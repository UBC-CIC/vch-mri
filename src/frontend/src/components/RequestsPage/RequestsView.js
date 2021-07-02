import React from "react";
import { Button, Header, Icon, Modal, Container } from "semantic-ui-react";
import { connect } from "react-redux";

class RequestsView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
  }

  render() {
    return (
      <Modal
        style={{ maxWidth: 500 }}
        onClose={() => this.setState({ open: false })}
        onOpen={() => this.setState({ open: true })}
        open={this.state.open}
        trigger={
          <Button icon>
            <Icon name="info circle" />
          </Button>
        }
      >
        <Header as="h2" color="blue" textAlign="center">
          Information
        </Header>
        <Modal.Content>
          <Container textAlign="left">
            <p>{`reqCIO: ${this.props.info.CIO_ID}`}</p>
            <p>{`Height: ${this.props.info.height}`}</p>
            <p>{`Weight: ${this.props.info.weight}`}</p>
            <p>{`Sex: ${this.props.info.Sex}`}</p>
            <p>{`Age: ${this.props.info.age}`}</p>
            <p>{`Preferred MRI Site: ${this.props.info["Preferred MRI Site"]}`}</p>
            <p>{`Priority: ${this.props.info.priority}`}</p>
            <p>{`P5 Flag: ${this.props.info.p5}`}</p>
            <p>{`Medical Conditions: ${this.props.info.medical_condition.join(
              ", "
            )}`}</p>
            <p>{`Diagnosis: ${this.props.info.diagnosis.join(", ")}`}</p>
            <p>{`Anatomy: ${this.props.info.anatomy.join(", ")}`}</p>
            <p>{`Symptoms: ${this.props.info.symptoms.join(", ")}`}</p>
            <p>{`Phrases: ${this.props.info.phrases.join(", ")}`}</p>
          </Container>
        </Modal.Content>
        <Modal.Actions>
          <Button
            color="black"
            content="Close"
            onClick={() => this.setState({ open: false })}
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    Requestss: state.results.resultsList,
    loading: state.results.loading,
    error: state.results.error,
  };
};

export default connect(mapStateToProps)(RequestsView);
