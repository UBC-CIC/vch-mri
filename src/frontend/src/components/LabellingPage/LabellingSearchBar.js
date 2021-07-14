import React from "react";
import { Input } from "semantic-ui-react";
import { connect } from "react-redux";
import { getResultByID, getResultsByPage } from "../../actions/ResultActions";

const initialState = {
  id: "",
};

class LabellingSearchBar extends React.Component {
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

  handleSearchClick = () => {
    if (this.state.id) {
      this.props.getResultByID(this.state.id);
    } else {
      this.props.getResultsByPage(1);
    }
    this.setState(initialState);
  };

  render() {
    return (
      <Input
        action={{
          color: "blue",
          labelPosition: "right",
          icon: "search",
          content: "Search",
          onClick: () => this.handleSearchClick(),
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
  LabellingSearchBar
);
