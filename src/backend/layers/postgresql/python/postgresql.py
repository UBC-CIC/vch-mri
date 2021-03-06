import json
import psycopg2
from psycopg2 import sql 
import boto3
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class PostgreSQL: 
    def __init__ (self):
        logger.info("------- PostgreSql Class Initialization")

        ssm = boto3.client('ssm')
        p_dbserver = '/mri-sched/dbserver_ec2'
        # p_dbserver = '/mri-sched/dbserver_ec2_public'
        p_dbname = '/mri-sched/dbname_ec2'
        p_dbuser = '/mri-sched/dbuser_ec2'
        p_dbpwd = '/mri-sched/dbpwd_ec2'
        params = ssm.get_parameters(
            Names=[
                p_dbserver, p_dbname, p_dbuser, p_dbpwd
            ],
            WithDecryption = True
        )
        logger.info("------- Finished Acquiring Params")
        if params['ResponseMetadata']['HTTPStatusCode'] != 200: 
            logger.info('ParameterStore Error: ', str(params['ResponseMetadata']['HTTPStatusCode']))
            sys.exit(1)

        for p in params['Parameters']: 
            if p['Name'] == p_dbserver:
                dbserver = p['Value']
            elif p['Name'] == p_dbname: 
                dbname = p['Value']
            elif p['Name'] == p_dbuser:
                dbuser = p['Value']
            elif p['Name'] == p_dbpwd:
                dbpwd = p['Value']
        logger.info("------- Connecting to PostgreSql: " + dbserver)
        self.conn = psycopg2.connect(host=dbserver, dbname=dbname, user=dbuser, password=dbpwd)
        logger.info("------- PostgreSql Class Initialized")
    
    def queryTable(self, table):
        cmd = """
        SELECT * FROM {}
        """
        with self.conn.cursor() as cur: 
            cur.execute(sql.SQL(cmd).format(sql.Identifier(table)))
            return cur.fetchall()

    def commit(self):
        self.conn.commit()

    def closeConn(self):
        self.conn.close()



