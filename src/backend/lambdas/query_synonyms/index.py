import psycopg2
import postgresql
import boto3
import logging
import json

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def addSynonym(cur, data):
    if 'key' not in data:
        raise TypeError("Missing 'key'")

    params = (data['key'], data['value'])

    cmd = """
    INSERT INTO synonyms
    VALUES (%s, %s) RETURNING key, val
    """

    logger.info(cmd)
    logger.info(params)
    cur.execute(cmd, params)

    return cur.fetchall()


def update_synonym(cur, data):
    if 'key' not in data:
        raise TypeError("Missing 'key'")
    key = data['key']
    logger.info(key)

    # Delete old one first if necessary
    if 'old_key' in data:
        old_key = data['old_key']
        logger.info(old_key)

        # NOTE: FALLTHROUGH and just do an update below if keys are the unchanged
        if key != old_key:
            # Delete first
            deleteSynonym(cur, old_key)
            logger.info('deleteSynonym')
            response = parseResponse(addSynonym(cur, data))
            logger.info('parseResponse(addSynonym')
            logger.info(response)
            response[0]['old_key'] = old_key
            logger.info(response)
            return response

    # Update only
    cmd = """
    UPDATE synonyms set key = new_key, val = new_val
    FROM (VALUES """
    param_values = []
    cmd += " (%s, %s)"
    param_values.extend([key, data['value']])
    cmd += " ) as tmp(new_key, new_val) WHERE tmp.new_key = synonyms.key RETURNING key, val"
    cur.execute(cmd, param_values)

    return parseResponse(cur.fetchall())

# Meh dont bother supprting multiple values at a time
#
# def addSynonym(cur, values):
#     cmd = """
#     INSERT INTO synonyms
#     VALUES """
#     param_values = []
#     for value in values:
#         cmd += "(%s, %s),"
#         param_values.extend([value['key'], value['value']])
#     cmd = cmd[:-1]
#     cmd += " RETURNING key, val"
#     cur.execute(cmd, param_values)
#     return cur.fetchall()

# def update_synonym(cur, values):
#     key = value['key']
#     old_key = value['old_key']
#
#     # Delete old one first if they necessary
#     if old_key is not None and key != old_key:
#         deleteSynonym(cur, old_key)
#         addSynonym(cur, values)
#     else:
#         cmd = """
#         UPDATE synonyms set key = new_key, val = new_val
#         FROM (VALUES """
#         param_values = []
#         for value in values:
#             cmd += " (%s, %s),"
#             param_values.extend([value['key'], value['value']])
#         cmd = cmd[:-1]
#         cmd += " ) as tmp(new_key, new_val) WHERE tmp.new_key = synonyms.key RETURNING key, val"
#         cur.execute(cmd, param_values)
#
#     return cur.fetchall()

def deleteSynonym(cur, id):
    cmd = """
    DELETE FROM synonyms
    WHERE key = %s"""

    cur.execute(cmd, (id,))
    # NOTE: There must be a comma after lines[0] to make that a tuple
    # Since the execute method is expecting a sequence (or a mapping) it iterates over the string you provided
    # surrounded by parenthesis. So it is necessary to explicitly make that a tuple.


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
                resp_list = parseResponse(addSynonym(cur, data))
            elif data['operation'] == 'UPDATE':
                resp_list = update_synonym(cur, data)
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

