import os
import re
import json
import sys
import boto3
from botocore.config import Config
from botocore import UNSIGNED
import string
import string
import logging
import uuid
from datetime import datetime, date
from spellchecker import SpellChecker
import psycopg2
from psycopg2 import sql
import time
import postgresql

logger = logging.getLogger()
logger.setLevel(logging.INFO)
compr = boto3.client(service_name='comprehend')
compr_m = boto3.client(service_name='comprehendmedical')
lambda_client = boto3.client('lambda')

RuleProcessingLambdaName = os.getenv('RULE_PROCESSING_LAMBDA')
DataResultsLambdaName = os.getenv('DATA_RESULTS_LAMBDA')

# Syn, Conj and spelllist loaded in load_db_data()
conj_list = []
synonyms_list = []
spell = None

psql = postgresql.PostgreSQL()

insert_new_request_cmd = """
    INSERT INTO data_request(id, state, age, height, weight, request) VALUES 
    (%s, 'received', %s, %s, %s, %s)
    ON CONFLICT (id)
    DO UPDATE SET
        age = EXCLUDED.age,
        height = EXCLUDED.height,
        weight = EXCLUDED.weight,
        request = EXCLUDED.request, 
        state='received_duplicate',
        error='',
        info=null,
        ai_rule_candidates=null,
        ai_rule_id=null,
        ai_priority='',
        ai_contrast=null,
        ai_tags=null,
        ai_p5_flag=null,
        final_priority = '',
        final_contrast = null,
        labelled_rule_id = null,
        labelled_priority = '',
        labelled_p5_flag=null,
        labelled_contrast = null,
        labelled_notes = '',
        labelled_tags=null
    """

