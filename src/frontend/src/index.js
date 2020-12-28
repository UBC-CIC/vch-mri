import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import 'semantic-ui-css/semantic.min.css';
import 'react-semantic-toasts/styles/react-semantic-alert.css';
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css';
import {store} from './store';

import Amplify from "aws-amplify";
import awsExports from "./aws-exports";
import history from "./history";
import { BrowserRouter as Router } from "react-router-dom";
Amplify.configure(awsExports);

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <App />
        </Router>
    </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
