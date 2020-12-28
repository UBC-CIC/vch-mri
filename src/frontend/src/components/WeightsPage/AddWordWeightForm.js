import React from 'react'
import {Button, Form, Header, Icon, Input, Modal} from 'semantic-ui-react'
import { connect } from "react-redux";
import { addWordWeight } from "../../actions/WeightActions";

const initialState = {
    open: false,
    word: '',
    weight: ''
};

class AddWordWeightForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = initialState;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
    }

    handleChange(e) {
        const {name, value} = e.target;
        this.setState({
            [name]: value
        });
    }

    handleSelectChange(e,{name, value}) {
        this.setState({[name]:value});
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.addWordWeight({
            key: this.state.word.trim(),
            value: this.state.weight
        });
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
                        <Icon name='add circle' /> Add Word Weight
                    </Button>
                }
            >
                <Header as='h2' color='blue' textAlign='center'>
                    Add a new Word Weight
                </Header>
                <Modal.Content>
                    <Form.Field
                        fluid
                        control={Input}
                        name='word'
                        label='Medical Word'
                        value={this.state.word}
                        onChange={this.handleChange}
                    />
                    <Form.Dropdown
                        fluid
                        selection
                        name='weight'
                        label='Word Weight'
                        options={[
                            { key: 'e', text: '', value: '' },
                            { key: 'A', text: 'A', value: 'A' },
                            { key: 'B', text: 'B', value: 'B' },
                            { key: 'C', text: 'C', value: 'C' },
                            { key: 'D', text: 'D', value: 'D' },
                        ]}
                        onChange={this.handleSelectChange}
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
                        content="Add Word Weight"
                        color='blue'
                        disabled={!this.state.word || !this.state.weight}
                    />
                </Modal.Actions>
            </Modal>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        weights: state.weights.weightsList,
        loading: state.weights.loading,
        error: state.weights.error
    }
};

export default connect(mapStateToProps, {addWordWeight})(AddWordWeightForm);