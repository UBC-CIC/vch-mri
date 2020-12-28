import React from "react";
import {Form, Input, TextArea} from 'semantic-ui-react-form-validator'
import {Header, Container, Button, Grid, Segment, Checkbox, Message} from 'semantic-ui-react';
import { Auth } from 'aws-amplify';
import { NavLink, withRouter } from 'react-router-dom';
import {compose} from "redux";
import {connect} from "react-redux";
import { loginFailure } from "../../actions/AuthActions";
import {sendSuccessToast} from "../../helpers";

let initState = {
    email: '',
    code: '',
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
            await Auth.confirmSignUp(this.state.email.trim(), this.state.code.trim());
            sendSuccessToast("Verification Successful!");
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
                            Enter your verification code
                        </Header>
                        <Form onSubmit={this.handleSubmit} ref="form">
                            <Grid.Row>
                                <Input width={'100%'}
                                       type="text"
                                       icon='at'
                                       iconPosition='left'
                                       name="email"
                                       placeholder="Re-enter your email address"
                                       onChange={this.handleChange}
                                       value={this.state.email}
                                       validators={['required']}
                                       errorMessages={['This field is required']}/>
                                <Input width={'100%'}
                                       type="text"
                                       icon='hashtag'
                                       iconPosition='left'
                                       name="code"
                                       placeholder="Enter your verification code..."
                                       onChange={this.handleChange}
                                       maxlength='6'
                                       value={this.state.code}
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
                                <Button  fluid content='Submit' color="blue"
                                         disabled={!this.state.code || !this.state.email}>Verify</Button>
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
    connect(mapStateToProps, { loginFailure }),
)(VerifyForm);