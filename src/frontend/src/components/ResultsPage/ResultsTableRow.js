import React from "react";
import { connect } from "react-redux";
import { Form, Table } from "semantic-ui-react";
import { modifyResult } from "../../actions/ResultActions";
import ResultView from "./ResultView";

class ResultsTableRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
      phys_priority:
        this.props.result.phys_priority !== null
          ? this.props.result.phys_priority
          : "e",
      phys_contrast:
        this.props.result.phys_contrast !== null
          ? this.props.result.phys_contrast
          : "e",
    };

    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      phys_priority:
        nextProps.result.phys_priority !== null
          ? nextProps.result.phys_priority
          : "e",
      phys_contrast:
        nextProps.result.phys_contrast !== null
          ? nextProps.result.phys_contrast
          : "e",
    });
  }

  handleSelectChange(e, { name, value }) {
    this.setState({ [name]: value }, () => {
      this.props.modifyResult({
        id: this.props.result.id,
        phys_priority:
          this.state.phys_priority === "e" ? null : this.state.phys_priority,
        phys_contrast:
          this.state.phys_contrast === "e" ? null : this.state.phys_contrast,
      });
    });
  }

  handleClick = (e, titleProps) => {
    const { index } = titleProps;
    const activeIndex = this.state.activeIndex;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  };

  render() {
    return (
      <>
        <Table.Row disabled={this.props.loading}>
          <Table.Cell>{this.props.result.id}</Table.Cell>
          <Table.Cell>
            {this.props.result.dob ? this.props.result.dob : "N/A"}
          </Table.Cell>
          <Table.Cell>
            {this.props.result.height ? this.props.result.height : "N/A"}
          </Table.Cell>
          <Table.Cell>
            {this.props.result.weight ? this.props.result.weight : "N/A"}
          </Table.Cell>
          <Table.Cell>
            {this.props.result.reason_for_exam
              ? this.props.result.reason_for_exam
              : "N/A"}
          </Table.Cell>
          <Table.Cell>
            {this.props.result.exam_requested
              ? this.props.result.exam_requested
              : "N/A"}
          </Table.Cell>
          <Table.Cell>
            {this.props.result.rules_id ? this.props.result.rules_id : "N/A"}
          </Table.Cell>
          <Table.Cell>{this.props.result.priority}</Table.Cell>
          <Table.Cell>
            {this.props.result.contrast !== null
              ? this.props.result.contrast.toString()
              : "none"}
          </Table.Cell>
          <Table.Cell>
            {this.props.result.p5_flag !== null
              ? this.props.result.p5_flag.toString()
              : "none"}
          </Table.Cell>
          <Table.Cell>
            <Form.Dropdown
              fluid
              selection
              name="phys_priority"
              value={this.state.phys_priority}
              options={[
                { key: "e", text: "none", value: "e" },
                { key: "P1", text: "P1", value: "P1" },
                { key: "P2", text: "P2", value: "P2" },
                { key: "P3", text: "P3", value: "P3" },
                { key: "P4", text: "P4", value: "P4" },
                { key: "P5", text: "P5", value: "P5" },
              ]}
              onChange={this.handleSelectChange}
            />
          </Table.Cell>
          <Table.Cell>
            <Form.Dropdown
              fluid
              selection
              name="phys_contrast"
              value={this.state.phys_contrast}
              options={[
                { key: "e", text: "none", value: "e" },
                { key: true, text: "true", value: true },
                { key: false, text: "false", value: false },
              ]}
              onChange={this.handleSelectChange}
            />
          </Table.Cell>
          <Table.Cell>
            {this.props.result.tags
              ? this.props.result.tags.join(", ")
              : "none"}
          </Table.Cell>
          <Table.Cell>{this.props.result.date_created}</Table.Cell>
          <Table.Cell textAlign="right" collapsing>
            <ResultView info={this.props.result.info} />
          </Table.Cell>
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

export default connect(mapStateToProps, { modifyResult })(ResultsTableRow);
