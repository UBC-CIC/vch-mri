# VCH MRI Booking Rule Based System
- To start this project, you will need an AWS account with CLI and [SAM setup](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) as well as SSM Session Manager installed to log into your EC2 instance with a private IP address.

## Preprocessing 
- Install the libraries into a virtual environment using `pip install -r requirements.txt`
- [preprocess_data.py](../src/backend/preprocess/preprocess_data.py): Main python script to preprocess the requisition data in large batches locally
- [preprocess_helper.py](../src/backend/preprocess/preprocess_helper.py): Helper functions 
- [sample_output.json](../src/backend/sample_output.json): Sample JSON output for first 100 rows of data of sample.csv
- To create a sample_output.json, in the terminal run `python .\preprocess\preprocess_data.py`

![Preprocessing Decision Tree](../images/decisionTree_preprocess.png)

## Rule Processing 
- [rules.py](../src/backend/rule_processing/rules.py): Main python script to obtain the priority value 
- [update_weights.py](/rule_processing/update_weights.py): Creates weighted tokens in the database for the descriptions found in mri_rules
- [postgresql.py](../src/backend/rule_processing/postgresql.py): Connecting to the postgres database with a SSM parameter store
- To update the weighted rule tokens, run `python .\rules_processing\update_weights.py` in the terminal
- To apply the rules and obtain a Rule ID + P-Value, run `python .\rule_processing\rules.py` in the terminal

![Rule Decision Tree](../images/decisionTree_rules.png)

## Lambdas
- Python Code used for Lambda Functions 

## Layers 
- Custom libraries used for Lambda Functions not found on AWS 
- To update or add a new layer, they must be zipped with the top level folder named __python__

## Rule Database Analysis
- [Sample Result](../src/backend/csv/mri_dataset_results_0828.xlsx): Form to P-Value Data (most recent)
 
