import React from 'react';
import { connect } from "react-redux";
import { Table } from 'semantic-ui-react'
import {Storage} from "@aws-amplify/storage";
import { sendSuccessToast, sendErrorToast } from "../../helpers";
import { getSynonyms, changeSynonymSort } from "../../actions/SynonymActions";
import ConfirmDeleteDialog from "../ConfirmDeleteDialog";
import AddSynonymForm from "./AddSynonymForm";
import ModifySynonymForm from "./ModifySynonymForm";


class SynonymsTable extends React.Component {
    constructor(props) {
        super(props);

        this.updateFile = this.updateFile.bind(this);
    }
    
    componentDidMount() {
        if (!this.props.initialize) {
            this.props.getSynonyms();
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.error) {
            sendErrorToast(this.props.error.message);
        } else if (this.props.success) {
            this.updateFile().then(response => {
                sendSuccessToast(this.props.success);
            });
        }
    }
    
    async updateFile() {
        let synonyms = this.props.synonyms;
        let fileStrings = synonyms.map((s) => [s.word, s.synonymList.join(" / ")].join(" : "));
        let fileString = fileStrings.join("\n");
        await Storage.put('thesaurus_medical.ths', fileString, {
            level: 'public'
        });
    }

    render() {
        return (
            <Table celled compact sortable>
                <Table.Header fullWidth>
                    <Table.Row>
                        <Table.HeaderCell
                            sorted={this.props.sortedColumn === 'word' ? this.props.sortDirection : null}
                            onClick={() => {this.props.changeSynonymSort('word');}}
                        >Word / Phrase</Table.HeaderCell>
                        <Table.HeaderCell>Assigned Synonyms</Table.HeaderCell>
                        <Table.HeaderCell collapsing textAlign='center'>
                            <AddSynonymForm/>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {this.props.synonyms.map((syn, index) =>
                        <Table.Row disabled={this.props.loading}>
                            <Table.Cell>{syn.word}</Table.Cell>
                            <Table.Cell>{syn.synonymList.join(', ')}</Table.Cell>
                            <Table.Cell textAlign='right' collapsing>
                                <ModifySynonymForm
                                    id={index}
                                    word={syn.word}
                                    synonymList={syn.synonymList}
                                />
                                <ConfirmDeleteDialog
                                    id={index}
                                    table='synonyms'
                                />
                            </Table.Cell>
                        </Table.Row>
                    )}
                </Table.Body>


                <Table.Footer fullWidth>
                    <Table.Row>
                        <Table.HeaderCell colSpan='8'>
                            {/*<Button size='small'>A Button</Button>*/}
                            {/*<Button disabled size='small'>*/}
                            {/*    Another Button*/}
                            {/*</Button>*/}
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Footer>
            </Table>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        synonyms: state.synonyms.synonymsList,
        loading: state.synonyms.loading,
        error: state.synonyms.error,
        success: state.synonyms.success,
        sortedColumn: state.synonyms.column,
        sortDirection: state.synonyms.direction,
        initialize: state.synonyms.initialize
    }
};

export default connect(mapStateToProps, {getSynonyms, changeSynonymSort})(SynonymsTable);