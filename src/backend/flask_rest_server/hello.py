from flask import Flask
from flask import jsonify
from flask import json
from flask_cors import CORS
from routes.route_results import results

app = Flask(__name__)
CORS(app)

import os
FLASK_ENV = os.environ['FLASK_ENV']

@app.route('/')
def hello_world():
    return 'Hello, World!223'

@app.route('/results', methods=['GET'])
def hello_world2():
    response = app.response_class(
            response=json.dumps({"status":"success","code":0,"data":{"Name":"Eyong","Age":30}}),
            status=400,
            mimetype='application/json'
    )
    return response

# def results():
#     return 'results for u POST'
# app.add_url_rule('/results','results',results)

@app.route('/results', methods=['POST'])
def resultsHandler():
    return results(request)
