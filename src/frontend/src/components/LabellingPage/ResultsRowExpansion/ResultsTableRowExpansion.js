import React from "react";
import { Table } from "semantic-ui-react";
import RuleCandidatesRow from "./RuleCandidatesRow";

class ResultsTableRowExpansion extends React.Component {
  render() {
    const result = this.props.result;
    const request = result.request_json;
    const info = result.info_json;
    const ruleCandidates = result.ai_rule_candidates;
    // console.log(result);

    return (
      <>
        <Table celled compact striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width="4">Original Request</Table.HeaderCell>
              <Table.HeaderCell width="4">
                After AWS Comprehend (sent to the Rules engine)
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
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
              <Table.Cell>
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
            </Table.Row>
          </Table.Body>
        </Table>
        <Table celled compact striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell colSpan="7">
                AI Rule candidates in order of highest (topmost) to lowest rank
                (bottom)
              </Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              <Table.HeaderCell>Rule ID</Table.HeaderCell>
              <Table.HeaderCell>Info</Table.HeaderCell>
              <Table.HeaderCell>Priority</Table.HeaderCell>
              <Table.HeaderCell>Contrast</Table.HeaderCell>
              <Table.HeaderCell>Body Parts</Table.HeaderCell>
              <Table.HeaderCell>bp_tk</Table.HeaderCell>
              <Table.HeaderCell>info_weighted_tk</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {ruleCandidates &&
              ruleCandidates.map((candidate, index) => (
                <RuleCandidatesRow candidate={candidate} index={index} />
              ))}
          </Table.Body>
        </Table>
      </>
    );
  }
}

export default ResultsTableRowExpansion;
