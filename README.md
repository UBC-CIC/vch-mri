# PHSA MRI CODE 

## Setup PostgreSQL
- To initialize the database, run the init_db.sql script in the terminal using `psql -U <user> -h <host> -f init_db.sql`. _Note this does assume you have postgresql database named rules._
- The functions expect the database keys to be stored on SSM Parameter Store. You can either use the AWS Console or the following AWS CLI commands: 
```bash
aws ssm put-parameter --name /mri-phsa/dbserver --value <host> --type SecureString --overwrite
aws ssm put-parameter --name /mri-phsa/dbname --value <database> --type SecureString --overwrite
aws ssm put-parameter --name /mri-phsa/dbuser --value <user> --type SecureString --overwrite
aws ssm put-parameter --name /mri-phsa/dbpwd --value <password> --type SecureString --overwrite
```

## Preprocessing
- [preprocess_data.py](/preprocess/preprocess_data.py): Main python script to preprocess the requisition data in large batches
- [preprocess_helper.py](/preprocess/preprocess_helper.py): Helper functions 
- [sample_output.json](sample_output.json): Sample JSON output for first 100 rows of data of sample.csv
- To create a sample_output.json, in the terminal run `python .\preprocess\preprocess_data.py`

## Rule Processing 
- [rules.py](/rule_processing/rules.py): Main python script to obtain the priority value 
- [update_weights.py](/rule_processing/update_weights.py): Creates weighted tokens in the database for the descriptions found in mri_rules
- [config.py](/rule_processing/config.py): Connecting to the postgres database with a custome database.ini file 
- To update the weighted rule tokens, run `python update_weights.py` in the terminal
- To apply the rules and obtain a Rule ID + P-Value, run `python .\rule_processing\rules.py` in the terminal

## Lambdas
- Python Code used for lambda functions
- To run the cloudformation code, use the following commands: 
```
sam package --s3-bucket cic-mri-data-bucket-test --output-template-file out.yaml
sam deploy --template-file out.yaml --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND --stack-name mri-test-stack
```

## Rule Database Analysis
- [Sample Result](/csv/mri_sample_results_0.3.xlsx): Form to P-Value Data (most recent)