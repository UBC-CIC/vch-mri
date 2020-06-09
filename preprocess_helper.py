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
    return extr 

def checkSpelling(text: str):
    words = spell.split_words(text)
    return ' '.join([spell.correction(word) for word in words])
    # ret_string = ''
    # for word in words: 
    #     ret_string = ret_string + ' ' + spell.correction(word)
    # return ret_string

def anatomySpelling(text: str):
    words = spell.split_words(text)
    word_list = []
    for word in words: 
        if word == 'MRI': 
            continue
        else: 
            word_list.append(word)
    return ' '.join(word_list)


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
                resp_str = checkSpelling(resp_str)
                med_cond.append(resp_str)
            elif category == 'SYMP': 
                resp_str = checkSpelling(resp_str)
                symptoms.append(resp_str)
            elif category == 'DIAGN':
                resp_str = checkSpelling(resp_str)
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

# def find_entities(data: str): 
#     if not data: 
#         return []
#     result = compr_m.detect_entities_v2(Text=data)        
#     # print("-- Key Phrases --")
#     for resp in result['Entities']:
#         # print(resp)
#         if resp['Score'] > 0.5: 
#                 resp_dict = {resp['Text']: {}}
                # get_traits(resp, resp_dict[resp['Text']])
                # get_attributes(resp, resp_dict[resp['Text']])
                # ret_list.append(resp_dict)
    