import React from "react";
import { connect } from "react-redux";
import { Table } from "semantic-ui-react";
import { modifyResult } from "../../actions/ResultActions";

class ResultsHistoryViewRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
    };
  }

  render() {
    // console.log("history");
    // console.log(this.props.history);
    const history = this.props.history;

    const index = this.props.index;
    // console.log(this.props.index);

    return (
      <>
        <Table.Row key={"row-data-" + index} disabled={this.props.loading}>
          <Table.Cell>{history.history_type}</Table.Cell>
          <Table.Cell>{history.description}</Table.Cell>
          <Table.Cell>{history.cognito_user_fullname}</Table.Cell>
          <Table.Cell>{history.dob ? history.dob : "N/A"}</Table.Cell>
          <Table.Cell>{history.height ? history.height : "N/A"}</Table.Cell>
          <Table.Cell>{history.weight ? history.weight : "N/A"}</Table.Cell>
          <Table.Cell>
            {history.reason_for_exam ? history.reason_for_exam : "N/A"}
          </Table.Cell>
          <Table.Cell>
            {history.exam_requested ? history.exam_requested : "N/A"}
          </Table.Cell>
          {/* <Table.Cell>N/A</Table.Cell> */}
          <Table.Cell>
            {history.mod_info ? JSON.stringify(history.mod_info) : "N/A"}
          </Table.Cell>
          <Table.Cell>{history.date_created}</Table.Cell>
          {/* {history.state === 'modification'
        &&
          <>
            <Table.Cell>{history.description}</Table.Cell>
            <Table.Cell>{history.cognito_user_fullname}</Table.Cell>
            <Table.Cell>{history.dob ? history.dob : "N/A"}</Table.Cell>
            <Table.Cell>
                {history.exam_requested ? history.exam_requested : "N/A"}
            </Table.Cell>
            <Table.Cell>
                {history.reason_for_exam ? history.reason_for_exam : "N/A"}
            </Table.Cell>
          </>
        } */}
        </Table.Row>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    results: state.results.resultsList,
    loading: state.results.loading,
    error: state.results.error,
    success: state.results.success,
    sortedColumn: state.results.column,
    sortDirection: state.results.direction,
  };
};

export default connect(mapStateToProps, { modifyResult })(
  ResultsHistoryViewRow
);
