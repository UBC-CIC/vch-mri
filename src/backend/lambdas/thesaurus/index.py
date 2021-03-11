import json
import urllib.parse
import boto3
import logging
import os
import postgresql

logger = logging.getLogger()
logger.setLevel(logging.INFO)
destPath = os.getenv('DEST_PATH')
sendCommandName = os.getenv('SEND_COMMAND_NAME')
ssmPath = os.getenv("SSM_PATH")
s3 = boto3.client('s3')
ssm = boto3.client('ssm')

cmd = """
DROP TEXT SEARCH CONFIGURATION IF EXISTS ths_search;

DROP TEXT SEARCH DICTIONARY IF EXISTS ths_med;

CREATE TEXT SEARCH DICTIONARY ths_med (
TEMPLATE = thesaurus, 
DictFile = thesaurus_medical,
Dictionary = english_stem); 

CREATE TEXT SEARCH CONFIGURATION ths_search (copy=english); 

ALTER TEXT SEARCH CONFIGURATION ths_search 
ALTER MAPPING FOR asciiword, asciihword, hword_asciipart 
WITH ths_med, english_stem;
"""

def handler(event, context):
    #get parameters from ssm
    params = ssm.get_parameters(
        Names=[
            ssmPath
        ],
        WithDecryption = True
    )
    logger.info("Finished Acquiring Params")
    if params['ResponseMetadata']['HTTPStatusCode'] != 200:
        logger.info('ParameterStore Error: ', str(params['ResponseMetadata']['HTTPStatusCode']))
        return {"isBase64Encoded": False, "statusCode": params['ResponseMetadata']['HTTPStatusCode'], "body": "SSM Error", "headers": {"Content-Type": "application/json"}}
    for p in params['Parameters']:
        if p['Name'] == ssmPath:
            ec2 = p['Value']
    #get bucket name
    bucket = event['Records'][0]['s3']['bucket']['name']
    #get the file/key name
    key = urllib.parse.unquote_plus(event['Records'][0]['s3']['object']['key'], encoding='utf-8')
    fileName = key.split("/")[1]
    logger.info(bucket)
    logger.info(key)
    logger.info(destPath)
    logger.info(ec2)
    #fetch file from S3
    response = s3.get_object(Bucket=bucket, Key=key)
    logger.info(response)
    #use ssm to send command to instance
    logger.info("Got S3 Object")
    ssm.send_command(
        InstanceIds =[ec2],
        Parameters={
                'fileName': [
                    fileName,
                ],
                's3Key': [
                    key,
                ],
                'destPath': [
                    destPath,
                ],
                'bucket':[
                    bucket,
                ],
            },
        DocumentName=sendCommandName
    )
    logger.info("Updated EC2 Instance")
    # Update text configuration on postgresql 
    psql = postgresql.PostgreSQL()
    with psql.conn.cursor() as cur: 
        try: 
            cur.execute(cmd)
            psql.commit()
            logger.info("Updated PostgreSQL Text Configuration")
        except Exception as error:
            logger.error(error)
            return {"isBase64Encoded": False, "statusCode": 400, "body": f'{type(error)}', "headers": {"Content-Type": "application/json"}}
