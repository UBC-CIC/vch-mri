import json
import psycopg2
from psycopg2 import sql 
import boto3
import logging
import os

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class PostgreSQL: 
    def __init__ (self):
        logger.info("------- PostgreSql Class Initialization")
        logger.info("LOCAL_DEBUG")
        debug = os.getenv('LOCAL_DEBUG')
        # debug = os.environ['AWS_REGION']
        logger.info(debug)
        if debug is None:
            logger.info('LOCAL_DEBUG is None')

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
        else:
            logger.info('LOCAL_DEBUG is true - set local Postgres conn params')
            dbserver = 'host.docker.internal'      # 'localhost' for SAM need provide IP since it's running in Docker container
            dbname = 'rules'
            dbuser = 'postgres'
            dbpwd = 'postgres'

        logger.info("------- Connecting to PostgreSql2: " + dbserver)
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



