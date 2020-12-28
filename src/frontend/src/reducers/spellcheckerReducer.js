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
import _ from "lodash";

let initialState = {
    spellcheckList: [],
    loading: false,
    success: '',
    error: null,
    column: null,
    direction: null
};

export const spell = (state = initialState, action) => {
    switch (action.type) {
        case GET_SPELLCHECK_WORDS_STARTED:
        case ADD_SPELLCHECK_WORD_STARTED:
        case DELETE_SPELLCHECK_WORD_STARTED:
            return {
                ...state,
                loading: true,
                success: '',
                error: null
            };
        case GET_SPELLCHECK_WORDS_SUCCESS:
            return {
                ...state,
                spellcheckList: action.response.data,
                loading: false,
                column: null,
                direction: null
            };
        case ADD_SPELLCHECK_WORD_SUCCESS:
            return {
                ...state,
                spellcheckList: state.spellcheckList.concat(action.response.data[0]),
                loading: false,
                success: "Word successfully added!"
            };
        case DELETE_SPELLCHECK_WORD_SUCCESS:
            return {
                ...state,
                spellcheckList: state.spellcheckList.filter((word) => word !== action.word),
                loading: false,
                success: "Word successfully deleted!"

            };
        case GET_SPELLCHECK_WORDS_FAILURE:
        case ADD_SPELLCHECK_WORD_FAILURE:
        case DELETE_SPELLCHECK_WORD_FAILURE:
            return {
                ...state,
                error: action.error,
                loading: false
            };
        case CHANGE_SPELLCHECK_WORD_SORT:
            if (state.column === action.column) {
                return {
                    ...state,
                    spellcheckList: state.spellcheckList.reverse(),
                    direction: (state.direction === 'ascending') ? 'descending' : 'ascending'
                }
            } else {
                return {
                    ...state,
                    column: action.column,
                    spellcheckList: _.sortBy(state.spellcheckList),
                    direction: 'ascending'
                }
            }
        default:
            return state;
    }
};