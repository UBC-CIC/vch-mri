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
import { modifyMRIRule, getMRIRules } from "../../actions/RuleActions";
import { connect } from "react-redux";

const initialState = {
  open: false,
  body_part: "",
  info: "",
  priority: "",
  contrast: "",
};

class ModifyRuleForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      id: this.props.id,
      body_part: this.props.body_part,
      info: this.props.info,
      priority: this.props.mriPriority,
      contrast: this.props.contrast ? "t" : "f",
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      id: nextProps.id,
      body_part: nextProps.body_part,
      info: nextProps.info,
      priority: nextProps.mriPriority,
      contrast: nextProps.contrast ? "t" : "f",
    });
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

  handleSubmit(e) {
    e.preventDefault();
    this.props.modifyMRIRule({
      id: this.state.id,
      body_part: this.state.body_part.trim(),
      info: this.state.info.trim(),
      priority: this.state.priority,
      contrast: this.state.contrast,
    });
    this.setState(initialState);
  }

  render() {
    return (
      <Modal
        as={Form}
        onSubmit={this.handleSubmit}
        style={{ maxWidth: 500 }}
        onClose={() => this.setState({ open: false })}
        onOpen={() => this.setState({ open: true })}
        open={this.state.open}
        trigger={
          <Button icon size="tiny" labelPosition="left">
            <Icon name="edit" />
            Modify
          </Button>
        }
      >
        <Header as="h2" color="blue" textAlign="center">
          Modify an Existing MRI Rule
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
            name="contrast"
            label="Contrast"
            value={this.state.contrast}
            options={[
              { key: "e", text: "", value: "" },
              { key: "t", text: "true", value: "t" },
              { key: "f", text: "false", value: "f" },
            ]}
            onChange={this.handleSelectChange}
          />
          <Form.Dropdown
            fluid
            selection
            name="priority"
            label="Priority"
            value={this.state.priority}
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
        </Modal.Content>
        <Modal.Actions>
          <Button
            color="black"
            content="Cancel"
            onClick={() => this.setState({ open: false })}
          />
          <Button
            type="submit"
            content="Modify Rule"
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

export default connect(mapStateToProps, { modifyMRIRule, getMRIRules })(
  ModifyRuleForm
);
