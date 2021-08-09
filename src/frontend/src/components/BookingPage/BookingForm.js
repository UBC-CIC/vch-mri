import React from "react";
import { Form, Input, TextArea, Segment, Header } from "semantic-ui-react";
import { DateInput } from "semantic-ui-calendar-react";
import { connect } from "react-redux";
import { sendMRIRequest } from "../../actions/BookingActions";
import { AUTH_USER_ID_TOKEN_KEY } from "../../constants/userConstant";
import { Cache } from "aws-amplify";
import jwt_decode from "jwt-decode";

const priorityOptions = [
  { key: "P1", text: "P1", value: "P1" },
  { key: "P2", text: "P2", value: "P2" },
  { key: "P3", text: "P3", value: "P3" },
  { key: "P4", text: "P4", value: "P4" },
  //   { key: "P5", text: "P5", value: "P5" },
  { key: "Unidentified", text: "Unidentified", value: "Unidentified" },
];

const initialState = {
  reqCIO: "",
  DOB: "",
  height: "",
  inchcm: "",
  weight: "",
  kglbs: "",
  radiologistPriority: "",
  reasonForExam: "",
  examRequested: "",
};

class BookingForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;

    this.handleChange = this.handleChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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

  handleDateChange = (date) => {
    this.setState({
      DOB: date,
    });
  };

  handleSubmit(e) {
    e.preventDefault();

    const storedUser = jwt_decode(Cache.getItem(AUTH_USER_ID_TOKEN_KEY));
    console.log(storedUser);

    this.props.sendMRIRequest({
      cognito_user_id: storedUser.sub,
      cognito_user_fullname: storedUser.name.trim(),
      ReqCIO: this.state.reqCIO.trim(),
      DOB: this.state.DOB.trim(),
      Height: this.state.height,
      "inch-cm": this.state.inchcm,
      Weight: this.state.weight,
      "kg-lbs": this.state.kglbs,
      "Radiologist Priority": this.state.radiologistPriority,
      "Reason for Exam": this.state.reasonForExam.trim(),
      "Exam Requested": this.state.examRequested.trim(),
    });
  }

  render() {
    return (
      <Segment inverted color="blue">
        <Header as="h2" color="white" textAlign="center">
          Submit An MRI Booking
        </Header>
        <Form inverted color="blue" onSubmit={this.handleSubmit}>
          <Form.Field
            fluid
            control={Input}
            name="reqCIO"
            label="reqCIO"
            value={this.state.reqCIO}
            onChange={this.handleChange}
          />
          <DateInput
            name="DOB"
            value={this.state.DOB}
            dateFormat="YYYY-MM-DD"
            label="Date of Birth (YYYY-MM-DD)"
            iconPosition="left"
            onChange={this.handleSelectChange}
          />
          <Form.Group inline widths="equal">
            <Form.Field
              fluid
              control={Input}
              name="height"
              label="Height"
              value={this.state.height}
              onChange={this.handleChange}
            />
            <Form.Dropdown
              fluid
              selection
              name="inchcm"
              label="Height Unit"
              options={[
                { key: "CM", text: "Centimeters", value: "CM" },
                { key: "IN", text: "Inches", value: "IN" },
              ]}
              onChange={this.handleSelectChange}
            />
            <Form.Field
              fluid
              control={Input}
              name="weight"
              label="Weight"
              value={this.state.weight}
              onChange={this.handleChange}
            />
            <Form.Dropdown
              fluid
              selection
              name="kglbs"
              label="Weight Unit"
              options={[
                { key: "KG", text: "Kilograms", value: "KG" },
                { key: "LBS", text: "Pounds", value: "LBS" },
              ]}
              onChange={this.handleSelectChange}
            />
          </Form.Group>
          <Form.Dropdown
            fluid
            selection
            name="radiologistPriority"
            label="Radiologist Priority"
            options={priorityOptions}
            onChange={this.handleSelectChange}
          />
          <Form.Field
            fluid
            control={TextArea}
            name="reasonForExam"
            label="Reason for Exam"
            value={this.state.reasonForExam}
            placeholder="Please provide more details"
            rows="6"
            onChange={this.handleChange}
          />
          <Form.Field
            fluid
            control={Input}
            name="examRequested"
            label="Exam Requested"
            value={this.state.examRequested}
            onChange={this.handleChange}
          />
          <Form.Button
            fluid
            color="white"
            content="Submit"
            disabled={
              !this.state.reqCIO ||
              !this.state.DOB ||
              !this.state.height ||
              !this.state.inchcm ||
              !this.state.weight ||
              !this.state.kglbs ||
              !this.state.radiologistPriority ||
              !this.state.reasonForExam ||
              !this.state.examRequested
            }
          >
            Submit
          </Form.Button>
        </Form>
      </Segment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    bookingResults: state.booking.bookingResults,
    loading: state.booking.loading,
    error: state.booking.error,
  };
};

export default connect(mapStateToProps, { sendMRIRequest })(BookingForm);
