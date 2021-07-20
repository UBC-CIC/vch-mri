import React from "react";
import { Form, Input, TextArea, Segment, Header } from "semantic-ui-react";
import { DateInput } from "semantic-ui-calendar-react";
import { connect } from "react-redux";
import { getStatistics } from "../actions/ResultActions";
import { sendErrorToast, sendSuccessToast } from "../helpers";

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
    // this.props.getStatistics();
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

  render() {
    console.log("Statistics rendor");
    console.log(this.props.results);

    return (
      <>
        <Segment inverted color="blue">
          <Header as="h2" color="white" textAlign="center">
            AI Result Statistics
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
              color="white"
              content="Submit"
              //   disabled={
              //     !this.state.startDate ||
              //     !this.state.endDate
              //   }
            >
              Submit
            </Form.Button>
          </Form>
        </Segment>
        <br></br>
        <div>{JSON.stringify(this.props.results)}</div>
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
