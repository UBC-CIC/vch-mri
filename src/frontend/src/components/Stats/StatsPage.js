import React from "react";
import { Header, Grid } from "semantic-ui-react";
import Stats from "./Stats";

class StatsPage extends React.Component {
  render() {
    return (
      <div className="page-container">
        {/* <Header as="h1" textAlign="left">
          AI Results Statistics
        </Header> */}
        <Grid centered>
          <Stats />
        </Grid>
      </div>
    );
  }
}

export default StatsPage;
