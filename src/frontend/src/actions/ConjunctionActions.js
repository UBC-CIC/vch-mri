import axios from "axios";
import {
    GET_CONJUNCTIONS_FAILURE,
    GET_CONJUNCTIONS_STARTED,
    GET_CONJUNCTIONS_SUCCESS,
    ADD_CONJUNCTION_FAILURE,
    ADD_CONJUNCTION_STARTED,
    ADD_CONJUNCTION_SUCCESS,
    MODIFY_CONJUNCTION_FAILURE,
    MODIFY_CONJUNCTION_STARTED,
    MODIFY_CONJUNCTION_SUCCESS,
    DELETE_CONJUNCTION_FAILURE,
    DELETE_CONJUNCTION_STARTED,
    DELETE_CONJUNCTION_SUCCESS,
    CHANGE_CONJUNCTION_SORT
} from "../constants/conjunctionConstants";

export const getConjunctionsStarted = () => {
    return {
        type: GET_CONJUNCTIONS_STARTED
    };
};

export const getConjunctionsSuccess = (response) => {
    return {
        type: GET_CONJUNCTIONS_SUCCESS,
        response
    };
};

export const getConjunctionsFailure = (error) => {
    return {
        type: GET_CONJUNCTIONS_FAILURE,
        error
    };
};

export const addConjunctionStarted = () => {
    return {
        type: ADD_CONJUNCTION_STARTED
    };
};

export const addConjunctionSuccess = (response) => {
    return {
        type: ADD_CONJUNCTION_SUCCESS,
        response
    };
};

export const addConjunctionFailure = (error) => {
    return {
        type: ADD_CONJUNCTION_FAILURE,
        error
    };
};

export const modifyConjunctionStarted = () => {
    return {
        type: MODIFY_CONJUNCTION_STARTED
    };
};

export const modifyConjunctionSuccess = (response) => {
    return {
        type: MODIFY_CONJUNCTION_SUCCESS,
        response
    };
};

export const modifyConjunctionFailure = (error) => {
    return {
        type: MODIFY_CONJUNCTION_FAILURE,
        error
    };
};

export const deleteConjunctionStarted = () => {
    return {
        type: DELETE_CONJUNCTION_STARTED
    };
};

export const deleteConjunctionSuccess = (key) => {
    return {
        type: DELETE_CONJUNCTION_SUCCESS,
        key
    };
};

export const deleteConjunctionFailure = (error) => {
    return {
        type: DELETE_CONJUNCTION_FAILURE,
        error
    };
};

export const getConjunctions = () => {
    return dispatch => {
        dispatch(getConjunctionsStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/conjunctions`, {
            "operation": "GET"
        })
            .then(response => {
                dispatch(getConjunctionsSuccess(response.data));
            })
            .catch(e => {
                dispatch(getConjunctionsFailure(e));
            });
    }
};

export const addConjunction = (state) => {
    return dispatch => {
        dispatch(addConjunctionStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/conjunctions`, {
            "operation": "ADD",
            "values": [ state ]
        })
            .then(response => {
                dispatch(addConjunctionSuccess(response.data));
            })
            .catch(e => {
                dispatch(addConjunctionFailure(e));
            });
    }
};

export const modifyConjunction = (state) => {
    return dispatch => {
        dispatch(modifyConjunctionStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/conjunctions`, {
            "operation": "UPDATE",
            "values": [ state ]
        })
            .then(response => {
                dispatch(modifyConjunctionSuccess(response.data));
            })
            .catch(e => {
                dispatch(modifyConjunctionFailure(e));
            });
    }
};

export const deleteConjunction = (key) => {
    return dispatch => {
        dispatch(deleteConjunctionStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/conjunctions`, {
            "operation": "DELETE",
            "id": key
        })
            .then(response => {
                dispatch(deleteConjunctionSuccess(key));
            })
            .catch(e => {
                dispatch(deleteConjunctionFailure(e));
            });
    }
};

export const changeConjunctionSort = (columnName) => {
    return {
        type: CHANGE_CONJUNCTION_SORT,
        column: columnName
    }
};