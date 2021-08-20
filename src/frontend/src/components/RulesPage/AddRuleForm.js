import React from "react";
import {
  Button,
  Form,
  Header,
  Icon,
  TextArea,
  Input,
  Modal,
} from "semantic-ui-react";
import { addMRIRule, getMRIRules } from "../../actions/RuleActions";
import { connect } from "react-redux";
import { getCognitoUser } from "../../helpers/Cognito";

const initialState = {
  addRuleMode: true,
  open: false,
  body_part: "",
  info: "",
  priority: "",
  contrast: "",
  specialty_tags: "",
};

class AddRuleForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleSelectChangeTags = this.handleSelectChangeTags.bind(this);
  }

  handleChange(e) {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  }

  handleSelectChange(e, { name, value }) {
    this.setState({ [name]: value });
  }

  handleSelectChangeTags(e, { name, value }) {
    // console.log("handleSelectChangeTag");
    // console.log(e);
    // console.log(name);
    // console.log(value);
    const tags = value.join(" / ").trim();
    console.log(tags);

    this.setState({ [name]: tags });
  }

  handleSubmit(e) {
    e.preventDefault();
    const storedUser = getCognitoUser();
    this.props.addMRIRule(
      {
        body_part: this.state.body_part.trim(),
        info: this.state.info.trim(),
        priority: this.state.priority,
        contrast: this.state.contrast,
        specialty_tags: this.state.specialty_tags,
      },
      storedUser.userID,
      storedUser.userName
    );
    this.setState(initialState);
  }

  render() {
    console.log("AddRuleForm render");
    console.log(this.props.specialtyExamList);
    return (
      <Modal
        as={Form}
        onSubmit={this.handleSubmit}
        style={{ maxWidth: 500 }}
        onClose={() => this.setState(initialState)}
        onOpen={() => this.setState({ open: true })}
        open={this.state.open}
        trigger={
          <Button
            floated="right"
            icon
            labelPosition="left"
            primary
            size="small"
          >
            <Icon name="add circle" /> Add Rule
          </Button>
        }
      >
        <Header as="h2" color="blue" textAlign="center">
          Add a new MRI Rule
        </Header>
        <Modal.Content>
          <Form.Field
            fluid
            control={Input}
            name="body_part"
            label="Body Part"
            value={this.state.body_part}
            onChange={this.handleChange}
          />
          <Form.Field
            fluid
            control={TextArea}
            name="info"
            label="Information"
            value={this.state.info}
            onChange={this.handleChange}
          />
          <Form.Dropdown
            fluid
            selection
            name="priority"
            label="Priority"
            options={[
              { key: "e", text: "", value: "" },
              { key: "P1", text: "P1", value: "P1" },
              { key: "P2", text: "P2", value: "P2" },
              { key: "P3", text: "P3", value: "P3" },
              { key: "P4", text: "P4", value: "P4" },
              // { key: 'P5', text: 'P5', value: 'P5' },
              {
                key: "Unidentified",
                text: "Unidentified",
                value: "Unidentified",
              },
            ]}
            onChange={this.handleSelectChange}
          />
          <Form.Dropdown
            fluid
            selection
            name="contrast"
            label="Contrast"
            options={[
              { key: "e", text: "", value: "" },
              { key: "t", text: "true", value: "t" },
              { key: "f", text: "false", value: "f" },
            ]}
            onChange={this.handleSelectChange}
          />
          <Form.Dropdown
            name="specialty_tags"
            label="Specialty Exam Tags"
            placeholder="Tags"
            fluid
            multiple
            search
            selection
            onChange={this.handleSelectChangeTags}
            options={this.props.specialtyExamList.map((exam, index) => ({
              key: `row-exam-${index}`,
              text: exam,
              value: exam,
            }))}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button
            color="black"
            content="Cancel"
            onClick={() => this.setState(initialState)}
          />
          <Button
            type="submit"
            content="Add Rule"
            color="blue"
            disabled={
              !this.state.body_part ||
              !this.state.info ||
              !this.state.contrast ||
              !this.state.priority
            }
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    ruleId: state.booking.bookingResults.rule_id,
    priority: state.booking.bookingResults.priority,
    submitted: state.booking.submitted,
    loading: state.booking.loading,
    error: state.booking.error,
  };
};

export default connect(mapStateToProps, { addMRIRule, getMRIRules })(
  AddRuleForm
);
