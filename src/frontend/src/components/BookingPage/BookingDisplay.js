import React from 'react';
import {Segment, Item} from "semantic-ui-react";
import { connect } from "react-redux";
import Loader from "../Loader";
import {sendErrorToast, sendSuccessToast} from "../../helpers";

class BookingDisplay extends React.Component {

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.error) {
            sendErrorToast(this.props.error.message);
        } else if (this.props.success) {
            sendSuccessToast(this.props.success);
        }
    }

    render() {
        if (this.props.loading) {
            return <Loader/>;
        }
        return (
            <Segment>
                <Item>
                    {this.props.submitted ? (
                        <Item.Content>
                            <Item.Header as='h3'>{`The rule ID is: ${this.props.results.rule_id}`}</Item.Header>
                            <Item.Header as='h3'>{`The booking priority is: ${this.props.results.priority}`}</Item.Header>
                            <Item.Header as='h3'>{`Contrast: ${this.props.results.contrast}`}</Item.Header>
                            <Item.Header as='h3'>{`P5: ${this.props.results.p5_flag}`}</Item.Header>
                            {this.props.results.specialty_exams &&
                            <Item.Header as='h3'>{`Specialty exams needed: ${this.props.results.specialty_exams.join(', ').trim()}`}</Item.Header>}
                        </Item.Content>
                    ) : (
                        <Item.Header as='h3'>MRI booking results will be displayed here.</Item.Header>
                    )}
                </Item>
            </Segment>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        results: state.booking.bookingResults,
        context: state.booking.context,
        submitted: state.booking.submitted,
        loading: state.booking.loading,
        error: state.booking.error
    }
};

export default connect(mapStateToProps)(BookingDisplay);