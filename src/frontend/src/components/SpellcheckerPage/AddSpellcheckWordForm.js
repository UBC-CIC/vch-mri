import React from 'react'
import {Button, Form, Header, Icon, Input, Modal} from 'semantic-ui-react'
import { connect } from "react-redux";
import { addSpellcheckWord } from "../../actions/SpellcheckActions";

const initialState = {
    open: false,
    word: ''
};

class AddSpellcheckWordForm extends React.Component {
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
        this.props.addSpellcheckWord(this.state.word.trim());
        this.setState(initialState);
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
                        <Icon name='add circle' /> Add Word
                    </Button>
                }
            >
                <Header as='h2' color='blue' textAlign='center'>
                    Add a word into the Spellcheck Dictionary
                </Header>
                <Modal.Content>
                    <Form.Field
                        fluid
                        control={Input}
                        name='word'
                        label='Word'
                        value={this.state.word}
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
                        content="Add Word"
                        color='blue'
                        disabled={!this.state.word}
                    />
                </Modal.Actions>
            </Modal>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        spellcheck: state.spell.spellcheckList,
        loading: state.spell.loading,
        error: state.spell.error
    }
};

export default connect(mapStateToProps, {addSpellcheckWord})(AddSpellcheckWordForm);