import React from "react";
import {
  Button,
  Header,
  Icon,
  Container,
  Modal,
  Table,
} from "semantic-ui-react";
import { connect } from "react-redux";
import ResultsHistoryViewRow from "./ResultsHistoryViewRow";

class ResultsHistoryView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
  }

  render() {
    return (
      <Modal
        // style={{ maxWidth: 500 }}
        onClose={() => this.setState({ open: false })}
        onOpen={() => this.setState({ open: true })}
        open={this.state.open}
        trigger={
          <Button icon>
            <Icon name="info circle" />
          </Button>
        }
      >
        <Header as="h2" color="blue" textAlign="center">
          History
        </Header>
        <Modal.Content>
          <Container textAlign="left">
            <Table celled compact striped>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Type</Table.HeaderCell>
                  <Table.HeaderCell>Description</Table.HeaderCell>
                  <Table.HeaderCell>Modified by User</Table.HeaderCell>
                  <Table.HeaderCell>DOB</Table.HeaderCell>
                  <Table.HeaderCell>Height</Table.HeaderCell>
                  <Table.HeaderCell>Weight</Table.HeaderCell>
                  <Table.HeaderCell>Reason for Exam</Table.HeaderCell>
                  <Table.HeaderCell>Exam Requested</Table.HeaderCell>
                  <Table.HeaderCell>Modified field</Table.HeaderCell>
                  <Table.HeaderCell>Date Modified</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {this.props.history.map((history, index) => (
                  <ResultsHistoryViewRow history={history} index={index} />
                ))}
              </Table.Body>
            </Table>
          </Container>
        </Modal.Content>
        <Modal.Actions>
          <Button
            color="black"
            content="Close"
            onClick={() => this.setState({ open: false })}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    results: state.results.resultsList,
    loading: state.results.loading,
    error: state.results.error,
  };
};

export default connect(mapStateToProps)(ResultsHistoryView);
