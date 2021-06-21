import boto3
import psycopg2

def connect(): 
    """
    Connect to PostgreSQL
    """
    # ssm = boto3.client('ssm')
    # p_dbserver = '/mri-sched/dbserver_ec2_public'
    # p_dbname = '/mri-sched/dbname_ec2'
    # p_dbuser = '/mri-sched/dbuser_ec2'
    # p_dbpwd = '/mri-sched/dbpwd_ec2'
    # params = ssm.get_parameters(
    #     Names=[
    #         p_dbserver, p_dbname, p_dbuser, p_dbpwd
    #     ],
    #     WithDecryption = True
    # )
    # if params['ResponseMetadata']['HTTPStatusCode'] != 200: 
    #     print('ParameterStore Error: ', str(params['ResponseMetadata']['HTTPStatusCode']))
    #     sys.exit(1)

    # for p in params['Parameters']: 
    #     if p['Name'] == p_dbserver:
    #         dbserver = p['Value']
    #     elif p['Name'] == p_dbname: 
    #         dbname = p['Value']
    #     elif p['Name'] == p_dbuser:
    #         dbuser = p['Value']
    #     elif p['Name'] == p_dbpwd:
    #         dbpwd = p['Value']
    # print("Trying to connect to postgresql: " + dbserver)
    # conn = psycopg2.connect(host=dbserver, dbname=dbname, user=dbuser, password=dbpwd)

    # Connect locally since the deployment Postgres EC2 is not publicly accessible
    print("Trying to connect to postgresql: localhost")
    conn = psycopg2.connect(host="localhost", database="rules", user="postgres", password="postgres")

    return conn 