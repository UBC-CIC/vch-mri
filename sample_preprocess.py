#!/usr/bin/python3
import boto3
import csv
import spacy
import pytextrank
med = boto3.client('comprehendmedical', region_name='us-west-2')
cmpr = boto3.client('comprehend', region_name='us-west-2')
body_parts = []
def detect_body_part(text):
    response = med.detect_entities_v2(
        Text=text
    )
    print("-> detect_body_part")
    for rec in response['Entities']:
        if 'Category' in rec:
            if rec['Category'] == "ANATOMY":
                print("- Body Part Identified: " + rec['Text'])
                # body_parts.append(rec['Text'])
def infer_icd10_cm(text):
    response = med.infer_icd10_cm(
        Text=text
    )
    print("-> infer_icd10_cm")
    for rec in response['Entities']:
        if 'Category' in rec:
            if rec['Category'] == "MEDICAL_CONDITION":
                print(rec["Text"])
def key_phrases(text):
    response = cmpr.detect_key_phrases(
        Text=text,
        LanguageCode='en'
    )
    print("-> key_phrases")
    for rec in response['KeyPhrases']:
        if rec["Score"] > 0.5:
            print(rec["Text"])
def ext_nlp(text):
    # load a spaCy model, depending on language, scale, etc.
    nlp = spacy.load("en_core_web_md")
    # add PyTextRank to the spaCy pipeline
    tr = pytextrank.TextRank()
    nlp.add_pipe(tr.PipelineComponent, name="textrank", last=True)
    doc = nlp(text)
    print("-> ext_nlp")
    # examine the top-ranked phrases in the document
    for p in doc._.phrases:
        #print("{:.4f} {:5d}  {}".format(p.rank, p.count, p.text))
        print(p.chunks)
with open('sample.csv', mode='r') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    line_count = 0
    for row in csv_reader:
        if line_count == 0:
            # print(f'Column names are {", ".join(row)}')
            line_count += 1
        print("----- Column: ExamRequested -----")
        print(f'{row["ExamRequested"]}')
        print("---------------------------------")
        if (len(row["ExamRequested"]) > 2 ):
            detect_body_part(row["ExamRequested"])
        print("----- Column: ReasonforExam -----")
        print(f'{row["ReasonforExam"]}')
        print("---------------------------------")
        if (len(row["ReasonforExam"]) > 2 ):
            infer_icd10_cm(row["ReasonforExam"])
            key_phrases(row["ReasonforExam"])
        # ext_nlp(row["ReasonforExam"])
        print("------------------------------------------------ End")
        line_count += 1
    print(f'Processed {line_count} lines.')