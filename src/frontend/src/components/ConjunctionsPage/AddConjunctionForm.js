import React from "react";
import { Button, Form, Header, Icon, Input, Modal } from "semantic-ui-react";
import { connect } from "react-redux";
import { addConjunction } from "../../actions/ConjunctionActions";

const initialState = {
  open: false,
  abbrev: "",
  meaning: "",
};

class AddConjunctionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.addConjunction({
      key: this.state.abbrev.trim(),
      value: this.state.meaning.trim(),
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
        onOpen={() => this.setState({ open: true })}
        open={this.state.open}
        trigger={
          <Button
            floated="right"
            icon
            labelPosition="left"
            primary
            size="small"
          >
            <Icon name="add circle" /> Add Abbreviation
          </Button>
        }
      >
        <Header as="h2" color="blue" textAlign="center">
          Add a new Medical Abbreviation
        </Header>
        <Modal.Content>
          <Form.Field
            fluid
            control={Input}
            name="abbrev"
            label="Medical Abbreviation"
            value={this.state.abbrev}
            onChange={this.handleChange}
          />
          <Form.Field
            fluid
            control={Input}
            name="meaning"
            label="Meaning"
            value={this.state.meaning}
            onChange={this.handleChange}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button
            color="black"
            content="Cancel"
            onClick={() => this.setState(initialState)}
          />
          <Button
            type="submit"
            content="Add Conjunction"
            color="blue"
            disabled={!this.state.abbrev || !this.state.meaning}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    conjunctions: state.conjunctions.conjunctionsList,
    loading: state.conjunctions.loading,
    error: state.conjunctions.error,
  };
};

export default connect(mapStateToProps, { addConjunction })(AddConjunctionForm);
