import React from "react";
import { connect } from "react-redux";
import { Table, Checkbox } from "semantic-ui-react";
import ModifyRuleForm from "./ModifyRuleForm";
import { toggleMRIRule, getMRIRules } from "../../actions/RuleActions";

class RulesTableRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = { active: this.props.active };

    this.handleToggle = this.handleToggle.bind(this);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({ active: nextProps.active });
  }

  handleToggle(e) {
    this.setState(
      (prevState) => ({ active: !prevState.active }),
      () =>
        this.props.toggleMRIRule({
          id: this.props.id,
          active: this.state.active,
        })
    );
  }

  render() {
    return (
      <Table.Row disabled={this.props.loading} error={!this.state.active}>
        <Table.Cell collapsing>
          <Checkbox
            toggle
            disabled={this.props.labelling}
            checked={this.state.active}
            onChange={this.handleToggle}
            style={{
              zIndex: 0,
            }}
          />
        </Table.Cell>
        <Table.Cell collapsing>{this.props.id}</Table.Cell>
        <Table.Cell collapsing>{this.props.body_part}</Table.Cell>
        <Table.Cell collapsing>{this.props.contrast.toString()}</Table.Cell>
        <Table.Cell collapsing>{this.props.priority}</Table.Cell>
        <Table.Cell>{this.props.info}</Table.Cell>
        {!this.props.labelling && (
          <Table.Cell collapsing>
            <ModifyRuleForm
              id={this.props.id}
              body_part={this.props.body_part}
              info={this.props.info}
              contrast={this.props.contrast}
              mriPriority={this.props.priority}
            />
          </Table.Cell>
        )}
      </Table.Row>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    rules: state.rules.rulesList,
    loading: state.rules.loading,
    error: state.rules.error,
    sortedColumn: state.rules.column,
    sortDirection: state.rules.direction,
  };
};

export default connect(mapStateToProps, { toggleMRIRule, getMRIRules })(
  RulesTableRow
);
