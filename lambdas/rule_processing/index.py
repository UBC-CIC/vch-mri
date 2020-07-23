import json
import time 
import psycopg2 
import logging
import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)
    
insert_cmd = """
INSERT INTO data_results(id, info, init_priority) VALUES 
(%s, %s, %s)
ON CONFLICT (id) DO UPDATE
SET info = excluded.info, 
init_priority = excluded.init_priority;
"""

update_sys_priority = """
UPDATE data_results
SET sys_priority = %s
WHERE id = '%s'; 
"""

update_cmd = """
UPDATE data_results 
SET rules_id = r.id , sys_priority = r.priority
FROM mri_rules r WHERE r.id = (
SELECT id
FROM mri_rules, to_tsquery('%s') query 
WHERE info_weighted_tk @@ query
"""

update_cmd_end = """
ORDER BY ts_rank_cd('{0.1, 0.2, 0.4, 1.0}',info_weighted_tk, query, 1) DESC LIMIT 1)
AND data_results.id = '%s'
RETURNING r.id, r.priority;
"""

def searchAnatomy(data):        
    anatomy_list = []
    for val in data: 
        # for any values that have multiple words (tsquery limitation)
        val = val.replace(' ', ' | ')
        anatomy_list.append(val)

    body_parts = ' | '.join(anatomy_list)
    anatomy_cmd = 'AND bp_tk @@ to_tsquery(\''+body_parts+'\')'
    return anatomy_cmd 

def searchText(data, *data_keys):
    value_set = set()
    for key in data_keys: 
        for val in data[key]:
            for word in val.split(): 
                value_set.add(word)
    return (' | ').join(value_set)

def connect(): 
    """
    Connect to PostgreSQL
    """
    ssm = boto3.client('ssm')
    p_dbserver = '/mri-phsa/dbserver'
    p_dbname = '/mri-phsa/dbname'
    p_dbuser = '/mri-phsa/dbuser'
    p_dbpwd = '/mri-phsa/dbpwd'
    logger.info("Grabbing Parameters")
    params = ssm.get_parameters(
        Names=[
            p_dbserver, p_dbname, p_dbuser, p_dbpwd
        ],
        WithDecryption = True
    )
    if params['ResponseMetadata']['HTTPStatusCode'] != 200: 
        print('ParameterStore Error: ', str(params['ResponseMetadata']['HTTPStatusCode']))
        sys.exit(1)
    logger.info("Finished Grabbing Parameters")

    for p in params['Parameters']: 
        if p['Name'] == p_dbserver:
            dbserver = p['Value']
        elif p['Name'] == p_dbname: 
            dbname = p['Value']
        elif p['Name'] == p_dbuser:
            dbuser = p['Value']
        elif p['Name'] == p_dbpwd:
            dbpwd = p['Value']
    logger.info("Trying to connect to postgresql")
    conn = psycopg2.connect(host=dbserver, dbname=dbname, user=dbuser, password=dbpwd)
    logger.info("Success, connected to PostgreSQL!")
    return conn 

def handler(event, context):
    logger.info(event)
    v = event
    conn = connect() 
    with conn.cursor() as cur: 
        # insert into data_results one by one 
        if "anatomy" not in v.keys():
            # No anatomy found => sys_priority = P99
            try: 
                logger.info("No anatomy found for CIO ID: ", v["CIO_ID"])
                cur.execute(insert_cmd, (v["CIO_ID"], json.dumps(v), v["priority"]))
                cur.execute(update_sys_priority, ('P99',v["CIO_ID"]))
            except psycopg2.IntegrityError:
                logger.info("Exception: ", err)
        else:
            anatomy_str  = searchAnatomy(v["anatomy"])
            info_str = searchText(v, "anatomy", "medical_condition", "diagnosis", "symptoms", "phrases", "other_info")
            command = (update_cmd % info_str) + anatomy_str + (update_cmd_end % v["CIO_ID"])
            try:
                cur.execute(insert_cmd, (v["CIO_ID"], json.dumps(v), v["priority"]))
                cur.execute(command)
                ret = cur.fetchall() 
                if not ret: 
                    cur.execute(update_sys_priority, ('P98', v["CIO_ID"]))
            except psycopg2.IntegrityError:                    
                logger.info("Exception: ", err)
        # commit the changes
        conn.commit()
        return {"rule_id": ret[0][0], "priority": ret[0][1]}


    
