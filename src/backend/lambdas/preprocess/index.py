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

spell = SpellChecker() 
psql = postgresql.PostgreSQL()
conj_list = psql.queryTable("conjunctions")
spelling_list = [x[0] for x in psql.queryTable('spellchecker')]
# Add words to spell list 
spell.word_frequency.load_words(spelling_list)

insert_new_request_cmd = """
INSERT INTO data_request(id, state, dob, height, weight, exam_requested, reason_for_exam) VALUES 
('%s', 'received', '%s', '%s', '%s', '%s', '%s')
ON CONFLICT (id)
DO UPDATE SET
    dob = EXCLUDED.dob,
    height = EXCLUDED.height,
    weight = EXCLUDED.weight,
    exam_requested = EXCLUDED.exam_requested,
    reason_for_exam = EXCLUDED.reason_for_exam,
    state='received_duplicate',
    error='',
    info=null,
    p5_flag=null,
    rules_id=null,
    phys_priority='',
    ai_priority='',
    final_priority='',
    contrast=null,
    tags=null,
    phys_contrast=null;
"""

insert_history_request_cmd = """
INSERT INTO request_history(id_data_request, history_type, dob, height, weight, exam_requested, reason_for_exam,
    cognito_user_id, cognito_user_fullname)
VALUES 
('%s', 'request', '%s', '%s', '%s', '%s', '%s', '%s', '%s')
"""

def convert2CM(height):
    if not isinstance(height, str):
        return 0
    try:
        parts = height.split(' ')
        unit = parts[1]
        if unit == 'CM':
            return float(parts[0])
        elif unit == 'IN':
            quantity_parts = parts[0].replace("'", ' ').replace('"', ' ').split()
            foot = quantity_parts[0]
            inch = 0
            if len(quantity_parts) == 2:
                inch = quantity_parts[1]
            return float(foot) * 30.48 + float(inch) * 2.54
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
    reponct = string.punctuation.replace("?","").replace("/","")
    extr = col.strip()
    extr = re.sub('<.*>', '', extr)
    extr = extr.translate(str.maketrans('','',reponct))
    extr = re.sub('[^0-9a-zA-Z?/ ]+', ' ', extr)
    extr = re.sub('\s+', ' ', extr)
    extr = extr.lower()
    return extr

def checkSpelling(text: str):
    words = text.split()
    return ' '.join([spell.correction(word) for word in words])

def replace_conjunctions(conj_list, text: str, info_list): 
    temp_text = f' {text} '
    for conj in conj_list:
        if contains_word(conj[0],text):
            info_list.append(conj[1])
            temp_text = temp_text.replace(f' {conj[0]} ', f' {conj[1]} ')
    return temp_text[1:len(temp_text)-1]

def find_all_entities(data: str):
    if not data:
        return []
    try:
        result = compr_m.detect_entities_v2(Text=data)
        return result['Entities']
    except Exception as ex:
        template = "An exception of type {0} occurred. Arguments:\n{1!r}"
        message = template.format(type(ex).__name__, ex.args)
        logger.error(message)

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
                            break #don't save anything for negation
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

def find_key_phrases(data:str, key_phrases, icd10cm_list, anatomy_list):
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

