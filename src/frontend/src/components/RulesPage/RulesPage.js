import React from "react";
import RulesTable from "./RulesTable";
import { Header } from "semantic-ui-react";

class RulesPage extends React.Component {
  render() {
    return (
      <div className="page-container">
        <Header as="h1" textAlign="left" style={{ fontSize: "2em" }}>
          Rules
        </Header>
        <RulesTable />
      </div>
    );
  }
}

export default RulesPage;
