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
    SELECT id, body_part, priority
    FROM mri_rules
"""
def searchAnatomy(data, cur):
    if not data["anatomy"]:
        return basic_cmd
    else: 
        body_parts = ' or '.join(map(lambda x: ('body_part LIKE \'%s\''), data["anatomy"]))
        body_parts = body_parts % tuple(data["anatomy"])
        anatomy_cmd = (anat_cmd+' WHERE '+ body_parts)
        #cur.execute(x)
        #return cur.fetchall()
        return anatomy_cmd


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
    with open('output/sample_output.json') as f: 
        data = json.load(f)
    connect(data)