import React from 'react';
import { connect } from "react-redux";
import {Table, Dropdown} from 'semantic-ui-react';
import { modifyWordWeight, deleteWordWeight } from "../../actions/WeightActions";
import ConfirmDeleteDialog from "../ConfirmDeleteDialog";


class WeightsTableRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = { weight: this.props.weight };

        this.handleSelectChange = this.handleSelectChange.bind(this);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({ weight: nextProps.weight });
    }

    handleSelectChange(e,{name, value}) {
        this.setState({[name]:value}, () =>
            this.props.modifyWordWeight({
                key: this.props.word,
                value: this.state.weight
            }));
    }

    render() {
        return (
            <Table.Row disabled={this.props.loading}>
                <Table.Cell>{this.props.word}</Table.Cell>
                <Table.Cell>
                    <Dropdown
                        fluid
                        selection
                        name='weight'
                        value={this.state.weight}
                        options={[
                            { key: 'A', text: 'A', value: 'A' },
                            { key: 'B', text: 'B', value: 'B' },
                            { key: 'C', text: 'C', value: 'C' },
                            { key: 'D', text: 'D', value: 'D' },
                        ]}
                        onChange={this.handleSelectChange}
                    />
                </Table.Cell>
                <Table.Cell textAlign='right' collapsing>
                    <ConfirmDeleteDialog
                        id={this.props.word}
                        table='weights'
                    />
                </Table.Cell>
            </Table.Row>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        weights: state.weights.weightsList,
        loading: state.weights.loading,
        error: state.weights.error
    }
};

export default connect(mapStateToProps, {modifyWordWeight, deleteWordWeight})(WeightsTableRow);