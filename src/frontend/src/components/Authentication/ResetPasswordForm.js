import React from "react";
import {Form, Input} from 'semantic-ui-react-form-validator'
import {Header, Button, Grid, Segment, Message} from 'semantic-ui-react';
import { Auth } from 'aws-amplify';
import { NavLink, withRouter } from 'react-router-dom';
import {compose} from "redux";
import {connect} from "react-redux";
import {sendSuccessToast} from "../../helpers";

const passwordValidator = require('password-validator');
const schema = new passwordValidator();

schema
    .is().min(8)
    .has().uppercase()
    .has().lowercase()
    .has().digits()
    .has().symbols()
    .has().not().spaces();

let initState = {
    code:"",
    email:"",
    password:"",
    password2: "",
    error: ""
};

class ResetPasswordForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = initState;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        Form.addValidationRule('validatePassword',value => {
            return schema.validate(value);
        });
        Form.addValidationRule('verifyPassword', value => {
            return this.state.password === this.state.password2;
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        const { history } = this.props;
        try {
            await Auth.forgotPasswordSubmit(this.state.email.trim(), this.state.code.trim(), this.state.password.trim());
            sendSuccessToast("Password change successful!");
            history.push('/login');
        } catch (e) {
            console.log(e);
            this.setState({ error: e.message });
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
                            Reset Your Password
                        </Header>
                        <Form onSubmit={this.handleSubmit} ref="form">
                            <Grid.Row>
                                <Input
                                    width={'100%'}
                                    type="text"
                                    name="email"
                                    icon='at'
                                    iconPosition='left'
                                    placeholder="Email address"
                                    onChange={this.handleChange}
                                    value={this.state.email}
                                    validators={['required']}
                                    errorMessages={['This field is required']}
                                />
                                <Input
                                    width={'100%'}
                                    type="text"
                                    icon='hashtag'
                                    iconPosition='left'
                                    name="code"
                                    placeholder="Enter your verification code..."
                                    onChange={this.handleChange}
                                    maxlength='6'
                                    value={this.state.code}
                                    validators={['required']}
                                    errorMessages={['This field is required']}
                                />
                                <Input
                                    width={'100%'}
                                    type="password"
                                    name="password"
                                    icon='lock'
                                    iconPosition='left'
                                    placeholder="Password"
                                    onChange={this.handleChange}
                                    value={this.state.password}
                                    validators={['required', 'validatePassword']}
                                    errorMessages={['This field is required',
                                        'Password must be at least 8 characters and contain one each of lowercase, uppercase, digit and symbol.']}
                                />
                                <Input
                                    width={'100%'}
                                    type="password"
                                    name="password2"
                                    icon='lock'
                                    iconPosition='left'
                                    placeholder="Retype Password"
                                    onChange={this.handleChange}
                                    value={this.state.password2}
                                    validators={['required', 'verifyPassword']}
                                    errorMessages={['This field is required', 'Passwords mismatch']}
                                />
                            </Grid.Row>
                            <Grid.Row>
                                <NavLink to="/login" style={{
                                    display: 'inline-block',
                                    padding: '4px 0 4px 0',
                                }}>Back to Login</NavLink>
                            </Grid.Row>
                            <Grid.Row>
                                <Button fluid content='Reset Password' color="blue"
                                        disabled={!this.state.code || !this.state.email ||
                                        !this.state.password || !this.state.password2 ||
                                        (this.state.password !== this.state.password2)}/>
                            </Grid.Row>
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
    connect(mapStateToProps),
)(ResetPasswordForm);