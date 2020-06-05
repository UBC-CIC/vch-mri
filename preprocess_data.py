import boto3
import pandas as pd
from preprocess_helper import *
import string 
import time

s3_bucket = 'cic-mri-data-bucket-test'
prefix = 'sagemaker/preprocess_data'
input_key = 'raw_data/may2020_data.csv'

s3_data_path = "s3://{}/{}".format(s3_bucket, input_key)
s3_output_path = "s3://{}/{}".format(s3_bucket, prefix)

start_time = time.time() #timer

# data_df = pd.read_csv(s3_data_path).dropna(how='all')
data_df = pd.read_csv('sample.csv').dropna(how='all')

# Format columns that don't need comprehend medical
data_df['age'] = data_df['DOB \n(yyyy-mm-dd)'].apply(dob2age)
data_df['height'] = data_df['Height \n(eg: ft.in)'] + \
    ' ' + data_df['INCH - CM']
data_df['weight'] = data_df['Weight'] + ' ' + data_df['KG - LBS']
data_df['Radiologist Priority'] = data_df['Radiologist Priority ']
data_df['height'] = data_df['height'].apply(convert2CM)
data_df['weight'] = data_df['weight'].apply(convert2KG)

formatted_df = data_df[['Req # CIO', 'height', 'weight', 'Sex','age', 'Preferred MRI Site', 'Radiologist Priority']]
data_df['Exam Requested'] = preProcessText(data_df['Exam Requested (Free Text)'])
data_df['Reason for Exam/Relevant Clinical History'] = preProcessText(data_df['Reason for Exam/Relevant Clinical History (Free Text)'])
data_df['Spine'] = preProcessText(data_df['Appropriateness Checklist - Spine'])
data_df['Hip & Knee'] = preProcessText(data_df['Appropriateness Checklist - Hip & Knee'])

formatted_df['Exam Requested'] = ''
formatted_df['Reason for Exam/Relevant Clinical History'] =''
formatted_df['Spine'] = ''
formatted_df['Hip & Knee'] = ''

for row in range(len(formatted_df.index)):
    print("row is :", row)
    anatomy_list = []
    mri_reason = f'{data_df["Exam Requested"][row]}'.replace('MRI','') # Comprehend Medical sometimes combines anatomy + MRI together
    temp_json = find_all_entities(mri_reason)
    directioned_anatomy = f'{data_df["Reason for Exam/Relevant Clinical History"][row]}'
    for obj in list(filter(lambda info_list: info_list['Category'] == 'ANATOMY', temp_json)):
        # print("--Body Part Identified: ", obj['Text'])
        anatomy = obj['Text'].lower()
        anatomy_list.append(anatomy)
        directioned_anatomy = preProcessAnatomy(anatomy, directioned_anatomy) # making changes from L/l -> left and R/r-> right

        if(contains_word('hip',anatomy) or contains_word('knee', anatomy)):
            # apply comprehend to knee/hip column
            # print("------ Column: Hip & Knee -----")
            # print(f'{data_df["Appropriateness Checklist - Hip & Knee"][row]}')
            formatted_df['Hip & Knee'][row] = find_entities(f'{data_df["Hip & Knee"][row]}') 
        
        elif(contains_word('spine',anatomy)):
            # apply comprehend to spine column
            # print("----- Column: Spine -----")
            # print(f'{data_df["Appropriateness Checklist - Spine"][row]}')
            formatted_df['Spine'][row] = find_entities(f'{data_df["Appropriateness Checklist - Spine"][row]}') 
    
    formatted_df['Exam Requested'][row] = anatomy_list    
    free_text = {}
    free_text['ICD10_CM'] = infer_icd10_cm(directioned_anatomy)
    free_text['Key_Phrases'] = find_relevant_phrases(directioned_anatomy, free_text['ICD10_CM'], anatomy_list)
    formatted_df['Reason for Exam/Relevant Clinical History'][row] = free_text

formatted_df.to_json('mridata_1.json', orient='index')

print("--- %s seconds ---", (time.time() - start_time))
