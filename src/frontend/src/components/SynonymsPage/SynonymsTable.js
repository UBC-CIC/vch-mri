import React from "react";
import { connect } from "react-redux";
import { Table } from "semantic-ui-react";
import { sendSuccessToast, sendErrorToast } from "../../helpers";
import { getSynonyms, changeSynonymSort } from "../../actions/SynonymActions";
import ConfirmDeleteDialog from "../ConfirmDeleteDialog";
import AddSynonymForm from "./AddSynonymForm";
import ModifySynonymForm from "./ModifySynonymForm";

class SynonymsTable extends React.Component {
  componentDidMount() {
    this.props.getSynonyms();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.error) {
      sendErrorToast(this.props.error.message);
    } else if (this.props.success) {
      sendSuccessToast(this.props.success);
    }
  }

  render() {
    console.log(this.props.synonyms);
    return (
      <Table celled compact sortable>
        <Table.Header fullWidth>
          <Table.Row>
            <Table.HeaderCell
              sorted={
                this.props.sortedColumn === "key"
                  ? this.props.sortDirection
                  : null
              }
              onClick={() => {
                this.props.changeSynonymSort("key");
              }}
            >
              Word / Phrase
            </Table.HeaderCell>
            <Table.HeaderCell
              sorted={
                this.props.sortedColumn === "value"
                  ? this.props.sortDirection
                  : null
              }
              onClick={() => {
                this.props.changeSynonymSort("value");
              }}
            >
              Assigned Synonyms
            </Table.HeaderCell>
            <Table.HeaderCell collapsing textAlign="center">
              <AddSynonymForm />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {this.props.synonyms.map((synonym, index) => (
            <Table.Row disabled={this.props.loading} key={"row-data-" + index}>
              <Table.Cell>{synonym.key}</Table.Cell>
              <Table.Cell>{synonym.value}</Table.Cell>
              <Table.Cell textAlign="right" collapsing>
                <ModifySynonymForm
                  word={synonym.key}
                  synonymList={synonym.value.split(" / ")}
                />
                <ConfirmDeleteDialog id={synonym.key} table="synonyms" />
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
    synonyms: state.synonyms.synonymsList,
    loading: state.synonyms.loading,
    error: state.synonyms.error,
    success: state.synonyms.success,
    sortedColumn: state.synonyms.column,
    sortDirection: state.synonyms.direction,
    initialize: state.synonyms.initialize,
  };
};

export default connect(mapStateToProps, { getSynonyms, changeSynonymSort })(
  SynonymsTable
);
