# PHSA MRI CODE 

## Preprocessing Data 
- [preprocess_data.py](/preprocess/preprocess_data.py): Main python script to preprocess MRI data 
- [preprocess_helper.py](/preprocess/preprocess_helper.py): Helper functions 
- [sample_output.json](sample_output.json): Sample JSON output for first 100 rows of data of sample.csv
- To create a sample_output.json, in the terminal run `python preprocess_data.py`

## Generating P-Value 
- [init_db.sql](init_db.sql): Script to re-initialize database (wipes out any previous data!) 
- [rules.py](/rule_processing/rules.py): Main python script to obtain the priority value 
- [update_weights.py](/rule_processing/update_weights.py): Creates weighted tokens in the database for the descriptions found in mri_rules
- [config.py](/rule_processing/config.py): Connecting to the postgres database with a custome database.ini file 
- To initialize the database, run the init_db.sql script in the terminal using `psql -U {username} -h {host} -f init_db.sql`. _Note this does assume you have a database named rules._
- To update the weighted rule tokens, run `python update_weights.py` in the terminal
- To apply the rules and obtain a Rule ID + P-Value, run `python rules.py` in the terminal

## Rule Database Analysis
- [mri_sample_results.xlsx](/csv/mri_sample_results.xlsx): Form to P-Value Data