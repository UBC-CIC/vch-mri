import psycopg2
import postgresql
import boto3
import logging
import json

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def addSynonym(cur, values):
    cmd = """
    INSERT INTO synonyms
    VALUES """
    param_values = []
    for value in values:
        cmd += "(%s, %s),"
        param_values.extend([value['key'], value['value']])
    cmd = cmd[:-1]
    cmd += " RETURNING key, val"
    cur.execute(cmd, param_values)
    return cur.fetchall()


def updateSynonym(cur, values):
    cmd = """
    UPDATE synonyms set key = new_key, val = new_val
    FROM (VALUES """
    param_values = []
    for value in values:
        cmd += " (%s, %s),"
        param_values.extend([value['key'], value['value']])
    cmd = cmd[:-1]
    cmd += " ) as tmp(new_key, new_val) WHERE tmp.new_key = synonyms.key RETURNING key, val"
    cur.execute(cmd, param_values)
    return cur.fetchall()


def deleteSynonym(cur, id):
    cmd = """
    DELETE FROM synonyms
    WHERE key = %s"""
    cur.execute(cmd, (id,))


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
                response = psql.queryTable('synonyms')
                resp_dict = {'result': True, 'headers': headers}
                logger.info(response)
                resp_list = parseResponse(response)
                resp_dict['data'] = resp_list
                return resp_dict
            elif data['operation'] == 'ADD':
                response = addSynonym(cur, data['values'])
                resp_list = parseResponse(response)
            elif data['operation'] == 'UPDATE':
                response = updateSynonym(cur, data['values'])
                resp_list = parseResponse(response)
            elif data['operation'] == 'DELETE':
                deleteSynonym(cur, data['id'])
            psql.commit()
            if data['operation'] == 'ADD' or data['operation'] == 'UPDATE':
                return {'result': True, 'headers': headers, 'data': resp_list}
        except Exception as error:
            logger.error(error)
            logger.error("Exception Type: %s" % type(error))
            return {"isBase64Encoded": False, "statusCode": 400, "body": f'{type(error)}',
                    "headers": {"Content-Type": "application/json"}}
    return {'result': True, 'headers': headers}

