import React from 'react';
import { connect } from "react-redux";
import { Button, Checkbox, Icon, Table } from 'semantic-ui-react'
import { getWordWeights, changeWeightSort } from "../../actions/WeightActions";
import AddWordWeightForm from "./AddWordWeightForm";
import WeightsTableRow from "./WeightsTableRow";
import { sendSuccessToast, sendErrorToast } from "../../helpers";


class WeightsTable extends React.Component {
    componentDidMount() {
        this.props.getWordWeights();
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
                            onClick={() => {this.props.changeWeightSort('key');}}
                        >Medical Word</Table.HeaderCell>
                        <Table.HeaderCell
                            sorted={this.props.sortedColumn === 'value' ? this.props.sortDirection : null}
                            onClick={() => {this.props.changeWeightSort('value');}}
                        >Assigned Weight</Table.HeaderCell>
                        <Table.HeaderCell collapsing textAlign='center'>
                            <AddWordWeightForm/>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {this.props.weights.map((weight, index) =>
                        <WeightsTableRow
                            word={weight.key}
                            weight={weight.value}
                        />
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
        weights: state.weights.weightsList,
        loading: state.weights.loading,
        error: state.weights.error,
        success: state.weights.success,
        sortedColumn: state.weights.column,
        sortDirection: state.weights.direction
    }
};

export default connect(mapStateToProps, {getWordWeights, changeWeightSort})(WeightsTable);