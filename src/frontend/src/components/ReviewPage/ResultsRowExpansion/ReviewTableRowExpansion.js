import React from "react";
import { Table } from "semantic-ui-react";
import RuleCandidatesRow from "./RuleCandidatesRow";

class ReviewTableRowExpansion extends React.Component {
  render() {
    const result = this.props.result;
    const request = result.request_json;
    const info = result.info_json;
    const icd10_result = info ? info.icd10_result : null;
    const ruleCandidates = result.ai_rule_candidates;
    // console.log(result);
    // console.log(icd10_result);
    return (
      <>
        <Table celled compact striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell width="2">Stage</Table.HeaderCell>
              <Table.HeaderCell width="6">
				  Result
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
				<Table.Cell>
				Original Request
				</Table.Cell>
              <Table.Cell>
                {/* <Container textAlign="left"> */}
                {request ? (
                  <>
                    <p>
                      <b>DOB: </b>
                      {request.DOB}
                    </p>
                    <p>
                      <b>Height: </b>
                      {`${request.Height} ${request["inch-cm"]}`}
                    </p>
                    <p>
                      <b>Weight: </b>
                      {`${request.weight} ${request["kg-lbs"]}`}
                    </p>
                    <p>
                      <b>Reason for Exam: </b>
                      {request["Reason for Exam"]}
                    </p>
                    <p>
                      <b>Exam Requested: </b>
                      {request["Exam Requested"]}
                    </p>
                  </>
                ) : (
                  <p>Request error.</p>
                )}
                {/* </Container> */}
              </Table.Cell>
			  </Table.Row>
			  <Table.Row>
				  <Table.Cell>
				  {/*After AWS Comprehend (sent to the Rules engine)*/}
				  Pre-Processed Values:
				  </Table.Cell>
              	<Table.Cell>
                {/* <Container textAlign="left"> */}
                {info ? (
                  <>
                    {/* <p>{`reqCIO: ${info.CIO_ID}`}</p> */}
                    <p><b>Height: </b>{info.height} CM</p>
                    <p><b>Weight: </b>{info.weight} KG</p>
                    {/* <p>{`Sex: ${info.Sex}`}</p> */}
                    <p><b>Age: </b>{info.age}</p>
                    {/* <p>{`Preferred MRI Site: ${info["Preferred MRI Site"]}`}</p> */}
                    {/* <p>{`Priority: ${info.priority}`}</p> */}
                    <p><b>P5 Flag: </b>{info.p5}</p>
					<p><b>Reason for Exam: </b>{info.replace_conjunctions}</p>
					<p><b>Exam Requested: </b>{info.exam_requested}</p>
					</>
				) : (<p> - </p>)}
				</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell>
						Anatomy (compr_m.detect_entities_v2)
					</Table.Cell>
					<Table.Cell>
						{info ? (
						<>
							<p><b>Input:</b>{info.exam_requested}</p>
							<p><b>Output:</b></p>
							<ul>
								{info.anatomy_json 
								&& info.anatomy_json.length > 0
								&& info.anatomy_json.map((a,i) => (
									<li key={i}>{JSON.stringify(a)}</li>
								))}
							</ul>
							<p><b>Anatomy List:</b>{info.anatomy.join(", ")}</p>
						</>
						) : (<p> - </p>)}
					</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell>
						infer_icd10_cm
					</Table.Cell>
					<Table.Cell>
						<p><b>Input:</b>{info.replace_conjunctions}</p>
						<p><b>Output: </b></p>
						<ul>
							{icd10_result 
							&& icd10_result.length > 0
							&& icd10_result.map((x,i) => (
								<li key={i}><pre>{JSON.stringify(x, null, 2)}</pre></li>
							))}
						</ul>
						<p><b>Final medical_condition: </b>{info.medical_condition.join(", ")}</p>
						<p><b>Final diagnosis: </b>{info.diagnosis.join(", ")}</p>
						<p><b>Final symptoms: </b>{info.symptoms.join(", ")}</p>
					</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell>
						find_key_phrases
					</Table.Cell>
					<Table.Cell>
						<p><b>Input (text):</b>{info.replace_conjunctions}</p>
						<p><b>Input (medical_condition): </b>{info.medical_condition.join(", ")}</p>
						<p><b>Input (diagnosis): </b>{info.diagnosis.join(", ")}</p>
						<p><b>Input (symptoms): </b>{info.symptoms.join(", ")}</p>
						<p><b>Input (anatomy):</b>{info.anatomy.join(", ")}</p>
						<p><b>Output (Phrases):</b></p>
						{info.phrases
						&& info.phrases.length > 0 
						&& info.phrases.map((x,i) => (
							<li key={i}>{x}</li>
						))}
					</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Cell>
						Rule Candidate Search
					</Table.Cell>
					<Table.Cell>
						<p><b>Input (anatomy):</b>{info.anatomy.join(", ")}</p>
						<p><b>Input (medical_condition): </b>{info.medical_condition.join(", ")}</p>
						<p><b>Input (diagnosis): </b>{info.diagnosis.join(", ")}</p>
						<p><b>Input (symptoms): </b>{info.symptoms.join(", ")}</p>
						<p><b>Input (phrases):</b>{info.phrases.join(", ")}</p>
						<p><b>Input (other_info):</b>{info.other_info.join(", ")}</p>
						<p><b>info_str: </b>{ Array.from(new Set([ 
								...info.anatomy.flatMap(x=>x.split(" ")),
								...info.diagnosis.flatMap(x=>x.split(" ")),
								...info.symptoms.flatMap(x=>x.split(" ")),
								...info.phrases.flatMap(x=>x.split(" ")),
								...info.other_info.flatMap(x=>x.split(" "))
							])).join(" | ") }</p>
						<p><b>anatomy_str: </b>{ Array.from(new Set([ 
								...info.anatomy.flatMap(x=>x.split(" "))
							])).join(" | ") }</p>
					</Table.Cell>
				</Table.Row>
          </Table.Body>
        </Table>
        <Table celled compact striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell colSpan="9">
                AI Rule candidates in order of highest (topmost) to lowest rank
                (bottom)
              </Table.HeaderCell>
            </Table.Row>
            <Table.Row>
              <Table.HeaderCell>Rule ID</Table.HeaderCell>
              <Table.HeaderCell>Body Parts</Table.HeaderCell>
              <Table.HeaderCell>Priority</Table.HeaderCell>
              <Table.HeaderCell>Contrast</Table.HeaderCell>
              <Table.HeaderCell>Sp. Exams</Table.HeaderCell>
              <Table.HeaderCell>Info</Table.HeaderCell>
              <Table.HeaderCell>Match %</Table.HeaderCell>
              <Table.HeaderCell>bp_tk</Table.HeaderCell>
              <Table.HeaderCell>info_weighted_tk</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {ruleCandidates &&
              ruleCandidates.map((candidate, index) => (
                <RuleCandidatesRow
                  candidate={candidate}
                  reqCio={this.props.reqCio}
                  reqState={result.state}
                  index={index}
                  popupButtonAIConfirm={this.props.popupButtonAIConfirm}
                  handleAIConfirm={this.props.handleAIConfirm}
                />
              ))}
          </Table.Body>
        </Table>
      </>
    );
  }
}

export default ReviewTableRowExpansion;
