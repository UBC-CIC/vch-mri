import React from 'react';
import BookingForm from "./BookingForm";
import BookingDisplay from "./BookingDisplay";
import Navbar from "../Navbar";
import { Container, Grid, Segment } from "semantic-ui-react";

import '../../styles/Container.css';

class BookingPage extends React.Component {

    render() {
        return (
            <div className='page-container'>
                <Container>
                    <Grid centered columns={2}>
                        <Grid.Row>
                            <Grid.Column width={8}>
                                <BookingForm/>
                            </Grid.Column>
                            <Grid.Column width={8}>
                                <BookingDisplay/>
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Container>
            </div>
        )
    }
}

export default BookingPage;