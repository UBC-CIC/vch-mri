import React from "react";
import { connect } from "react-redux";
import { Table, Pagination, Accordion } from "semantic-ui-react";
import {
  changeResultSort,
  getResultsByPage,
} from "../../actions/ResultActions";
import { sendSuccessToast, sendErrorToast } from "../../helpers";
import ResultsTableRow from "./ResultsTableRow";

class ResultsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activePage: 1,
    };

    this.handlePaginationChange = this.handlePaginationChange.bind(this);
  }
  componentDidMount() {
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

  render() {
    return (
      <Accordion fluid={true} as={Table}>
        <Table celled compact sortable>
          <Table.Header fullWidth>
            <Table.Row>
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
                collapsing
                sorted={
                  this.props.sortedColumn === "dob"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("dob");
                }}
              >
                DOB
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
                Height
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
                Weight
              </Table.HeaderCell>
              <Table.HeaderCell>Reason for Exam</Table.HeaderCell>
              <Table.HeaderCell>Exam Requested</Table.HeaderCell>
              <Table.HeaderCell
                collapsing
                sorted={
                  this.props.sortedColumn === "rules_id"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("rules_id");
                }}
              >
                Rule ID
              </Table.HeaderCell>
              <Table.HeaderCell
                collapsing
                sorted={
                  this.props.sortedColumn === "priority"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("priority");
                }}
              >
                Priority
              </Table.HeaderCell>
              <Table.HeaderCell
                collapsing
                sorted={
                  this.props.sortedColumn === "contrast"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("contrast");
                }}
              >
                Contrast
              </Table.HeaderCell>
              <Table.HeaderCell
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
              </Table.HeaderCell>
              <Table.HeaderCell
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
              </Table.HeaderCell>
              <Table.HeaderCell>Tags</Table.HeaderCell>
              <Table.HeaderCell
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
              <Table.HeaderCell collapsing />
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {this.props.results.map((result, index) => (
              <ResultsTableRow result={result} />
            ))}
          </Table.Body>

          <Table.Footer fullWidth>
            <Table.Row>
              <Table.HeaderCell colSpan="10">
                {this.props.totalPages && (
                  <Pagination
                    floated="right"
                    defaultActivePage={this.state.activePage}
                    onPageChange={this.handlePaginationChange}
                    totalPages={this.props.totalPages}
                  />
                )}
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </Accordion>
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
