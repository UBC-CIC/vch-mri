import React from "react";
import LabellingTable from "./LabellingTable";
import LabellingSearchBar from "./LabellingSearchBar";
import { Grid, Container, Button, Icon } from "semantic-ui-react";
import RulesTable from "../RulesPage/RulesTable";
import "../../styles/LabellingRules.css";

class LabellingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showRules: true,
    };
  }

  handleClickShowRules = () => {
    this.setState({ showRules: !this.state.showRules });
    console.log(this.state.showRules);
  };

  render() {
    return (
      <div className="page-container">
        <LabellingSearchBar />
        {/* {this.state.showRules && (
          <>
            <Container>
              <div>
                <div>
                  <LabellingTable
                    showRules={this.state.showRules}
                    handleClickShowRules={this.handleClickShowRules}
                  />
                </div>
                <div className="fields">
                  <RulesTable />
                </div>
                <div
                  class="scrolling content"
                  style={{
                    maxHeight: "100px",
                    width: "100vh",
                    backgroundColor: "lightskyblue",
                  }}
                >
                  <RulesTable />
                </div>
              </div>
            </Container>
          </>
        )} */}
        {this.state.showRules && (
          <>
            <Grid>
              <Grid.Column
                floated="left"
                width={10}
                style={{
                  padding: 20,
                }}
              >
                <div className="fieldsLabelling">
                  <LabellingTable
                    showRules={this.state.showRules}
                    handleClickShowRules={this.handleClickShowRules}
                  />
                </div>
              </Grid.Column>
              <Grid.Column
                floated="left"
                width={6}
                style={{
                  padding: 20,
                }}
              >
                <div className="fieldsRules">
                  <RulesTable labelling={true} />
                </div>
              </Grid.Column>
            </Grid>
          </>
        )}
        {!this.state.showRules && (
          <>
            <LabellingTable
              showRules={this.state.showRules}
              handleClickShowRules={this.handleClickShowRules}
            />
          </>
        )}
      </div>
    );
  }
}

export default LabellingPage;
