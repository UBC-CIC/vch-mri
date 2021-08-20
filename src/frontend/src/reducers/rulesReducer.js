import {
  GET_MRI_RULES_FAILURE,
  GET_MRI_RULES_STARTED,
  GET_MRI_RULES_SUCCESS,
  GET_MRI_RULES_HISTORY_FAILURE,
  GET_MRI_RULES_HISTORY_STARTED,
  GET_MRI_RULES_HISTORY_SUCCESS,
  ADD_MRI_RULE_FAILURE,
  ADD_MRI_RULE_STARTED,
  ADD_MRI_RULE_SUCCESS,
  MODIFY_MRI_RULE_FAILURE,
  MODIFY_MRI_RULE_STARTED,
  MODIFY_MRI_RULE_SUCCESS,
  TOGGLE_ACTIVE_RULE_FAILURE,
  TOGGLE_ACTIVE_RULE_STARTED,
  TOGGLE_ACTIVE_RULE_SUCCESS,
  CHANGE_RULE_SORT,
  DELETE_MRI_RULE_STARTED,
  DELETE_MRI_RULE_FAILURE,
  DELETE_MRI_RULE_SUCCESS,
} from "../constants/rulesConstant";
import _ from "lodash";

let initialState = {
  rulesList: [],
  rulesHistoryList: [],
  rulesListDropdown: [],
  loading: false,
  success: "",
  error: null,
  column: null,
  direction: null,
};

export const rules = (state = initialState, action) => {
  switch (action.type) {
    case GET_MRI_RULES_STARTED:
    case ADD_MRI_RULE_STARTED:
    case MODIFY_MRI_RULE_STARTED:
    case TOGGLE_ACTIVE_RULE_STARTED:
    case DELETE_MRI_RULE_STARTED:
    case GET_MRI_RULES_HISTORY_STARTED:
      return {
        ...state,
        loading: true,
        success: "",
        error: null,
      };
    case GET_MRI_RULES_SUCCESS:
      const rulesList = action.response.data;
      //   console.log("GET_MRI_RULES_SUCCESS");
      //   console.log(rulesList);
      let rulesListDropdown = [];
      rulesList.forEach((element, index) => {
        rulesListDropdown.push({
          key: element.id,
          text: `${element.id}`,
          //   text: `${element.id} - ${element.body_part}`,
          value: element.id,
          priority: element.priority,
          contrast: element.contrast,
        });
      });
      return {
        ...state,
        rulesListDropdown: rulesListDropdown,
        rulesList: action.response.data,
        loading: false,
        column: null,
        direction: null,
      };
    case GET_MRI_RULES_HISTORY_SUCCESS:
      const rulesHistoryList = action.response.data;
      return {
        ...state,
        rulesHistoryList: rulesHistoryList,
        loading: false,
        column: null,
        direction: null,
      };
    case ADD_MRI_RULE_SUCCESS:
      return {
        ...state,
        rulesList: state.rulesList.concat(action.response.data[0]),
        loading: false,
        success: "Rule successfully added!",
      };
    case MODIFY_MRI_RULE_SUCCESS:
      const updRule = action.response.data[0];
      return {
        ...state,
        rulesList: state.rulesList.map((rule) =>
          rule.id === updRule.id ? updRule : rule
        ),
        loading: false,
        success: "Rule successfully modified!",
      };
    case TOGGLE_ACTIVE_RULE_SUCCESS:
      return {
        ...state,
        rulesList: state.rulesList.map((rule) =>
          rule.id === action.id
            ? {
                ...rule,
                active: action.active,
              }
            : rule
        ),
        loading: false,
        success: "Rule successfully toggled!",
      };
    case DELETE_MRI_RULE_SUCCESS:
      return {
        ...state,
        rulesList: state.rulesList.filter((rule) => rule.id !== action.id),
        loading: false,
        success: "Rule successfully deleted!",
      };
    case GET_MRI_RULES_FAILURE:
    case ADD_MRI_RULE_FAILURE:
    case MODIFY_MRI_RULE_FAILURE:
    case TOGGLE_ACTIVE_RULE_FAILURE:
    case DELETE_MRI_RULE_FAILURE:
    case GET_MRI_RULES_HISTORY_FAILURE:
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    case CHANGE_RULE_SORT:
      if (state.column === action.column) {
        return {
          ...state,
          rulesList: state.rulesList.reverse(),
          direction:
            state.direction === "ascending" ? "descending" : "ascending",
        };
      } else {
        return {
          ...state,
          column: action.column,
          rulesList: _.sortBy(state.rulesList, [action.column]),
          direction: "ascending",
        };
      }
    default:
      return state;
  }
};
