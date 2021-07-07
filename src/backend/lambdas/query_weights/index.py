import psycopg2
import postgresql
import boto3
from botocore.config import Config
from botocore import UNSIGNED
import logging
import json
import os

logger = logging.getLogger()
logger.setLevel(logging.INFO)
lambda_client = boto3.client('lambda')
UpdateWeightLambdaName = os.getenv('UPDATE_WEIGHTS_LAMBDA')


def addWeight(cur, values):
    cmd = """
    INSERT INTO word_weights
    VALUES """
    param_values = []
    for value in values:
        cmd += "(%s, %s),"
        param_values.extend([value['key'], value['value']])
    cmd = cmd[:-1]
    cmd += " RETURNING word, weight"
    cur.execute(cmd, param_values)
    return cur.fetchall()


def updateWeight(cur, values):
    cmd = """
    UPDATE word_weights set word = new_word, weight = new_weight
    FROM (VALUES """
    param_values = []
    for value in values:
        cmd += " (%s, %s),"
        param_values.extend([value['key'], value['value']])
    cmd = cmd[:-1]
    cmd += " ) as tmp(new_word, new_weight) WHERE tmp.new_word = word_weights.word RETURNING word, weight"
    cur.execute(cmd, param_values)
    return cur.fetchall()


def deleteWeight(cur, id):
    cmd = """
    DELETE FROM word_weights
    WHERE word = %s"""
    cur.execute(cmd, (id,))


def applyWeight():
    debug = os.getenv('LOCAL_DEBUG')
    if debug is not None:
        # “generated Lambdas are suffixed with an ID to keep them unique between multiple deployments
        # (e.g. FunctionB-123ABC4DE5F6A), so a Lamba named "FunctionB" doesn't exist”
        # https://stackoverflow.com/questions/60181387/how-to-invoke-aws-lambda-from-another-lambda-within-sam-local
        lambda_client_local = boto3.client('lambda',
                                           endpoint_url="http://host.docker.internal:5001",
                                           use_ssl=False,
                                           verify=False,
                                           config=Config(signature_version=UNSIGNED,
                                                         read_timeout=10000,
                                                         retries={'max_attempts': 0}))
        response = lambda_client_local.invoke(
            FunctionName=UpdateWeightLambdaName,
            InvocationType='RequestResponse',
        )
    else:
        response = lambda_client.invoke(
            FunctionName=UpdateWeightLambdaName,
            InvocationType='RequestResponse',
        )

    ret = json.loads(response['Payload'].read())
    if ret['result'] == False:
        logger.error("Apply Weight Failed")


def parseResponse(response):
    resp_list = []
    for resp_tuple in response:
        resp = {}
        resp['key'] = resp_tuple[0]
        resp['value'] = resp_tuple[1]
        resp_list.append(resp)
    return resp_list


def handler(event, context):
    logger.info(event)
    if 'body' not in event:
        logger.error('Missing parameters')
        return {"isBase64Encoded": False, "statusCode": 400, "body": "Missing Body Parameter",
                "headers": {"Content-Type": "application/json"}}

    data = json.loads(event['body'])  # use for postman tests
    # data = event['body'] # use for console tests
    logger.info(data)
    psql = postgresql.PostgreSQL()

    # CORS preflight for local debugging
    headers = {
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    }

    with psql.conn.cursor() as cur:
        try:
            if data['operation'] == 'GET':
                response = psql.queryTable('word_weights')
                resp_dict = {'result': True, 'headers': headers}
                logger.info(response)
                resp_list = parseResponse(response)
                resp_dict['data'] = resp_list
                return resp_dict
            elif data['operation'] == 'ADD':
                response = addWeight(cur, data['values'])
                resp_list = parseResponse(response)
            elif data['operation'] == 'UPDATE':
                response = updateWeight(cur, data['values'])
                resp_list = parseResponse(response)
            elif data['operation'] == 'DELETE':
                deleteWeight(cur, data['id'])
            psql.commit()
            logger.info("Applying Change")
            applyWeight()
            if data['operation'] == 'ADD' or data['operation'] == 'UPDATE':
                return {'result': True, 'headers': headers, 'data': resp_list}
        except Exception as error:
            logger.error(error)
            logger.error("Exception Type: %s" % type(error))
            return {"isBase64Encoded": False, "statusCode": 400, "body": f'{type(error)}',
                    "headers": {"Content-Type": "application/json"}}
    return {'result': True, 'headers': headers}
