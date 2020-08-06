import boto3
import psycopg2

def connect(): 
    """
    Connect to PostgreSQL
    """
    ssm = boto3.client('ssm', region_name='ca-central-1')
    # p_dbserver = '/mri-phsa/dbserver'
    # p_dbname = '/mri-phsa/dbname'
    # p_dbuser = '/mri-phsa/dbuser'
    # p_dbpwd = '/mri-phsa/dbpwd'
    p_dbserver = '/mri-phsa/dbserver_ec2_public'
    p_dbname = '/mri-phsa/dbname_ec2'
    p_dbuser = '/mri-phsa/dbuser_ec2'
    p_dbpwd = '/mri-phsa/dbpwd_ec2'
    params = ssm.get_parameters(
        Names=[
            p_dbserver, p_dbname, p_dbuser, p_dbpwd
        ],
        WithDecryption = True
    )
    if params['ResponseMetadata']['HTTPStatusCode'] != 200: 
        print('ParameterStore Error: ', str(params['ResponseMetadata']['HTTPStatusCode']))
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
    print("Trying to connect to postgresql")
    conn = psycopg2.connect(host=dbserver, dbname=dbname, user=dbuser, password=dbpwd)
    print("Success, connected to PostgreSQL!")
    return conn 