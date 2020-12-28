import React from "react";
import {Form, Input} from 'semantic-ui-react-form-validator'
import {Header, Button, Grid, Segment, Message} from 'semantic-ui-react';
import { Auth } from 'aws-amplify';
import { NavLink, withRouter } from 'react-router-dom';
import {compose} from "redux";
import {connect} from "react-redux";
import {sendSuccessToast} from "../../helpers";

let initState = {
    email: '',
    error: ''
};

class VerifyForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = initState;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        // Form.addValidationRule('verifyPassword', value => {
        //     return this.state.password === this.state.password2;
        // });
    }

    async handleSubmit(e) {
        e.preventDefault();
        const { history } = this.props;
        try {
            await Auth.forgotPassword(this.state.email.trim());
            sendSuccessToast("Request received! Please check your email for a verification code and enter a new password.");
            history.push('/reset');
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
                            Forgot Your Password?
                        </Header>
                        <Form onSubmit={this.handleSubmit} ref="form">
                            <Grid.Row>
                                <Input width={'100%'}
                                       type="text"
                                       name="email"
                                       placeholder="Enter your email address"
                                       onChange={this.handleChange}
                                       value={this.state.email}
                                       validators={['required']}
                                       errorMessages={['This field is required']}/>
                            </Grid.Row>
                            <Grid.Row>
                                <NavLink to="/login" style={{
                                    display: 'inline-block',
                                    padding: '4px 0 4px 0',
                                }}>Back to Login</NavLink>
                            </Grid.Row>
                            <Grid.Row>
                                <Button
                                    fluid
                                    content='Confirm Request'
                                    color="blue"
                                    disabled={!this.state.email}
                                />
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
)(VerifyForm);