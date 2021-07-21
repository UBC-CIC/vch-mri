import React from "react";
import { Header, Grid } from "semantic-ui-react";
import Statistics from "./Statistics";

class StatisticsPage extends React.Component {
  render() {
    return (
      <div className="page-container">
        {/* <Header as="h1" textAlign="left">
          AI Results Statistics
        </Header> */}
        <Grid centered>
          <Statistics />
        </Grid>
      </div>
    );
  }
}

export default StatisticsPage;
