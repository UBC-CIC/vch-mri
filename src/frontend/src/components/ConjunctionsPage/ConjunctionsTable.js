import React from 'react';
import { connect } from "react-redux";
import { Table } from 'semantic-ui-react';
import { getConjunctions, changeConjunctionSort } from "../../actions/ConjunctionActions";
import ConfirmDeleteDialog from "../ConfirmDeleteDialog";
import AddConjunctionForm from "./AddConjunctionForm";
import ModifyConjunctionForm from "./ModifyConjunctionForm";
import {sendErrorToast, sendSuccessToast} from "../../helpers";


class ConjunctionsTable extends React.Component {
    componentDidMount() {
        this.props.getConjunctions();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.error) {
            sendErrorToast(this.props.error.message);
        } else if (this.props.success) {
            sendSuccessToast(this.props.success);
        }
    }

    render() {
        return (
            <Table celled compact sortable>
                <Table.Header fullWidth>
                    <Table.Row>
                        <Table.HeaderCell
                            sorted={this.props.sortedColumn === 'key' ? this.props.sortDirection : null}
                            onClick={() => {this.props.changeConjunctionSort('key');}}
                        >Medical Abbreviation</Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={this.props.sortedColumn === 'value' ? this.props.sortDirection : null}
                            onClick={() => {this.props.changeConjunctionSort('value');}}
                        >Meaning</Table.HeaderCell>
                        <Table.HeaderCell collapsing textAlign='center'>
                            <AddConjunctionForm/>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {this.props.conjunctions.map((conj, index) =>
                        <Table.Row disabled={this.props.loading}>
                            <Table.Cell>{conj.key}</Table.Cell>
                            <Table.Cell>{conj.value}</Table.Cell>
                            <Table.Cell textAlign='right' collapsing>
                                <ModifyConjunctionForm
                                    abbrev={conj.key}
                                    meaning={conj.value}
                                />
                                <ConfirmDeleteDialog
                                    id={conj.key}
                                    table='conj'
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
        conjunctions: state.conjunctions.conjunctionsList,
        loading: state.conjunctions.loading,
        error: state.conjunctions.error,
        success: state.conjunctions.success,
        sortedColumn: state.conjunctions.column,
        sortDirection: state.conjunctions.direction
    }
};

export default connect(mapStateToProps, {getConjunctions, changeConjunctionSort})(ConjunctionsTable);