import React from "react";
import LabellingTable from "./LabellingTable";
import LabellingSearchBar from "./LabellingSearchBar";

class LabellingPage extends React.Component {
  render() {
    return (
      <div className="page-container">
        <LabellingSearchBar />
        <LabellingTable />
      </div>
    );
  }
}

export default LabellingPage;
