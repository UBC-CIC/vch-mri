import {
    GET_WORD_WEIGHTS_FAILURE,
    GET_WORD_WEIGHTS_SUCCESS,
    GET_WORD_WEIGHTS_STARTED,
    ADD_WORD_WEIGHT_STARTED,
    ADD_WORD_WEIGHT_SUCCESS,
    ADD_WORD_WEIGHT_FAILURE,
    MODIFY_WORD_WEIGHT_STARTED,
    MODIFY_WORD_WEIGHT_SUCCESS,
    MODIFY_WORD_WEIGHT_FAILURE,
    DELETE_WORD_WEIGHT_FAILURE,
    DELETE_WORD_WEIGHT_STARTED,
    DELETE_WORD_WEIGHT_SUCCESS,
    CHANGE_WEIGHT_SORT
} from "../constants/weightConstants";
import _ from "lodash";

let initialState = {
    weightsList: [],
    loading: false,
    success: '',
    error: null,
    column: null,
    direction: null
};

export const weights = (state = initialState, action) => {
    switch (action.type) {
        case GET_WORD_WEIGHTS_STARTED:
        case ADD_WORD_WEIGHT_STARTED:
        case MODIFY_WORD_WEIGHT_STARTED:
        case DELETE_WORD_WEIGHT_STARTED:
            return {
                ...state,
                loading: true,
                success: '',
                error: null
            };
        case GET_WORD_WEIGHTS_SUCCESS:
            return {
                ...state,
                weightsList: action.response.data,
                loading: false,
                column: null,
                direction: null
            };
        case ADD_WORD_WEIGHT_SUCCESS:
            return {
                ...state,
                weightsList: state.weightsList.concat(action.response.data[0]),
                loading: false,
                success: "Word weight successfully added!"
            };
        case MODIFY_WORD_WEIGHT_SUCCESS:
            const updWeight = action.response.data[0];
            return {
                ...state,
                weightsList: state.weightsList.map((weight) => weight.key === updWeight.key ? updWeight : weight),
                loading: false,
                success: "Word weight successfully modified!"
            };
        case DELETE_WORD_WEIGHT_SUCCESS:
            return {
                ...state,
                weightsList: state.weightsList.filter((weight) => weight.key !== action.key),
                loading: false,
                success: "Word weight successfully deleted!"
            };
        case GET_WORD_WEIGHTS_FAILURE:
        case ADD_WORD_WEIGHT_FAILURE:
        case MODIFY_WORD_WEIGHT_FAILURE:
        case DELETE_WORD_WEIGHT_FAILURE:
            return {
                ...state,
                error: action.error,
                loading: false
            };
        case CHANGE_WEIGHT_SORT:
            if (state.column === action.column) {
                return {
                    ...state,
                    weightsList: state.weightsList.reverse(),
                    direction: (state.direction === 'ascending') ? 'descending' : 'ascending'
                }
            } else {
                return {
                    ...state,
                    column: action.column,
                    weightsList: _.sortBy(state.weightsList, [action.column]),
                    direction: 'ascending'
                }
            }
        default:
            return state;
    }
};