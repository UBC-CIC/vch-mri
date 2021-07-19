import React from "react";
import WeightsTable from "./WeightsTable";
import { Header } from "semantic-ui-react";

class WeightsPage extends React.Component {
  render() {
    return (
      <div className="page-container">
        <Header as="h1" textAlign="left">
          Rule Word Weights
        </Header>
        <WeightsTable />
      </div>
    );
  }
}

export default WeightsPage;
