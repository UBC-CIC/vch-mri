import React from 'react'
import {Button, Form, Header, Icon, Input, Modal} from 'semantic-ui-react'
import { connect } from "react-redux";
import { addSpecialtyExam } from "../../actions/SpecialtyExamActions";

const initialState = {
    open: false, 
    exam: ''
};

class addSpecialtyExamForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = initialState;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        const {name, value} = e.target;
        this.setState({
            [name]: value
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.addSpecialtyExam(this.state.exam);
        this.setState(initialState)
    }

    render() {
        return (
            <Modal
                as={Form}
                onSubmit={this.handleSubmit}
                style={{ maxWidth: 500 }}
                onClose={() => this.setState(initialState)}
                onOpen={() => this.setState({open: true})}
                open={this.state.open}
                trigger={
                    <Button
                        floated='right'
                        icon
                        labelPosition='left'
                        primary
                        size='small'
                    >
                        <Icon name='add circle' /> Add Exam
                    </Button>
                }
            >
                <Header as='h2' color='blue' textAlign='center'>
                    Add a Specialty Exam for Result Tags
                </Header>
                <Modal.Content>
                    <Form.Field
                        fluid
                        control={Input}
                        name='exam'
                        label='Specialty Exam'
                        value={this.state.exam}
                        onChange={this.handleChange}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        color='black'
                        content='Cancel'
                        onClick={() => this.setState(initialState)}
                    />
                    <Button
                        type='submit'
                        content="Add Specialty Exam"
                        color='blue'
                        disabled={!this.state.exam}
                    />
                </Modal.Actions>
            </Modal>
        )
    }
}

const mapStatetoProps = (state) => {
    return {
        specialtyExam: state.specialtyExam.specialtyExamList,
        loading: state.loading,
        error: state.error
    }
}; 

export default connect(mapStatetoProps, {addSpecialtyExam})(addSpecialtyExamForm);