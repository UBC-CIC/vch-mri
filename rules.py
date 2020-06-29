import psycopg2 
from config import config 
import json
import time 

insert_cmd = """
INSERT INTO data_results(id, info, init_priority) VALUES 
(%s, %s, %s)
ON CONFLICT (id) DO UPDATE
SET info = excluded.info, 
init_priority = excluded.init_priority;
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
ORDER BY ts_rank_cd('{0.1, 0.2, 0.35, 1.0}',info_weighted_tk, query, 1) DESC LIMIT 1)
AND data_results.id = %s
RETURNING r.id, r.priority;
"""

## diagnosis, phrases, symptoms, medical_conditions, phrases 

## other - followup, history, hx 

def searchAnatomy(data, cur):
    if not data["anatomy"]:
        return ''
    else: 
        anatomy_list = []
        for val in data["anatomy"]: 
            # for any values that have multiple words (tsquery limitation)
            val = val.replace(' ', ' | ')
            anatomy_list.append(val)

        body_parts = ' | '.join(anatomy_list)
        # anatomy_cmd = (basic_cmd+" AND bodyTk @@ to_tsquery(\'"+ body_parts + "\')")
        anatomy_cmd = 'AND bp_tk @@ to_tsquery(\''+body_parts+'\')'
        return anatomy_cmd 

def searchText(cur, data, *data_keys):
    value_set = set()
    for key in data_keys: 
        for val in data[key]:
            for word in val.split(): 
                value_set.add(word)
    return (' | ').join(value_set)

def connect(data):
    """ Connect to the PostgreSQL database server """
    conn = None
    try:
        # read the connection parameters
        params = config()
        # connect to the PostgreSQL server
        conn = psycopg2.connect(**params)
        cur = conn.cursor()
        
        # insert into data_results one by one 
        for x, v in data.items():
            anatomy_str  = searchAnatomy(v, cur)
            info_str = searchText(cur, v, "anatomy", "medical_condition", "diagnosis", "symptoms", "phrases", "other_info")
            if not anatomy_str:
                command = (update_cmd % info_str) + (update_cmd_end % v["CIO_ID"])
            else: 
                command = (update_cmd % info_str) + anatomy_str + (update_cmd_end % v["CIO_ID"])
            #print(insert_cmd % (v["CIO_ID"], json.dumps(v), v["priority"]))
            try:
                cur.execute(insert_cmd, (v["CIO_ID"], json.dumps(v), v["priority"]))
                #print(command)
                cur.execute(command)
                ret = cur.fetchall() 
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
    with open('sample_output.json') as f: 
        data = json.load(f)
    connect(data)
    print( f'---{time.time()-start}---')
