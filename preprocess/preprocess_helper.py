import boto3 
from datetime import datetime, date
import re
import string
import pandas as pd
from spellchecker import SpellChecker 

compr = boto3.client(service_name='comprehend')
compr_m = boto3.client(service_name='comprehendmedical')

spell = SpellChecker() 
spell.word_frequency.load_text_file('./wordbank.txt')

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
    extr = col.str.lower()
    return extr 

def checkSpelling(text: str):
    words = spell.split_words(text)
    return ' '.join([spell.correction(word) for word in words])

def anatomySpelling(text: str):
    words = spell.split_words(text)
    word_list = []
    for word in words: 
        word_list.append(spell.correction(word))
    return ' '.join(word_list)

def preProcessAnatomy(text):
    dir_list = {
        'l': 'left', 
        'r': 'right',
        'L': 'left',
        'R': 'right'
    }
    temp_text = f' {text} '
    for direction in dir_list: 
        if contains_word(direction,text): 
            temp_text = temp_text.replace(f' {direction} ', f' {dir_list[direction]} ')
    return temp_text[1:len(temp_text)-1]

def find_additional_info(text:str, info_list): 
    """
    Will append history and hx seperately, need to format it so this will become standardized? 
    """
    text_list = {
        'followup': 'followup',
        'history': 'history',
        'hx': 'medical history',
        '?': 'query',
    }
    for i in text_list: 
        if f'{i}' in f'{text}':
            info_list.append(text_list[i])

def find_all_entities(data: str):
    if not data: 
        return [] 
    # print("-- Entities --")
    try: 
        result = compr_m.detect_entities_v2(Text=data)
        # for resp in result['Entities']:
            # print(resp)
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
            if resp['Score'] > 0.5: 
                resp_str = resp['Text']
                category = ''
                # first check Attributes
                for attr in resp['Attributes']: 
                    if attr['Score'] > 0.5: 
                        if attr['Type'] == 'ACUITY' or attr['Type'] == 'DIRECTION': 
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
            if resp['Score'] > 0.5: 
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
    