import React from "react";
import { connect } from "react-redux";
import { Table } from "semantic-ui-react";
import {
  getSpellcheckWords,
  changeSpellcheckSort,
} from "../../actions/SpellcheckActions";
import ConfirmDeleteDialog from "../ConfirmDeleteDialog";
import AddSpellcheckWordForm from "./AddSpellcheckWordForm";
import { sendErrorToast, sendSuccessToast } from "../../helpers";

class SpellcheckerTable extends React.Component {
  componentDidMount() {
    this.props.getSpellcheckWords();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.error) {
      sendErrorToast(this.props.error.message);
    } else if (this.props.success) {
      sendSuccessToast(this.props.success);
    }
  }

  render() {
    return (
      <Table celled compact sortable>
        <Table.Header fullWidth>
          <Table.Row>
            <Table.HeaderCell
              sorted={
                this.props.sortedColumn === "word"
                  ? this.props.sortDirection
                  : null
              }
              onClick={() => this.props.changeSpellcheckSort()}
            >
              Spellchecker Word
            </Table.HeaderCell>
            <Table.HeaderCell collapsing textAlign="center">
              <AddSpellcheckWordForm />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {this.props.spellcheck.map((spell, index) => (
            <Table.Row disabled={this.props.loading}>
              <Table.Cell>{spell}</Table.Cell>
              <Table.Cell textAlign="right" collapsing>
                <ConfirmDeleteDialog id={spell} table="spell" />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>

        <Table.Footer fullWidth>
          <Table.Row>
            <Table.HeaderCell colSpan="8">
              {/*<Button size='small'>A Button</Button>*/}
              {/*<Button disabled size='small'>*/}
              {/*    Another Button*/}
              {/*</Button>*/}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    spellcheck: state.spell.spellcheckList,
    loading: state.spell.loading,
    error: state.spell.error,
    success: state.spell.success,
    sortedColumn: state.spell.column,
    sortDirection: state.spell.direction,
  };
};

export default connect(mapStateToProps, {
  changeSpellcheckSort,
  getSpellcheckWords,
})(SpellcheckerTable);
