import axios from "axios";
import {
    SEND_MRI_REQUEST_FAILURE,
    SEND_MRI_REQUEST_STARTED,
    SEND_MRI_REQUEST_SUCCESS
} from "../constants/bookingConstant";

export const sendMRIRequestStarted = () => {
    return {
        type: SEND_MRI_REQUEST_STARTED
    };
};

export const sendMRIRequestSuccess = (response) => {
    return {
        type: SEND_MRI_REQUEST_SUCCESS,
        response
    };
};

export const sendMRIRequestFailure = (error) => {
    return {
        type: SEND_MRI_REQUEST_FAILURE,
        error
    };
};

export const sendMRIRequest = (state) => {
    return dispatch => {
        dispatch(sendMRIRequestStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/parser`, state)
            .then(response => {
                dispatch(sendMRIRequestSuccess(response.data));
            })
            .catch(e => {
                dispatch(sendMRIRequestFailure(e));
            });
    }
};