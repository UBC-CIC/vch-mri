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


def update_bodypart_tokens(cur):
    cmd = """
    UPDATE mri_rules 
    SET bp_tk = to_tsvector(body_part);
    """
    cur.execute(cmd)


def queryRules(cur, count):
    cmd = """
    SELECT id, body_part, contrast, priority, info, active 
    FROM mri_rules
    ORDER BY id
    """
    cur.execute(cmd)
    if count == -1:
        return cur.fetchall()
    else:
        return cur.fetchmany(count)


def queryRulesID(cur, id):
    cmd = """
    SELECT id, body_part, contrast, priority, info, active 
    FROM mri_rules
    WHERE id = %s
    """
    logger.info("Getting Rule ID: " + id)
    cur.execute(cmd, [id])
    logger.info(id)
    return cur.fetchall()


def addRule(cur, values):
    cmd = """
    INSERT INTO mri_rules(body_part, info, priority, contrast) 
    VALUES """
    param_values = []
    for value in values:
        cmd += "(%s, %s, %s, %s),"
        param_values.extend([value['body_part'], value['info'], value['priority'], value['contrast']])
    cmd = cmd[:-1]
    cmd += " RETURNING id, body_part, contrast, priority, info, active"

    command = cmd % param_values
    logger.info(command)

    cur.execute(cmd, param_values)
    ret = cur.fetchall()
    update_bodypart_tokens(cur)
    return ret


def updateRule(cur, values):
    cmd = """
    UPDATE mri_rules SET body_part = new_body_part, info = new_info, priority = new_priority, contrast = CAST(new_contrast AS BOOLEAN)
    FROM (VALUES """
    param_values = []
    for value in values:
        cmd += "(%s, %s, %s, %s, %s),"
        param_values.extend([value['id'], value['body_part'], value['info'], value['priority'], value['contrast']])
    cmd = cmd[:-1]
    cmd += " ) as tmp(id, new_body_part, new_info, new_priority, new_contrast) WHERE CAST(tmp.id AS INTEGER) = mri_rules.id RETURNING mri_rules.id, body_part, contrast, priority, info, active"

    command = cmd % param_values
    logger.info(command)

    cur.execute(cmd, param_values)
    ret = cur.fetchall()
    update_bodypart_tokens(cur)
    return ret


def setRuleActivity(cur, id, active):
    cmd = """
    UPDATE mri_rules SET active = %s
    WHERE id = %s"""
    cur.execute(cmd, (active, id))


def applyWeight():
    IS_LOCAL = os.getenv('IS_LOCAL')
    logger.info('IS_LOCAL')
    logger.info(IS_LOCAL)

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
        resp['id'] = resp_tuple[0]
        resp['body_part'] = resp_tuple[1]
        resp['contrast'] = resp_tuple[2]
        resp['priority'] = resp_tuple[3]
        resp['info'] = resp_tuple[4]
        resp['active'] = resp_tuple[5]
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
    rest_cmd = data['operation']
    logger.info('------- REST: ' + rest_cmd)
    with psql.conn.cursor() as cur:
        try:
            if rest_cmd == 'GET':
                if 'id' in data.keys():
                    response = queryRulesID(cur, data['id'])
                else:
                    response = queryRules(cur, data['count'])

                resp_dict = {'result': True, 'headers': headers, 'data': []}
                # logger.info(response)
                resp_list = parseResponse(response)
                resp_dict['data'] = resp_list
                return resp_dict

            elif rest_cmd == 'ADD':
                response = addRule(cur, data['values'])
                resp_list = parseResponse(response)
            elif rest_cmd == 'UPDATE':
                response = updateRule(cur, data['values'])
                resp_list = parseResponse(response)
            elif rest_cmd == 'DEACTIVATE':
                setRuleActivity(cur, data['id'], 'f')
            elif rest_cmd == 'ACTIVATE':
                setRuleActivity(cur, data['id'], 't')
            psql.commit()
            if rest_cmd == 'ADD' or rest_cmd == 'UPDATE':
                logger.info("Applying weight")
                applyWeight()
                return {'result': True, 'headers': headers, 'data': resp_list}
        except Exception as error:
            logger.error(error)
            logger.error("Exception Type: %s" % type(error))
            return {"isBase64Encoded": False, "statusCode": 400, "body": f'{type(error)}',
                    "headers": {"Content-Type": "application/json"}}
    return {'result': True, 'headers': headers}
