import React from "react";
import { connect } from "react-redux";
import { Table, Pagination, Confirm } from "semantic-ui-react";
import {
  changeResultSort,
  getResultsByPage,
  rerunAI,
  rerunAIAll,
} from "../../actions/ResultActions";
import { sendSuccessToast, sendErrorToast } from "../../helpers";
import ReviewTableRow from "./ReviewTableRow";
import { Icon, Button } from "semantic-ui-react";
import { getCognitoUser } from "../../helpers/Cognito";

const DEFAULT_NUM_COLUMNS = 12;
// const DEFAULT_EXPANDED_NUM_COLUMNS = 12;

class ReviewTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activePage: 1,
      expandedRows: [],
      numColumns: DEFAULT_NUM_COLUMNS,
      showPhysicianResults: false,
      showAll: false,
      showLabelled: false,
      showConfirmRerunAll: false,
    };

    this.handlePaginationChange = this.handlePaginationChange.bind(this);
    this.handleRowClick = this.handleRowClick.bind(this);
    this.getLabelledFilter = this.getLabelledFilter.bind(this);
  }

  getLabelledFilter = () => {
    return this.state.showLabelled
      ? null
      : [
          "received",
          "received_duplicate",
          "deleted",
          "ai_priority_processed",
          "final_priority_received",
        ];
  };

  async componentDidMount() {
    // console.log("ReviewTable componentDidMount");
    this.props.getResultsByPage(
      this.state.activePage,
      this.getLabelledFilter()
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.error && prevProps.error !== this.props.error) {
      sendErrorToast(this.props.error.message);
    } else if (this.props.success && prevProps.success !== this.props.success) {
      sendSuccessToast(this.props.success);
    }
  }

  handlePaginationChange = (e, { activePage }) => {
    this.setState({ activePage }, () => {
      this.props.getResultsByPage(activePage, this.getLabelledFilter());
    });
  };

  handleRowClick(e, rowId) {
    if (e.target.tagName !== "TD") return;

    const currentExpandedRows = this.state.expandedRows;
    const isRowCurrentlyExpanded = currentExpandedRows.includes(rowId);

    const newExpandedRows = isRowCurrentlyExpanded
      ? currentExpandedRows.filter((id) => id !== rowId)
      : currentExpandedRows.concat(rowId);

    this.setState({ expandedRows: newExpandedRows });
  }

  handleClickToggleRules = () => {
    this.setState({
      numColumns: this.props.showRules ? 16 : DEFAULT_NUM_COLUMNS,
    });
    this.props.handleClickShowRules();
  };

  handleClickCollapseAll = () => {
    this.setState({
      showAll: !this.state.showAll,
      //   numColumns: this.state.showAll ? 16 : DEFAULT_NUM_COLUMNS,
    });
  };

  handleClickShowLabelled = () => {
    this.setState({ showLabelled: !this.state.showLabelled }, () => {
      this.props.getResultsByPage(
        this.state.activePage,
        this.getLabelledFilter()
      );
    });
  };

  handleClickRerunAll = () => {
    console.log("handleClickRerunAll");

    this.setState({ showConfirmRerunAll: true });
  };

  rerunAll = () => {
    console.log("rerunAll");

    this.setState({ showConfirmRerunAll: false });
    const storedUser = getCognitoUser();
    this.props.rerunAIAll(
      this.state.activePage,
      0,
      storedUser.userID,
      storedUser.userName
    );
  };

  render() {
    // console.log("render ReviewTable");
    // console.log(this.state.showAll);
    // console.log(this.state.numColumns);
    return (
      <>
        <Confirm
          header="Re-Run AI on all Labelled requests?"
          //   content={
          //     <>
          //       Clicking 'Confirm' will re-run the AI processing on ALL Labelled
          //       results in the system.
          //       <br />
          //       This could take several minutes - check status in 'Re-run AI
          //       status' page
          //     </>
          //   }
          content="Clicking 'Confirm' will re-run the AI processing on ALL Labelled results in the system.&#xa;This could take several minutes - check status in 'Re-run AI status' page."
          open={this.state.showConfirmRerunAll}
          onCancel={() => this.setState({ showConfirmRerunAll: false })}
          onConfirm={this.rerunAll}
          confirmButton="Confirm"
          //   size="large"
        />
        <Button
          style={{ margin: "1em 0em 1em 0em" }}
          floated="left"
          color="blue"
          //   size="large"
          onClick={this.handleClickRerunAll}
          icon
          disabled={this.props.loading}
          //   disabled={true}
          labelPosition="right"
        >
          <Icon name="arrow circle right" /> Re-run AI for ALL Labelled
        </Button>
        <Button
          style={{ margin: "1em 0em 1em 1em" }}
          floated="right"
          color="blue"
          //   size="large"
          onClick={this.handleClickCollapseAll}
          icon
          labelPosition="right"
        >
          <Icon name="arrow circle right" />
          Expand All
        </Button>
        <Button
          style={{ margin: "1em 0em 1em 1em" }}
          floated="right"
          color="blue"
          //   size="large"
          onClick={this.handleClickShowLabelled}
          icon
          labelPosition="right"
        >
          <Icon name="arrow circle right" />{" "}
          {this.state.showLabelled ? "HIDE Labelled" : "SHOW Labelled"}
        </Button>
        <Table celled compact sortable striped>
          <Table.Header fullWidth>
            <Table.Row key={"row-footer"}>
              <Table.HeaderCell colSpan={this.state.numColumns}>
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
              <Table.HeaderCell colSpan="2" />
              <Table.HeaderCell colSpan="5">AI Results</Table.HeaderCell>
              {this.state.showPhysicianResults && (
                <>
                  <Table.HeaderCell colSpan="2">
                    Physician Results
                  </Table.HeaderCell>
                </>
              )}
              <Table.HeaderCell colSpan="6">Labelled Override</Table.HeaderCell>
              {/* <Table.HeaderCell colSpan="3" /> */}
              {!this.props.showRules && <Table.HeaderCell colSpan="3" />}
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
                width={1}
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
              {/* <Table.HeaderCell
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
              <Table.HeaderCell>Reason for Exam</Table.HeaderCell>
              <Table.HeaderCell>Exam Requested</Table.HeaderCell> */}
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
                  this.props.sortedColumn === "ai_p5_flag"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("ai_p5_flag");
                }}
              >
                P5
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
              <Table.HeaderCell>Sp. Exams</Table.HeaderCell>
              {this.state.showPhysicianResults && (
                <>
                  <Table.HeaderCell
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
                </>
              )}
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
                  this.props.sortedColumn === "labelled_p5_flag"
                    ? this.props.sortDirection
                    : null
                }
                onClick={() => {
                  this.props.changeResultSort("labelled_p5_flag");
                }}
              >
                P5
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
              </Table.HeaderCell>
             
            </Table.Row>
          </Table.Header> 

          {/* <Table.Body>{allItemRows}</Table.Body> */}
          <Table.Body>
            {this.props.results &&
              this.props.results.map((result, index) => (
                <React.Fragment key={"row-review-" + index}>
                  <ReviewTableRow
                    result={result}
                    rulesListDropdown={this.props.rulesListDropdown}
                    showRules={this.props.showRules}
                    showPhysicianResults={this.state.showPhysicianResults}
                    showLabelled={this.state.showLabelled}
                    index={index}
                    handleRowClick={this.handleRowClick}
                    expanded={
                      this.state.showAll ||
                      this.state.expandedRows.includes(index)
                    }
                  />
                </React.Fragment>
              ))}
          </Table.Body>

          <Table.Footer fullWidth>
            <Table.Row key={"row-footer"}>
              <Table.HeaderCell colSpan={this.state.numColumns}>
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

export default connect(mapStateToProps, {
  changeResultSort,
  getResultsByPage,
  rerunAI,
  rerunAIAll,
})(ReviewTable);
