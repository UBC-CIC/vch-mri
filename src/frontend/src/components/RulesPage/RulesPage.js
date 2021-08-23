import React from "react";
import RulesTable from "./RulesTable";
import { Header, Button, Icon } from "semantic-ui-react";
import RulesHistoryView from "./RulesHistoryView";

class RulesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showInactive: false,
    };
  }

  handleClickToggleInactive = () => {
    this.setState({ showInactive: !this.state.showInactive });
  };

  render() {
    return (
      <div className="page-container">
        <Header as="h1" textAlign="left" style={{ fontSize: "2em" }}>
          Rules
        </Header>
        <Button
          style={{ margin: "1em 0em 1em 1em" }}
          floated="right"
          color="blue"
          //   size="large"
          onClick={this.handleClickToggleInactive}
          icon
          labelPosition="right"
        >
          <Icon name="arrow circle right" /> Toggle Inactive
        </Button>
        <RulesHistoryView />
        <RulesTable
          //   labelling={this.props.labelling}
          labelling={false}
          showInactive={this.state.showInactive}
          rulesLoaded={this.props.rulesLoaded}
        />
      </div>
    );
  }
}

export default RulesPage;
