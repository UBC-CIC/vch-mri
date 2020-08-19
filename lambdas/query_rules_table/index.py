import psycopg2 
import postgresql
import boto3 
import logging 
import json 

logger = logging.getLogger()
logger.setLevel(logging.INFO)

table = 'mri_rules'

def update_bodypart_tokens(cur):
    cmd = """
    UPDATE mri_rules 
    SET bp_tk = to_tsvector(body_part);
    """
    cur.execute(cmd)

def queryRules(cur, count):
    cmd = """
    SELECT id, body_part, contrast, arthro, priority, info, active 
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
    SELECT id, body_part, contrast, arthro, priority, info, active 
    FROM mri_rules
    WHERE id = %s
    """
    logger.info("Getting Rule ID")
    cur.execute(cmd, [id])
    logger.info(id)
    return cur.fetchall()

def addRule(cur, values):
    cmd = """
    INSERT INTO mri_rules(body_part, info, priority, contrast, arthro) 
    VALUES """
    param_values = []
    for value in values: 
        cmd += "(%s, %s, %s, %s, %s),"
        param_values.extend([value['body_part'], value['info'], value['priority'], value['contrast'], value['arthro']])
    cmd = cmd[:-1]
    cur.execute(cmd, param_values)
    update_bodypart_tokens(cur)

def updateRule(cur, id, values):
    cmd = """
    UPDATE mri_rules SET body_part = new_body_part, info = new_info, priority = new_priority, contrast = CAST(new_contrast AS BOOLEAN), arthro = CAST(new_arthro AS BOOLEAN)
    FROM (VALUES """
    param_values = []
    for value in values:
        cmd += "(%s, %s, %s, %s, %s, %s),"
        param_values.extend([id, value['body_part'], value['info'], value['priority'], value['contrast'], value['arthro']])
    cmd = cmd[:-1]
    cmd += " ) as tmp(id, new_body_part, new_info, new_priority, new_contrast, new_arthro) WHERE CAST(tmp.id AS INTEGER) = mri_rules.id"
    cur.execute(cmd, param_values)
    update_bodypart_tokens(cur)

def setRuleActivity(cur, id, active):
    cmd = """
    UPDATE mri_rules SET active = %s
    WHERE id = %s"""
    cur.execute(cmd, (active,id))

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
                if 'id' in data.keys():
                    response = queryRulesID(cur, data['id'])
                else: 
                    response = queryRules(cur, data['count'])
                
                resp_dict = {'status': "DONE"}
                count = 0
                logger.info(response)
                for resp_tuple in response: 
                    resp_dict[count] = {}
                    resp_dict[count]['id'] = resp_tuple[0]
                    resp_dict[count]['body_part'] = resp_tuple[1]
                    resp_dict[count]['contrast'] = resp_tuple[2]
                    resp_dict[count]['arthro'] = resp_tuple[3]
                    resp_dict[count]['priority'] = resp_tuple[4]
                    resp_dict[count]['info'] = resp_tuple[5]
                    resp_dict[count]['active'] = resp_tuple[6]
                    count+=1
                return resp_dict

            elif data['operation'] == 'ADD':
                addRule(cur, data['values'])
            elif data['operation'] == 'UPDATE': 
                updateRule(cur, data['id'], data['values'])
            elif data['operation'] == 'DEACTIVATE':
                setRuleActivity(cur, data['id'], 'f')
            elif data['operation'] == 'ACTIVATE':
                setRuleActivity(cur, data['id'], 't')
            psql.commit() 
        except (Exception, psycopg2.DatabaseError) as error:
            logger.error(error)
            return {"status": "ERROR", "error": error}
    
    return {"status": "DONE"}
    
