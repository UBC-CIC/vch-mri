import itertools
import psycopg2

from config import config 

def getKeywords(cur, weight_type:str):
    """
    :cur: cursor for postgresql connection \n 
    :weight_type str: Weight of either A, B, C, or D (descending weights)\n
    :return list: List of all words with corresponding weight 
    """
    command = """SELECT word FROM word_weights WHERE weight =%s"""
    cur.execute(command, (weight_type,))
    ret = cur.fetchall()
    key_list = [] 
    for val in ret: 
        key_list.append(val[0])
    return (key_list)        

def createLemexes(key_list):
    """
    :return str: in the format of {x, y, z} from input of key_list
    """
    return '{' + ', '.join(key_list) + '}'

def create_setWeight(col: str, weight: str, lemex: str):
    """
    :return str: format of 'setweight(col, weight, lemex)' \n
    Check postgresql text search setweight function to see the syntax 
    """
    return """setweight(%s, '%s', '%s')""" % (col, weight, lemex)

def updateWeights(cur, table: str, column: str, list_setweight): 
    """
    :cur: cursor for postgresql connection\n
    :table str: table to update\n
    :column str: column to update in table\n
    :list_setweight List: create string using create_setWeight and append to a list
    """
    command = """
    UPDATE %s
    SET %s = %s;
    """
    set_weight = ' || '.join(list_setweight)
    command = command % (table, column, set_weight)
    cur.execute(command)

def runUpdateWeights():
    conn = None
    try:
        # read the connection parameters
        params = config()
        # connect to the PostgreSQL server
        conn = psycopg2.connect(**params)
        cur = conn.cursor()
        # execute the command 
        lemex_a = createLemexes(getKeywords(cur, 'A'))
        lemex_b = createLemexes(getKeywords(cur, 'B'))
        lemex_c = createLemexes(getKeywords(cur, 'C'))
        lemex_d = createLemexes(getKeywords(cur, 'D'))
        setweight_a = create_setWeight('to_tsvector(descrp)', 'A', lemex_a)
        setweight_b = create_setWeight('to_tsvector(descrp)', 'B', lemex_b)
        setweight_c = create_setWeight('to_tsvector(descrp)', 'C', lemex_c)
        setweight_d = create_setWeight('to_tsvector(descrp)', 'D', lemex_d)
        list_weights = [setweight_a, setweight_b, setweight_c, setweight_d]
        updateWeights(cur, 'mri_rules', 'descrpWeightedTk', list_weights)
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
    runUpdateWeights()