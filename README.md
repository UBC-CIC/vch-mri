# PHSA MRI CODE 
- UBC CIC Medical Imaging Scheduler System 
- To start this project, you will need to create the following before running the cloudformation script: 
> S3 bucket 
> EC2 instance
> Security Groups
> VPC with Private and Public Subnets 
- To run the cloudformation code, use the following commands: 
```
sam package --s3-bucket <s3 bucket name> --output-template-file out.yaml
sam deploy --template-file out.yaml --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND --stack-name <stack name>
```

## Setup PostgreSQL in EC2
- Follow [these instructions](https://installvirtual.com/install-postgresql-10-on-amazon-ec2/) to download postgres onto EC2
- To update the configuration for remote access of postgres: 
```bash
# Edit /var/lib/pgsql/data/postgresql.conf
nano /var/lib/pgsql/data/postgresql.conf

# Change the following line to listen to external requests
listen_address='*'
```
```bash
# Edit /var/lib/pgsql/data/pg_hba.conf
nano /var/lib/pgsql/data/pg_hba.conf

# Change the following line to allow IPv4 Connections for all 
# IPv4 local connections:
host    all             all             0.0.0.0/0               md5
```
```bash
# Restart postgres
systemctl restart postgresql
```
- On the AWS console, you'll need to add access to Postgres to the EC2 instance to the security group 
- To initialize the database, run the init_db.sql script in the terminal using `psql -U <user> -h <host> -f init_db.sql` after adding the file locations. _Note this does assume you have postgresql database named rules and psql installed on your own computer. Otherwise, you copy and run script directly in Postgres._
- The functions expect the database keys to be stored on SSM Parameter Store. You can either use the AWS Console or the following AWS CLI commands: 
```bash
aws ssm put-parameter --name /mri-phsa/dbserver_ec2 --value <host> --type SecureString --overwrite
aws ssm put-parameter --name /mri-phsa/dbname_ec2 --value <database> --type SecureString --overwrite
aws ssm put-parameter --name /mri-phsa/dbuser_ec2 --value <user> --type SecureString --overwrite
aws ssm put-parameter --name /mri-phsa/dbpwd_ec2 --value <password> --type SecureString --overwrite
aws ssm put-parameter --name /mri-phsa/ec2 --value <instance id> --type SecureString --overwrite
```

## Preprocessing
- [preprocess_data.py](/preprocess/preprocess_data.py): Main python script to preprocess the requisition data in large batches
- [preprocess_helper.py](/preprocess/preprocess_helper.py): Helper functions 
- [sample_output.json](sample_output.json): Sample JSON output for first 100 rows of data of sample.csv
- To create a sample_output.json, in the terminal run `python .\preprocess\preprocess_data.py`

![Preprocessing Decision Tree](/media/decisionTree_preprocess.png)

## Rule Processing 
- [rules.py](/rule_processing/rules.py): Main python script to obtain the priority value 
- [update_weights.py](/rule_processing/update_weights.py): Creates weighted tokens in the database for the descriptions found in mri_rules
- [postgresql.py](/rule_processing/postgresql.py): Connecting to the postgres database with a SSM parameter store =
- To update the weighted rule tokens, run `python .\rules_processing\update_weights.py` in the terminal
- To apply the rules and obtain a Rule ID + P-Value, run `python .\rule_processing\rules.py` in the terminal

![Rule Decision Tree](/media/decisionTree_rules.png)


## Lambdas
- Python Code used for Lambda Functions 

## Layers 
- Custom libraries used for Lambda Functions not found on AWS 
- To update or add a new layer, they must be zipped with the top level folder named __python__

## Rule Database Analysis
- [Sample Result](/csv/mri_dataset_results_0820.xlsx): Form to P-Value Data (most recent)

### Further Recommendations 
This is a proof of concept and it