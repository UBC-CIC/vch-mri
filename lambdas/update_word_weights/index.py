import psycopg2 
import postgresql
import boto3 
import logging 
import json 

logger = logging.getLogger()
logger.setLevel(logging.INFO)

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
    return getKeywordStem(cur, '| '.join(key_list))    

def getKeywordStem(cur, word_list):
    command = """SELECT tsvector_to_array(to_tsvector(%s))"""
    cur.execute(command, (word_list,))
    ret = cur.fetchall()
    return '{' + ', '.join(ret[0][0]) + '}'

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

def handler(event, context):
    psql = postgresql.PostgreSQL()
    try: 
        with psql.conn.cursor() as cur:
            # execute the command 
            lemex_a = getKeywords(cur, 'A')
            lemex_b = getKeywords(cur, 'B')
            lemex_c = getKeywords(cur, 'C')
            lemex_d = getKeywords(cur, 'D')
            setweight_a = create_setWeight('to_tsvector(info)', 'A', lemex_a)
            setweight_b = create_setWeight('to_tsvector(info)', 'B', lemex_b)
            setweight_c = create_setWeight('to_tsvector(info)', 'C', lemex_c)
            setweight_d = create_setWeight('to_tsvector(info)', 'D', lemex_d)
            list_weights = [setweight_a, setweight_b, setweight_c, setweight_d]
            updateWeights(cur, 'mri_rules', 'info_weighted_tk', list_weights)
            # commit the changes
            psql.commit()
            logger.info("Weights Finished Updating")
            return {'result': True}
    except Exception as error:
        logger.error(error)
        logger.error("Exception Type: %s" % type(error))
        return {'result': False, 'msg': f'{error}'}
