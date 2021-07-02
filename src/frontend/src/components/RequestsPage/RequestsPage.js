import React from "react";
import RequestsTable from "./RequestsTable";
import RequestsSearchBar from "./RequestsSearchBar";

class RequestsPage extends React.Component {
  render() {
    return (
      <div className="page-container">
        <RequestsSearchBar />
        <RequestsTable />
      </div>
    );
  }
}

export default RequestsPage;
