import React from "react";
import { Header } from "semantic-ui-react";
import RerunAITable from "./RerunAITable";

class RerunAIPage extends React.Component {
  render() {
    return (
      <div className="page-container">
        <Header as="h1" textAlign="left">
          Re-run AI on ALL Labelled - Status and History
        </Header>
        <Header as="h3" textAlign="left" inverted color="orange">
          Refresh page (F5) to see updated status
        </Header>
        <RerunAITable />
      </div>
    );
  }
}

export default RerunAIPage;
