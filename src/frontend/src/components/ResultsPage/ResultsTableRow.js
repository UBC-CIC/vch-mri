import React from "react";
import { connect } from "react-redux";
import { Icon, Form, Table } from "semantic-ui-react";
import { modifyResult } from "../../actions/ResultActions";
import ResultView from "./ResultView";
import ResultsTableRowExpansion from "./ResultsTableRowExpansion";

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

  renderItemCaret(expanded) {
    if (expanded) {
      return <Icon name="caret down" />;
    } else {
      return <Icon name="caret right" />;
    }
  }

  renderItemDetails(item) {
    return (
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan="8">Git Repository</Table.HeaderCell>
            <Table.HeaderCell colSpan="2">Git Repository2</Table.HeaderCell>
            <Table.HeaderCell colSpan="2">Git Repository3</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <Table.Row>
            <Table.Cell colSpan="8">
              <Icon name="folder" /> node_modules
            </Table.Cell>
            <Table.Cell colSpan="2">Initial commit</Table.Cell>
            <Table.Cell colSpan="2" textAlign="right">
              10 hours ago
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <Icon name="folder" /> test
            </Table.Cell>
            <Table.Cell>Initial commit</Table.Cell>
            <Table.Cell textAlign="right">10 hours ago</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <Icon name="folder" /> build
            </Table.Cell>
            <Table.Cell>Initial commit</Table.Cell>
            <Table.Cell textAlign="right">10 hours ago</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <Icon name="file outline" /> package.json
            </Table.Cell>
            <Table.Cell>Initial commit</Table.Cell>
            <Table.Cell textAlign="right">10 hours ago</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <Icon name="file outline" /> Gruntfile.js
            </Table.Cell>
            <Table.Cell>Initial commit</Table.Cell>
            <Table.Cell textAlign="right">10 hours ago</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      // <Segment basic>
      //   <Grid columns={3}>
      //     <Grid.Column>
      //       <span>Name: {item.name}</span>
      //     </Grid.Column>

      //     <Grid.Column>
      //       <span>Point: {item.points}</span>
      //     </Grid.Column>

      //     <Grid.Column>
      //       <span>Percent: {item.percent}</span>
      //     </Grid.Column>
      //   </Grid>
      // </Segment>
    );
  }

  render() {
    console.log("expanded");
    console.log(this.props.expanded);
    // console.log(ResultsTableRow);
    console.log(this.props.result.error);

    const index = this.props.index;
    console.log(this.props.index);
    let state = this.props.result.state;
    if (this.props.result.error && this.props.result.error !== "") {
      //  error state
      state = `"${this.props.result.error}"`;
    }
    return (
      <>
        <Table.Row
          onClick={() => this.props.handleRowClick(index)}
          key={"row-data-" + index}
          disabled={this.props.loading}
          error={
            (this.props.result.error && this.props.result.error !== "") ||
            state === "deleted"
          }
          warning={state === "received" || state === "received_duplicate"}
          positive={
            state === "ai_priority_processed" ||
            state === "final_priority_received" ||
            state === "labelled"
          }
        >
          <Table.Cell singleLine>
            {this.renderItemCaret(this.props.expanded)}
            {this.props.result.id}
          </Table.Cell>
          <Table.Cell>{state}</Table.Cell>
          <Table.Cell>
            {this.props.result.request.dob
              ? this.props.result.request.dob
              : "N/A"}
          </Table.Cell>
          <Table.Cell>
            {this.props.result.request.height
              ? this.props.result.request.height
              : "N/A"}
          </Table.Cell>
          <Table.Cell>
            {this.props.result.request.weight
              ? this.props.result.request.weight
              : "N/A"}
          </Table.Cell>
          <Table.Cell>
            {this.props.result.request.reason_for_exam
              ? this.props.result.request.reason_for_exam
              : "N/A"}
          </Table.Cell>
          <Table.Cell>
            {this.props.result.request.exam_requested
              ? this.props.result.request.exam_requested
              : "N/A"}
          </Table.Cell>
          <Table.Cell>
            {this.props.result.rules_id ? this.props.result.rules_id : "N/A"}
          </Table.Cell>
          <Table.Cell>
            {this.props.result.priority ? this.props.result.priority : "N/A"}
          </Table.Cell>
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
          {/* <Table.Cell>
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
          </Table.Cell> */}
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
        {this.props.expanded && (
          <Table.Row key={"row-expanded-" + index}>
            <Table.Cell colSpan="12">
              {/* {this.renderItemDetails(this.props.result)} */}
              <ResultsTableRowExpansion result={this.props.result} />
            </Table.Cell>
          </Table.Row>
        )}
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
