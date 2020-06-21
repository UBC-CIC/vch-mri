# PHSA MRI CODE 

## Preprocessing Data 
- [preprocess_data.py](preprocess_data.py): Main python script to preprocess MRI data 
- [preprocess_helper.py](preprocess_helper.py): Helper functions 
- [sample_output.json](sample_output.json): Sample JSON output for first 100 rows of data of sample.csv
- To create a sample_output.json, in the terminal run `python preprocess_data.py`

## Generating P-Value 
- [init_db.sql](init_db.sql): Script to re-initialize database (wipes out any previous data!) 
- [rules.py](rules.py): Main python script to obtain the priority value 
- [update_weights.py](update_weights.py): Creates weighted tokens in the database for the descriptions found in mri_rules
- [config.py](config.py): Connecting to the postgres database
- To initialize the database, run the init_db.sql script in the terminal using `psql -U {username} -h {host} -f init_db.sql`. _Note this does assume you have a database named rules._
- To update the weighted rule tokens, run `python update_weights.py` in the terminal
- To apply the rules and obtain a Rule ID + P-Value, run `python rules.py` in the terminal