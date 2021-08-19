import React from "react";
import { Button, Form, Header, Icon, Input, Modal } from "semantic-ui-react";
import { modifyConjunction } from "../../actions/ConjunctionActions";
import { connect } from "react-redux";

const initialState = {
  open: false,
  abbrev: "",
  abbrev_orig: "",
  meaning: "",
};

class ModifyConjunctionForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      abbrev: this.props.abbrev,
      abbrev_orig: this.props.abbrev,
      meaning: this.props.meaning,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      abbrev: nextProps.abbrev,
      meaning: nextProps.meaning,
    });
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.modifyConjunction({
      key: this.state.abbrev.trim(),
      old_key: this.state.abbrev_orig.trim(),
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
        onClose={() => this.setState({ open: false })}
        onOpen={() =>
          this.setState({ open: true, abbrev_orig: this.state.abbrev })
        }
        open={this.state.open}
        trigger={
          <Button icon size="tiny" labelPosition="left">
            <Icon name="edit" />
            Modify
          </Button>
        }
      >
        <Header as="h2" color="blue" textAlign="center">
          Modify an existing Abbreviation
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
            onClick={() => this.setState({ open: false })}
          />
          <Button
            type="submit"
            content="Modify Abbreviation"
            color="blue"
            disabled={!this.state.meaning}
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

export default connect(mapStateToProps, { modifyConjunction })(
  ModifyConjunctionForm
);
