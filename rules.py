import psycopg2 
from config import config 
import json

# commands = """
#     SELECT id, body_part, priority
#     FROM mri_rules 
#     WHERE body_part IN (%s)
# """
##--AND tokens @@ to_tsquery('%s')

basic_cmd = """
SELECT id, body_part, priority, weighted_tk, ts_rank_cd('{0.1, 0.2, 0.35, 1.0}',weighted_tk, query, 1) AS rank
FROM test_rules, to_tsquery('%s') query 
WHERE weighted_tk @@ query
"""

## diagnosis, phrases, symptoms, medical_conditions, phrases 

## other - followup, history, hx 


## update count from rule_stats 
## where id is ( )


## select id, body_part, tokens, priority, ts_rank_cd( tokens, query, 1) AS rank
## from mri_rules, to_tsquery('hip | fracture | pain | dr | munk | asap | previous | orif | ongoing | anterior') query
## WHERE body_part LIKE 'hip'
## AND tokens @@ query
## ORDER BY rank DESC
## LIMIT 5

def searchAnatomy(data, cur):
    if not data["anatomy"]:
        return basic_cmd
    else: 
        anatomy_list = []
        for val in data["anatomy"]: 
            # for any values that have multiple words (tsquery limitation)
            val = val.replace(' ', ' | ')
            anatomy_list.append(val)

        body_parts = ' | '.join(anatomy_list)
        anatomy_cmd = (basic_cmd+" AND body_tokens @@ to_tsquery(\'"+ body_parts + "\')")
        #cur.execute(anatomy_cmd)
        #return cur.fetchall()
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
        
        # # create table one by one
        # for command in commands:
        #     cur.execute(command)
        #     ret = cur.fetchall()
        #     print(ret)
        for x, v in data.items():
            command = searchAnatomy(v, cur)
            #print(command)
            n_command = searchText(cur, v, "anatomy", "medical_condition", "diagnosis", "symptoms", "phrases", "other_info")
            final_command = (command % n_command) + ' ORDER BY rank DESC'
            # print(final_command)
            cur.execute(final_command)
            ret=cur.fetchall()
            print("for ", x, ": \n the ranking is ", ret)

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
    with open('output/mridata6.json') as f: 
        data = json.load(f)
    connect(data)