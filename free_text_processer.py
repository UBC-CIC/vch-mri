import boto3
import pandas as pd
import json

# s3_bucket = 'cic-mri-data-bucket-test'
# prefix = 'sagemaker/preprocess_data'
# input_key = 'raw_data/may2020_data.csv'
# s3_data_path = "s3://{}/{}".format(s3_bucket, input_key)

comprehend = boto3.client(service_name='comprehend')
comprehend_m = boto3.client(service_name='comprehendmedical')

import sys 
# sys.stdout=open("sample_output.txt", "w")

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
        result = comprehend_m.detect_entities_v2(Text=data)
        for resp in result['Entities']:
            print(resp)
        return result['Entities']
    else:
        return []

def find_freetext_entities(data):
    if isinstance(data, str):
        result = find_entities(data)
        ret_list = []
        for obj in list(filter(lambda info_list: (info_list['Category'] == 'ANATOMY' or info_list['Category'] == 'MEDICAL_CONDITION'), result)):
            info = obj['Text']
            ret_list.append(info)
        return ret_list
    else:
        return [] 

def find_phrases(data):
    if isinstance(data, str):
        result = comprehend.detect_key_phrases(Text=data, LanguageCode='en')
        ret_list = []
        print("-- Key Phrases --")
        for resp in result['KeyPhrases']:
            print(resp)
            if resp['Score'] > 0.5: 
                ret_list.append(resp['Text'])
        return ret_list #only return scores > 0.5 for phrases 
    else:
        return []

def infer_icd10_cm(data):
    if isinstance(data, str):
        print("-- ICD10_CM --")
        result = comprehend_m.infer_icd10_cm(Text=data)
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
            if 'Attributes' in response_dict: 
                response_dict['Attributes'].append(attr_dict)
            else: 
                response_dict['Attributes'] = [attr_dict]


data_df = pd.read_csv('sample.csv').dropna(how='all')
# 'Relevant Previous Exams', 
# 'Exam Requested (Free Text)', 
# 'Reason for Exam/Relevant Clinical History (Free Text)',
# 'Appropriateness Checklist - Spine', 'Appropriateness Checklist - Hip & Knee'

# Preprocess freetext
data_df['Exam Requested (Free Text)'] = preProcessText(data_df['Exam Requested (Free Text)'])
data_df['Reason for Exam/Relevant Clinical History (Free Text)'] = preProcessText(data_df['Reason for Exam/Relevant Clinical History (Free Text)'])
data_df['Appropriateness Checklist - Spine'] = preProcessText(data_df['Appropriateness Checklist - Spine'])
data_df['Appropriateness Checklist - Hip & Knee'] = preProcessText(data_df['Appropriateness Checklist - Hip & Knee'])

for row in range(20):
    print("Row #", row)
    print("----- Column: Exam Requested -----")
    print(f'{data_df["Exam Requested (Free Text)"][row]}')
    temp_json = find_entities(data_df['Exam Requested (Free Text)'][row])
    directioned_anatomy = data_df['Reason for Exam/Relevant Clinical History (Free Text)'][row]
    for obj in list(filter(lambda info_list: info_list['Category'] == 'ANATOMY', temp_json)):
        print("--Body Part Identified: ", obj['Text'])
        anatomy = obj['Text'].lower()
        
        # if(contains_word('hip',anatomy) or contains_word('knee', anatomy)):
        #     # apply comprehend to knee/hip column
        #     print("------ Column: Hip & Knee -----")
        #     print(f'{data_df["Appropriateness Checklist - Hip & Knee"][row]}')
        #     preprocessed_anatomy = preProcessAnatomy(anatomy, data_df['Appropriateness Checklist - Hip & Knee'][row].lower())
        #     print("Phrases Found: ", find_phrases(preprocessed_anatomy))
        #     print(find_entities(preprocessed_anatomy)) # not enough data to specify

        # elif(contains_word('spine',anatomy)):
        #     # apply comprehend to spine column
        #     print("----- Column: Spine -----")
        #     print(f'{data_df["Appropriateness Checklist - Spine"][row]}')
        #     preprocessed_anatomy = preProcessAnatomy(anatomy, data_df['Appropriateness Checklist - Spine'][row].lower())
        #     print("Phrases Found: ",preprocessed_anatomy)
        #     print(find_entities(data_df['Appropriateness Checklist - Spine'][row])) # no data to specify       

        directioned_anatomy = preProcessAnatomy(anatomy, directioned_anatomy)
  
    
    print("----- Column: Reason for Exam/Relevant Clinical History (Free Text) -----")
    print(f'{data_df["Reason for Exam/Relevant Clinical History (Free Text)"][row]}')
    print(f'{directioned_anatomy}')
    # print("--Phrases Found: ", find_phrases(directioned_anatomy))
    # print("--Freetext Entities Found: ", find_freetext_entities(directioned_anatomy))
    print("--icd10_cm Found: ", infer_icd10_cm(directioned_anatomy),'\n')
    
# sys.stdout.close()