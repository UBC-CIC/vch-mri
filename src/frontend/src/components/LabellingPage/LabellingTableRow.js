import React from "react";
import { connect } from "react-redux";
import {
  Form,
  Icon,
  Table,
  TextArea,
  Popup,
  Button,
  Grid,
  Header,
} from "semantic-ui-react";
import { modifyResult } from "../../actions/ResultActions";
import ResultsHistoryView from "../ResultsPage/ResultsHistoryView";
import ResultsTableRowExpansion from "./ResultsRowExpansion/ResultsTableRowExpansion";
import {
  REQUEST_STATES,
  NOTE_CONFIRM_AI,
  BtnTextConfirm,
  PopupTextNewlyLabel,
} from "../../constants/resultConstants";
import { AUTH_USER_ID_TOKEN_KEY } from "../../constants/userConstant";
import { Cache } from "aws-amplify";
import jwt_decode from "jwt-decode";

import "../../styles/TableLabelling.css";

const SavingState = Object.freeze({
  NOT_SAVED: 0,
  SAVING: 1,
  SAVED: 2,
});

class LabellingTableRow extends React.Component {
  constructor(props) {
    super(props);
    const result = this.props.result;

    this.state = {
      activeIndex: 0,
      saving: SavingState.NOT_SAVED,
      labelled_rule_id:
        result.labelled_rule_id !== null ? result.labelled_rule_id : "e",
      labelled_priority:
        result.labelled_priority !== null ? result.labelled_priority : "e",
      labelled_contrast:
        result.labelled_contrast !== null ? result.labelled_contrast : "e",
      labelled_notes: result.labelled_notes,
    };

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleChangeNote = this.handleChangeNote.bind(this);
    this.timerChangeNote = this.timerChangeNote.bind(this);
    this.handleAIConfirm = this.handleAIConfirm.bind(this);
    this.handleRerunAI = this.handleRerunAI.bind(this);
    this.popupButtonAIConfirm = this.popupButtonAIConfirm.bind(this);
  }

