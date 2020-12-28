import React from 'react';
import {Auth} from "@aws-amplify/auth";
import {Form, Button, Grid, Header, Segment, Message} from "semantic-ui-react";
import { NavLink, withRouter } from "react-router-dom";
import { AUTH_USER_ACCESS_TOKEN_KEY, AUTH_USER_ID_TOKEN_KEY } from '../../constants/userConstant';
import { compose } from "redux";
import { connect } from "react-redux";
import { Cache } from 'aws-amplify';
import { loginSuccess, loginFailure } from '../../actions/AuthActions';

let initState = {
    email:'',
    password:'',
    loading: false,
    error: ''
};

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = initState;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        if (this.props.auth.loggedIn) {
            const { history } = this.props;
            history.push('/dashboard');
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const { history } = this.props;
        this.setState({ loading: true });
        try {
            const user = await Auth.signIn(this.state.email.trim(), this.state.password.trim());
            const accessToken = user.signInUserSession.accessToken.jwtToken;
            const idToken = user.signInUserSession.idToken.jwtToken;
            Cache.setItem(AUTH_USER_ACCESS_TOKEN_KEY, accessToken);
            Cache.setItem(AUTH_USER_ID_TOKEN_KEY, idToken);
            this.props.loginSuccess(user);
            history.push('/dashboard');
        } catch(e) {
            //this.props.loginFailure(e.message);
            this.setState({ error: e.message, loading: false, email:'', password:'' });
        }
    };

    handleChange(e) {
        const {name, value} = e.target;
        this.setState({
            [name]: value
        });
    }

    render() {
        return (
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
                <Grid.Column style={{ maxWidth: 400 }}>
                    <Segment>
                        <Header as='h2' color='blue' textAlign='center'>
                            Log-in to your account
                        </Header>
                        <Form loading={this.state.loading} onSubmit={this.handleSubmit} ref="form">
                            <Form.Input
                                fluid
                                icon='at'
                                iconPosition='left'
                                type="text"
                                name="email"
                                placeholder="Email address"
                                onChange={this.handleChange}
                                value={this.state.email}
                            />
                            <Form.Input
                                fluid
                                icon='lock'
                                iconPosition='left'
                                type="password"
                                name="password"
                                placeholder="Password"
                                onChange={this.handleChange}
                                value={this.state.password}
                            />
                            <Grid.Row>
                                <NavLink to="/register" style={{
                                    display: 'inline-block',
                                    padding: '4px 0 2px 0',
                                    marginTop: '10px',
                                }}>Create a new account</NavLink>
                            </Grid.Row>
                            <Grid.Row>
                                <NavLink to="/forgot" style={{
                                    display: 'inline-block',
                                    padding: '2px 0 4px 0',
                                    marginBottom: '8px',
                                }}>Forgot Password?</NavLink>
                            </Grid.Row>
                            <Button content='Submit' fluid color="blue" disabled={!this.state.email || !this.state.password}>
                                Login
                            </Button>
                        </Form>
                    </Segment>
                    { !!this.state.error &&
                    <Message negative>
                        <p>{this.state.error}</p>
                    </Message>}
                </Grid.Column>
            </Grid>);
    }
}

const mapStateToProps = state => ({
    auth: state.authentication
});

export default compose(
    withRouter,
    connect(mapStateToProps, { loginSuccess, loginFailure }),
)(LoginForm);