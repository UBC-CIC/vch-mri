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
  Checkbox,
} from "semantic-ui-react";
import { modifyResult, rerunAI } from "../../actions/ResultActions";
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
      labelled_p5_flag:
        result.labelled_p5_flag !== null ? result.labelled_p5_flag : false,
      labelled_tags: result.labelled_tags ? result.labelled_tags : "",
      labelled_notes: result.labelled_notes ? result.labelled_notes : "",
    };

    this.handleToggle = this.handleToggle.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleChangeTextArea = this.handleChangeTextArea.bind(this);
    this.timerChangeNote = this.timerChangeNote.bind(this);
    this.handleAIConfirm = this.handleAIConfirm.bind(this);
    this.handleRerunAI = this.handleRerunAI.bind(this);
    this.popupButtonAIConfirm = this.popupButtonAIConfirm.bind(this);
  }

  componentDidMount() {
    this.timer = null;
  }

  componentWillReceiveProps(nextProps, nextContext) {
    console.log("componentWillReceiveProps");
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
      labelled_p5_flag:
        nextProps.result.labelled_p5_flag !== null
          ? nextProps.result.labelled_p5_flag
          : false,
      labelled_tags: nextProps.result.labelled_tags
        ? nextProps.result.labelled_tags
        : "",
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
        // Don't wipe flag and tags
        labelled_p5_flag: false,
        labelled_tags: NOTE_CONFIRM_AI,
      },
      () => {
        this.props.modifyResult(this.preparePayloadModifyResult(reqId));
      }
    );
  }

  handleRerunAI(reqId) {
    console.log("handleRerunAI");
    console.log(reqId);

    const storedUser = jwt_decode(Cache.getItem(AUTH_USER_ID_TOKEN_KEY));
    this.props.rerunAI(reqId, storedUser.sub, storedUser.name.trim());
  }

  handleToggle(e) {
    this.setState({ labelled_p5_flag: !this.state.labelled_p5_flag }, () =>
      this.handleSelectChange(e, {})
    );
  }

  handleSelectChange(e, { name, value }) {
    console.log("handleSelectChange");
    console.log(name);
    console.log(value);
    let labelled_priority = this.state.labelled_priority;
    let labelled_contrast = this.state.labelled_contrast;
    let labelled_notes = this.state.labelled_notes;
    let labelled_p5_flag = this.state.labelled_p5_flag;
    let labelled_tags = this.state.labelled_tags;

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
    if (labelled_notes === NOTE_CONFIRM_AI) {
      labelled_notes = "";
    }
    if (labelled_tags === NOTE_CONFIRM_AI) {
      labelled_tags = "";
    }

    this.setState(
      {
        labelled_priority: labelled_priority,
        labelled_contrast: labelled_contrast,
        labelled_notes: labelled_notes,
        labelled_p5_flag: labelled_p5_flag,
        labelled_tags: labelled_tags,
        [name]: value,
      },
      () => {
        this.props.modifyResult(
          this.preparePayloadModifyResult(this.props.result.id)
        );
      }
    );
  }

  handleChangeTextArea(e) {
    console.log("handleChangeTextArea");
    console.log(e.target.name);
    console.log(e.target.value);
    const name = e.target.name;
    const value = e.target.value;

    clearTimeout(this.timer);
    this.setState({ [name]: value, saving: SavingState.NOT_SAVED });

    this.timer = setTimeout(() => {
      console.log("SAVING textarea now...");

      if (
        name === "labelled_notes" &&
        this.state.labelled_tags === NOTE_CONFIRM_AI
      )
        this.setState({ labelled_tags: "" });

      if (
        name === "labelled_tags" &&
        this.state.labelled_notes === NOTE_CONFIRM_AI
      )
        this.setState({ labelled_notes: "" });

      this.setState({ [name]: value, saving: SavingState.SAVING });

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
    console.log("preparePayloadModifyResult");
    console.log(this.state.labelled_rule_id);
    console.log(this.state.labelled_priority);
    console.log(this.state.labelled_p5_flag);
    console.log(this.state.labelled_tags);

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
      labelled_p5_flag: this.state.labelled_p5_flag,
      labelled_tags:
        this.state.labelled_tags === "" ? null : this.state.labelled_tags,
      labelled_notes:
        this.state.labelled_notes === "" ? null : this.state.labelled_notes,
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

  popupButtonAIConfirm = (
    reqId,
    resState = REQUEST_STATES.STATE_AIProcessed
  ) => {
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
    // console.log("render");
    // console.log(this.props.expanded);
    // // console.log(ResultsTableRow);
    // console.log(this.props.result.error);

    const index = this.props.index;
    const result = this.props.result;
    // console.log(result);

    const resState = result.state;
    let state = result.state;
    let error = false;

    //  error state
    if (result.error && result.error !== "") error = true;

    let aiPriorityString = result.ai_priority ? result.ai_priority : " - ";
    if (result.ai_priority === "P98" || result.ai_priority === "P99")
      aiPriorityString = "No match";

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
            content={this.popupButtonAIConfirm(result.id, resState)}
            trigger={
              <Table.Cell singleLine>
                {this.renderItemCaret(this.props.expanded)}
                {result.id}
              </Table.Cell>
            }
            mouseEnterDelay={500}
            mouseLeaveDelay={500}
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
            mouseEnterDelay={500}
            mouseLeaveDelay={500}
            style={{ color: "red" }}
          />
          {resState === REQUEST_STATES.STATE_ReceivedNewlyLabelled && (
            <Popup
              content={PopupTextNewlyLabel}
              trigger={!error && <Table.Cell>{state}</Table.Cell>}
              flowing
              hoverable
              mouseEnterDelay={500}
              mouseLeaveDelay={500}
              disabled={disableAIConfirmPopup}
              style={{ color: "green" }}
            />
          )}
          {resState !== REQUEST_STATES.STATE_ReceivedNewlyLabelled && (
            <Popup
              content={this.popupButtonAIConfirm(result.id, resState)}
              trigger={!error && <Table.Cell>{state}</Table.Cell>}
              flowing
              hoverable
              mouseEnterDelay={500}
              mouseLeaveDelay={500}
              disabled={disableAIConfirmPopup}
              style={{ color: "red" }}
            />
          )}
          <Popup
            content={this.popupButtonAIConfirm(result.id, resState)}
            trigger={
              <Table.Cell>
                {result.ai_rule_id ? result.ai_rule_id : " - "}
              </Table.Cell>
            }
            mouseEnterDelay={500}
            mouseLeaveDelay={500}
            flowing
            disabled={disableAIConfirmPopup}
            hoverable
            style={{ color: "red" }}
          />
          <Popup
            content={this.popupButtonAIConfirm(result.id, resState)}
            trigger={<Table.Cell>{aiPriorityString}</Table.Cell>}
            flowing
            hoverable
            mouseEnterDelay={500}
            mouseLeaveDelay={500}
            disabled={disableAIConfirmPopup}
            style={{ color: "red" }}
          />
          <Popup
            content={this.popupButtonAIConfirm(result.id, resState)}
            trigger={
              <Table.Cell>
                <Form.Checkbox
                  //   toggle
                  disabled={true}
                  name="ai_p5_flag"
                  //   value={result.labelled_p5_flag}
                  checked={result.ai_p5_flag || false}
                  //   onChange={this.handleSelectChange}
                  onChange={this.handleToggle}
                  style={{
                    zIndex: 0,
                  }}
                />
              </Table.Cell>
            }
            flowing
            hoverable
            mouseEnterDelay={500}
            mouseLeaveDelay={500}
            disabled={disableAIConfirmPopup}
            style={{ color: "red" }}
          />
          <Popup
            content={this.popupButtonAIConfirm(result.id, resState)}
            trigger={
              <Table.Cell>
                {result.ai_contrast !== null
                  ? result.ai_contrast.toString()
                  : " - "}
              </Table.Cell>
            }
            mouseEnterDelay={500}
            mouseLeaveDelay={500}
            flowing
            hoverable
            disabled={disableAIConfirmPopup}
            style={{ color: "red" }}
          />
          <Popup
            content={this.popupButtonAIConfirm(result.id, resState)}
            trigger={
              <Table.Cell>{result.ai_tags ? result.ai_tags : " - "}</Table.Cell>
            }
            mouseEnterDelay={500}
            mouseLeaveDelay={500}
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
                // { key: "P5", text: "P5", value: "P5" },
              ]}
              onChange={this.handleSelectChange}
            />
          </Table.Cell>
          <Table.Cell>
            <Form.Checkbox
              //   toggle
              disabled={this.props.loading}
              name="labelled_p5_flag"
              //   value={result.labelled_p5_flag}
              checked={result.labelled_p5_flag || false}
              //   onChange={this.handleSelectChange}
              onChange={this.handleToggle}
              style={{
                zIndex: 0,
              }}
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
              placeholder="Tags separated by ' / ' (auto-saves after 2s)"
              name="labelled_tags"
              value={this.state.labelled_tags || ""}
              //   value={
              //     this.state.labelled_tags
              //       ? this.state.labelled_tags.join(", ")
              //       : ""
              //   }
              onChange={this.handleChangeTextArea}
            />
          </Table.Cell>
          {/* <Table.Cell>
            {result.p5_flag !== null ? result.p5_flag.toString() : "none"}
          </Table.Cell> */}
          {!this.props.showRules && (
            <>
              <Table.Cell>
                <TextArea
                  disabled={this.props.loading}
                  placeholder="Labelling notes (auto-saves after 2s)"
                  name="labelled_notes"
                  value={this.state.labelled_notes || ""}
                  onChange={this.handleChangeTextArea}
                />
              </Table.Cell>
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
            <Table.Cell colSpan="13">
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

export default connect(mapStateToProps, { modifyResult, rerunAI })(
  LabellingTableRow
);
