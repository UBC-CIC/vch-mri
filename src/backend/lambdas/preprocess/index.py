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
import postgresql

logger = logging.getLogger()
logger.setLevel(logging.INFO)
compr = boto3.client(service_name='comprehend')
compr_m = boto3.client(service_name='comprehendmedical')
lambda_client = boto3.client('lambda')

RuleProcessingLambdaName = os.getenv('RULE_PROCESSING_LAMBDA')
DataResultsLambdaName = os.getenv('DATA_RESULTS_LAMBDA')

spell = SpellChecker()
psql = postgresql.PostgreSQL()
conj_list = psql.queryTable("conjunctions")
spelling_list = [x[0] for x in psql.queryTable('spellchecker')]
# Add words to spell list
spell.word_frequency.load_words(spelling_list)

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
        p5_flag=null,
        final_priority = '',
        final_contrast = null,
        labelled_rule_id = null,
        labelled_priority = '',
        labelled_contrast = null,
        labelled_notes = ''
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
def query_results_id(cur, id):
    cmd = """
    SELECT req.id, state, error, request
    FROM data_request as req
    WHERE req.id = %s
    AND state NOT IN ('deleted');
    """
    cur.execute(cmd, [id])
    return cur.fetchall()


def query_results_all(cur):
    cmd = """
    SELECT req.id, state, error, request
    FROM data_request as req
    WHERE state NOT IN ('deleted');
    """
    cur.execute(cmd)
    return cur.fetchall()

def parse_response_results(response):
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
        resp['state'] = resp_tuple[1]
        resp['error'] = resp_tuple[2]
        resp['request_json'] = resp_tuple[3]  # Request

        resp_list.append(resp)
    return resp_list


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
    return f' {sample} ' in f' {text} '


def preProcessText(col):
    """
    Takes in a pandas.Series and preprocesses the text
    """
    reponct = string.punctuation.replace("?", "").replace("/", "")
    extr = col.strip()
    extr = re.sub('<.*>', '', extr)
    extr = extr.translate(str.maketrans('', '', reponct))
    extr = re.sub('[^0-9a-zA-Z?/ ]+', ' ', extr)
    extr = re.sub('\s+', ' ', extr)
    extr = extr.lower()
    return extr


def checkSpelling(text: str):
    words = text.split()
    return ' '.join([spell.correction(word) for word in words])


def replace_conjunctions(conj_list, text: str, info_list):
    # raise Exception('replace_conjunctions ex test')
    temp_text = f' {text} '
    for conj in conj_list:
        if contains_word(conj[0], text):
            info_list.append(conj[1])
            temp_text = temp_text.replace(f' {conj[0]} ', f' {conj[1]} ')
    return temp_text[1:len(temp_text) - 1]


def find_all_entities(data: str):
    # raise Exception('find_all_entities ex test')
    if not data:
        return []
    try:
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
        return
    try:
        icd10_result = compr_m.infer_icd10_cm(Text=data)
        for resp in icd10_result['Entities']:
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
    data_df['Exam Requested'] = preProcessText(exam_requested)
    data_df['Reason for Exam/Relevant Clinical History'] = preProcessText(reason_for_exam)
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

    # Parse the Exam Requested Column into Comprehend Medical to find Anatomy Entities
    try:
        anatomy_json = find_all_entities(checkSpelling(f'{data_df["Exam Requested"]}'))
    except Exception as error:
        return error_handler(cio, "find_all_entities - Exception Type: %s" % type(error))

    try:
        preprocessed_text = replace_conjunctions(conj_list, f'{data_df["Reason for Exam/Relevant Clinical History"]}',
                                                 other_info)
    except Exception as error:
        return error_handler(cio, "replace_conjunctions - Exception Type: %s" % type(error))

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
    infer_icd10_cm(preprocessed_text, medical_conditions, diagnosis, symptoms)
    find_key_phrases(preprocessed_text, key_phrases, medical_conditions + diagnosis + symptoms, anatomy_list)

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


def rerun_rule_processing_all(cognito_user_id, cognito_user_fullname):
    logger.info('rerun_rule_processing_all')

    with psql.conn.cursor() as cur:
        response = query_results_all(cur)
        results = parse_response_results(response)

        # logger.info(results)
        total = len(results)
        processed = 0
        for result in results:
            logger.info('rerun_all: #%s of %s' % (processed, total))
            logger.info(result)

            # if processed > 0:
            #     break
            try:
                parse_response = parse_and_run_rule_processing(result['request_json'],
                                                               cognito_user_id, cognito_user_fullname, False)
                processed += 1
            except Exception as error:
                logger.info('rerun_rule_processing_all')
                logger.info(error)

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
            response = parse_response_results(query_results_id(cur, cio_id))
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

    if 'operation' in data_df:
        rest_cmd = data_df['operation']
        logger.info('------- REST: ' + rest_cmd)

        if rest_cmd == 'RERUN_ALL':
            logger.info('RERUN_ALL')

            results = rerun_rule_processing_all(cognito_user_id, cognito_user_fullname)
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
    else:
        logger.info('------- REST: new request')
        return parse_and_run_rule_processing(data_df, cognito_user_id, cognito_user_fullname)

