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
import _ from "lodash";

let initialState = {
    specialtyExamList: [],
    loading: false,
    success: '',
    error: null,
    column: null,
    direction: null
};

export const specialtyExam = (state = initialState, action) => {
    switch (action.type) {
        case GET_SPECIALTY_EXAMS_STARTED:
        case ADD_SPECIALTY_EXAM_STARTED:
        case DELETE_SPECIALTY_EXAM_STARTED:
            return {
                ...state,
                loading: true,
                success: '',
                error: null
            };
        case GET_SPECIALTY_EXAMS_SUCCESS:
            return {
                ...state,
                specialtyExamList: action.response.data,
                loading: false,
                column: null,
                direction: null
            };
        case ADD_SPECIALTY_EXAM_SUCCESS: 
            return {
                ...state,
                specialtyExamList: state.specialtyExamList.concat(action.response.data[0]),
                loading: false,
                success: "Specialty Exam Tag successfully added!"
            };
        case DELETE_SPECIALTY_EXAM_SUCCESS:
            return {
                ...state,
                specialtyExamList: state.specialtyExamList.filter((exam) => exam !== action.exam),
                loading: false,
                success: "Specialty Exam Tag successfully deleted!"
            };
        case GET_SPECIALTY_EXAMS_FAILURE:
        case ADD_SPECIALTY_EXAM_FAILURE:
        case DELETE_SPECIALTY_EXAM_FAILURE:
            return {
                ...state,
                error: action.error,
                loading: false
            };
        case CHANGE_SPECIALTY_EXAM_SORT:
            if (state.column === action.column) {
                return {
                    ...state,
                    specialtyExamList: state.specialtyExamList.reverse(),
                    direction: (state.direction === 'ascending') ? 'descending' : 'ascending'
                }
            } else {
                return {
                    ...state,
                    column: action.column,
                    specialtyExamList: _.sortBy(state.specialtyExamList),
                    direction: 'ascending'
                }
            }
        default: 
            return state;
    }
};

