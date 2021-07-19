import React from "react";
import SpellcheckerTable from "./SpellcheckerTable";
import { Header } from "semantic-ui-react";

class SpellcheckerPage extends React.Component {
  render() {
    return (
      <div className="page-container">
        <Header as="h1" textAlign="left">
          Spellchecker
        </Header>
        <SpellcheckerTable />
      </div>
    );
  }
}

export default SpellcheckerPage;