  componentDidMount() {
    this.timer = null;
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      labelled_rule_id:
        nextProps.result.labelled_rule_id !== null
          ? nextProps.result.labelled_rule_id
          : "e",
      labelled_priority:
        nextProps.result.labelled_priority !== null
          ? nextProps.result.labelled_priority
          : "e",
      labelled_contrast:
        nextProps.result.labelled_contrast !== null
          ? nextProps.result.labelled_contrast
          : "e",
      labelled_notes: nextProps.result.labelled_notes,
    });
  }

  handleAIConfirm(reqId) {
    console.log("handleAIConfirm");
    console.log(reqId);
    this.setState(
      {
        labelled_rule_id: "e",
        labelled_priority: "e",
        labelled_contrast: "e",
        labelled_notes: NOTE_CONFIRM_AI,
      },
      () => {
        this.props.modifyResult(this.preparePayloadModifyResult(reqId));
      }
    );
  }

  handleRerunAI(reqId) {
    console.log("handleRerunAI");
    console.log(reqId);
    // this.setState(
    //   {
    //     labelled_rule_id: "e",
    //     labelled_priority: "e",
    //     labelled_contrast: "e",
    //     labelled_notes: NOTE_CONFIRM_AI,
    //   },
    //   () => {
    //     this.props.modifyResult(this.preparePayloadModifyResult(reqId));
    //   }
    // );
  }

  handleSelectChange(e, { name, value }) {
    // console.log("handleSelectChange");
    // console.log(name);
    // console.log(value);
    let labelled_priority = this.state.labelled_priority;
    let labelled_contrast = this.state.labelled_contrast;
    let labelled_notes = this.state.labelled_notes;

    if (name === "labelled_rule_id") {
      const foundRule = this.props.rulesListDropdown.find(
        (element) => element.value === value
      );

      console.log("handleSelectChange");
      console.log(foundRule);
      labelled_priority = foundRule.priority;
      labelled_contrast = foundRule.contrast;
    }
    // NOT AI confirmed anymore! Wipe the note
    if (labelled_notes === NOTE_CONFIRM_AI) labelled_notes = "";

    this.setState(
      {
        labelled_priority: labelled_priority,
        labelled_contrast: labelled_contrast,
        labelled_notes: labelled_notes,
        [name]: value,
      },
      () => {
        this.props.modifyResult(
          this.preparePayloadModifyResult(this.props.result.id)
        );
      }
    );
  }

  handleChangeNote(e) {
    // console.log("handleChangeNote");
    // console.log(e.target.value);
    const value = e.target.value;

    clearTimeout(this.timer);
    this.setState({ labelled_notes: value, saving: SavingState.NOT_SAVED });

    this.timer = setTimeout(() => {
      console.log("SAVING note now...");
      this.setState({ labelled_notes: value, saving: SavingState.SAVING });

      // calls API
      this.props.modifyResult(
        this.preparePayloadModifyResult(this.props.result.id)
      );
      this.setState({ saving: SavingState.SAVED });
    }, 2000);
  }

  preparePayloadModifyResult(index) {
    const storedUser = jwt_decode(Cache.getItem(AUTH_USER_ID_TOKEN_KEY));
    // console.log(storedUser);
    console.log(this.state.labelled_rule_id);
    console.log(this.state.labelled_priority);

    return {
      id: index,
      labelled_rule_id:
        this.state.labelled_rule_id === "e"
          ? null
          : this.state.labelled_rule_id,
      labelled_priority:
        this.state.labelled_priority === "e"
          ? null
          : this.state.labelled_priority,
      labelled_contrast:
        this.state.labelled_contrast === "e"
          ? null
          : this.state.labelled_contrast,
      labelled_notes: this.state.labelled_notes,
      cognito_user_id: storedUser.sub,
      cognito_user_fullname: storedUser.name.trim(),
    };
  }

  timerChangeNote(e, value) {}

  handleClickCollapseAll = () => {
    this.setState({ showAll: !this.state.showAll });
  };

  renderItemCaret(expanded) {
    if (expanded) {
      return <Icon name="caret down" />;
    } else {
      return <Icon name="caret right" />;
    }
  }

  //   popupButtonAIConfirm = (resState, reqId) => (
  //     <>
  //       <Grid centered divided="vertically">
  //         <Grid.Row columns={1}>
  //           <p>Note: all existing labelling overrides will be cleared.</p>
  //         </Grid.Row>
  //         <Grid.Row columns={2}>
  //           <Grid.Column textAlign="center">
  //             {/* <Header as="h4">{BtnTextConfirm}</Header>
  //             <p>Note: all existing labelling overrides will be cleared.</p> */}
  //             <Button
  //               fluid
  //               color="green"
  //               content={BtnTextConfirm}
  //               onClick={() => this.handleAIConfirm(reqId)}
  //               style={{ marginTop: "10px" }}
  //             />
  //           </Grid.Column>
  //           <Grid.Column textAlign="center">
  //             {/* <Header as="h4">Re-run AI</Header>
  //             <p>
  //               Note: all existing rule ID's, priority's and constrast's will be
  //               cleared.
  //             </p> */}
  //             <Button
  //               fluid
  //               color="green"
  //               content={"Re-run AI"}
  //               onClick={() => this.handleAIConfirm(reqId)}
  //               style={{ marginTop: "10px" }}
  //             />
  //           </Grid.Column>
  //         </Grid.Row>
  //       </Grid>
  //     </>
  //   );

  popupButtonAIConfirm = (resState, reqId) => {
    let showOnlyRerun = false;
    let gridColumns = 2;

    switch (resState) {
      case REQUEST_STATES.STATE_Received:
      case REQUEST_STATES.STATE_ReceivedDupe:
        showOnlyRerun = true;
        gridColumns = 1;
        break;

      default:
        break;
    }
    return (
      <>
        <Grid centered divided="horizontally">
          {/* <Grid.Row columns={1}>
            <p>Note: all existing labelling overrides will be cleared.</p>
          </Grid.Row> */}
          <Grid.Row columns={gridColumns}>
            {!showOnlyRerun && (
              <Grid.Column textAlign="center">
                <Header as="h4">{BtnTextConfirm}</Header>
                <p>Existing labelling overrides will be cleared.</p>
                <Button
                  // fluid
                  color="green"
                  content={BtnTextConfirm}
                  onClick={() => this.handleAIConfirm(reqId)}
                  // style={{ marginTop: "10px" }}
                />
              </Grid.Column>
            )}
            <Grid.Column textAlign="center">
              <Header as="h4">Re-run AI</Header>
              <p>Labelling overrides will NOT be cleared.</p>
              <Button
                // fluid
                color="green"
                content={"Re-run AI"}
                onClick={() => this.handleRerunAI(reqId)}
                // style={{ marginTop: "10px" }}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </>
    );
  };

  render() {
    // console.log("expanded");
    // console.log(this.props.expanded);
    // // console.log(ResultsTableRow);
    // console.log(this.props.result.error);

    const index = this.props.index;
    const result = this.props.result;

    const resState = result.state;
    let state = result.state;
    let error = false;

    //  error state
    if (result.error && result.error !== "") error = true;

    let disableAIConfirmPopup = true;

    switch (resState) {
      case REQUEST_STATES.STATE_Received:
        state = "Received";
        disableAIConfirmPopup = false;
        break;
      case REQUEST_STATES.STATE_ReceivedDupe:
        state = "Duplicate";
        disableAIConfirmPopup = false;
        break;
      case REQUEST_STATES.STATE_AIProcessed:
        state = "AI processed";
        disableAIConfirmPopup = false;
        break;
      case REQUEST_STATES.STATE_ReceivedFinal:
        state = "Phys. final";
        disableAIConfirmPopup = false;
        break;
      case REQUEST_STATES.STATE_ReceivedNewlyLabelled:
        state = "*Labelled";
        disableAIConfirmPopup = false;
        break;
      case REQUEST_STATES.STATE_ReceivedLabelled:
        state = "Labelled";
        disableAIConfirmPopup = false;

        // TODO: check filter but default do NOT show labelled
        if (!this.props.showLabelled) return null;

        break;

      default:
        break;
    }

    return (
      <>
        <Table.Row
          onClick={(e) => this.props.handleRowClick(e, index)}
          key={"row-data-" + index}
          disabled={this.props.loading}
          error={error || resState === REQUEST_STATES.STATE_Deleted}
          warning={
            !error &&
            (resState === REQUEST_STATES.STATE_Received ||
              resState === REQUEST_STATES.STATE_ReceivedDupe)
          }
          positive={
            resState === REQUEST_STATES.STATE_ReceivedLabelled ||
            resState === REQUEST_STATES.STATE_ReceivedNewlyLabelled
          }
        >
          <Popup
            content={this.popupButtonAIConfirm(resState, result.id)}
            trigger={
              <Table.Cell singleLine>
                {this.renderItemCaret(this.props.expanded)}
                {result.id}
              </Table.Cell>
            }
            flowing
            hoverable
            disabled={disableAIConfirmPopup}
            // size="tiny"
            style={{ color: "red" }}
          />
          <Popup
            content={result.error}
            trigger={error && <Table.Cell>ERROR</Table.Cell>}
            hoverable
            style={{ color: "red" }}
          />
          {resState === REQUEST_STATES.STATE_ReceivedNewlyLabelled && (
            <Popup
              content={PopupTextNewlyLabel}
              trigger={!error && <Table.Cell>{state}</Table.Cell>}
              flowing
              hoverable
              disabled={disableAIConfirmPopup}
              style={{ color: "green" }}
            />
          )}
          {resState !== REQUEST_STATES.STATE_ReceivedNewlyLabelled && (
            <Popup
              content={this.popupButtonAIConfirm(resState, result.id)}
              trigger={!error && <Table.Cell>{state}</Table.Cell>}
              flowing
              hoverable
              disabled={disableAIConfirmPopup}
              style={{ color: "red" }}
            />
          )}
          <Popup
            content={this.popupButtonAIConfirm(resState, result.id)}
            trigger={
              <Table.Cell>
                {result.ai_rule_id ? result.ai_rule_id : " - "}
              </Table.Cell>
            }
            flowing
            disabled={disableAIConfirmPopup}
            hoverable
            style={{ color: "red" }}
          />
          <Popup
            content={this.popupButtonAIConfirm(resState, result.id)}
            trigger={
              <Table.Cell>
                {result.ai_priority ? result.ai_priority : " - "}
              </Table.Cell>
            }
            flowing
            hoverable
            disabled={disableAIConfirmPopup}
            style={{ color: "red" }}
          />
          <Popup
            content={this.popupButtonAIConfirm(resState, result.id)}
            trigger={
              <Table.Cell>
                {result.ai_contrast !== null
                  ? result.ai_contrast.toString()
                  : " - "}
              </Table.Cell>
            }
            flowing
            hoverable
            disabled={disableAIConfirmPopup}
            style={{ color: "red" }}
          />
          {this.props.showPhysicianResults && (
            <>
              <Table.Cell>
                {result.final_priority ? result.final_priority : " - "}
              </Table.Cell>
              <Table.Cell>
                {result.final_contrast !== null
                  ? result.final_contrast.toString()
                  : " - "}
              </Table.Cell>
            </>
          )}
          <Table.Cell>
            <Form.Dropdown
              fluid
              selection
              search
              compact
              lazyLoad
              name="labelled_rule_id"
              disabled={this.props.loading}
              value={result.labelled_rule_id ? result.labelled_rule_id : "e"}
              options={[
                { key: "e", text: "-", value: "e" },
                ...this.props.rulesListDropdown,
              ]}
              onChange={this.handleSelectChange}
            />
          </Table.Cell>
          <Table.Cell>
            <Form.Dropdown
              fluid
              selection
              search
              name="labelled_priority"
              disabled={this.props.loading}
              value={result.labelled_priority ? result.labelled_priority : "e"}
              options={[
                { key: "e", text: "-", value: "e" },
                { key: "P1", text: "P1", value: "P1" },
                { key: "P2", text: "P2", value: "P2" },
                { key: "P3", text: "P3", value: "P3" },
                { key: "P4", text: "P4", value: "P4" },
                { key: "P5", text: "P5", value: "P5" },
              ]}
              onChange={this.handleSelectChange}
            />
          </Table.Cell>
          <Table.Cell>
            <Form.Dropdown
              fluid
              selection
              search
              name="labelled_contrast"
              disabled={this.props.loading}
              value={
                result.labelled_contrast !== null
                  ? result.labelled_contrast
                  : "e"
              }
              options={[
                { key: "e", text: "-", value: "e" },
                { key: true, text: "true", value: true },
                { key: false, text: "false", value: false },
              ]}
              onChange={this.handleSelectChange}
            />
          </Table.Cell>
          <Table.Cell>
            <TextArea
              disabled={this.props.loading}
              placeholder="Labelling notes"
              value={this.state.labelled_notes}
              onChange={this.handleChangeNote}
            />
          </Table.Cell>
          {/* <Table.Cell>
            {result.p5_flag !== null ? result.p5_flag.toString() : "none"}
          </Table.Cell> */}
          {/* <Table.Cell>
            {result.ai_tags ? result.ai_tags.join(", ") : "none"}
          </Table.Cell> */}
          {!this.props.showRules && (
            <>
              <Table.Cell>{result.date_created}</Table.Cell>
              <Table.Cell>{result.date_updated}</Table.Cell>
              <Table.Cell textAlign="right" collapsing>
                <ResultsHistoryView history={result.history} />
              </Table.Cell>
            </>
          )}
        </Table.Row>
        {this.props.expanded && (
          <Table.Row active key={"row-expanded-" + index}>
            <Table.Cell colSpan="12">
              <div style={{ padding: "1.5em" }}>
                {/* {this.renderItemDetails(result)} */}
                <ResultsTableRowExpansion
                  result={result}
                  reqCio={result.id}
                  index={index}
                  popupButtonAIConfirm={this.popupButtonAIConfirm}
                  handleAIConfirm={this.handleAIConfirm}
                />
              </div>
            </Table.Cell>
          </Table.Row>
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    results: state.results.resultsList,
    loading: state.results.loading,
    error: state.results.error,
    success: state.results.success,
    sortedColumn: state.results.column,
    sortDirection: state.results.direction,
  };
};

export default connect(mapStateToProps, { modifyResult })(LabellingTableRow);
