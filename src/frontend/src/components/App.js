import React from 'react';
import '../styles/App.css';
import RegisterForm from "./Authentication/RegisterForm";
import LoginForm from "./Authentication/LoginForm";
import VerifyForm from "./Authentication/VerifyForm";
import ForgotPasswordForm from "./Authentication/ForgotPasswordForm";
import ResetPasswordForm from "./Authentication/ResetPasswordForm";
import Main from "./Main";
import {Switch, Route} from 'react-router-dom';
import PrivateRoute from "./PrivateRoute";
import {SemanticToastContainer} from "react-semantic-toasts";

class App extends React.Component {
    render() {
        return (
            <div className="App">
                <Switch>
                    <PrivateRoute path="/dashboard" component={Main}/>
                    <Route exact path="/" component={LoginForm}/>
                    <Route path="/login" component={LoginForm}/>
                    <Route path="/register" component={RegisterForm}/>
                    <Route path="/verify" component={VerifyForm}/>
                    <Route path="/forgot" component={ForgotPasswordForm}/>
                    <Route path="/reset" component={ResetPasswordForm}/>
                </Switch>
                <SemanticToastContainer position="bottom-center" />
            </div>
        );
  }
}

export default App;
