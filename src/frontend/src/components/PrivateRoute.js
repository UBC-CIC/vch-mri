import React from "react";
import { Route, Redirect } from "react-router-dom";
import { connect } from "react-redux";
import { AUTH_USER_ACCESS_TOKEN_KEY } from '../constants/userConstant';
import { validateToken } from "../helpers";
import { Cache } from 'aws-amplify';

const PrivateRoute = ({ component: Component, authentication, ...rest }) => {
    const checkUserAuth = validateToken(Cache.getItem(AUTH_USER_ACCESS_TOKEN_KEY));

    return (<Route
        {...rest}
        render={props =>
            checkUserAuth ? (
                <Component {...props} />
            ) : (
                <Redirect to="/login"/>
            )
        }
    />);
};

const mapStateToProps = state => ({
    authentication: state.authentication
});

export default connect(mapStateToProps)(PrivateRoute);