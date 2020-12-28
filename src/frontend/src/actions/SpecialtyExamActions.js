import {
    GET_SPECIALTY_EXAMS_STARTED,
    GET_SPECIALTY_EXAMS_SUCCESS,
    GET_SPECIALTY_EXAMS_FAILURE,
    ADD_SPECIALTY_EXAM_STARTED,
    ADD_SPECIALTY_EXAM_SUCCESS,
    ADD_SPECIALTY_EXAM_FAILURE,
    DELETE_SPECIALTY_EXAM_STARTED,
    DELETE_SPECIALTY_EXAM_SUCCESS,
    DELETE_SPECIALTY_EXAM_FAILURE,
    CHANGE_SPECIALTY_EXAM_SORT
} from "../constants/specialtyExamConstant";
import axios from "axios";

export const getSpecialtyExamsStarted = () => {
    return {
        type: GET_SPECIALTY_EXAMS_STARTED
    };
};

export const getSpecialtyExamsSuccess = (response) => {
    return {
        type: GET_SPECIALTY_EXAMS_SUCCESS,
        response
    };
};

export const getSpecialtyExamsFailure = (error) => {
    return {
        type: GET_SPECIALTY_EXAMS_FAILURE,
        error
    };
}; 

export const addSpecialtyExamStarted = () => {
    return {
        type: ADD_SPECIALTY_EXAM_STARTED
    };
};

export const addSpecialtyExamSuccess = (response) => {
    return {
        type: ADD_SPECIALTY_EXAM_SUCCESS,
        response
    };
};

export const addSpecialtyExamFailure = (error) => {
    return {
        type: ADD_SPECIALTY_EXAM_FAILURE,
        error
    };
};

export const deleteSpecialtyExamStarted = () => {
    return {
        type: DELETE_SPECIALTY_EXAM_STARTED
    };
};

export const deleteSpecialtyExamSuccess = (exam) => {
    return {
        type: DELETE_SPECIALTY_EXAM_SUCCESS,
        exam
    };
};

export const deleteSpecialtyExamFailure = (error) => {
    return {
        type: DELETE_SPECIALTY_EXAM_FAILURE,
        error
    };
};

export const getSpecialtyExams = () => {
    return dispatch => {
        dispatch(getSpecialtyExamsStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/tags`, {
            "operation": "GET"
        })
            .then(response => {
                dispatch(getSpecialtyExamsSuccess(response.data));
            })
            .catch(e => {
                dispatch(getSpecialtyExamsFailure(e));
            });
    }
};

export const addSpecialtyExam = (exam) => {
    return dispatch => {
        dispatch(addSpecialtyExamStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/tags`, {
            "operation": "ADD",
            "values": [ exam ]
        })
            .then(response => {
                dispatch(addSpecialtyExamSuccess(response.data));
            })
            .catch(e => {
                dispatch(addSpecialtyExamFailure(e));
            });
    }
};

export const deleteSpecialtyExam = (word) => {
    return dispatch => {
        dispatch(deleteSpecialtyExamStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/tags`, {
            "operation": "DELETE",
            "id": word
        })
            .then(response => {
                dispatch(deleteSpecialtyExamSuccess(word));
            })
            .catch(e => {
                dispatch(deleteSpecialtyExamFailure(e));
            });
    }
};

export const changeSpecialtyExamSort = () => {
    return { 
        type: CHANGE_SPECIALTY_EXAM_SORT,
        column: "exam"
    }
}