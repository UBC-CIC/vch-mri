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
    this.HistoryCell = this.HistoryCell.bind(this);
  }

  HistoryCell() {
    const history = this.props.history;
    switch (history.history_type) {
      case "request":
        return (
          <Table.Cell>
            {history ? (
              <>
                <p>
                  <b>DOB: </b>
                  {history.dob}
                </p>
                <p>
                  <b>Height: </b>
                  {history.height}
                </p>
                <p>
                  <b>Weight: </b>
                  {history.weight}
                </p>
                <p>
                  <b>Reason for Exam: </b>
                  {history.reason_for_exam}
                </p>
                <p>
                  <b>Exam Requested: </b>
                  {history.exam_requested}
                </p>
              </>
            ) : (
              <p>Request error.</p>
            )}
          </Table.Cell>
        );
      case "modification":
        const info = history.mod_info;
        return (
          <Table.Cell>
            {info ? (
              <>
                <p>
                  <b>Labelling:</b>
                </p>
                <p>
                  <b>Rule ID: </b>
                  {info.labelled_rule_id ? info.labelled_rule_id : " - "}
                </p>
                <p>
                  <b>Priority: </b>
                  {info.labelled_priority ? info.labelled_priority : " - "}
                </p>
                <p>
                  <b>Contrast: </b>
                  {info.labelled_contrast !== null
                    ? info.labelled_contrast.toString()
                    : " - "}
                </p>
                <p>
                  <b>Notes: </b>
                  {info.labelled_notes && info.labelled_notes !== ""
                    ? info.labelled_notes
                    : " - "}
                </p>
              </>
            ) : (
              <p>Modification error.</p>
            )}
          </Table.Cell>
        );
      case "ai_result":
        const result = history.mod_info;
        return (
          <Table.Cell>
            {result ? (
              <>
                <p>
                  <b>AI Result:</b>
                </p>
                <p>
                  <b>Rule ID: </b>
                  {result.rule_id ? result.rule_id : " - "}
                </p>
                <p>
                  <b>Priority: </b>
                  {result.priority ? result.priority : " - "}
                </p>
                <p>
                  <b>Contrast: </b>
                  {result.contrast !== null
                    ? result.contrast.toString()
                    : " - "}
                </p>
                <p>
                  <b>anatomy: </b>
                  {result.anatomy ? result.anatomy : " - "}
                </p>
                <p>
                  <b>p5_flag: </b>
                  {result.p5_flag ? result.p5_flag : " - "}
                </p>
                <p>
                  <b>specialty_exams: </b>
                  {result.specialty_exams ? result.specialty_exams : " - "}
                </p>
              </>
            ) : (
              <p>Modification error.</p>
            )}
          </Table.Cell>
        );
      case "delete":
        return (
          <Table.Cell>
            <p>{`DELETED:`}</p>
          </Table.Cell>
        );
      default:
        break;
    }
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
          <this.HistoryCell />
          <Table.Cell>{history.date_created}</Table.Cell>
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
