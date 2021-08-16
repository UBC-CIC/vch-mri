import React from "react";
import { connect } from "react-redux";
// import { Button, Checkbox, Icon, Table } from "semantic-ui-react";
import { Table } from "semantic-ui-react";
import { getMRIRules, changeRuleSort } from "../../actions/RuleActions";
import { getSpecialtyExams } from "../../actions/SpecialtyExamActions";
// import Loader from "../Loader";
import ModifyRuleForm from "./ModifyRuleForm";
import RulesTableRow from "./RulesTableRow";
import { sendErrorToast, sendSuccessToast } from "../../helpers";

class RulesTable extends React.Component {
  componentDidMount() {
    // true - already loaded by parent
    if (!this.props.rulesLoaded) {
      this.props.getMRIRules();
      this.props.getSpecialtyExams();
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
    console.log("RulesTable render");
    console.log(this.props.specialtyExam);
    return (
      <Table celled compact sortable>
        <Table.Header fullWidth>
          <Table.Row>
            {!this.props.labelling && (
              <>
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
              </>
            )}
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
            <Table.HeaderCell>Sp. Exams</Table.HeaderCell>
            {!this.props.labelling && (
              <Table.HeaderCell collapsing>
                <ModifyRuleForm
                  addRuleMode={true}
                  specialtyExamList={this.props.specialtyExam}
                />
              </Table.HeaderCell>
            )}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {/* {this.props.rules.map((rule, index) => (
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
          ))} */}
          {this.props.rules.map((rule, index) => {
            if (rule.active || (!rule.active && this.props.showInactive))
              return (
                <React.Fragment key={"row-rule-" + index}>
                  <RulesTableRow
                    active={rule.active}
                    id={rule.id}
                    body_part={rule.body_part}
                    contrast={rule.contrast}
                    priority={rule.priority}
                    specialty_tags={rule.specialty_tags}
                    info={rule.info}
                    index={index}
                    labelling={this.props.labelling}
                    specialtyExamList={this.props.specialtyExam}
                  />
                </React.Fragment>
              );
            else return <React.Fragment key={"row-rule-" + index} />;
          })}
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
    specialtyExam: state.specialtyExam.specialtyExamList,
    loading: state.rules.loading && state.specialtyExam.loading,
    error: state.rules.error,
    success: state.rules.success,
    sortedColumn: state.rules.column,
    sortDirection: state.rules.direction,
  };
};

export default connect(mapStateToProps, {
  getMRIRules,
  changeRuleSort,
  getSpecialtyExams,
})(RulesTable);
