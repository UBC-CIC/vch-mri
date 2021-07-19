import React from "react";
import LabellingTable from "./LabellingTable";
import LabellingSearchBar from "./LabellingSearchBar";
import { Grid, Header } from "semantic-ui-react";
import RulesTable from "../RulesPage/RulesTable";
import { connect } from "react-redux";
import { getMRIRules } from "../../actions/RuleActions";
import "../../styles/LabellingRules.css";

class LabellingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showRules: true,
    };
  }
  async componentWillMount() {
    console.log("componentWillMount");
    await this.props.getMRIRules();
  }

  handleClickShowRules = () => {
    this.setState({ showRules: !this.state.showRules });
    console.log(this.state.showRules);
  };

  render() {
    if (this.props.loading)
      return <div className="page-container">Loading...</div>;

    let labellingClassname = "fieldsLabellingRules";
    let labellingWidth = 10;
    if (!this.state.showRules) {
      labellingClassname = "fieldsLabelling";
      labellingWidth = 12;
    }
    return (
      <div className="page-container">
        <Header as="h1" textAlign="left">
          Labelling
        </Header>
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
        <>
          <Grid>
            <Grid.Column
              floated="left"
              width={labellingWidth}
              style={{
                padding: 20,
              }}
            >
              <div className={labellingClassname}>
                <LabellingTable
                  showRules={this.state.showRules}
                  handleClickShowRules={this.handleClickShowRules}
                  rulesListDropdown={this.props.rulesListDropdown}
                />
              </div>
            </Grid.Column>
            {this.state.showRules && (
              <Grid.Column
                floated="left"
                width={6}
                style={{
                  padding: 20,
                }}
              >
                <div className="fieldsRules">
                  <RulesTable labelling={true} rulesLoaded={true} />
                </div>
              </Grid.Column>
            )}
          </Grid>
        </>
        {/* {!this.state.showRules && (
          <>
            <LabellingTable
              showRules={this.state.showRules}
              handleClickShowRules={this.handleClickShowRules}
            />
          </>
        )} */}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    rulesListDropdown: state.rules.rulesListDropdown,
    rules: state.rules.rulesList,
    loading: state.rules.loading,
    error: state.rules.error,
    success: state.rules.success,
    sortedColumn: state.rules.column,
    sortDirection: state.rules.direction,
  };
};

export default connect(mapStateToProps, {
  getMRIRules,
})(LabellingPage);
