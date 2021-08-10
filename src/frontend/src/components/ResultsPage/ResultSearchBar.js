import React from "react";
import { Form } from "semantic-ui-react";
import { connect } from "react-redux";
import { getResultByID, getResultsByPage } from "../../actions/ResultActions";

const initialState = {
  id: "",
};

class ResultSearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;

    this.handleChange = this.handleChange.bind(this);
    this.handleSearchClick = this.handleSearchClick.bind(this);
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  }

  handleSearchClick(e) {
    e.preventDefault();
    if (this.state.id) {
      this.props.getResultByID(this.state.id);
    } else {
      this.props.getResultsByPage(1);
    }
    this.setState(initialState);
  }

  render() {
    return (
      <Form onSubmit={this.handleSearchClick}>
        <Form.Input
          action={{
            color: "blue",
            labelPosition: "right",
            icon: "search",
            content: "Search",
            onClick: this.handleSearchClick,
          }}
          fluid
          icon="search"
          iconPosition="left"
          placeholder="Search result by reqCIO..."
          name="id"
          loading={this.props.loading}
          value={this.state.id}
          onChange={this.handleChange}
        />
      </Form>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    results: state.results.resultsList,
    loading: state.results.loading,
    error: state.results.error,
  };
};

export default connect(mapStateToProps, { getResultByID, getResultsByPage })(
  ResultSearchBar
);
