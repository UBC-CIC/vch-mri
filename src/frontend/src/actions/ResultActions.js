import {
    GET_RESULT_BY_ID_FAILURE,
    GET_RESULT_BY_ID_STARTED,
    GET_RESULT_BY_ID_SUCCESS,
    GET_RESULTS_BY_PAGE_FAILURE,
    GET_RESULTS_BY_PAGE_STARTED,
    GET_RESULTS_BY_PAGE_SUCCESS,
    GET_RESULT_DATA_FAILURE,
    GET_RESULT_DATA_STARTED,
    GET_RESULT_DATA_SUCCESS,
    MODIFY_RESULT_FAILURE,
    MODIFY_RESULT_STARTED,
    MODIFY_RESULT_SUCCESS,
    CHANGE_RESULT_SORT
} from "../constants/resultConstants";
import axios from "axios";

export const getResultByIDStarted = () => {
    return {
        type: GET_RESULT_BY_ID_STARTED
    };
};

export const getResultByIDSuccess = (response) => {
    return {
        type: GET_RESULT_BY_ID_SUCCESS,
        response
    };
};

export const getResultByIDFailure = (error) => {
    return {
        type: GET_RESULT_BY_ID_FAILURE,
        error
    };
};

export const getResultsByPageStarted = () => {
    return {
        type: GET_RESULTS_BY_PAGE_STARTED
    };
};

export const getResultsByPageSuccess = (response) => {
    return {
        type: GET_RESULTS_BY_PAGE_SUCCESS,
        response
    };
};

export const getResultsByPageFailure = (error) => {
    return {
        type: GET_RESULTS_BY_PAGE_FAILURE,
        error
    };
};

export const getResultDataStarted = () => {
    return {
        type: GET_RESULT_DATA_STARTED
    };
};

export const getResultDataSuccess = (response) => {
    return {
        type: GET_RESULT_DATA_SUCCESS,
        response
    };
};

export const getResultDataFailure = (error) => {
    return {
        type: GET_RESULT_DATA_FAILURE,
        error
    };
};

export const modifyResultStarted = () => {
    return {
        type: MODIFY_RESULT_STARTED
    };
};

export const modifyResultSuccess = (response) => {
    return {
        type: MODIFY_RESULT_SUCCESS,
        response
    };
};

export const modifyResultFailure = (error) => {
    return {
        type: MODIFY_RESULT_FAILURE,
        error
    };
};

export const changeResultSort = (columnName) => {
    return {
        type: CHANGE_RESULT_SORT,
        column: columnName
    }
};

export const getResultByID = (id) => {
    return dispatch => {
        dispatch(getResultByIDStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/results`, {
            "operation": "GET",
            "id": id
        })
            .then(response => {
                dispatch(getResultByIDSuccess(response.data));
            })
            .catch(e => {
                dispatch(getResultByIDFailure(e));
            });
    }
};

export const getResultsByPage = (pageIndex) => {
    return dispatch => {
        dispatch(getResultsByPageStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/results`, {
            "operation": "GET",
            "page": pageIndex
        })
            .then(response => {
                dispatch(getResultsByPageSuccess(response.data));
            })
            .catch(e => {
                dispatch(getResultsByPageFailure(e));   
            });
    }
};

export const getResultData = () => {
    return dispatch => {
        dispatch(getResultDataStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/results`, {
            "operation": "GET_DATA",
        })
            .then(response => {
                dispatch(getResultDataSuccess(response.data));
            })
            .catch(e => {
                dispatch(getResultDataFailure(e));
            });
    }
};

export const modifyResult = (state) => {
    return dispatch => {
        dispatch(modifyResultStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/results`, {
            "operation": "UPDATE",
            "id": state.id,
            "phys_priority": state.phys_priority,
            "phys_contrast": state.phys_contrast
        })
            .then(response => {
                dispatch(modifyResultSuccess(response.data));
            })
            .catch(e => {
                dispatch(modifyResultFailure(e));
            });
    }
};