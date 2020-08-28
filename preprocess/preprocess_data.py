import boto3
import pandas as pd
from preprocess_helper import *
import string 
import time 
import uuid 
import sys
sys.path.append('.')
from rule_processing import postgresql

start = time.time() 

data_df = pd.read_csv('./csv/requisition_data_200.csv', skip_blank_lines=True).fillna({'Req # CIO': '-1'}).astype('object')
# Format columns that don't need comprehend medical and preprocess the text 
data_df['CIO_ID'] = data_df['Req # CIO']
data_df['age'] = data_df['DOB \n(yyyy-mm-dd)'].apply(dob2age)
data_df['height'] = data_df['Height \r\n(eg: ft.in)'] + \
    ' ' + data_df['INCH - CM']
data_df['weight'] = data_df["Weight"].astype(str) + ' ' + data_df['KG - LBS']
data_df['height'] = data_df['height'].apply(convert2CM)
data_df['weight'] = data_df['weight'].apply(convert2KG)
data_df['Exam Requested'] = preProcessText(data_df['Exam Requested (Free Text)'])
data_df['priority'] = data_df['Radiologist Priority ']
data_df['Reason for Exam/Relevant Clinical History'] = preProcessText(data_df['Reason for Exam/Relevant Clinical History (Free Text)'])
data_df['Hip & Knee'] = preProcessText(data_df['Appropriateness Checklist - Hip & Knee'])
data_df['Spine'] = preProcessText(data_df['Appropriateness Checklist - Spine'])

# New Dataframe with
formatted_df = data_df[['CIO_ID', 'height', 'weight', 'Sex','age', 'Preferred MRI Site', 'priority']]
formatted_df.loc[:,'p5'] = 'f'
formatted_df.loc[:,'medical_condition'] = ''
formatted_df.loc[:,'diagnosis'] = ''
formatted_df.loc[:,'anatomy'] = ''
formatted_df.loc[:,'symptoms'] = ''
formatted_df.loc[:,'phrases'] = ''
formatted_df.loc[:,'other_info'] = ''

# Obtain data from postgres 
conn = postgresql.connect() 
conj_list = queryTable(conn, "conjunctions")
conn.close() 

for row in range(len(formatted_df.index)):
    print("row is :", row)
    anatomy_list = []
    medical_conditions = [] 
    diagnosis = [] 
    symptoms = []
    key_phrases = []
    other_info = []
    
    # Create a UUID for CIO ID if there isn't one already 
    formatted_df.loc[row,'CIO_ID'] = findId(f'{formatted_df["CIO_ID"][row]}')
    # Change Unidentified priority to code U/I 
    formatted_df.loc[row,'priority'] = findUnidentified(f'{formatted_df["priority"][row]}')

    # Parse the Exam Requested Column into Comprehend Medical to find Anatomy Entities
    anatomy_json = find_all_entities(checkSpelling(f'{data_df["Exam Requested"][row]}'))
    preprocessed_text = replace_conjunctions(conj_list,f'{data_df["Reason for Exam/Relevant Clinical History"][row]}',other_info)
    for obj in anatomy_json: 
        if obj['Category'] == 'ANATOMY' or obj['Category'] == 'TEST_TREATMENT_PROCEDURE' or obj['Category'] == 'MEDICAL_CONDITION':
            anatomy_list.append(obj['Text'])
        elif obj['Score'] > 0.4 and obj['Category'] == 'TIME_EXPRESSION' and obj['Type'] == 'TIME_TO_TEST_NAME':
            formatted_df.loc[row, 'p5'] = 't' 
        # if(contains_word('hip',anatomy) or contains_word('knee', anatomy)):
        #     # apply comprehend to knee/hip column
        #     formatted_df['Hip & Knee'][row] = find_entities(f'{data_df["Hip & Knee"][row]}') 
        # elif(contains_word('spine',anatomy)):
        #     # apply comprehend to spine column
        #     formatted_df['Spine'][row] = find_entities(f'{data_df["Appropriateness Checklist - Spine"][row]}') 
    
    infer_icd10_cm(preprocessed_text, medical_conditions, diagnosis, symptoms)
    find_key_phrases(preprocessed_text, key_phrases, medical_conditions+diagnosis+symptoms, anatomy_list)

    # formatted_df['anatomy'][row] = anatomy_list    
    # formatted_df['medical_condition'][row] = medical_conditions
    # formatted_df['diagnosis'][row] = diagnosis
    # formatted_df['symptoms'][row] = symptoms
    # formatted_df['phrases'][row] = key_phrases
    # formatted_df['other_info'][row] = other_info
    formatted_df.at[row, 'anatomy'] = anatomy_list    
    formatted_df.at[row, 'medical_condition'] = medical_conditions
    formatted_df.at[row, 'diagnosis'] = diagnosis
    formatted_df.at[row, 'symptoms'] = symptoms
    formatted_df.at[row, 'phrases'] = key_phrases
    formatted_df.at[row, 'other_info'] = other_info

formatted_df.to_json('sample_output.json', orient='index')

print(f'---{time.time()-start}---')
