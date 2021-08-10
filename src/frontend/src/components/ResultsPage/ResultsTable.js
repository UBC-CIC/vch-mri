import React from "react";
import { connect } from "react-redux";
import { Table, Pagination } from "semantic-ui-react";
import {
  changeResultSort,
  getResultsByPage,
} from "../../actions/ResultActions";
import { sendSuccessToast, sendErrorToast } from "../../helpers";
import ResultsTableRow from "./ResultsTableRow";
// import { Icon, Button } from "semantic-ui-react";

const NUM_COLUMNS = 12;

class ResultsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activePage: 1,
      expandedRows: [],
      showAll: false,
    };

    this.handlePaginationChange = this.handlePaginationChange.bind(this);
    this.handleRowClick = this.handleRowClick.bind(this);
  }

  async componentDidMount() {
    console.log("ResultsTable componentDidMount");
    this.props.getResultsByPage(this.state.activePage);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.error) {
      sendErrorToast(this.props.error.message);
    } else if (this.props.success) {
      sendSuccessToast(this.props.success);
    }
  }

  handlePaginationChange = (e, { activePage }) => {
    this.setState({ activePage }, () => {
      this.props.getResultsByPage(activePage);
    });
  };

  handleRowClick(rowId) {
    const currentExpandedRows = this.state.expandedRows;
    const isRowCurrentlyExpanded = currentExpandedRows.includes(rowId);

    const newExpandedRows = isRowCurrentlyExpanded
      ? currentExpandedRows.filter((id) => id !== rowId)
      : currentExpandedRows.concat(rowId);

    this.setState({ expandedRows: newExpandedRows });
  }

  handleClickCollapseAll = () => {
    this.setState({ showAll: !this.state.showAll });
  };

  render() {
    return (
      <>
        {/* <Button
          color="blue"
          size="huge"
          onClick={this.handleClickCollapseAll}
          icon
          labelPosition="right"
        >
          <Icon name="arrow circle right" /> Show All
        </Button> */}
        <Table celled compact sortable striped>
          <Table.Header fullWidth>
            <Table.Row key={"row-footer"}>
              <Table.HeaderCell colSpan={NUM_COLUMNS}>
                {this.props.totalPages && (
                  <Pagination
                    floated="right"
                    activePage={this.state.activePage}
                    onPageChange={this.handlePaginationChange}
                    totalPages={this.props.totalPages}
                  />
                )}
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Header fullWidth>
            <Table.Row key={"row-header1"}>
              <Table.HeaderCell colSpan="7" />
              <Table.HeaderCell colSpan="4">AI Results</Table.HeaderCell>
              {/* <Table.HeaderCell colSpan="2">Physician Results</Table.HeaderCell>
              <Table.HeaderCell colSpan="3">Labelled Override</Table.HeaderCell> */}
              <Table.HeaderCell colSpan="1" />
            </Table.Row>
            <Table.Row key={"row-header2"}>
              <Table.HeaderCell
                sorted={
                  this.props.sortedColumn === "id"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("id");
                }}
              >
                reqCIO
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={
                  this.props.sortedColumn === "state"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("state");
                }}
              >
                State
              </Table.HeaderCell>
              <Table.HeaderCell
                collapsing
                sorted={
                  this.props.sortedColumn === "age"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("age");
                }}
              >
                Age
              </Table.HeaderCell>
              <Table.HeaderCell
                collapsing
                sorted={
                  this.props.sortedColumn === "height"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("height");
                }}
              >
                Height (CM)
              </Table.HeaderCell>
              <Table.HeaderCell
                collapsing
                sorted={
                  this.props.sortedColumn === "weight"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("weight");
                }}
              >
                Weight (KG)
              </Table.HeaderCell>
              <Table.HeaderCell width={10}>Reason for Exam</Table.HeaderCell>
              <Table.HeaderCell width={4}>Exam Requested</Table.HeaderCell>
              <Table.HeaderCell
                collapsing
                sorted={
                  this.props.sortedColumn === "ai_rule_id"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("ai_rule_id");
                }}
              >
                Rule ID
              </Table.HeaderCell>
              <Table.HeaderCell
                collapsing
                sorted={
                  this.props.sortedColumn === "ai_priority"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("ai_priority");
                }}
              >
                Priority
              </Table.HeaderCell>
              <Table.HeaderCell
                collapsing
                sorted={
                  this.props.sortedColumn === "ai_contrast"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("ai_contrast");
                }}
              >
                Contrast
              </Table.HeaderCell>
              <Table.HeaderCell>Sp. Exam</Table.HeaderCell>
              {/* <Table.HeaderCell
                collapsing
                sorted={
                  this.props.sortedColumn === "final_priority"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("final_priority");
                }}
              >
                Priority
              </Table.HeaderCell>
              <Table.HeaderCell
                collapsing
                sorted={
                  this.props.sortedColumn === "final_contrast"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("final_contrast");
                }}
              >
                Contrast
              </Table.HeaderCell>
              <Table.HeaderCell
                collapsing
                sorted={
                  this.props.sortedColumn === "labelled_rule_id"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("labelled_rule_id");
                }}
              >
                Rule ID
              </Table.HeaderCell>
              <Table.HeaderCell
                collapsing
                sorted={
                  this.props.sortedColumn === "labelled_priority"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("labelled_priority");
                }}
              >
                Priority
              </Table.HeaderCell>
              <Table.HeaderCell
                collapsing
                sorted={
                  this.props.sortedColumn === "labelled_contrast"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("labelled_contrast");
                }}
              >
                Contrast
              </Table.HeaderCell> */}
              {/* <Table.HeaderCell
                collapsing
                sorted={
                  this.props.sortedColumn === "p5_flag"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("p5_flag");
                }}
              >
                P5 Flag
              </Table.HeaderCell> */}
              {/* <Table.HeaderCell
                sorted={
                  this.props.sortedColumn === "phys_priority"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("phys_priority");
                }}
              >
                Physician Priority
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={
                  this.props.sortedColumn === "phys_contrast"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("phys_contrast");
                }}
              >
                Physician Contrast
              </Table.HeaderCell> */}
              {/* <Table.HeaderCell
                sorted={
                  this.props.sortedColumn === "created_at"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("created_at");
                }}
              >
                Date Created
              </Table.HeaderCell>
              <Table.HeaderCell
                sorted={
                  this.props.sortedColumn === "updated_at"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("updated_at");
                }}
              >
                Date Modified
              </Table.HeaderCell> */}
              <Table.HeaderCell collapsing>History</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          {/* <Table.Body>{allItemRows}</Table.Body> */}
          <Table.Body>
            {this.props.results.map((result, index) => (
              <ResultsTableRow
                result={result}
                index={index}
                handleRowClick={this.handleRowClick}
                expanded={
                  this.state.showAll || this.state.expandedRows.includes(index)
                }
              />
            ))}
          </Table.Body>

          <Table.Footer fullWidth>
            <Table.Row key={"row-footer"}>
              <Table.HeaderCell colSpan={NUM_COLUMNS}>
                {this.props.totalPages && (
                  <Pagination
                    floated="right"
                    activePage={this.state.activePage}
                    onPageChange={this.handlePaginationChange}
                    totalPages={this.props.totalPages}
                  />
                )}
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    results: state.results.resultsList,
    totalPages: state.results.totalPages,
    loading: state.results.loading,
    error: state.results.error,
    success: state.results.success,
    sortedColumn: state.results.column,
    sortDirection: state.results.direction,
  };
};

export default connect(mapStateToProps, { changeResultSort, getResultsByPage })(
  ResultsTable
);
