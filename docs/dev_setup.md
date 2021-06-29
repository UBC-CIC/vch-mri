# Setting up local development environment

## POSTGRESSQL

- brew install postgres https://dyclassroom.com/howto-mac/how-to-install-postgresql-on-mac-using-homebrew
  - install regular postgres beforehand
  - install pgadmin4
  - create db named "rules"
  - run init_db.sql (if path errors, may need to run SQL snippets directly in PGadmin)
  - Copy thesaurus_medical.ths to: /Applications/Postgres.app/Contents/Versions/11/share/postgresql/tsearch_data/

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

## AWS SAM - Serverless Application Model

- Make sure Docker is installed and running
- Make sure Postgres is running
- Run ALL lambdas locally connected to local Postgres DB:

  - cd /SapienMachineLearning/vch-mri
  - sam local start-lambda -t template-novpc.yaml --port 5001
  - sam local start-api -t template-novpc.yaml --env-vars ./SAM/env.json --port 5000 -d 5858 --debug

- default Running on http://127.0.0.1:5000/
- verify working via Postman or CURL to any route for ex POST http://127.0.0.1:5000/rules

Note: the 5001 Lambda services are needed because the 5000 Lambda's call the 5001's locally - this is the only way
to invoke a Lambda locally from another local Lambda

### postgresql layer

Notes on the PG layer, everything is already setup just FYI info: Layers are built with Python 3.7 (if upgrade 3.8 then make sure to rebuild layers) - make sure Python 3.7 is installed and in the PATH
brew install python@3.7
https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-using-invoke.html

/layers/postgresql.zip

- change postgresql.py (https://github.com/aws/aws-sam-cli/issues/318):
  self.conn = psycopg2.connect(host="host.docker.internal", database="rules", user="postgres", password="postgres")
- compress and replace postgresql.zip

# FRONTEND

## AWS Ampllify

- need to pull this config file (aws-exports.js) from your AWS profile which contains the Amplify deployment, will allow you to connect to all the AWS services (cognito etc) locally
- copy the file to SapienMachineLearning/vch-mri/src/frontend/src/aws-exports.js
- cd to that dir
  npm install

export REACT_APP_HTTP_API_URL=http://localhost:5000
export REACT_APP_HTTP_API_URL=http://127.0.0.1:5000
echo $REACT_APP_HTTP_API_URL

- (windows: set REACT_APP_HTTP_API_URL=http://localhost:5000)
  npm run start
- make changes and save, React UI should hot reload

## Step through debugging:

- VS code
- F5 to ‘Add configuration…’
  "configurations": [
  {
  "type": "pwa-chrome",
  "request": "launch",
  "name": "Launch Chrome against localhost",
  "url": "http://localhost:3000",
  "webRoot": "${workspaceFolder}"
  }
- F5 to run Debugger and you should be able to set breakpoints and step through the js code now
