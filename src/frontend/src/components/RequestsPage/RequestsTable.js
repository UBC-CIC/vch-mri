import React from "react";
import { connect } from "react-redux";
import { Table, Pagination } from "semantic-ui-react";
import {
  changeResultSort,
  getResultsByPage,
} from "../../actions/ResultActions";
import { sendSuccessToast, sendErrorToast } from "../../helpers";
// import RequestsTableRow from "./RequestsTableRow";
import { Icon, Form, Button } from "semantic-ui-react";

class RequestsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activePage: 1,
      data: [
        {
          date: "2014-04-18",
          total: 121.0,
          status: "Shipped",
          name: "A",
          points: 5,
          percent: 50,
        },
        {
          date: "2014-04-21",
          total: 121.0,
          status: "Not Shipped",
          name: "B",
          points: 10,
          percent: 60,
        },
        {
          date: "2014-08-09",
          total: 121.0,
          status: "Not Shipped",
          name: "C",
          points: 15,
          percent: 70,
        },
        {
          date: "2014-04-24",
          total: 121.0,
          status: "Shipped",
          name: "D",
          points: 20,
          percent: 80,
        },
        {
          date: "2014-04-26",
          total: 121.0,
          status: "Shipped",
          name: "E",
          points: 25,
          percent: 90,
        },
      ],
      expandedRows: [],
      showAll: false,
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

  handleRowClick(rowId) {
    const currentExpandedRows = this.state.expandedRows;
    const isRowCurrentlyExpanded = currentExpandedRows.includes(rowId);

    const newExpandedRows = isRowCurrentlyExpanded
      ? currentExpandedRows.filter((id) => id !== rowId)
      : currentExpandedRows.concat(rowId);

    this.setState({ expandedRows: newExpandedRows });
  }

  renderItemCaret(rowId) {
    const currentExpandedRows = this.state.expandedRows;
    const isRowCurrentlyExpanded = currentExpandedRows.includes(rowId);

    if (isRowCurrentlyExpanded) {
      return <Icon name="caret down" />;
    } else {
      return <Icon name="caret right" />;
    }
  }

  handleClickCollapseAll = () => {
    this.setState({ showAll: !this.state.showAll });
  };
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

  renderItem(item, index) {
    const clickCallback = () => this.handleRowClick(index);
    const itemRows = [
      <Table.Row onClick={clickCallback} key={"row-data-" + index}>
        <Table.Cell>{this.renderItemCaret(index)}</Table.Cell>
        <Table.Cell>{item.date}</Table.Cell>
        <Table.Cell>{item.total}</Table.Cell>
        <Table.Cell>{item.status}</Table.Cell>
        <Table.Cell>{item.status}</Table.Cell>
        <Table.Cell>{item.status}</Table.Cell>
        <Table.Cell>
          <Form.Dropdown
            fluid
            selection
            name="phys_priority"
            value={"P1"}
            options={[
              { key: "e", text: "none", value: "e" },
              { key: "P1", text: "P1", value: "P1" },
              { key: "P2", text: "P2", value: "P2" },
              { key: "P3", text: "P3", value: "P3" },
              { key: "P4", text: "P4", value: "P4" },
              { key: "P5", text: "P5", value: "P5" },
            ]}
          />
        </Table.Cell>
        <Table.Cell>{item.status}</Table.Cell>
        <Table.Cell>{item.status}</Table.Cell>
        <Table.Cell>{item.status}</Table.Cell>
      </Table.Row>,
    ];

    if (this.state.showAll || this.state.expandedRows.includes(index)) {
      itemRows.push(
        <Table.Row key={"row-expanded-" + index}>
          <Table.Cell colSpan="12">{this.renderItemDetails(item)}</Table.Cell>
        </Table.Row>
      );
    }

    return itemRows;
  }

  render() {
    let allItemRows = [];

    this.state.data.forEach((item, index) => {
      const perItemRows = this.renderItem(item, index);
      allItemRows = allItemRows.concat(perItemRows);
    });
    return (
      <>
        <Button
          color="blue"
          size="huge"
          onClick={this.handleClickCollapseAll}
          icon
          labelPosition="right"
        >
          <Icon name="arrow circle right" /> Show All
        </Button>
        <Table celled compact sortable>
          <Table.Header fullWidth>
            <Table.Row>
              <Table.HeaderCell>Historic Data</Table.HeaderCell>
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
              <Table.HeaderCell>Date Created</Table.HeaderCell>
              <Table.HeaderCell collapsing />
            </Table.Row>
          </Table.Header>

          <Table.Body>{allItemRows}</Table.Body>
          {/* <Table.Body>
            {this.props.results.map((result, index) => (
              <RequestsTableRow result={result} />
            ))}
          </Table.Body> */}

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
  RequestsTable
);
