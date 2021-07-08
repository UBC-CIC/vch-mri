import React from "react";
import { Table, Container } from "semantic-ui-react";

class ResultsTableRowExpansion extends React.Component {
  render() {
    const result = this.props.result;
    const request = result.request_json;
    const info = result.info_json;
    const rule = result.rule;

    return (
      <Table celled compact striped>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan="4">Original Request</Table.HeaderCell>
            <Table.HeaderCell colSpan="4">
              After AWS Comprehend (this info is sent to the Rules engine for AI
              priority determination)
            </Table.HeaderCell>
            <Table.HeaderCell>Rule - AI match</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell colSpan="4">
              {/* <Container textAlign="left"> */}
              {request ? (
                <>
                  <p>{`DOB: ${request.DOB}`}</p>
                  <p>{`Height: ${request.Height} ${request["inch-cm"]}`}</p>
                  <p>{`Weight: ${request.weight} ${request["kg-lbs"]}`}</p>
                  <p>{`Reason for Exam: ${request["Reason for Exam"]}`}</p>
                  <p>{`Exam Requested: ${request["Exam Requested"]}`}</p>
                </>
              ) : (
                <p>Request error.</p>
              )}
              {/* </Container> */}
            </Table.Cell>
            <Table.Cell colSpan="4">
              {/* <Container textAlign="left"> */}
              {info ? (
                <>
                  {/* <p>{`reqCIO: ${info.CIO_ID}`}</p> */}
                  <p>{`Height: ${info.height} CM`}</p>
                  <p>{`Weight: ${info.weight} KG`}</p>
                  {/* <p>{`Sex: ${info.Sex}`}</p> */}
                  <p>{`Age: ${info.age}`}</p>
                  {/* <p>{`Preferred MRI Site: ${info["Preferred MRI Site"]}`}</p> */}
                  {/* <p>{`Priority: ${info.priority}`}</p> */}
                  <p>{`P5 Flag: ${info.p5}`}</p>
                  <p>{`Medical Conditions: ${
                    info.medical_condition.length > 0
                      ? info.medical_condition.join(", ")
                      : "none"
                  }`}</p>
                  {info.diagnosis && info.diagnosis.length > 0 && (
                    <p>{`Diagnosis: ${info.diagnosis.join(", ")}`}</p>
                  )}
                  {info.anatomy && info.anatomy.length > 0 && (
                    <p>{`Anatomy: ${info.anatomy.join(", ")}`}</p>
                  )}
                  {info.symptoms && info.symptoms.length > 0 && (
                    <p>{`Symptoms: ${info.symptoms.join(", ")}`}</p>
                  )}
                  {info.phrases && info.phrases.length > 0 && (
                    <p>{`Phrases: ${info.phrases.join(", ")}`}</p>
                  )}
                </>
              ) : (
                <p> - </p>
              )}
              {/* </Container> */}
            </Table.Cell>
            <Table.Cell textAlign="left">
              {rule.rules_id ? (
                <>
                  <p>{`Rule ID: ${rule.rules_id}`}</p>
                  <p>{`Priority: ${rule.priority}`}</p>
                  <p>{`Contrast: ${rule.contrast}`}</p>
                  {result.tags && result.tags > 0 && (
                    <p>{`Specialty Exam Tags: ${result.tags.join(", ")}`}</p>
                  )}
                  <p>{`Body Parts: ${rule.body_part}`}</p>
                  <p>{`bp_tk: ${rule.bp_tk}`}</p>
                  <p>{`info_weighted_tk: ${rule.info_weighted_tk}`}</p>
                </>
              ) : (
                <p> - </p>
              )}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );
  }
}

export default ResultsTableRowExpansion;
