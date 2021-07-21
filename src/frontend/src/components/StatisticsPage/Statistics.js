import React from "react";
import { Form, Segment, Header, Grid, Statistic } from "semantic-ui-react";
import { DateInput } from "semantic-ui-calendar-react";
import { connect } from "react-redux";
import { getStatistics } from "../../actions/ResultActions";
import { sendErrorToast, sendSuccessToast } from "../../helpers";

class Statistics extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: "",
      endDate: "",
    };

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.props.getStatistics();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.error) {
      sendErrorToast(this.props.error.message);
    } else if (this.props.success) {
      sendSuccessToast(this.props.success);
    }
  }

  handleSelectChange(e, { name, value }) {
    console.log("handleSelectChange");
    console.log(name);
    console.log(value);
    this.setState({ [name]: value });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.getStatistics(
      this.state.startDate.trim(),
      this.state.endDate.trim()
    );
  }

  itemsStatistic(labelPrefix, data) {
    let total = data.total;
    let success = total - data.overridden;
    let percent = ((success / total) * 100).toFixed(2) + "%";
    return [
      {
        key: `${labelPrefix}key`,
        label: `${labelPrefix} Overridden`,
        value: `${data.overridden}/${total}`,
      },
      { key: `${labelPrefix}Accuracy`, label: "Accuracy", value: percent },
    ];
  }

  ruleStatistic(rule) {
    let total = rule.total;
    let ruleId = rule.rule_id;
    let success = total - rule.total_overridden;
    let percent = ((success / total) * 100).toFixed(2) + "%";
    // console.log("ruleStatistic");
    // console.log(ruleId);
    return [
      { key: `${ruleId}-ruleid`, label: "Rule ID", value: ruleId },
      //   { key: "views", label: "Total AI Wins", value: total },
      {
        key: `${ruleId}-total`,
        label: "Total Times AI Overridden",
        // value: rule.total_overridden,
        value: `${rule.total_overridden}/${total}`,
      },
      { key: `${ruleId}-Accuracy`, label: "Accuracy", value: percent },
    ];
  }

  render() {
    console.log("Statistics rendor");
    console.log(this.props.results);
    const results = this.props.results;

    return (
      <>
        <Grid.Row centered>
          <Segment inverted color="blue">
            <Header as="h2" textAlign="center">
              AI Results Statistics
            </Header>
            <Form inverted color="blue" onSubmit={this.handleSubmit}>
              <DateInput
                name="startDate"
                value={this.state.startDate}
                dateFormat="YYYY-MM-DD"
                label="Start date (YYYY-MM-DD)"
                iconPosition="left"
                onChange={this.handleSelectChange}
              />
              <DateInput
                name="endDate"
                value={this.state.endDate}
                dateFormat="YYYY-MM-DD"
                label="End date (YYYY-MM-DD)"
                iconPosition="left"
                onChange={this.handleSelectChange}
              />
              <Form.Button
                fluid
                // color="white"
                // content="Submit"
                //   disabled={
                //     !this.state.startDate ||
                //     !this.state.endDate
                //   }
              >
                Submit
              </Form.Button>
            </Form>
          </Segment>
        </Grid.Row>
        <br></br>
        {/* <div>{JSON.stringify(this.props.results)}</div> */}
        {/* <Segment centered inverted style={{ padding: "2em" }}> */}
        {results && (
          <>
            <Grid.Row centered>
              <Statistic.Group
                size="huge"
                color="green"
                //   inverted
                items={[
                  {
                    key: "tlr",
                    label: "Total Labelled Results",
                    value: results.rule.total,
                  },
                ]}
              />
            </Grid.Row>
          </>
        )}
        {results && results.rule.total > 0 && (
          <>
            <hr />
            <Grid.Row centered>
              <Statistic.Group
                //   inverted
                items={this.itemsStatistic("Rules", results.rule)}
              />
            </Grid.Row>
            <Grid.Row centered>
              <Statistic.Group
                //   inverted
                items={this.itemsStatistic("Priorities", results.priority)}
              />
            </Grid.Row>
            <Grid.Row centered>
              <Statistic.Group
                //   inverted
                items={this.itemsStatistic("Contrasts", results.contrast)}
              />
            </Grid.Row>
            <hr />
          </>
        )}
        {results &&
          results.rules &&
          results.rules.length > 0 &&
          results.rules.map((rule, index) => (
            <>
              <Grid.Row centered>
                <Statistic.Group
                  // inverted
                  size="small"
                  items={this.ruleStatistic(rule)}
                />
              </Grid.Row>
            </>
          ))}
        {/* </Segment> */}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    results: state.results.statistics,
    loading: state.results.loading,
    error: state.results.error,
    success: state.results.success,
  };
};

export default connect(mapStateToProps, { getStatistics })(Statistics);
