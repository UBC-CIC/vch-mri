import React from "react";
// import SynonymsForm from "./SynonymsForm";
import SynonymsTable from "./SynonymsTable";
import { Header } from "semantic-ui-react";

class SynonymsPage extends React.Component {
  render() {
    return (
      <div className="page-container">
        <Header as="h1" textAlign="left">
          Synonyms
        </Header>
        <SynonymsTable />
        {/* <SynonymsForm /> */}
      </div>
    );
  }
}

export default SynonymsPage;
