import React from "react";
import SpecialtyExamTable from "./SpecialtyExamTable";
import { Header } from "semantic-ui-react";

class SpecialtyExamPage extends React.Component {
  render() {
    return (
      <div className="page-container">
        <Header as="h1" textAlign="left">
          Specialty Exam Tags
        </Header>
        <SpecialtyExamTable />
      </div>
    );
  }
}

export default SpecialtyExamPage;
