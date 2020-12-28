import React from "react";
import { connect } from "react-redux";
import { Table } from "semantic-ui-react";
import { getSpecialtyExams, changeSpecialtyExamSort } from "../../actions/SpecialtyExamActions";
import ConfirmDeleteDialog from "../ConfirmDeleteDialog";
import AddSpecialtyExamForm from "./AddSpecialtyExamForm";
import { sendErrorToast, sendSuccessToast } from "../../helpers";

class SpecialtyExamTable extends React.Component {
    componentDidMount() {
        this.props.getSpecialtyExams();
    }

    componentDidUpdate(preProps, prevState, snapshot) {
        if (this.props.error) {
            sendErrorToast(this.props.error.message);
        } else if (this.props.success) {
            sendSuccessToast(this.props.success);
        }
    }

    render() {
        return (
            <Table celled compact sortable >
                <Table.Header fullWidth>
                    <Table.Row>
                        <Table.HeaderCell
                            sorted={this.props.sortedColumn === 'exam' ? this.props.sortDirection : null}
                            onClick={() => this.props.changeSpecialtyExamSort()}
                        >Specialty Exam</Table.HeaderCell>
                        <Table.HeaderCell collapsing textAlign='center'>
                            <AddSpecialtyExamForm/>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {this.props.specialtyExam.map((specialtyExam, index) =>
                        <Table.Row disabled={this.props.loading}>
                            <Table.Cell>{specialtyExam}</Table.Cell>
                            <Table.Cell textAlign='right' collapsing>
                                <ConfirmDeleteDialog
                                    id={specialtyExam}
                                    table='specialtyExam'
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
        </Table >
        )
    }
}

const mapStatetoProps = (state) => {
    return {
        specialtyExam: state.specialtyExam.specialtyExamList,
        loading: state.specialtyExam.loading,
        error: state.specialtyExam.error,
        success: state.specialtyExam.success,
        sortedColumn: state.specialtyExam.column,
        sortDirection: state.specialtyExam.direction
    }
};

export default connect(mapStatetoProps, { changeSpecialtyExamSort, getSpecialtyExams })(SpecialtyExamTable);