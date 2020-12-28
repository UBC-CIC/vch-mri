import axios from "axios";
import {
    CHANGE_WEIGHT_SORT,
    GET_WORD_WEIGHTS_FAILURE,
    GET_WORD_WEIGHTS_STARTED,
    GET_WORD_WEIGHTS_SUCCESS,
    ADD_WORD_WEIGHT_FAILURE,
    ADD_WORD_WEIGHT_STARTED,
    ADD_WORD_WEIGHT_SUCCESS,
    MODIFY_WORD_WEIGHT_FAILURE,
    MODIFY_WORD_WEIGHT_STARTED,
    MODIFY_WORD_WEIGHT_SUCCESS,
    DELETE_WORD_WEIGHT_STARTED,
    DELETE_WORD_WEIGHT_SUCCESS,
    DELETE_WORD_WEIGHT_FAILURE
} from "../constants/weightConstants";

export const getWordWeightsStarted = () => {
    return {
        type: GET_WORD_WEIGHTS_STARTED
    };
};

export const getWordWeightsSuccess = (response) => {
    return {
        type: GET_WORD_WEIGHTS_SUCCESS,
        response
    };
};

export const getWordWeightsFailure = (error) => {
    return {
        type: GET_WORD_WEIGHTS_FAILURE,
        error
    };
};

export const addWordWeightStarted = () => {
    return {
        type: ADD_WORD_WEIGHT_STARTED
    };
};

export const addWordWeightSuccess = (response) => {
    return {
        type: ADD_WORD_WEIGHT_SUCCESS,
        response
    };
};

export const addWordWeightFailure = (error) => {
    return {
        type: ADD_WORD_WEIGHT_FAILURE,
        error
    };
};

export const modifyWordWeightStarted = () => {
    return {
        type: MODIFY_WORD_WEIGHT_STARTED
    };
};

export const modifyWordWeightSuccess = (response) => {
    return {
        type: MODIFY_WORD_WEIGHT_SUCCESS,
        response
    };
};

export const modifyWordWeightFailure = (error) => {
    return {
        type: MODIFY_WORD_WEIGHT_FAILURE,
        error
    };
};

export const deleteWordWeightStarted = () => {
    return {
        type: DELETE_WORD_WEIGHT_STARTED
    };
};

export const deleteWordWeightSuccess = (key) => {
    return {
        type: DELETE_WORD_WEIGHT_SUCCESS,
        key
    };
};

export const deleteWordWeightFailure = (error) => {
    return {
        type: DELETE_WORD_WEIGHT_FAILURE,
        error
    };
};

export const getWordWeights = () => {
    return dispatch => {
        dispatch(getWordWeightsStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/weights`, {
            "operation": "GET"
        })
            .then(response => {
                dispatch(getWordWeightsSuccess(response.data));
            })
            .catch(e => {
                dispatch(getWordWeightsFailure(e));
            });
    }
};

export const addWordWeight = (state) => {
    return dispatch => {
        dispatch(addWordWeightStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/weights`, {
            "operation": "ADD",
            "values": [ state ]
        })
            .then(response => {
                dispatch(addWordWeightSuccess(response.data));
            })
            .catch(e => {
                dispatch(addWordWeightFailure(e));
            });
    }
};

export const modifyWordWeight = (state) => {
    return dispatch => {
        dispatch(modifyWordWeightStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/weights`, {
            "operation": "UPDATE",
            "values": [ state ]
        })
            .then(response => {
                dispatch(modifyWordWeightSuccess(response.data));
            })
            .catch(e => {
                dispatch(modifyWordWeightFailure(e));
            });
    }
};

export const deleteWordWeight = (key) => {
    return dispatch => {
        dispatch(deleteWordWeightStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/weights`, {
            "operation": "DELETE",
            "id": key
        })
            .then(response => {
                dispatch(deleteWordWeightSuccess(key));
            })
            .catch(e => {
                dispatch(deleteWordWeightFailure(e));
            });
    }
};

export const changeWeightSort = (columnName) => {
    return {
        type: CHANGE_WEIGHT_SORT,
        column: columnName
    }
};