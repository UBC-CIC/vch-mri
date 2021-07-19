import React from "react";
import ResultsTable from "./ResultsTable";
import ResultSearchBar from "./ResultSearchBar";
import { Header } from "semantic-ui-react";

class ResultsPage extends React.Component {
  render() {
    return (
      <div className="page-container">
        <Header as="h1" textAlign="left">
          Results
        </Header>
        <ResultSearchBar />
        <ResultsTable />
      </div>
    );
  }
}

export default ResultsPage;
