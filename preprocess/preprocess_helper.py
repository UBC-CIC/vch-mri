import boto3 
from datetime import datetime, date
import re
import string
import pandas as pd
from spellchecker import SpellChecker 
import uuid 
import psycopg2
from psycopg2 import sql
import sys
sys.path.append('.')
from rule_processing import postgresql

def queryTable(conn, table):
    cmd = """
    SELECT * FROM {}
    """
    with conn.cursor() as cur: 
        cur.execute(sql.SQL(cmd).format(sql.Identifier(table)))
        return cur.fetchall()

compr = boto3.client(service_name='comprehend')
compr_m = boto3.client(service_name='comprehendmedical')
spell = SpellChecker() 
conn = postgresql.connect()
spelling_list = [x[0] for x in queryTable(conn, 'spellchecker')]
conn.close()
# Add words to spell list 
spell.word_frequency.load_words(spelling_list)

def findId(val):
    if val == '-1': 
        return str(uuid.uuid4())
    return val

def findUnidentified(val):
    if val.lower() == 'unidentified':
        return 'U/I'
    return val 

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
    print('weight is:', weight)
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
    rehtml = re.compile('<.*>')
    extr = col.str.strip()
    extr = extr.str.replace(rehtml, '', regex=True)
    extr = extr.str.translate(str.maketrans('','',reponct))
    extr = extr.str.replace('[^0-9a-zA-Z?/ ]+', ' ', regex=True)
    extr = extr.str.replace('\s+', ' ', regex=True)
    extr = extr.str.lower()
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
        print(message)

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
        print(message)

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
        print(message)
    