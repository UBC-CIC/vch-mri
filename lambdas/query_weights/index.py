import psycopg2 
import postgresql
import boto3 
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
        logger.error( 'Missing parameters')
        return {'result': False, 'msg': 'Missing parameters' }

    data = json.loads(event['body']) # use for postman tests
    # data = event['body'] # use for console tests
    logger.info(data)
    psql = postgresql.PostgreSQL()

    with psql.conn.cursor() as cur:
        try: 
            if data['operation'] == 'GET':
                response = psql.queryTable('word_weights')
                resp_dict = {'result': True}
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
                return {'result': True, 'data': resp_list}
        except Exception as error:
            logger.error(error)
            logger.error("Exception Type: %s" % type(error))
            return {'result': False, 'msg': f'{error}'}
   
    return {'result': True}
    
