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
import RulesHistoryViewRow from "./RulesHistoryViewRow";
import { getMRIRulesHistory } from "../../actions/RuleActions";

class ResultsHistoryView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };

    this.onOpen = this.onOpen.bind(this);
  }

  onOpen = () => {
    console.log("RulesHistoryViewRow onOpen");
    this.props.getMRIRulesHistory();
    this.setState({ open: true });
  };

  render() {
    console.log("RulesHistoryViewRow render");
    console.log(this.props.rulesHistoryList);
    const rulesHistoryList = this.props.rulesHistoryList;

    return (
      <Modal
        // style={{ maxWidth: "100%" }}
        size="large"
        onClose={() => this.setState({ open: false })}
        onOpen={this.onOpen}
        open={this.state.open}
        trigger={
          <Button
            style={{ margin: "1em 0em 1em 1em" }}
            floated="right"
            color="blue"
            //   size="large"
            // onClick={this.handleClickToggleInactive}
            icon
            labelPosition="right"
          >
            <Icon name="window restore outline" /> History
            {/* <Button icon>
            History <Icon name="info circle" />
          </Button> */}
          </Button>
        }
      >
        <Header as="h2" color="blue" textAlign="center">
          Rules History
        </Header>
        <Modal.Content>
          <Container textAlign="left">
            <Table collapsing celled compact striped size="large">
              <Table.Header fullWidth>
                <Table.Row>
                  <Table.HeaderCell>Rule ID</Table.HeaderCell>
                  <Table.HeaderCell>Description</Table.HeaderCell>
                  <Table.HeaderCell>Active</Table.HeaderCell>
                  <Table.HeaderCell>Body Part</Table.HeaderCell>
                  <Table.HeaderCell>Information</Table.HeaderCell>
                  <Table.HeaderCell>Priority</Table.HeaderCell>
                  <Table.HeaderCell>Contrast</Table.HeaderCell>
                  <Table.HeaderCell>Sp. Exams</Table.HeaderCell>
                  <Table.HeaderCell>Modified by User</Table.HeaderCell>
                  <Table.HeaderCell>Date</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rulesHistoryList &&
                  rulesHistoryList.map((history, index) => (
                    <React.Fragment key={"row-history-" + index}>
                      <RulesHistoryViewRow history={history} index={index} />
                    </React.Fragment>
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
    rulesHistoryList: state.rules.rulesHistoryList,
    loading: state.results.loading,
    error: state.results.error,
  };
};

export default connect(mapStateToProps, { getMRIRulesHistory })(
  ResultsHistoryView
);
