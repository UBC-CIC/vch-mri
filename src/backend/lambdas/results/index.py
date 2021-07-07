import postgresql
import boto3
import logging
import json
import os
from datetime import date, datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def queryResults(cur, page):
    cmd = """
    SELECT req.id, req.info, rules_id, ai_priority, req.contrast, p5_flag, tags, phys_priority, phys_contrast,
        created_at, dob, height, weight, reason_for_exam, exam_requested, error, state,
        rules.body_part, rules.bp_tk, rules.info_weighted_tk, rules.priority, rules.contrast as rules_contrast
    FROM data_request as req
    LEFT JOIN mri_rules as rules on rules_id = rules.id
    LIMIT 50 OFFSET %s
    """
    offset = (int(page) - 1) * 50
    cur.execute(cmd, (offset,))
    return cur.fetchall()


def queryPageCount(cur):
    cmd = """
    SELECT CEIL(CAST(COUNT(id) AS float)/50)
    FROM data_request
    """
    cur.execute(cmd)
    return cur.fetchall()[0][0]


def queryResultsID(cur, id):
    cmd = """
    SELECT req.id, req.info, rules_id, ai_priority, req.contrast, p5_flag, tags, phys_priority, phys_contrast,
        created_at, dob, height, weight, reason_for_exam, exam_requested, error, state,
        rules.body_part, rules.bp_tk, rules.info_weighted_tk, rules.priority, rules.contrast as rules_contrast
    FROM data_request as req
    LEFT JOIN mri_rules as rules on rules_id = rules.id
    WHERE req.id = %s
    """
    cur.execute(cmd, [id])
    return cur.fetchall()


def updateResults(cur, id, priority, contrast):
    cmd = """
    UPDATE data_request 
    SET phys_priority = %s, phys_contrast = %s
    WHERE id = %s
    RETURNING id, phys_priority, phys_contrast
    """
    cur.execute(cmd, (priority, contrast, id))
    return cur.fetchall()


def getResultCount(cur, interval):
    if interval == 'DAILY':
        cmd = """
        SELECT COUNT(id)
        FROM data_request
        WHERE DATE(created_at) = current_date
        """
    elif interval == 'WEEKLY':
        cmd = """
        SELECT COUNT(id)
        FROM data_request
        WHERE EXTRACT(WEEK FROM created_at) = EXTRACT(WEEK FROM current_date)
        """
    elif interval == 'MONTHLY':
        cmd = """
        SELECT COUNT(id)
        FROM data_request
        WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM current_date)
        """
    cur.execute(cmd)
    return cur.fetchall()[0][0]


def datetime_to_json(obj):
    if isinstance(obj, (datetime, date)):
        return obj.strftime("%Y-%m-%d %H:%M:%S")
    else:
        return obj


def parseResponse(response):
    resp_list = []
    for resp_tuple in response:
        resp = {}
        rule = {}
        request = {}

        # Rule
        rule['rules_id'] = resp_tuple[2]
        rule['priority'] = resp_tuple[20]
        rule['contrast'] = resp_tuple[21]
        rule['body_part'] = resp_tuple[17]
        rule['bp_tk'] = resp_tuple[18]
        rule['info_weighted_tk'] = resp_tuple[19]

        # Request
        request['dob'] = resp_tuple[10]
        request['height'] = resp_tuple[11]
        request['weight'] = resp_tuple[12]
        request['reason_for_exam'] = resp_tuple[13]
        request['exam_requested'] = resp_tuple[14]

        resp['id'] = resp_tuple[0]
        resp['info'] = resp_tuple[1]        # pre-process info
        resp['rules_id'] = resp_tuple[2]
        resp['priority'] = resp_tuple[3]
        resp['contrast'] = resp_tuple[4]
        resp['p5_flag'] = resp_tuple[5]
        resp['tags'] = resp_tuple[6]
        resp['phys_priority'] = resp_tuple[7]
        resp['phys_contrast'] = resp_tuple[8]
        resp['date_created'] = datetime_to_json(resp_tuple[9])
        resp['error'] = resp_tuple[15]
        resp['state'] = resp_tuple[16]

        resp['rule'] = rule
        resp['request'] = request
        resp_list.append(resp)
    return resp_list


def handler(event, context):
    logger.info(event)
    if 'body' not in event:
        logger.error('Missing parameters')
        return {"isBase64Encoded": False, "statusCode": 400, "body": "Missing Body Parameter loser",
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
            resp_dict = {'result': True,
                         'headers': headers,
                         'data': []}
            if data['operation'] == 'GET':
                if 'id' in data.keys():
                    response = parseResponse(queryResultsID(cur, data['id']))
                else:
                    response = parseResponse(queryResults(cur, data['page']))
                    resp_dict['total_pgs'] = queryPageCount(cur)
            elif data['operation'] == 'UPDATE':
                response = updateResults(cur, data['id'], data['phys_priority'], data['phys_contrast'])
                response = [{'id': response[0][0], 'phys_priority': response[0][1], 'phys_contrast': response[0][2]}]
            elif data['operation'] == 'GET_DATA':
                daily = getResultCount(cur, 'DAILY')
                weekly = getResultCount(cur, 'WEEKLY')
                monthly = getResultCount(cur, 'MONTHLY')
                response = [{'daily': daily, 'weekly': weekly, 'monthly': monthly}]
            psql.commit()
            logger.info(response)
            resp_dict['data'] = response
            return resp_dict
        except Exception as error:
            logger.error(error)
            logger.error("Exception Type: %s" % type(error))
            return {"isBase64Encoded": False, "statusCode": 400, "body": f'{type(error)}',
                    "headers": {"Content-Type": "application/json"}}
    return {'result': True, 'headers': headers}
