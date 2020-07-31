import psycopg2 
import json
import time 
import uuid 
import boto3
from postgresql import connect 

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
WHERE id = %s; 
"""

update_cmd = """
UPDATE data_results 
SET rules_id = r.id , sys_priority = r.priority, contrast = r.contrast, arthro = r.arthro
FROM mri_rules r WHERE r.id = (
SELECT id
FROM mri_rules, to_tsquery('tst_search','%s') query 
WHERE info_weighted_tk @@ query
"""

update_cmd_end = """
ORDER BY ts_rank_cd('{0.1, 0.2, 0.4, 1.0}',info_weighted_tk, query, 1) DESC LIMIT 1)
AND data_results.id = '%s'
RETURNING r.id, r.priority, r.contrast, r.arthro;
"""

def searchAnatomy(data, cur):        
    anatomy_list = []
    for val in data: 
        # for any values that have multiple words (tsquery limitation)
        val = val.replace(' ', ' | ')
        anatomy_list.append(val)

    body_parts = ' | '.join(anatomy_list)
    anatomy_cmd = 'AND bp_tk @@ to_tsquery(\''+body_parts+'\')'
    return anatomy_cmd 

def searchText(cur, data, *data_keys):
    value_set = set()
    for key in data_keys: 
        for val in data[key]:
            for word in val.split(): 
                value_set.add(word)
    return (' | ').join(value_set)

def compare_rules(data):
    """ Connect to the PostgreSQL database server """
    conn = None
    try:
        conn = connect()
        cur = conn.cursor()
        
        # insert into data_results one by one 
        for x, v in data.items():
            if not v["anatomy"]: 
                # No anatomy found => sys_priority = P99
                try: 
                    print("No anatomy found for CIO ID: ", v["CIO_ID"])
                    cur.execute(insert_cmd, (v["CIO_ID"], json.dumps(v), v["priority"]))
                    cur.execute(update_sys_priority, ('P99',v["CIO_ID"]))
                except psycopg2.IntegrityError:
                    print("Exception: ", err)
            else:
                anatomy_str  = searchAnatomy(v["anatomy"], cur)
                info_str = searchText(cur, v, "anatomy", "medical_condition", "diagnosis", "symptoms", "phrases", "other_info")
                command = (update_cmd % info_str) + anatomy_str + (update_cmd_end % v["CIO_ID"])
                try:
                    cur.execute(insert_cmd, (v["CIO_ID"], json.dumps(v), v["priority"]))
                    cur.execute(command)
                    ret = cur.fetchall() 
                    if not ret:  
                        print("No Rule Found for CIO ID: %s" % v["CIO_ID"])
                        cur.execute(update_sys_priority, ('P98', v["CIO_ID"]))
                    print("For CIO ID: %s, With return of: %s" % (v["CIO_ID"], ret))
                except psycopg2.IntegrityError:
                    print("Exception: ", err)
        # close communication with the PostgreSQL database server
        cur.close()
        # commit the changes
        conn.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()

if __name__ == '__main__':
    start = time.time()
    with open('./sample_output.json') as f: 
        data = json.load(f)
    compare_rules(data)
    print( f'---{time.time()-start}---')
