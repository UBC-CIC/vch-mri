# File created for testing icd10_cm functions 
import boto3
import pandas as pd
import json
import re
import string
import sys 

compr_m = boto3.client(service_name='comprehendmedical')
compr = boto3.client(service_name='comprehend')

# sys.stdout=open("icd10cm_output.txt", "w")

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

def find_entities(data):
    if isinstance(data, str): 
        print("-- Entities --")
        result = compr_m.detect_entities_v2(Text=data)
        for resp in result['Entities']:
            print(resp)
        return result['Entities']
    else:
        return []

def infer_icd10_cm(data):
    if isinstance(data, str):
        print("-- ICD10_CM --")
        result = compr_m.infer_icd10_cm(Text=data)
        ret_list = []
        for resp in result['Entities']: 
            print(resp)
            if resp['Score'] > 0.5: 
                resp_dict = {resp['Text']: {}}
                get_traits(resp, resp_dict[resp['Text']])
                get_attributes(resp, resp_dict[resp['Text']])             
                ret_list.append(resp_dict)        
        return ret_list
    else: 
        return []

def get_traits(entity, response_dict):
    for entity_trait in entity['Traits']:
        if entity_trait['Score'] > 0.5: 
            if 'Traits' in response_dict: 
                response_dict['Traits'].append(f'{entity_trait["Name"]}')
            else: 
                response_dict['Traits'] = [f'{entity_trait["Name"]}']

def get_attributes(entity, response_dict):
    for entity_attr in entity['Attributes']:
        if entity_attr['Score'] > 0.5:
            attr_dict = {'Type': f'{entity_attr["Type"]}', 'Text': f'{entity_attr["Text"]}'}
            get_traits(entity_attr, attr_dict)
            if 'Attributes' in response_dict: 
                response_dict['Attributes'].append(attr_dict)
            else: 
                response_dict['Attributes'] = [attr_dict]

def find_relevant_phrases(data, icd10cm_list, anatomy_list):
    """
    Finds key phrases that contain either 
    :icdm10cm_list type: List(Dict)
    :anatomy_list type: List(String)
    """
    if isinstance(data, str):
        result = compr.detect_key_phrases(Text=data, LanguageCode='en')
        ret_list = []
        print("-- Key Phrases --")
        for resp in result['KeyPhrases']:
            placed = False
            print(resp) 
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

def infer_icd10_cm_v2(data: str, med_cond, diagnosis, symptoms):
    """
    :data type: string to pass through Comprehend Medical icd10_cm
    :med_cond type: List[]
    :diagnosis type: List[]
    :symptoms type: List[]
    """
    icd10_result = compr_m.infer_icd10_cm(Text=data)
    for resp in icd10_result['Entities']:
        if resp['Score'] > 0.5: 
            category = ''
            resp_str = resp['Text']
            # first check Attributes
            for attr in resp['Attributes']: 
                if attr['Score'] > 0.5: 
                    if attr['Type'] == 'ACUITY': 
                        resp_str = f'{attr["Text"]}' + ' ' + resp_str
                    elif attr['Type'] == 'SYSTEM_ORGAN_SITE': 
                        resp_str = resp_str + ' ' + f'{attr["Text"]}'
                print(resp_str)
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
            print(category)
            if not category: 
                med_cond.append(resp_str)
            elif category == 'SYMP': 
                symptoms.append(resp_str)
            elif category == 'DIAGN'
                diagnosis.append(resp_str)

def find_key_phrases(data:str, key_phrases, icd10cm_list, anatomy_list):
    kp_result = compr.detect_key_phrases(Text=data, LanguageCode='en')
    for resp in kp_result['KeyPhrases']:
        placed = False
        # print(resp) 
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
    return key_phrases

data_df = pd.read_csv('sample.csv').dropna(how='all').head(n=10)
# 'Relevant Previous Exams', 
# 'Exam Requested (Free Text)', 
# 'Reason for Exam/Relevant Clinical History (Free Text)',
# 'Appropriateness Checklist - Spine', 'Appropriateness Checklist - Hip & Knee'

# Preprocess freetext
data_df['Exam Requested (Free Text)'] = preProcessText(data_df['Exam Requested (Free Text)'])
data_df['Reason for Exam/Relevant Clinical History (Free Text)'] = preProcessText(data_df['Reason for Exam/Relevant Clinical History (Free Text)'])
data_df['Appropriateness Checklist - Spine'] = preProcessText(data_df['Appropriateness Checklist - Spine'])
data_df['Appropriateness Checklist - Hip & Knee'] = preProcessText(data_df['Appropriateness Checklist - Hip & Knee'])


for row in range(len(data_df.index)):
    print("Row #", row)
    # print("----- Column: Exam Requested -----")
    # print(f'{data_df["Exam Requested (Free Text)"][row]}')
    mri_reason = f'{data_df["Exam Requested (Free Text)"][row]}'.replace('MRI','') # Comprehend Medical sometimes combines anatomy + MRI together
    temp_json = find_entities(mri_reason)
    directioned_anatomy = f'{data_df["Reason for Exam/Relevant Clinical History (Free Text)"][row]}'
    anatomy_list = []
    for obj in list(filter(lambda info_list: info_list['Category'] == 'ANATOMY', temp_json)):
        # print("--Body Part Identified: ", obj['Text'])
        anatomy = obj['Text'].lower()  
        anatomy_list.append(anatomy)
        directioned_anatomy = preProcessAnatomy(anatomy, directioned_anatomy) # making changes from L/l -> left and R/r-> right
  
    # print("----- Column: Reason for Exam/Relevant Clinical History (Free Text) -----")
    # print(f'{directioned_anatomy}')
    # infer_ents = infer_icd10_cm(directioned_anatomy)
    # print("\n--icd10_cm Found: ", infer_ents,'\n')
    # print("\n--key phrases Found: ", find_relevant_phrases(directioned_anatomy,infer_ents, anatomy_list),'\n')
    medical_conditions = [] 
    diagnosis = [] 
    symptoms = []
    key_phrases = []
    infer_icd10_cm_v2(directioned_anatomy, medical_conditions, diagnosis, symptoms)
    find_key_phrases(directioned_anatomy, key_phrases, medical_conditions+diagnosis+symptoms, anatomy_list)

    print("medical conditions: ", medical_conditions)
    print("diagnosis: ", diagnosis)
    print("symptoms: ", symptoms)
    print("key phrases: ", key_phrases)
# sys.stdout.close()