def handler(event, context):
    logger.info(event)
    if 'body' not in event:
        logger.error( 'Missing parameters')
        return {"isBase64Encoded": False, "statusCode": 400, "body": "Missing Body Parameter", "headers": {"Content-Type": "application/json"}}

    data_df = json.loads(event['body']) # use for postman tests
    # data_df = event['body'] # use for console tests
    logger.info(data_df)
    
    if 'ReqCIO' not in data_df or not data_df['ReqCIO']:
        data_df['CIO_ID'] = str(uuid.uuid4())
    else: 
        data_df['CIO_ID'] = (data_df['ReqCIO'])




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
    cio = data_df["CIO_ID"]
    logger.info(cio)
    dob = data_df['DOB']
    logger.info(dob)
    height = data_df['Height'] + ' ' + data_df['inch-cm']
    logger.info(height)
    weight = data_df['Weight'] + ' ' + data_df['kg-lbs']
    logger.info(weight)
    exam_requested = data_df['Exam Requested']
    logger.info(exam_requested)
    reason_for_exam = data_df['Reason for Exam']
    logger.info(reason_for_exam)

    logger.info('Store request in the DB immediately')
    with psql.conn.cursor() as cur:
        try:
            command = insert_new_request_cmd % (data_df["CIO_ID"], dob, height, weight, exam_requested,
                                                reason_for_exam)
            logger.info(command)
            cur.execute(command)

            command = insert_history_request_cmd % (data_df["CIO_ID"], dob, height, weight, exam_requested,
                                                    reason_for_exam, cognito_user_id, cognito_user_fullname)
            logger.info(command)
            cur.execute(command)

            psql.conn.commit()
        except Exception as error:
            logger.error(error)
            logger.error("Postgrest DB error - Exception Type: %s" % type(error))
            return {"isBase64Encoded": False, "statusCode": 400, "body": f'{type(error)}',
                    "headers": {"Content-Type": "application/json"}}

    return {"isBase64Encoded": False, "statusCode": 400, "body": "debubging",
            "headers": {"Content-Type": "application/json"}}


    if data_df['Radiologist Priority'].lower() == 'unidentified':
        data_df['priority'] = 'U/I'
    else: 
        data_df['priority'] = data_df['Radiologist Priority']

    # Format columns that don't need comprehend medical and preprocess the text
    data_df['age'] = dob2age(dob)
    data_df['height'] = height
    data_df['weight'] = weight
    data_df['height'] = convert2CM(data_df['height'])
    data_df['weight'] = convert2KG(data_df['weight'])
    data_df['Exam Requested'] = preProcessText(exam_requested)
    data_df['Reason for Exam/Relevant Clinical History'] = preProcessText(reason_for_exam)
    # data_df['Spine'] = preProcessText(data_df['Appropriateness Checklist - Spine'])
    # data_df['Hip & Knee'] = preProcessText(data_df['Appropriateness Checklist - Hip & Knee'])
    
    # New Dataframe 
    template = ['CIO_ID', 'height', 'weight', 'Sex','age', 'Preferred MRI Site', 'priority']
    formatted_df = recursively_prune_dict_keys(data_df, template)
    formatted_df['medical_condition'] = ''
    formatted_df['diagnosis'] = ''
    formatted_df['anatomy'] = ''
    formatted_df['symptoms'] = ''
    formatted_df['phrases'] = ''
    formatted_df['other_info'] = ''
    formatted_df['p5'] = 'f'
    
    anatomy_list = []
    medical_conditions = []
    diagnosis = []
    symptoms = []
    key_phrases = []
    other_info = []
    # Parse the Exam Requested Column into Comprehend Medical to find Anatomy Entities
    anatomy_json = find_all_entities(checkSpelling(f'{data_df["Exam Requested"]}'))
    preprocessed_text = replace_conjunctions(conj_list,f'{data_df["Reason for Exam/Relevant Clinical History"]}',other_info)
    for obj in anatomy_json: 
        if obj['Category'] == 'ANATOMY' or obj['Category'] == 'TEST_TREATMENT_PROCEDURE' or obj['Category'] == 'MEDICAL_CONDITION':
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
    find_key_phrases(preprocessed_text, key_phrases, medical_conditions+diagnosis+symptoms, anatomy_list)

    formatted_df['anatomy'] = anatomy_list
    formatted_df['medical_condition'] = medical_conditions
    formatted_df['diagnosis'] = diagnosis
    formatted_df['symptoms'] = symptoms
    formatted_df['phrases'] = key_phrases
    formatted_df['other_info'] = other_info
    
    #formatted_df.to_json('sample_output.json', orient='index')
    #print("output is: ", formatted_df)

    debug = os.getenv('LOCAL_DEBUG')
    if debug is not None:
        # “generated Lambdas are suffixed with an ID to keep them unique between multiple deployments (e.g. FunctionB-123ABC4DE5F6A),
        #   so a Lamba named "FunctionB" doesn't exist”
        # https://stackoverflow.com/questions/60181387/how-to-invoke-aws-lambda-from-another-lambda-within-sam-local
        lambda_client = boto3.client('lambda',
                                    endpoint_url="http://host.docker.internal:5001",
                                    use_ssl=False,
                                    verify=False,
                                    config=Config(signature_version=UNSIGNED,
                                                read_timeout=10000,
                                                retries={'max_attempts': 0}))

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
