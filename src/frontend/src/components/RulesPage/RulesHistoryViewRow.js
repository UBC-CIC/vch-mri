import React from "react";
import { connect } from "react-redux";
import { Table } from "semantic-ui-react";

class RulesHistoryViewRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
    };
  }

  render() {
    const history = this.props.history;
    const index = this.props.index;
    // console.log(this.props.index);

    return (
      <>
        <Table.Row key={"row-data-" + index} disabled={this.props.loading}>
          <Table.Cell>{history.id_rule}</Table.Cell>
          <Table.Cell>{history.description}</Table.Cell>
          <Table.Cell>{history.active ? "ACTIVE" : "Inactive"}</Table.Cell>
          <Table.Cell>{history.body_part}</Table.Cell>
          <Table.Cell>{history.info}</Table.Cell>
          <Table.Cell>{history.priority}</Table.Cell>
          <Table.Cell>{history.contrast ? "True" : "False"}</Table.Cell>
          <Table.Cell>
            {history.specialty_tags ? history.specialty_tags : "-"}
          </Table.Cell>
          <Table.Cell>{history.cognito_user_fullname}</Table.Cell>
          <Table.Cell>{history.created_at}</Table.Cell>
        </Table.Row>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loading: state.results.loading,
    error: state.results.error,
  };
};

export default connect(mapStateToProps)(RulesHistoryViewRow);
