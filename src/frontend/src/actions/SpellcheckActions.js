import {
    GET_SPELLCHECK_WORDS_FAILURE,
    GET_SPELLCHECK_WORDS_STARTED,
    GET_SPELLCHECK_WORDS_SUCCESS,
    ADD_SPELLCHECK_WORD_FAILURE,
    ADD_SPELLCHECK_WORD_STARTED,
    ADD_SPELLCHECK_WORD_SUCCESS,
    DELETE_SPELLCHECK_WORD_FAILURE,
    DELETE_SPELLCHECK_WORD_STARTED,
    DELETE_SPELLCHECK_WORD_SUCCESS,
    CHANGE_SPELLCHECK_WORD_SORT
} from "../constants/spellcheckerConstant";
import axios from "axios";

export const getSpellcheckWordsStarted = () => {
    return {
        type: GET_SPELLCHECK_WORDS_STARTED
    };
};

export const getSpellcheckWordsSuccess = (response) => {
    return {
        type: GET_SPELLCHECK_WORDS_SUCCESS,
        response
    };
};

export const getSpellcheckWordsFailure = (error) => {
    return {
        type: GET_SPELLCHECK_WORDS_FAILURE,
        error
    };
};

export const addSpellcheckWordStarted = () => {
    return {
        type: ADD_SPELLCHECK_WORD_STARTED
    };
};

export const addSpellcheckWordSuccess = (response) => {
    return {
        type: ADD_SPELLCHECK_WORD_SUCCESS,
        response
    };
};

export const addSpellcheckWordFailure = (error) => {
    return {
        type: ADD_SPELLCHECK_WORD_FAILURE,
        error
    };
};

export const deleteSpellcheckWordStarted = () => {
    return {
        type: DELETE_SPELLCHECK_WORD_STARTED
    };
};

export const deleteSpellcheckWordSuccess = (word) => {
    return {
        type: DELETE_SPELLCHECK_WORD_SUCCESS,
        word
    };
};

export const deleteSpellcheckWordFailure = (error) => {
    return {
        type: DELETE_SPELLCHECK_WORD_FAILURE,
        error
    };
};

export const getSpellcheckWords = () => {
    return dispatch => {
        dispatch(getSpellcheckWordsStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/spell`, {
            "operation": "GET"
        })
            .then(response => {
                dispatch(getSpellcheckWordsSuccess(response.data));
            })
            .catch(e => {
                dispatch(getSpellcheckWordsFailure(e));
            });
    }
};

export const addSpellcheckWord = (word) => {
    return dispatch => {
        dispatch(addSpellcheckWordStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/spell`, {
            "operation": "ADD",
            "values": [ word ]
        })
            .then(response => {
                dispatch(addSpellcheckWordSuccess(response.data));
            })
            .catch(e => {
                dispatch(addSpellcheckWordFailure(e));
            });
    }
};

export const deleteSpellcheckWord = (word) => {
    return dispatch => {
        dispatch(deleteSpellcheckWordStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/spell`, {
            "operation": "DELETE",
            "id": word
        })
            .then(response => {
                dispatch(deleteSpellcheckWordSuccess(word));
            })
            .catch(e => {
                dispatch(deleteSpellcheckWordFailure(e));
            });
    }
};

export const changeSpellcheckSort = () => {
    return {
        type: CHANGE_SPELLCHECK_WORD_SORT,
        column: "word"
    }
};