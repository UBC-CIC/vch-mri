import json
import time 
import psycopg2 
import logging
import boto3
import postgresql

logger = logging.getLogger()
logger.setLevel(logging.INFO)
    
insert_cmd = """
INSERT INTO data_results(id, info, p5_flag) VALUES 
(%s, %s, %s)
ON CONFLICT (id) DO UPDATE
SET info = excluded.info, 
p5_flag = excluded.p5_flag;
"""

update_sys_priority = """
UPDATE data_results
SET sys_priority = %s
WHERE id = %s; 
"""

update_cmd = """
UPDATE data_results
SET rules_id = r.id , sys_priority = r.priority, contrast = r.contrast
FROM mri_rules r WHERE r.id = (
SELECT id
FROM mri_rules, to_tsquery('ths_search','%s') query 
WHERE info_weighted_tk @@ query
AND active = 't'
"""

update_cmd_end = """
ORDER BY ts_rank_cd('{0.1, 0.2, 0.4, 1.0}',info_weighted_tk, query, 1) DESC LIMIT 1)
AND data_results.id = '%s'
RETURNING r.id, r.body_part, r.priority, r.contrast, data_results.p5_flag, r.info;
"""

update_tags = """
UPDATE data_results
SET tags = array_tag FROM (
SELECT array_agg(tag) AS array_tag FROM (
SELECT tag from specialty_tags
WHERE %s ~* tag) AS x) AS y
where id = %s
RETURNING tags;
"""

def searchAnatomy(data):        
    anatomy_list = []
    for val in data: 
        # for any values that have multiple words (tsquery limitation)
        val = val.replace(' ', ' | ')
        anatomy_list.append(val)

    body_parts = ' | '.join(anatomy_list)
    anatomy_cmd = "AND bp_tk @@ to_tsquery('ths_search','%s')" % body_parts
    return anatomy_cmd 

def searchText(data, *data_keys):
    value_set = set()
    for key in data_keys: 
        for val in data[key]:
            for word in val.split(): 
                value_set.add(word)
    return (' | ').join(value_set)

def handler(event, context):
    logger.info(event)
    v = event
    psql = postgresql.PostgreSQL()
    with psql.conn.cursor() as cur: 
        # insert into data_results one by one
        try:
            cur.execute(insert_cmd, (v["CIO_ID"], json.dumps(v), v["p5"]))
            if "anatomy" not in v.keys():
                # No anatomy found => sys_priority = P99
                logger.info("No anatomy found for CIO ID: ", v["CIO_ID"])
                cur.execute(update_sys_priority, ('P99',v["CIO_ID"]))
                psql.conn.commit()
                return {"rule_id": "N/A", "priority": "P99"}
            else:
                anatomy_str  = searchAnatomy(v["anatomy"])
                info_str = searchText(v, "anatomy", "medical_condition", "diagnosis", "symptoms", "phrases", "other_info")
                command = (update_cmd % info_str) + anatomy_str + (update_cmd_end % v["CIO_ID"])
                cur.execute(command)
                ret = cur.fetchall() 
                if not ret: 
                    cur.execute(update_sys_priority, ('P98', v["CIO_ID"]))
                    psql.conn.commit()
                    return {"rule_id": "N/A", "priority": "P98"}
                cur.execute(update_tags, (ret[0][5], v["CIO_ID"]))
                tags = cur.fetchall()
            # commit the changes
            psql.conn.commit()
            return {"rule_id": ret[0][0], "anatomy": ret[0][1], "priority": ret[0][2], "contrast": ret[0][3], "p5_flag": ret[0][4], "specialty_exams": tags[0][0]}
        except Exception as error:
            logger.error(error)
            logger.error("Exception Type: %s" % type(error))         
            return {"isBase64Encoded": False, "statusCode": 500, "body": f'{type(error)}', "headers": {"Content-Type": "application/json"}}


    
