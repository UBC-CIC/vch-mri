# Setting up local development environment

## POSTGRESSQL
- brew install postgres https://dyclassroom.com/howto-mac/how-to-install-postgresql-on-mac-using-homebrew
    - install regular postgres beforehand
    - install pgadmin4
    - create db named "rules"
    - run init_db.sql (if path errors, may need to run SQL snippets directly in PGadmin)
    - Copy thesaurus_medical.ths to:  /Applications/Postgres.app/Contents/Versions/11/share/postgresql/tsearch_data/


## PYCHARM
- open src/backend folder
- venv - point to /bin/…python3.8
- when IDE prompts, click 'Install requirements'
- Pycharm menu->prefs->Project: backend

If error installing requirement for psycopg2, you will need to update the interpretor to install psycopg2-binary:
https://www.psycopg.org/docs/install.html
- This will install a pre-compiled binary version of the module which does not require the build or runtime prerequisites described below.
- psycopg2-binary package is meant for beginners to start playing with Python and PostgreSQL without the need to meet the build requirements.
- If you are the maintainer of a published package depending on psycopg2 you shouldn’t use psycopg2-binary as a module dependency. For production use you are advised to use the source distribution.


### Enable DEBUGGING (code step-through):
- for each batch file (preprocess_data.py, rules.py, update_weights.py)
Edit configurations/Add Configuration...-> + -> new Python…"Script path" to the .py file to run….interpreter Python 3.8

### Batch proccesing the sample request data:
- first run update_weights.py -> creates weights in mri_rules table
    - should complete in secs (check mri_rules/info_weighted_tk has updated)
- then preprocess_data.py: ./csv/requisition_data_200.csv -> sample_output.json
    - can take 10mins+:
        row is : 0
        ...
        row is : 204
        row is : 205
        ---533.6206860542297---
- then lastly rules.py: sample_output.json -> updates the Pvalues in data_results table
    - should complete within 1 mins:
        ...
        For CIO ID: 124186, With return of: [(98, 'P3', True, 'Characterization soft tissue mass likely benign (lipoma)')]
        ---28.142488718032837---
    - check data_results/sys_priority has updated
