import React from "react";
import { connect } from "react-redux";
import { Table, Grid, Header, Button, Popup } from "semantic-ui-react";
import { getRerunAIHistory, stopRerunAI } from "../../actions/ResultActions";
import { sendErrorToast, sendSuccessToast } from "../../helpers";

class RerunAITable extends React.Component {
  componentDidMount() {
    this.props.getRerunAIHistory();
  }

  componentDidUpdate(preProps, prevState, snapshot) {
    if (this.props.error) {
      sendErrorToast(this.props.error.message);
    } else if (this.props.success) {
      sendSuccessToast(this.props.success);
    }
  }

  handleRerunAIContinue(reqId) {
    console.log(`handleRerunAI: ${reqId}`);
    // this.props.rerunAI(reqId, storedUser.sub, storedUser.name.trim());
  }

  handleStopAI(reqId) {
    console.log(`handleStopAI: ${reqId}`);
    this.props.stopRerunAI(reqId);
  }

  popupButtonAIConfirm = (reqId, resState = "stopped") => {
    let gridColumns = 2;

    return (
      <>
        <Grid centered divided="horizontally">
          {/* <Grid.Row columns={1}>
            <p>Note: all existing labelling overrides will be cleared.</p>
          </Grid.Row> */}
          <Grid.Row columns={gridColumns}>
            <Grid.Column textAlign="center">
              <Header as="h4">Continue Re-run AI</Header>
              <p>AI processing will continue from where it left off.</p>
              <Button
                // fluid
                color="green"
                content={"Continue"}
                onClick={() => this.handleRerunAIContinue(reqId)}
                // style={{ marginTop: "10px" }}
              />
            </Grid.Column>
            <Grid.Column textAlign="center">
              <Header as="h4">Stop AI Processing</Header>
              <p>
                You will NOT be able to restart processing on this list again.
              </p>
              <Button
                // fluid
                color="red"
                content={"Stop"}
                onClick={() => this.handleStopAI(reqId)}
                // style={{ marginTop: "10px" }}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </>
    );
  };

  render() {
    console.log("RerunAI rendor");
    console.log(this.props.results);
    const results = this.props.results;

    return (
      <Table celled compact sortable>
        <Table.Header fullWidth>
          <Table.Row key={"row-header1"}>
            <Table.HeaderCell colSpan="3" />
            <Table.HeaderCell colSpan="2">CIO's Processed</Table.HeaderCell>
            <Table.HeaderCell colSpan="2">
              ALL CIO's to be Processed
            </Table.HeaderCell>
            <Table.HeaderCell colSpan="5" />
          </Table.Row>
          <Table.Row key={"row-header2"}>
            <Table.HeaderCell>Re-run ID</Table.HeaderCell>
            <Table.HeaderCell>State</Table.HeaderCell>
            <Table.HeaderCell>Current CIO</Table.HeaderCell>
            <Table.HeaderCell>Total #</Table.HeaderCell>
            <Table.HeaderCell>List</Table.HeaderCell>
            <Table.HeaderCell>Total #</Table.HeaderCell>
            <Table.HeaderCell>List</Table.HeaderCell>
            <Table.HeaderCell>Desc</Table.HeaderCell>
            <Table.HeaderCell>User</Table.HeaderCell>
            <Table.HeaderCell>Elapsed Time (ms)</Table.HeaderCell>
            <Table.HeaderCell>Created</Table.HeaderCell>
            <Table.HeaderCell>Modified </Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {results &&
            results.map((result, index) => (
              <React.Fragment key={"row-labelling-" + index}>
                <Popup
                  content={this.popupButtonAIConfirm(result.id, result.state)}
                  trigger={
                    <Table.Row
                      disabled={this.props.loading}
                      key={"row-data-" + index}
                      positive={result.state === "running"}
                    >
                      <Table.Cell>{result.id}</Table.Cell>
                      <Table.Cell>{result.state}</Table.Cell>
                      <Table.Cell>{result.cio_current}</Table.Cell>
                      <Table.Cell>
                        {result.cio_list_processed
                          ? result.cio_list_processed.length
                          : 0}
                      </Table.Cell>
                      <Table.Cell>
                        {result.cio_list_processed.join(", ")}
                      </Table.Cell>
                      <Table.Cell>
                        {result.cio_list_all ? result.cio_list_all.length : 0}
                      </Table.Cell>
                      <Table.Cell>{result.cio_list_all.join(", ")}</Table.Cell>
                      <Table.Cell>{result.description}</Table.Cell>
                      <Table.Cell>{result.cognito_user_fullname}</Table.Cell>
                      <Table.Cell>{result.time_elapsed_ms}</Table.Cell>
                      <Table.Cell>{result.created_at}</Table.Cell>
                      <Table.Cell>{result.updated_at}</Table.Cell>
                      {/* <Table.Cell textAlign="right" collapsing>
                <ConfirmDeleteDialog id={specialtyExam} table="specialtyExam" />
              </Table.Cell> */}
                    </Table.Row>
                  }
                  mouseEnterDelay={500}
                  mouseLeaveDelay={500}
                  flowing
                  hoverable
                  position="bottom center"
                  disabled={result.state !== "running"}
                  // size="tiny"
                  style={{ color: "red" }}
                ></Popup>
              </React.Fragment>
            ))}
        </Table.Body>

        <Table.Footer fullWidth>
          <Table.Row>
            <Table.HeaderCell colSpan="12">
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

const mapStatetoProps = (state) => {
  return {
    results: state.results.rerunAIHistory,
    error: state.results.error,
    success: state.results.success,
    sortedColumn: state.results.column,
    sortDirection: state.results.direction,
  };
};

export default connect(mapStatetoProps, { getRerunAIHistory, stopRerunAI })(
  RerunAITable
);
