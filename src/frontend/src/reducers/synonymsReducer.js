import {
    CHANGE_SYNONYM_SORT,
    GET_SYNONYMS_FAILURE,
    GET_SYNONYMS_STARTED,
    GET_SYNONYMS_SUCCESS,
    ADD_SYNONYM,
    MODIFY_SYNONYM,
    DELETE_SYNONYM
} from "../constants/synonymsConstants";
import _ from "lodash";

let initialState = {
    synonymsList: [],
    loading: false,
    success: '',
    error: null,
    column: null,
    direction: null,
    initialize: false
};

export const synonyms = (state = initialState, action) => {
    switch (action.type) {
        case GET_SYNONYMS_STARTED:
            return {
                ...state,
                loading: true,
                success: '',
                error: null
            };
        case GET_SYNONYMS_SUCCESS:
            return {
                ...state,
                synonymsList: action.response,
                loading: false,
                column: null,
                direction: null,
                initialize: true
            };
        case ADD_SYNONYM:
            return {
                ...state,
                synonymsList: state.synonymsList.concat(action.synonym),
                success: "Synonym successfully added!"
            };
        case MODIFY_SYNONYM:
            return {
                ...state,
                synonymsList: state.synonymsList.map((synonym, index) => index === action.index ? action.synonym : synonym),
                success: "Synonym successfully modified!"
            };
        case DELETE_SYNONYM:
            return {
                ...state,
                synonymsList: state.synonymsList.filter((synonym, index) => index !== action.index),
                success: "Synonym successfully deleted!"
            };
        case GET_SYNONYMS_FAILURE:
            return {
                ...state,
                error: action.error,
                loading: false
            };
        case CHANGE_SYNONYM_SORT:
            if (state.column === action.column) {
                return {
                    ...state,
                    synonymsList: state.synonymsList.reverse(),
                    direction: (state.direction === 'ascending') ? 'descending' : 'ascending'
                }
            } else {
                return {
                    ...state,
                    column: action.column,
                    synonymsList: _.sortBy(state.synonymsList, [action.column]),
                    direction: 'ascending'
                }
            }
        default:
            return state;
    }
};