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
  CHANGE_RESULT_SORT,
} from "../constants/resultConstants";
import _ from "lodash";

let initialState = {
  resultsList: [],
  info: {
    daily: "",
    weekly: "",
    monthly: "",
  },
  totalPages: null,
  loading: false,
  success: "",
  error: null,
  column: null,
  direction: null,
};

export const results = (state = initialState, action) => {
  switch (action.type) {
    case GET_RESULT_BY_ID_STARTED:
    case GET_RESULTS_BY_PAGE_STARTED:
    case GET_RESULT_DATA_STARTED:
    case MODIFY_RESULT_STARTED:
      return {
        ...state,
        loading: true,
        success: "",
        error: null,
      };
    case GET_RESULT_BY_ID_SUCCESS:
      return {
        ...state,
        resultsList: action.response.data,
        loading: false,
        column: null,
        direction: null,
      };
    case GET_RESULTS_BY_PAGE_SUCCESS:
      return {
        ...state,
        resultsList: action.response.data,
        totalPages: action.response.total_pgs,
        loading: false,
        column: "updated_at",
        direction: "descending",
      };
    case GET_RESULT_DATA_SUCCESS:
      return {
        ...state,
        info: action.response.data[0],
        loading: false,
      };
    case MODIFY_RESULT_SUCCESS:
      const updResult = action.response.data[0];
      return {
        ...state,
        resultsList: state.resultsList.map((result) =>
          result.id === updResult.id
            ? {
                ...result,
                phys_priority: updResult.phys_priority,
                phys_contrast: updResult.phys_contrast,
              }
            : result
        ),
        loading: false,
        success: "MRI Result values have been successfully modified!",
      };
    case GET_RESULT_BY_ID_FAILURE:
    case GET_RESULTS_BY_PAGE_FAILURE:
    case GET_RESULT_DATA_FAILURE:
    case MODIFY_RESULT_FAILURE:
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    case CHANGE_RESULT_SORT:
      if (state.column === action.column) {
        return {
          ...state,
          resultsList: state.resultsList.reverse(),
          direction:
            state.direction === "ascending" ? "descending" : "ascending",
        };
      } else {
        return {
          ...state,
          column: action.column,
          resultsList: _.sortBy(state.resultsList, [action.column]),
          direction: "ascending",
        };
      }
    default:
      return state;
  }
};
