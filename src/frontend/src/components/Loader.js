import React from 'react';
import {PuffLoader} from 'react-spinners';
import { Grid } from "semantic-ui-react";

class Loader extends React.Component {
    render() {
        return (
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
                <PuffLoader
                    sizeUnit={"px"}
                    size={60}
                    color={'#000000'}
                />
            </Grid>
        )
    }
}

export default Loader;