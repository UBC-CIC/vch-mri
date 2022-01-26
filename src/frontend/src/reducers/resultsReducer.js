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
  GET_STATISTICS_STARTED,
  GET_STATISTICS_SUCCESS,
  GET_STATISTICS_FAILURE,
  GET_STATS_STARTED,
  GET_STATS_SUCCESS,
  GET_STATS_FAILURE,
  MODIFY_RESULT_FAILURE,
  MODIFY_RESULT_STARTED,
  MODIFY_RESULT_SUCCESS,
  REMOVE_FAILURE,
  REMOVE_SUCCESS,
  REMOVE_STARTED,
  AI_RERUN_STATUS_STARTED,
  AI_RERUN_STATUS_FAILURE,
  AI_RERUN_STATUS_SUCCESS,
  AI_RERUN_STARTED,
  AI_RERUN_SUCCESS,
  AI_RERUN_ALL_SUCCESS,
  AI_RERUN_FAILURE,
  CHANGE_RESULT_SORT,
  REQUEST_STATES,
  GET_LABELLED_RESULTS_BY_PAGE_FAILURE,
  GET_LABELLED_RESULTS_BY_PAGE_STARTED,
  GET_LABELLED_RESULTS_BY_PAGE_SUCCESS,
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
	case GET_LABELLED_RESULTS_BY_PAGE_STARTED:
    case GET_RESULT_DATA_STARTED:
    case GET_STATISTICS_STARTED:
	case GET_STATS_STARTED:
    case MODIFY_RESULT_STARTED:
    case AI_RERUN_STARTED:
    case REMOVE_STARTED:
    case AI_RERUN_STATUS_STARTED:
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
	case GET_LABELLED_RESULTS_BY_PAGE_SUCCESS:
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
    case GET_STATISTICS_SUCCESS:
      return {
        ...state,
        statistics: action.response.data,
        loading: false,
      };
	case GET_STATS_SUCCESS:
      return {
        ...state,
        statistics: action.response.data,
        loading: false,
      };
    case AI_RERUN_STATUS_SUCCESS:
      return {
        ...state,
        rerunAIHistory: action.response.data,
        loading: false,
      };
    case MODIFY_RESULT_SUCCESS:
      const updResult = action.response.data[0];
      console.log("MODIFY_RESULT_SUCCESS");
      console.log(updResult);
      return {
        ...state,
        resultsList: state.resultsList.map((result) => {
          let ret = result;
          if (result.id === updResult.id) {
            result.state = updResult.state;
            if (updResult.history && updResult.history.length > 0)
              result.history = updResult.history;
            if (updResult.state === REQUEST_STATES.STATE_ReceivedLabelled)
              result.state = REQUEST_STATES.STATE_ReceivedNewlyLabelled;
            if (
              updResult.history_type &&
              result.history &&
              result.history.length > 0
            ) {
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
              labelled_p5_flag: updResult.labelled_p5_flag,
              labelled_tags: updResult.labelled_tags,
            };
            console.log(ret);
          }
          return ret;
        }),
        loading: false,
        success: "MRI Result values have been successfully modified!",
      };
    case REMOVE_SUCCESS:
      const removeResult = action.response.data[0];
      console.log("REMOVE_SUCCESS");
      console.log(removeResult);
      return {
        ...state,
        resultsList: state.resultsList.map((result) => {
          if (result.id === removeResult.id) {
            if (removeResult.state === REQUEST_STATES.STATE_Deleted)
              result.state = REQUEST_STATES.STATE_NewlyDeleted;
            console.log(result);
          }
          return result;
        }),
        loading: false,
        success: "MRI request has been successfully removed!",
      };
    case AI_RERUN_SUCCESS:
      const rerunResult = action.response.data[0];
      console.log("AI_RERUN_SUCCESS");
      console.log(rerunResult);
      return {
        ...state,
        resultsList: state.resultsList.map((result) => {
          let ret = result;
          if (result.id === rerunResult.id) {
            if (rerunResult.state === REQUEST_STATES.STATE_ReceivedLabelled)
              rerunResult.state = REQUEST_STATES.STATE_ReceivedNewlyLabelled;
            ret = rerunResult;
            console.log(ret);
          }
          return ret;
        }),
        loading: false,
        success: "MRI AI Re-run has successfully completed!",
      };
    case AI_RERUN_ALL_SUCCESS:
      console.log("AI_RERUN_ALL_SUCCESS");
      console.log(action.response);
      //   console.log(action.response.data[0]);
      return {
        ...state,
        loading: false,
        success: `MRI AI Re-run ALL has completed!  ${action.response.processed} of ${action.response.total} succeeded`,
      };
    case GET_RESULT_BY_ID_FAILURE:
    case GET_RESULTS_BY_PAGE_FAILURE:
    case GET_RESULT_DATA_FAILURE:
	case GET_LABELLED_RESULTS_BY_PAGE_FAILURE:
    case GET_STATISTICS_FAILURE:
	case GET_STATS_FAILURE:
    case MODIFY_RESULT_FAILURE:
    case AI_RERUN_FAILURE:
    case REMOVE_FAILURE:
    case AI_RERUN_STATUS_FAILURE:
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
