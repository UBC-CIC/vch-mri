import boto3 
from datetime import datetime, date
import re
import string
import pandas as pd

compr = boto3.client(service_name='comprehend')
compr_m = boto3.client(service_name='comprehendmedical')

def find_all_entities(data):
    if isinstance(data, str): 
        if not data: 
            return [] 
        # print("-- Entities --")
        result = compr_m.detect_entities_v2(Text=data)
        # for resp in result['Entities']:
            # print(resp)
        return result['Entities']
    else:
        return []

def infer_icd10_cm(data):
    if isinstance(data, str):
        try: 
            # print("-- ICD10_CM --")
            result = compr_m.infer_icd10_cm(Text=data)
            ret_list = []
            for resp in result['Entities']: 
                # print(resp)
                if resp['Score'] > 0.5: 
                    resp_dict = {resp['Text']: {}}
                    get_traits(resp, resp_dict[resp['Text']])
                    get_attributes(resp, resp_dict[resp['Text']])             
                    ret_list.append(resp_dict)        
            return ret_list
        except: 
            return []
    else: 
        return []

def get_traits(entity, response_dict):
    try:
        for entity_trait in entity['Traits']:
            if entity_trait['Score'] > 0.5: 
                if 'Traits' in response_dict: 
                    response_dict['Traits'].append(f'{entity_trait["Name"]}')
                else: 
                    response_dict['Traits'] = [f'{entity_trait["Name"]}']
    except: 
        return 

def get_attributes(entity, response_dict):
    try: 
        for entity_attr in entity['Attributes']:
            if entity_attr['Score'] > 0.5:
                attr_dict = {'Type': f'{entity_attr["Type"]}', 'Text': f'{entity_attr["Text"]}'}
                get_traits(entity_attr, attr_dict)
                if 'Attributes' in response_dict: 
                    response_dict['Attributes'].append(attr_dict)
                else: 
                    response_dict['Attributes'] = [attr_dict]
    except: 
        return 

def find_entities(data):
    if isinstance(data, str):
        if not data: 
            return []
        result = compr_m.detect_entities_v2(Text=data)        
        ret_list = []
        # print("-- Key Phrases --")
        for resp in result['Entities']:
            # print(resp)
            if resp['Score'] > 0.5: 
                resp_dict = {resp['Text']: {}}
                get_traits(resp, resp_dict[resp['Text']])
                get_attributes(resp, resp_dict[resp['Text']])
                ret_list.append(resp_dict)
        return ret_list 
    else:
        return []

def find_relevant_phrases(data, icd10cm_list, anatomy_list):
    """
    Finds key phrases that contain either 
    :icdm10cm_list type: List(Dict)
    :anatomy_list type: List(String)
    """
    if isinstance(data, str):
        if not data: 
            return []
        result = compr.detect_key_phrases(Text=data, LanguageCode='en')
        ret_list = []
        # print("-- Key Phrases --")
        for resp in result['KeyPhrases']:
            placed = False
            # print(resp) 
            if resp['Score'] > 0.5: 
                for result in icd10cm_list: 
                    [(k,v)] = result.items()
                    if contains_word(k, resp['Text']):
                        ret_list.append(resp['Text'])
                        placed = True
                        break 
                if not placed: 
                    for result in anatomy_list: 
                        if contains_word(result, resp['Text']):
                            ret_list.append(resp['Text'])
                            break
        return ret_list
    else:
        return []

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
    extr = ' '+text # Accounts for cases such as text="L anatomy" 
    for direction in dir_list: 
        if f'{direction}' in f'{extr}': 
            extr = extr.replace(direction+anatomy, dir_list[direction]+anatomy)
    return extr[1:] # removes the space we added originally 

