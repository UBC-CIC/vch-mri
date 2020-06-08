import boto3 
from datetime import datetime, date
import re
import string
import pandas as pd

compr = boto3.client(service_name='comprehend')
compr_m = boto3.client(service_name='comprehendmedical')

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
    reponct = re.compile('[%s]' % re.escape(string.punctuation))
    rehtml = re.compile('<.*?>')
    extr = col.str.strip()
    extr = col.str.replace(rehtml, '', regex=True)
    extr = col.str.replace(reponct, ' ', regex=True)
    extr = col.str.replace('[^0-9a-zA-Z ]+', '', regex=True)
    extr = col.str.replace('\s+', ' ', regex=True)
    return extr 

def preProcessAnatomy(anatomy, text):
    dir_list = {
        ' L ': ' left ', 
        ' l ': ' left ', 
        ' R ': ' right ', 
        ' r ': ' right ',
    }
    for direction in dir_list: 
        if contains_word(direction,text): 
            text = text.replace(direction+anatomy, dir_list[direction]+anatomy)
    return text 

def find_all_entities(data: str):
    if not data: 
        return [] 
    # print("-- Entities --")
    result = compr_m.detect_entities_v2(Text=data)
    # for resp in result['Entities']:
        # print(resp)
    return result['Entities']
    
def infer_icd10_cm(data: str, med_cond, diagnosis, symptoms):
    """
    :data type: string to pass through Comprehend Medical icd10_cm
    :med_cond type: List[]
    :diagnosis type: List[]
    :symptoms type: List[]
    """
    if not data: 
        return 
    icd10_result = compr_m.infer_icd10_cm(Text=data)
    for resp in icd10_result['Entities']:
        if resp['Score'] > 0.5: 
            resp_str = resp['Text']
            category = ''
            # first check Attributes
            for attr in resp['Attributes']: 
                if attr['Score'] > 0.5: 
                    if attr['Type'] == 'ACUITY': 
                        resp_str = f'{attr["Text"]}' + ' ' + resp_str
                    elif attr['Type'] == 'SYSTEM_ORGAN_SITE': 
                        resp_str = resp_str + ' ' + f'{attr["Text"]}'
            for trait in resp['Traits']:
                if trait['Score'] > 0.5: 
                    if trait['Name'] == 'NEGATION': 
                        category = 'NEG'
                        break #don't save anything for negation 
                    elif trait['Name'] == 'SYMPTOM': 
                        category = 'SYMP'
                    elif trait['Name'] == 'DIAGNOSIS':
                        category = 'DIAGN'
            # add our response string to corresponding list 
            if not category: 
                med_cond.append(resp_str)
            elif category == 'SYMP': 
                symptoms.append(resp_str)
            elif category == 'DIAGN':
                diagnosis.append(resp_str)

def find_key_phrases(data:str, key_phrases, icd10cm_list, anatomy_list):
    """
    :data type: string to pass through Comprehend Detect Key Phrases 
    :key_phrases type: List[] 
    :icd10cm_list type: List[]
    :anatomy_list type: List[]
    """
    if not data: 
        return 
    kp_result = compr.detect_key_phrases(Text=data, LanguageCode='en')
    for resp in kp_result['KeyPhrases']:
        placed = False
        if resp['Score'] > 0.5: 
            for icd10cm in icd10cm_list: 
                if contains_word(icd10cm, resp['Text']):
                    key_phrases.append(resp['Text'])
                    placed = True
                    break 
                elif contains_word(resp['Text'], icd10cm):
                    key_phrases.append(resp['Text'])
                    placed = True
                    break
            if not placed: 
                for anatomy in anatomy_list: 
                    if contains_word(anatomy, resp['Text']):
                        key_phrases.append(resp['Text'])
                        break

def find_entities(data: str): 
    if not data: 
        return []
    result = compr_m.detect_entities_v2(Text=data)        
    # print("-- Key Phrases --")
    for resp in result['Entities']:
        # print(resp)
        if resp['Score'] > 0.5: 
                resp_dict = {resp['Text']: {}}
                # get_traits(resp, resp_dict[resp['Text']])
                # get_attributes(resp, resp_dict[resp['Text']])
                # ret_list.append(resp_dict)
    