insert_history_request_cmd = """
    INSERT INTO request_history(id_data_request, history_type, dob, height, weight, exam_requested, reason_for_exam,
        initial_priority, cognito_user_id, cognito_user_fullname)
    VALUES 
    (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

update_request_error_cmd = """
    UPDATE data_request 
    SET error = %s
    WHERE id = %s
    RETURNING id
    """


# AND (error IS NULL OR error = '')
def query_results_id(cur, id_array):
    cmd = """
    SELECT req.id, state, error, request
    FROM data_request as req
    WHERE req.id = ANY (%s)
    AND state NOT IN ('deleted')
    ORDER BY updated_at ASC;
    """
    cur.execute(cmd, (id_array, ))
    return cur.fetchall()


def query_results_all(cur, array_states):
    cmd = """
    SELECT req.id, state, error, request
    FROM data_request as req
    WHERE state IN (%s)
    ORDER BY updated_at ASC;
    """
    cur.execute(cmd, array_states)
    return cur.fetchall()


def parse_response_results(response, resp_array_ids=[]):
    resp_list = []
    for resp_tuple in response:
        resp = {}

        # Rule - filled in queryAndParseResponseRuleCandidates
        # rule['rules_id'] = resp_tuple[2]
        # rule['info'] = resp_tuple[22]
        # rule['priority'] = resp_tuple[19]
        # rule['contrast'] = resp_tuple[20]
        # rule['body_part'] = resp_tuple[16]
        # rule['bp_tk'] = resp_tuple[17]
        # rule['info_weighted_tk'] = resp_tuple[18]

        resp['id'] = resp_tuple[0]
        resp_array_ids.append(resp_tuple[0])

        resp['state'] = resp_tuple[1]
        resp['error'] = resp_tuple[2]
        resp['request_json'] = resp_tuple[3]  # Request

        resp_list.append(resp)
    return resp_list


# rerun_ai
add_rerun_ai_cmd = """
    INSERT INTO rerun_ai_history(state, description, cognito_user_id, cognito_user_fullname,
        cio_current, cio_list_all, cio_list_processed, cio_list_failed, time_elapsed_ms)
    VALUES 
    ('running', %s, %s, %s, %s, %s, %s, %s, 0)
    RETURNING id
    """


end_all_rerun_ai_cmd = """
    UPDATE rerun_ai_history 
    SET state = 'stopped'
    WHERE state = 'running'
    RETURNING id
    """

update_cio_current_rerun_ai = """
    UPDATE rerun_ai_history 
    SET cio_current = %s
    WHERE id = %s
    RETURNING id, state
    """

addto_timer_rerun_ai = """
    UPDATE rerun_ai_history 
    SET time_elapsed_ms = time_elapsed_ms + %s, cio_list_processed = array_append(cio_list_processed, %s)
    WHERE id = %s
    """


set_state_rerun_ai = """
    UPDATE rerun_ai_history 
    SET state = %s
    WHERE id = %s
    """


def query_rerun_ai(cur, id):
    cmd = """
    SELECT id, state, description, cognito_user_id, cognito_user_fullname, cio_current, cio_list_all,
        cio_list_processed, cio_list_failed, time_elapsed_ms, created_at, updated_at
    FROM rerun_ai_history
    WHERE id = %s
    ORDER BY id DESC LIMIT 1
    """
    cur.execute(cmd, (id,))
    return cur.fetchall()


def parse_rerun_ai_results(response):
    resp_list = []
    for resp_tuple in response:
        resp = {}

        resp['id'] = resp_tuple[0]
        resp['state'] = resp_tuple[1]
        resp['description'] = resp_tuple[2]
        resp['cognito_user_id'] = resp_tuple[3]
        resp['cognito_user_fullname'] = resp_tuple[4]
        resp['cio_current'] = resp_tuple[5]
        resp['cio_list_all'] = resp_tuple[6]
        resp['cio_list_processed'] = resp_tuple[7]
        resp['cio_list_failed'] = resp_tuple[8]
        resp['time_elapsed_ms'] = resp_tuple[9]
        resp['created_at'] = datetime_to_json(resp_tuple[10])
        resp['updated_at'] = datetime_to_json(resp_tuple[11])

        resp_list.append(resp)
    return resp_list


def datetime_to_json(obj):
    if isinstance(obj, (datetime, date)):
        return obj.strftime("%Y-%m-%d %H:%M:%S")
    else:
        return obj


def query_rerun_ai_history(cur):
    cmd = """
    SELECT id, state, description, cognito_user_id, cognito_user_fullname, cio_current, cio_list_all, cio_list_processed,
        cio_list_failed, time_elapsed_ms, created_at, updated_at
    FROM rerun_ai_history
    ORDER BY id DESC
    """
    cur.execute(cmd)
    return cur.fetchall()


def convert2CM(height):
    if not isinstance(height, str):
        return 0
    try:
        parts = height.split(' ')
        unit = parts[1]
        if unit == 'CM':
            return float(parts[0])
        elif unit == 'IN':
            return float(parts[0]) * 2.54
            # quantity_parts = parts[0].replace("'", ' ').replace('"', ' ').split()
            # foot = quantity_parts[0]
            # inch = 0
            # if len(quantity_parts) == 2:
            #     inch = quantity_parts[1]
            # return float(foot) * 30.48 + float(inch) * 2.54
    except:
        return 0


def convert2KG(weight):
    if not isinstance(weight, str):
        return 0
    try:
        parts = weight.split(' ')
        unit = parts[1]
        if unit == 'KG':
            return float(parts[0])
        elif unit == 'LBS':
            return 0.453592 * float(parts[0])
    except:
        return 0


def dob2age(dob):
    try:
        birthdate = datetime.strptime(dob, '%Y-%m-%d')
        today = date.today()
        age = today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))
        return age
    except:
        return 0


def contains_word(sample, text):
    return f' {sample.lower()} ' in f' {text.lower()} '


def preProcessText(col):
    """
    Takes in a pandas.Series and preprocesses the text
    """
    # DO NOT want to replace punc with empty string cause it will converge into one word!
    # reponct = string.punctuation.replace("?", "").replace("/", "")
    extr = col.strip()
    extr = re.sub('<.*>', '', extr)
    # extr = extr.translate(str.maketrans('', '', reponct))
    extr = re.sub('[^0-9a-zA-Z?/ ]+', ' ', extr)
    extr = re.sub('\s+', ' ', extr)
    extr = extr.lower()
    return extr


def checkSpelling(text: str):
    words = text.split()
    # logger.info('checkSpelling - words')
    # logger.info(words)
    return ' '.join([spell.correction(word) for word in words])


def replace_conjunctions(conj_list, text: str, info_list):
    # logger.info(conj_list)
    # raise Exception('replace_conjunctions ex test')
    temp_text = f' {text.lower()} '
    for conj in conj_list:
        abbrev = conj[0].lower()
        meaning = conj[1]
        if contains_word(abbrev, text):
            info_list.append(meaning)
            temp_text = temp_text.replace(f' {abbrev} ', f' {meaning} ')
    return temp_text[1:len(temp_text) - 1]


def apply_synonyms(syn_list, text: str, info_list):
    logger.info('apply_synonyms')
    # logger.info(synonyms_list)
    # raise Exception('apply_synonyms ex test')
    temp_text = f' {text.lower()} '
    for syn in syn_list:
        abbrev = syn[0].lower()
        meanings = syn[1].split(" / ")
        meaning = ' * '.join(meanings)
        # logger.info(meaning)
        if contains_word(abbrev, text):
            info_list.append(meaning)
            temp_text = temp_text.replace(f' {abbrev} ', f' {abbrev} * {meaning} ')
    return temp_text[1:len(temp_text) - 1]


def find_all_entities(data: str):
    # raise Exception('find_all_entities ex test')
    if not data:
        return []
    try:
        logger.info('--> compr_m.detect_entities_v2')
        result = compr_m.detect_entities_v2(Text=data)
        return result['Entities']
    except Exception as ex:
        template = "An exception of type {0} occurred. Arguments:\n{1!r}"
        message = template.format(type(ex).__name__, ex.args)
        logger.error(message)
        raise Exception(message)


def infer_icd10_cm(data: str, med_cond, diagnosis, symptoms):
    """
    :data type: string to pass through Comprehend Medical icd10_cm
    :med_cond type: List[]
    :diagnosis type: List[]
    :symptoms type: List[]
    """
    if not data:
        return None
    try:
        logger.info('--> compr_m.infer_icd10_cm - icd10_result[Entities]')
        icd10_result = compr_m.infer_icd10_cm(Text=data)
        # logger.info('icd10_result')
        # logger.info(icd10_result)
        for resp in icd10_result['Entities']:
            logger.info(resp)
            if resp['Score'] > 0.4:
                resp_str = resp['Text']
                category = ''
                # first check Attributes
                for attr in resp['Attributes']:
                    if attr['Score'] > 0.4:
                        if attr['Type'] == 'ACUITY' or attr['Type'] == 'DIRECTION':
                            resp_str = f'{attr["Text"]}' + ' ' + resp_str
                        elif attr['Type'] == 'SYSTEM_ORGAN_SITE':
                            resp_str = resp_str + ' ' + f'{attr["Text"]}'
                for trait in resp['Traits']:
                    if trait['Score'] > 0.4:
                        if trait['Name'] == 'NEGATION':
                            category = 'NEG'
                            break  # don't save anything for negation
                        elif trait['Name'] == 'SYMPTOM':
                            category = 'SYMP'
                        elif trait['Name'] == 'DIAGNOSIS':
                            category = 'DIAGN'
                # add our response string to corresponding list
                if not category:
                    resp_str = checkSpelling(resp_str)
                    med_cond.append(resp_str)
                elif category == 'SYMP':
                    resp_str = checkSpelling(resp_str)
                    symptoms.append(resp_str)
                elif category == 'DIAGN':
                    resp_str = checkSpelling(resp_str)
                    diagnosis.append(resp_str)
                    # logger.info('infer_icd10_cm - DIAGN')
                    # logger.info(resp_str)

        return icd10_result
    except Exception as ex:
        template = "An exception of type {0} occurred. Arguments:\n{1!r}"
        message = template.format(type(ex).__name__, ex.args)
        logger.error(message)


def find_key_phrases(data: str, key_phrases, icd10cm_list, anatomy_list):
    """
    :data type: string to pass through Comprehend Detect Key Phrases
    :key_phrases type: List[]
    :icd10cm_list type: List[]
    :anatomy_list type: List[]
    """
    if not data:
        return
    try:
        kp_result = compr.detect_key_phrases(Text=data, LanguageCode='en')
        for resp in kp_result['KeyPhrases']:
            placed = False
            if resp['Score'] > 0.4:
                for icd10cm in icd10cm_list:
                    if contains_word(icd10cm, resp['Text']):
                        resp_str = checkSpelling(resp['Text'])
                        key_phrases.append(resp_str)
                        placed = True
                        break
                    elif contains_word(resp['Text'], icd10cm):
                        resp_str = checkSpelling(resp['Text'])
                        key_phrases.append(resp_str)
                        placed = True
                        break
                if not placed:
                    for anatomy in anatomy_list:
                        if contains_word(anatomy, resp['Text']):
                            resp_str = checkSpelling(resp['Text'])
                            key_phrases.append(resp_str)
                            break
    except Exception as ex:
        template = "An exception of type {0} occurred. Arguments:\n{1!r}"
        message = template.format(type(ex).__name__, ex.args)
        logger.error(message)


def recursively_prune_dict_keys(obj, keep):
    if isinstance(obj, dict):
        return {k: recursively_prune_dict_keys(v, keep) for k, v in obj.items() if k in keep}
    elif isinstance(obj, list):
        return [recursively_prune_dict_keys(item, keep) for item in obj]
    else:
        return obj


def error_handler(cio, message):
    # user_error = re.escape(message)
    with psql.conn.cursor() as cur:
        try:
            user_error = message
            data = (f'{user_error}', cio)
            command = update_request_error_cmd % data
            logger.info(command)
            cur.execute(update_request_error_cmd, data)
            psql.conn.commit()

        except Exception as error:
            logger.error(error)
            user_error = "Postgrest DB error - Exception Type: %s" % user_error
    return {"isBase64Encoded": False,
            "statusCode": 500,
            "body": f'{user_error}',
            "headers": {"Content-Type": "application/json"}}


def add_whitespace_spec_chars(value):
    # Add whitespace around special chars
    special_char = "@_!#$%^&*()<>?/\|}{~:;[].,"
    # special_char = "/.,"
    for i in special_char:
        value = value.replace(i, f' {i} ')

    # processed = value.replace("/", " / ")
    # processed = processed.replace("\\", " \\ ")
    return value


def parse_and_run_rule_processing(data_df, cognito_user_id, cognito_user_fullname, new_request=True):
    logger.info('parse_and_run_rule_processing')
    logger.info(data_df)
    if 'ReqCIO' not in data_df or not data_df['ReqCIO']:
        data_df['CIO_ID'] = str(uuid.uuid4())
    else:
        data_df['CIO_ID'] = (data_df['ReqCIO'])

    cio = data_df["CIO_ID"]
    # logger.info(cio)
    dob = data_df['DOB']
    # logger.info(dob)
    req_height = data_df['Height'] + ' ' + data_df['inch-cm']
    # logger.info(req_height)
    req_weight = data_df['Weight'] + ' ' + data_df['kg-lbs']
    # logger.info(req_weight)
    exam_requested = data_df['Exam Requested']
    # logger.info(exam_requested)
    reason_for_exam = data_df['Reason for Exam']
    # logger.info(reason_for_exam)
    radiologist_priority = data_df['Radiologist Priority']
    # logger.info(radiologist_priority)

    # Convert these easy fields first
    data_df['age'] = dob2age(dob)
    age = data_df['age']
    # logger.info(age)
    data_df['height'] = convert2CM(req_height)
    height = data_df['height']
    data_df['weight'] = convert2KG(req_weight)
    weight = data_df['weight']

    logger.info('Store request in the DB immediately')
    with psql.conn.cursor() as cur:
        try:
            # Insert request history
            if new_request:
                # Insert new request
                data = (cio, age, height, weight, json.dumps(data_df))

                logger.info(insert_new_request_cmd)
                logger.info(data)

                cur.execute(insert_new_request_cmd, data)

                request_type = 'request'
            else:
                request_type = 'request_rerun'
            data = (cio, request_type, dob, req_height, req_weight, exam_requested, reason_for_exam,
                    radiologist_priority, cognito_user_id, cognito_user_fullname)
            command = insert_history_request_cmd % data
            logger.info(command)

            cur.execute(insert_history_request_cmd, data)

            psql.conn.commit()
        except Exception as error:
            logger.error(error)
            user_error = "Postgrest DB error - Exception Type: %s" % type(error)
            logger.error(user_error)
            return {"isBase64Encoded": False, "statusCode": 500,
                    "body": f'{user_error}',
                    "headers": {"Content-Type": "application/json"}}

    if data_df['Radiologist Priority'].lower() == 'unidentified':
        data_df['priority'] = 'U/I'
    else:
        data_df['priority'] = data_df['Radiologist Priority']

    # Format columns that don't need comprehend medical and preprocess the text
    logger.info(reason_for_exam)
    reason_for_exam = preProcessText(reason_for_exam)
    data_df['Reason for Exam/Relevant Clinical History'] = reason_for_exam
    logger.info('POST preprocessed_text - Reason for Exam')
    logger.info(reason_for_exam)

    logger.info(exam_requested)
    exam_requested = preProcessText(exam_requested)
    data_df['Exam Requested'] = exam_requested
    logger.info('POST preprocessed_text - Exam Requested')
    logger.info(exam_requested)

    # data_df['Spine'] = preProcessText(data_df['Appropriateness Checklist - Spine'])
    # data_df['Hip & Knee'] = preProcessText(data_df['Appropriateness Checklist - Hip & Knee'])

    # New Dataframe
    template = ['CIO_ID', 'height', 'weight', 'Sex', 'age', 'Preferred MRI Site', 'priority']
    formatted_df = recursively_prune_dict_keys(data_df, template)
    formatted_df['medical_condition'] = ''
    formatted_df['diagnosis'] = ''
    formatted_df['anatomy'] = ''
    formatted_df['symptoms'] = ''
    formatted_df['phrases'] = ''
    formatted_df['other_info'] = ''
    formatted_df['p5'] = 'f'
    if new_request:
        formatted_df['new_request'] = True

    anatomy_list = []
    medical_conditions = []
    diagnosis = []
    symptoms = []
    key_phrases = []
    other_info = []
    syn_info = []

    # Parse the Exam Requested Column into Comprehend Medical to find Anatomy Entities
    try:
        logger.info('Reason for Exam - replace_conjunctions')
        conj = replace_conjunctions(conj_list, f'{data_df["Reason for Exam/Relevant Clinical History"]}', other_info)
        logger.info(conj)
        # whitespc after conj - for ex r/o -> rule out; if a space added it won't match conj
        whitespc = add_whitespace_spec_chars(conj)
        syn = apply_synonyms(synonyms_list, whitespc, syn_info)
        # logger.info(syn)
        # preprocessed_text = checkSpelling(whitespc)
        preprocessed_text = checkSpelling(syn)
        logger.info(preprocessed_text)
    except Exception as error:
        return error_handler(cio, "replace_conjunctions - Exception Type: %s" % type(error))

    try:
        logger.info('Exam Requested - anatomy_json - find_all_entities(checkSpelling)')
        whitespc = add_whitespace_spec_chars(data_df["Exam Requested"])
        logger.info(whitespc)
        syn = apply_synonyms(synonyms_list, whitespc, syn_info)
        spelling = checkSpelling(syn)
        logger.info(spelling)
        anatomy_json = find_all_entities(spelling)
        logger.info(anatomy_json)
    except Exception as error:
        return error_handler(cio, "find_all_entities - Exception Type: %s" % type(error))

    for obj in anatomy_json:
        if obj['Category'] == 'ANATOMY' or obj['Category'] == 'TEST_TREATMENT_PROCEDURE' or \
                obj['Category'] == 'MEDICAL_CONDITION':
            anatomy_list.append(obj['Text'])
        elif obj['Score'] > 0.4 and obj['Category'] == 'TIME_EXPRESSION' and obj['Type'] == 'TIME_TO_TEST_NAME':
            formatted_df['p5'] = 't'
            # if(contains_word('hip',anatomy) or contains_word('knee', anatomy)):
        #     # apply comprehend to knee/hip column
        #     formatted_df['Hip & Knee'][row] = find_entities(f'{data_df["Hip & Knee"][row]}')
        # elif(contains_word('spine',anatomy)):
        #     # apply comprehend to spine column
        #     formatted_df['Spine'][row] = find_entities(f'{data_df["Appropriateness Checklist - Spine"][row]}')
    icd10_result = infer_icd10_cm(preprocessed_text, medical_conditions, diagnosis, symptoms)
    logger.info('<-- POST infer_icd10_cm')
    logger.info(f'medical_conditions: {medical_conditions}')
    logger.info(f'diagnosis: {diagnosis}')
    logger.info(f'symptoms: {symptoms}')
    find_key_phrases(preprocessed_text, key_phrases, medical_conditions + diagnosis + symptoms, anatomy_list)

    formatted_df['anatomy_json'] = anatomy_json
    formatted_df['replace_conjunctions'] = preprocessed_text

    if icd10_result is not None:
        formatted_df['icd10_result'] = icd10_result['Entities']

    formatted_df['anatomy'] = anatomy_list
    formatted_df['medical_condition'] = medical_conditions
    formatted_df['diagnosis'] = diagnosis
    formatted_df['symptoms'] = symptoms
    formatted_df['phrases'] = key_phrases
    formatted_df['other_info'] = other_info

    # formatted_df.to_json('sample_output.json', orient='index')
    # print("output is: ", formatted_df)

    try:
        debug = os.getenv('LOCAL_DEBUG')
        if debug is not None:
            logger.info('LOCAL_DEBUG')
            # “generated Lambdas are suffixed with an ID to keep them unique between multiple
            # deployments (e.g. FunctionB-123ABC4DE5F6A), so a Lambda named "FunctionB" doesn't exist”
            # https://stackoverflow.com/questions/60181387/how-to-invoke-aws-lambda-from-another-lambda-within-sam-local
            lambda_client_local = boto3.client('lambda',
                                               endpoint_url="http://host.docker.internal:5001",
                                               use_ssl=False,
                                               verify=False,
                                               config=Config(signature_version=UNSIGNED,
                                                             read_timeout=10000,
                                                             retries={'max_attempts': 0}))
            rules_response = lambda_client_local.invoke(
                FunctionName=RuleProcessingLambdaName,
                InvocationType='RequestResponse',
                Payload=json.dumps(formatted_df)
            )
        else:
            rules_response = lambda_client.invoke(
                FunctionName=RuleProcessingLambdaName,
                InvocationType='RequestResponse',
                Payload=json.dumps(formatted_df)
            )

        if rules_response['ResponseMetadata']['HTTPStatusCode'] != 200:
            return rules_response

        data = json.loads(rules_response['Payload'].read())
        response = {
            'result': data,
            'context': formatted_df,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': 'http://localhost:3000',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            }
        }

        return response
    except Exception as error:
        return error_handler(cio, "RuleProcessingLambda - Exception Type: %s" % type(error))


def rerun_rule_processing_all(cognito_user_id, cognito_user_fullname, rerun_all_id=0):
    logger.info(f'rerun_rule_processing_all: {rerun_all_id}')

    results = []
    ai_row_id = 0
    with psql.conn.cursor() as cur:
        if rerun_all_id == 0:
            # NEW
            resp_array_ids = []
            response = query_results_all(cur, ['labelled_priority'])
            logger.info(response)
            results = parse_response_results(response, resp_array_ids)
            logger.info(results)

            cur_cio = ''
            if len(resp_array_ids):
                cur_cio = resp_array_ids[0]

            # First, end all other sessions
            cur.execute(end_all_rerun_ai_cmd)

            add_params = ('', cognito_user_id, cognito_user_fullname, cur_cio, resp_array_ids, [], [])
            cur.execute(add_rerun_ai_cmd, add_params)
            add_resp = cur.fetchall()
            ai_row_id = add_resp[0][0]
            psql.commit()
        else:
            # Continue
            rerun_ai = query_rerun_ai(cur, rerun_all_id)
            rerun_ai = parse_rerun_ai_results(rerun_ai)
            logger.info(rerun_ai)

            rerun_ai_row = rerun_ai[0]
            cio_list_all = rerun_ai_row['cio_list_all']
            logger.info(cio_list_all)
            cio_list_processed = rerun_ai_row['cio_list_processed']
            logger.info(cio_list_processed)
            # cio_list_remaining = list(set(cio_list_all) - set(cio_list_processed)) # doesnt preserve order
            cio_list_remaining = [i for i in cio_list_all if i not in cio_list_processed or cio_list_processed.remove(i)]
            logger.info(cio_list_remaining)
            ai_row_id = rerun_ai_row['id']

            try:
                remaining_reqs = query_results_id(cur, cio_list_remaining)
            except Exception as error:
                logger.info('query_results_id')
                logger.info(error)
            logger.info(remaining_reqs)
            results = parse_response_results(remaining_reqs)
            logger.info(results)
            cur.execute(set_state_rerun_ai, ('running', ai_row_id))
            return

        # logger.info(results)
        total = len(results)
        processed = 0
        stopped = False
        for result in results:
            start = time.time_ns()

            logger.info(result)
            cio_id = result['id']
            logger.info('rerun_all: #%s of %s - cio: %s' % (processed, total, cio_id))

            logger.info(ai_row_id)
            cur.execute(update_cio_current_rerun_ai, (cio_id, ai_row_id))
            psql.commit()
            update_resp = cur.fetchall()
            logger.info(update_resp)
            cur_state = update_resp[0][1]
            if cur_state == 'stopped':
                logger.info('-------rerun_all: stopped!!')
                stopped = True
                break

            try:
                parse_and_run_rule_processing(result['request_json'], cognito_user_id, cognito_user_fullname, False)
            except Exception as error:
                logger.info('rerun_rule_processing_all')
                logger.info(error)

            processed += 1
            end = time.time_ns()
            elapsed_ms = (end - start) / 1000000
            logger.info(elapsed_ms)

            cur.execute(addto_timer_rerun_ai, (elapsed_ms, cio_id, ai_row_id))
            psql.commit()
            #
            # processed += 1

        if stopped is False:
            cur.execute(set_state_rerun_ai, ('done', ai_row_id))
            cur.execute(update_cio_current_rerun_ai, ('', ai_row_id))
            psql.commit()

        return {
            'processed': processed,
            'total': total
        }


def rerun_rule_processing_single(cio_id, cognito_user_id, cognito_user_fullname):
    logger.info('rerun_rule_processing_single')
    logger.info(cio_id)

    with psql.conn.cursor() as cur:
        if cio_id is None:
            logger.info('GET ALL - cio_id is None')
        else:
            response = parse_response_results(query_results_id(cur, [cio_id]))
            logger.info(response)
            if len(response) > 0:
                logger.info('calling parse_and_run_rule_processing')
                return parse_and_run_rule_processing(response[0]['request_json'],
                                                     cognito_user_id, cognito_user_fullname, False)
            else:
                error_msg = 'NO results from CIO ID: %s' % cio_id
                return {"isBase64Encoded": False, "statusCode": 400, "body": error_msg,
                        "headers": {"Content-Type": "application/json"}}

            # LET UI retrieve new history
            # 
            # data = {
            #     'operation': 'GET',
            #     'id': cio_id
            # }
            # logger.info('DataResultsLambdaName')
            # logger.info(DataResultsLambdaName)
            # try:
            #     debug = os.getenv('LOCAL_DEBUG')
            #     if debug is not None:
            #         logger.info('LOCAL_DEBUG')
            #         # “generated Lambdas are suffixed with an ID to keep them unique between multiple
            #         # deployments (e.g. FunctionB-123ABC4DE5F6A), so a Lambda named "FunctionB" doesn't exist”
            #         # https://stackoverflow.com/questions/60181387/how-to-invoke-aws-lambda-from-another-lambda-within-sam-local
            #         lambda_client_local = boto3.client('lambda',
            #                                            endpoint_url="http://host.docker.internal:5002",
            #                                            use_ssl=False,
            #                                            verify=False,
            #                                            config=Config(signature_version=UNSIGNED,
            #                                                          read_timeout=10000,
            #                                                          retries={'max_attempts': 0}))
            #         rules_response = lambda_client_local.invoke(
            #             FunctionName=DataResultsLambdaName,
            #             InvocationType='RequestResponse',
            #             Payload=json.dumps(data)
            #         )
            #     else:
            #         rules_response = lambda_client.invoke(
            #             FunctionName=DataResultsLambdaName,
            #             InvocationType='RequestResponse',
            #             Payload=json.dumps(data)
            #         )
            #
            #     logger.info(rules_response)
            #     if rules_response['ResponseMetadata']['HTTPStatusCode'] != 200:
            #         return rules_response
            #
            #     data_response = json.loads(rules_response['Payload'].read())
            #     return {
            #         'result': data_response,
            #         'context': data,
            #         'headers': {
            #             'Access-Control-Allow-Headers': 'Content-Type',
            #             'Access-Control-Allow-Origin': 'http://localhost:3000',
            #             'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            #         }
            #     }
            # except Exception as error:
            #     logger.error(error)
            #     return error_handler(cio_id, "QueryRulesLambdaName - Exception Type: %s" % type(error))


def get_rerun_history():
    with psql.conn.cursor() as cur:
        return parse_rerun_ai_results(query_rerun_ai_history(cur))
    return []


def stop_rerun_ai():
    with psql.conn.cursor() as cur:
        cur.execute(end_all_rerun_ai_cmd)
        psql.commit()
    return

def load_db_data():
    logger.info('load_db_data')

    # Load conj
    global conj_list
    conj_list = psql.queryTable("conjunctions")
    # logger.info(conj_list)

    # Load synonyms
    global synonyms_list
    synonyms_list = psql.queryTable("synonyms")
    # logger.info(synonyms_list)

    # Add words to spell list
    global spell
    spell = SpellChecker()
    spelling_list = [x[0] for x in psql.queryTable('spellchecker')]
    # logger.info(spelling_list)
    spell.word_frequency.load_words(spelling_list)
    return


def handler(event, context):
    logger.info(event)
    param_error = {"isBase64Encoded": False, "statusCode": 400, "body": "Missing Body Parameter",
                   "headers": {"Content-Type": "application/json"}}
    if 'body' not in event:
        logger.error(param_error["body"])
        return param_error

    data_df = json.loads(event['body'])  # use for postman tests
    # data_df = event['body'] # use for console tests
    logger.info(data_df)

    headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    }

    ##########################################
    # TODO: Parameter validation
    cognito_user_id = ''
    if 'cognito_user_id' in data_df and data_df['cognito_user_id']:
        cognito_user_id = data_df["cognito_user_id"]
        logger.info(cognito_user_id)
    cognito_user_fullname = ''
    if 'cognito_user_fullname' in data_df and data_df['cognito_user_fullname']:
        cognito_user_fullname = data_df["cognito_user_fullname"]
        logger.info(cognito_user_fullname)

    load_db_data()

    resp_dict = {'result': True,
                 'headers': headers,
                 'data': []}

    if 'operation' in data_df:
        rest_cmd = data_df['operation']
        logger.info('------- REST: ' + rest_cmd)

        if rest_cmd == 'RERUN_ALL':
            logger.info('RERUN_ALL')

            rerun_all_id = 0
            if 'rerun_all_id' in data_df and data_df['rerun_all_id']:
                rerun_all_id = data_df["rerun_all_id"]
            logger.info(rerun_all_id)

            results = rerun_rule_processing_all(cognito_user_id, cognito_user_fullname, rerun_all_id)
            logger.info('RERUN_ALL FINAL result:')
            logger.info(results)
            return {**results, 'headers': headers}

        elif rest_cmd == 'RERUN_ONE':
            logger.info('RERUN_ONE')
            if 'CIO_ID' not in data_df:
                param_error["body"] = "Missing Body Parameter: CIO_ID"
                logger.error(param_error["body"])
                return param_error
            cio_id = data_df['CIO_ID']
            return rerun_rule_processing_single(cio_id, cognito_user_id, cognito_user_fullname)
        elif rest_cmd == 'GET_RERUN_STATUS':
            logger.info('GET_RERUN_STATUS')
            return []
        elif rest_cmd == 'GET_RERUN_HISTORY':
            logger.info('GET_RERUN_HISTORY')
            resp_dict['data'] = get_rerun_history()
            return resp_dict
        elif rest_cmd == 'STOP_RERUN_AI':
            logger.info('STOP_RERUN_AI')
            stop_rerun_ai()
            resp_dict['data'] = get_rerun_history()
            return resp_dict
    else:
        logger.info('------- REST: new request')
        return parse_and_run_rule_processing(data_df, cognito_user_id, cognito_user_fullname)

