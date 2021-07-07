import React from "react";
import { Table, Icon } from "semantic-ui-react";

class ResultsTableRowExpansion extends React.Component {
  render() {
    const result = this.props.result;
    return (
      <Table celled striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan="8">Original Request</Table.HeaderCell>
            <Table.HeaderCell colSpan="2">
              Pre-process (prior to Rules priority engine)
            </Table.HeaderCell>
            <Table.HeaderCell colSpan="2">Results - Rule Info</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          <Table.Row>
            <Table.Cell colSpan="8">
              <Icon name="folder" /> {result.id}
            </Table.Cell>
            <Table.Cell colSpan="2">Initial commit</Table.Cell>
            <Table.Cell colSpan="2" textAlign="right">
              10 hours ago
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <Icon name="folder" /> test2
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
    );
  }
}

export default ResultsTableRowExpansion;
