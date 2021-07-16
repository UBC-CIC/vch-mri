import React from "react";
import { connect } from "react-redux";
import { Button, Checkbox, Icon, Table } from "semantic-ui-react";
import { getMRIRules, changeRuleSort } from "../../actions/RuleActions";
import Loader from "../Loader";
import AddRuleForm from "./AddRuleForm";
import RulesTableRow from "./RulesTableRow";
import { sendErrorToast, sendSuccessToast } from "../../helpers";

class RulesTable extends React.Component {
  componentDidMount() {
    // true - already loaded by parent
    if (!this.props.rulesLoaded) {
      this.props.getMRIRules();
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.error) {
      sendErrorToast(this.props.error.message);
    } else if (this.props.success) {
      sendSuccessToast(this.props.success);
    }
  }

  render() {
    return (
      <Table celled compact sortable>
        <Table.Header fullWidth>
          <Table.Row>
            <Table.HeaderCell
              collapsing
              sorted={
                this.props.sortedColumn === "active"
                  ? this.props.sortDirection
                  : null
              }
              onClick={() => {
                this.props.changeRuleSort("active");
              }}
            >
              Active
            </Table.HeaderCell>
            <Table.HeaderCell
              collapsing
              sorted={
                this.props.sortedColumn === "id"
                  ? this.props.sortDirection
                  : null
              }
              onClick={() => {
                this.props.changeRuleSort("id");
              }}
            >
              ID
            </Table.HeaderCell>
            <Table.HeaderCell
              collapsing
              sorted={
                this.props.sortedColumn === "body_part"
                  ? this.props.sortDirection
                  : null
              }
              onClick={() => {
                this.props.changeRuleSort("body_part");
              }}
            >
              Body Part
            </Table.HeaderCell>
            <Table.HeaderCell
              collapsing
              sorted={
                this.props.sortedColumn === "contrast"
                  ? this.props.sortDirection
                  : null
              }
              onClick={() => {
                this.props.changeRuleSort("contrast");
              }}
            >
              Contrast
            </Table.HeaderCell>
            <Table.HeaderCell
              collapsing
              sorted={
                this.props.sortedColumn === "priority"
                  ? this.props.sortDirection
                  : null
              }
              onClick={() => {
                this.props.changeRuleSort("priority");
              }}
            >
              Priority
            </Table.HeaderCell>
            <Table.HeaderCell
              sorted={
                this.props.sortedColumn === "info"
                  ? this.props.sortDirection
                  : null
              }
              onClick={() => {
                this.props.changeRuleSort("info");
              }}
            >
              Information
            </Table.HeaderCell>
            {!this.props.labelling && (
              <Table.HeaderCell collapsing>
                <AddRuleForm />
              </Table.HeaderCell>
            )}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {this.props.rules.map((rule, index) => (
            <RulesTableRow
              active={rule.active}
              id={rule.id}
              body_part={rule.body_part}
              contrast={rule.contrast}
              priority={rule.priority}
              info={rule.info}
              index={index}
              labelling={this.props.labelling}
            />
          ))}
        </Table.Body>

        <Table.Footer fullWidth>
          <Table.Row>
            <Table.HeaderCell colSpan="8">
              {/*<Button size='small'>A Button</Button>*/}
              {/*<Button disabled size='small'>*/}
              {/*    Another Button*/}
              {/*</Button>*/}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    rules: state.rules.rulesList,
    loading: state.rules.loading,
    error: state.rules.error,
    success: state.rules.success,
    sortedColumn: state.rules.column,
    sortDirection: state.rules.direction,
  };
};

export default connect(mapStateToProps, { getMRIRules, changeRuleSort })(
  RulesTable
);
