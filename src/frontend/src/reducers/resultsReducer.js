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
  REQUEST_STATES,
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
        resultsList: state.resultsList.map((result) => {
          let ret = result;
          if (result.id === updResult.id) {
            result.state = updResult.state;
            if (updResult.state === REQUEST_STATES.STATE_ReceivedLabelled)
              result.state = REQUEST_STATES.STATE_ReceivedNewlyLabelled;
            if (result.history && result.history.length > 0) {
              const history = {
                history_type: updResult.history_type,
                description: updResult.description,
                mod_info: updResult.mod_info,
                cognito_user_fullname: updResult.cognito_user_fullname,
                date_created: updResult.date_created,
              };
              result.history.unshift(history);
            }
            ret = {
              ...result,
              labelled_rule_id: updResult.labelled_rule_id,
              labelled_priority: updResult.labelled_priority,
              labelled_contrast: updResult.labelled_contrast,
              labelled_notes: updResult.labelled_notes,
            };
          }
          return ret;
        }),
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
