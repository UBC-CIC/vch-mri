import boto3
import pandas as pd
from preprocess_helper import *
import string 
import time 

start = time.time() 
# s3_bucket = 'cic-mri-data-bucket-test'
# prefix = 'sagemaker/preprocess_data'
# input_key = 'raw_data/may2020_data.csv'
# s3_data_path = "s3://{}/{}".format(s3_bucket, input_key)
# s3_output_path = "s3://{}/{}".format(s3_bucket, prefix)

# data_df = pd.read_csv(s3_data_path).dropna(how='all')
data_df = pd.read_csv('sample.csv').dropna(how='all').head(n=10)
# Format columns that don't need comprehend medical and preprocess the text 
data_df['age'] = data_df['DOB \r\n(yyyy-mm-dd)'].apply(dob2age)
data_df['height'] = data_df['Height \r\n(eg: ft.in)'] + \
    ' ' + data_df['INCH - CM']
data_df['weight'] = data_df['Weight'] + ' ' + data_df['KG - LBS']
data_df['Radiologist Priority'] = data_df['Radiologist Priority ']
data_df['height'] = data_df['height'].apply(convert2CM)
data_df['weight'] = data_df['weight'].apply(convert2KG)
data_df['Exam Requested'] = preProcessText(data_df['Exam Requested (Free Text)'])
data_df['Reason for Exam/Relevant Clinical History'] = preProcessText(data_df['Reason for Exam/Relevant Clinical History (Free Text)'])
data_df['Spine'] = preProcessText(data_df['Appropriateness Checklist - Spine'])
data_df['Hip & Knee'] = preProcessText(data_df['Appropriateness Checklist - Hip & Knee'])

# New Dataframe with
formatted_df = data_df[['Req # CIO', 'height', 'weight', 'Sex','age', 'Preferred MRI Site', 'Radiologist Priority']]
formatted_df['medical_condition'] = ''
formatted_df['diagnosis'] = ''
formatted_df['anatomy'] = ''
formatted_df['symptoms'] = ''
formatted_df['phrases'] = ''
formatted_df['other_info'] = ''

for row in range(len(formatted_df.index)):
    print("row is :", row)
    anatomy_list = []
    medical_conditions = [] 
    diagnosis = [] 
    symptoms = []
    key_phrases = []
    other_info = []
    
    # Parse the Exam Requested Column into Comprehend Medical to find Anatomy Entities
    # mri_reason = checkSpelling(f'{data_df["Exam Requested"][row]}'.replace('MRI','')) # Comprehend Medical sometimes combines anatomy + MRI together
    mri_reason = anatomySpelling(f'{data_df["Exam Requested"][row]}')
    temp_json = find_all_entities(mri_reason)
    directioned_anatomy = f'{data_df["Reason for Exam/Relevant Clinical History"][row]}'
    
    for obj in list(filter(lambda info_list: info_list['Category'] == 'ANATOMY', temp_json)):
        # print("--Body Part Identified: ", obj['Text'])
        anatomy = obj['Text'].lower()
        anatomy_list.append(anatomy)
        directioned_anatomy = preProcessAnatomy(anatomy, directioned_anatomy) # making changes from L/l -> left and R/r-> right
        # if(contains_word('hip',anatomy) or contains_word('knee', anatomy)):
        #     # apply comprehend to knee/hip column
        #     formatted_df['Hip & Knee'][row] = find_entities(f'{data_df["Hip & Knee"][row]}') 
        # elif(contains_word('spine',anatomy)):
        #     # apply comprehend to spine column
        #     formatted_df['Spine'][row] = find_entities(f'{data_df["Appropriateness Checklist - Spine"][row]}') 
        
    infer_icd10_cm(directioned_anatomy, medical_conditions, diagnosis, symptoms)
    find_key_phrases(directioned_anatomy, key_phrases, medical_conditions+diagnosis+symptoms, anatomy_list)
    find_additional_info(directioned_anatomy, other_info)    

    formatted_df['anatomy'][row] = anatomy_list    
    formatted_df['medical_condition'][row] = medical_conditions
    formatted_df['diagnosis'][row] = diagnosis
    formatted_df['symptoms'][row] = symptoms
    formatted_df['phrases'][row] = key_phrases
    formatted_df['other_info'][row] = other_info

formatted_df.to_json('sample_output.json', orient='index')

print( f'---{time.time()-start}---')
