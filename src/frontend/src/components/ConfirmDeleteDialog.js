import React from "react";
import { Button, Modal } from "semantic-ui-react";
import { deleteWordWeight } from "../actions/WeightActions";
import { deleteSpellcheckWord } from "../actions/SpellcheckActions";
import { deleteConjunction } from "../actions/ConjunctionActions";
import { deleteSynonym } from "../actions/SynonymActions";
import { deleteSpecialtyExam } from "../actions/SpecialtyExamActions";
import { connect } from "react-redux";

const initialState = {
  open: false,
  id: null,
  table: "",
};

class ConfirmDeleteDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;

    this.handleDelete = this.handleDelete.bind(this);
  }

  componentDidMount() {
    this.setState({
      id: this.props.id,
      table: this.props.table,
    });
  }

  handleDelete(e) {
    switch (this.props.table) {
      case "weights":
        this.props.deleteWordWeight(this.props.id);
        break;
      case "spell":
        this.props.deleteSpellcheckWord(this.props.id);
        break;
      case "conj":
        this.props.deleteConjunction(this.props.id);
        break;
      case "synonyms":
        this.props.deleteSynonym(this.props.id);
        break;
      case "specialtyExam":
        this.props.deleteSpecialtyExam(this.props.id);
        break;
      default:
        this.setState({ open: false });
    }
  }

  render() {
    return (
      <Modal
        onSubmit={this.handleSubmit}
        style={{ maxWidth: 500 }}
        onClose={() => this.setState({ open: false })}
        onOpen={() => this.setState({ open: true })}
        open={this.state.open}
        trigger={<Button size="tiny" secondary icon="delete" />}
      >
        <Modal.Header as="h2" color="blue" textalign="center">
          Confirm Delete
        </Modal.Header>
        <Modal.Content>
          <p>Are you sure you want to delete this?</p>
        </Modal.Content>
        <Modal.Actions>
          <Button
            color="black"
            content="No"
            onClick={() => this.setState({ open: false })}
          />
          <Button
            type="submit"
            content="Yes"
            color="blue"
            onClick={() => this.handleDelete()}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

export default connect(null, {
  deleteWordWeight,
  deleteSpellcheckWord,
  deleteConjunction,
  deleteSynonym,
  deleteSpecialtyExam,
})(ConfirmDeleteDialog);
