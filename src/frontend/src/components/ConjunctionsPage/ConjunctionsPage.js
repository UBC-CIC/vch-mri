import React from "react";
import ConjunctionsTable from "./ConjunctionsTable";
import { Header } from "semantic-ui-react";

class ConjunctionsPage extends React.Component {
  render() {
    return (
      <div className="page-container">
        <Header as="h1" textAlign="left">
          Conjunctions
        </Header>
        <ConjunctionsTable />
      </div>
    );
  }
}

export default ConjunctionsPage;
