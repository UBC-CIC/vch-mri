import psycopg2 
import postgresql
import boto3 
import logging 
import json 
import os 

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def queryResults(cur, limit, prev_date):
    cmd = """
    SELECT id, info, rules_id, sys_priority, contrast, p5_flag, tags, phys_priority, phys_contrast, created_at
    FROM data_results
    WHERE created_at < %s
    ORDER BY created_at DESC
    LIMIT %s
    """
    cur.execute(cmd, (prev_date, limit))
    return cur.fetchall()

def queryResultsID(cur, id):
    cmd = """
    SELECT id, info, rules_id, sys_priority, contrast, p5_flag, tags, phys_priority, phys_contrast, created_at
    FROM data_results
    WHERE id = %s
    """
    cur.execute(cmd, [id])
    return cur.fetchall()

def updateResults(cur, id, priority, contrast):
    cmd = """
    UPDATE data_results 
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
        FROM data_results
        WHERE DATE(created_at) = current_date
        """
    elif interval == 'WEEKLY':
        cmd = """
        SELECT COUNT(id)
        FROM data_results
        WHERE EXTRACT(WEEK FROM created_at) = EXTRACT(WEEK FROM current_date)
        """
    elif interval == 'MONTHLY':
        cmd = """
        SELECT COUNT(id)
        FROM data_results
        WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM current_date)
        """
    cur.execute(cmd)
    return cur.fetchall()[0][0]

def parseResponse(response):
    resp_list = []
    for resp_tuple in response: 
        resp = {}
        resp['id'] = resp_tuple[0]
        resp['info'] = resp_tuple[1]
        resp['rules_id'] = resp_tuple[2]
        resp['priority'] = resp_tuple[3]
        resp['contrast'] = resp_tuple[4]
        resp['p5_flag'] = resp_tuple[5]
        resp['tags'] = resp_tuple[6]
        resp['phys_priority'] = resp_tuple[7]
        resp['phys_contrast'] = resp_tuple[8]
        resp['date_created'] = resp_tuple[9]
        resp_list.append(resp)
    return resp_list

def handler(event, context):
    logger.info(event)
    if 'body' not in event:
        logger.error( 'Missing parameters')
        return {'result': False, 'msg': 'Missing parameters body' }

    data = json.loads(event['body']) # use for postman tests
    # data = event['body'] # use for console tests
    logger.info(data)
    psql = postgresql.PostgreSQL()

    with psql.conn.cursor() as cur:
        try: 
            if data['operation'] == 'GET':
                if 'id' in data.keys():
                    response = queryResultsID(cur, data['id'])
                    resp_list = parseResponse(response)
                elif 'interval' in data.keys():
                    response = getResultCount(cur, data['interval'])
                    resp_list = [response]
                else: 
                    response = queryResults(cur, data['limit'], data['timestamp'])
                    resp_list = parseResponse(response)
            elif data['operation'] == 'UPDATE':
                response = updateResults(cur, data['id'], data['phys_priority'], data['phys_contrast'])
                resp_list = [{'id': response[0][0], 'phys_priority': response[0][1], 'phys_contrast': response[0][2]}]
            psql.commit()
            resp_dict = {'result': True, 'data': []}
            logger.info(response)
            resp_dict['data'] = resp_list
            return resp_dict
        except Exception as error:
            logger.error(error)
            logger.error("Exception Type: %s" % type(error))
            return {'result': False, 'msg': f'{error}'}

    return {'result': True}
    
