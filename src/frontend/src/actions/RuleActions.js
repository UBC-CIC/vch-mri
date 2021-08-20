import axios from "axios";
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
} from "../constants/rulesConstant";
// TODO for sample data local testing instead of waiting Lambda containers to load ~5secs
// import SampleData from "../data/SampleDataRules";

export const getMRIRulesStarted = () => {
  return {
    type: GET_MRI_RULES_STARTED,
  };
};

export const getMRIRulesSuccess = (response) => {
  return {
    type: GET_MRI_RULES_SUCCESS,
    response,
  };
};

export const getMRIRulesFailure = (error) => {
  return {
    type: GET_MRI_RULES_FAILURE,
    error,
  };
};

export const getMRIRulesHistoryStarted = () => {
  return {
    type: GET_MRI_RULES_HISTORY_STARTED,
  };
};

export const getMRIRulesHistorySuccess = (response) => {
  return {
    type: GET_MRI_RULES_HISTORY_SUCCESS,
    response,
  };
};

export const getMRIRulesHistoryFailure = (error) => {
  return {
    type: GET_MRI_RULES_HISTORY_FAILURE,
    error,
  };
};

export const addMRIRuleStarted = () => {
  return {
    type: ADD_MRI_RULE_STARTED,
  };
};

export const addMRIRuleSuccess = (response) => {
  return {
    type: ADD_MRI_RULE_SUCCESS,
    response,
  };
};

export const addMRIRuleFailure = (error) => {
  return {
    type: ADD_MRI_RULE_FAILURE,
    error,
  };
};

export const modifyMRIRuleStarted = () => {
  return {
    type: MODIFY_MRI_RULE_STARTED,
  };
};

export const modifyMRIRuleSuccess = (response) => {
  return {
    type: MODIFY_MRI_RULE_SUCCESS,
    response,
  };
};

export const modifyMRIRuleFailure = (error) => {
  return {
    type: MODIFY_MRI_RULE_FAILURE,
    error,
  };
};

export const toggleActiveRuleStarted = () => {
  return {
    type: TOGGLE_ACTIVE_RULE_STARTED,
  };
};

export const toggleActiveRuleSuccess = (state) => {
  return {
    type: TOGGLE_ACTIVE_RULE_SUCCESS,
    ...state,
  };
};

export const toggleActiveRuleFailure = (error) => {
  return {
    type: TOGGLE_ACTIVE_RULE_FAILURE,
    error,
  };
};

export const getMRIRules = () => {
  return (dispatch) => {
    console.log("getMRIRules");
    dispatch(getMRIRulesStarted());

    // TODO for sample data local testing instead of waiting Lambda containers to load ~5secs
    // dispatch(getMRIRulesSuccess(SampleData));
    axios
      .post(`${process.env.REACT_APP_HTTP_API_URL}/rules`, {
        operation: "GET",
        count: -1,
      })
      .then((response) => {
        dispatch(getMRIRulesSuccess(response.data));
      })
      .catch((e) => {
        dispatch(getMRIRulesFailure(e));
      });
  };
};

export const getMRIRulesHistory = () => {
  return (dispatch) => {
    console.log("getMRIRulesHistory");
    dispatch(getMRIRulesHistoryStarted());

    // TODO for sample data local testing instead of waiting Lambda containers to load ~5secs
    // dispatch(getMRIRulesSuccess(SampleData));
    axios
      .post(`${process.env.REACT_APP_HTTP_API_URL}/rules`, {
        operation: "GET_HISTORY",
        count: -1,
      })
      .then((response) => {
        dispatch(getMRIRulesHistorySuccess(response.data));
      })
      .catch((e) => {
        dispatch(getMRIRulesHistoryFailure(e));
      });
  };
};

export const addMRIRule = (
  state,
  cognito_user_id = "",
  cognito_user_fullname = ""
) => {
  return (dispatch) => {
    dispatch(addMRIRuleStarted());

    axios
      .post(`${process.env.REACT_APP_HTTP_API_URL}/rules`, {
        operation: "ADD",
        values: [state],
        cognito_user_fullname,
        cognito_user_id,
      })
      .then((response) => {
        dispatch(addMRIRuleSuccess(response.data));
      })
      .catch((e) => {
        dispatch(addMRIRuleFailure(e));
      });
  };
};

export const modifyMRIRule = (
  state,
  cognito_user_id = "",
  cognito_user_fullname = ""
) => {
  return (dispatch) => {
    dispatch(modifyMRIRuleStarted());

    axios
      .post(`${process.env.REACT_APP_HTTP_API_URL}/rules`, {
        operation: "UPDATE",
        values: [state],
        cognito_user_fullname,
        cognito_user_id,
      })
      .then((response) => {
        dispatch(modifyMRIRuleSuccess(response.data));
      })
      .catch((e) => {
        dispatch(modifyMRIRuleFailure(e));
      });
  };
};

export const toggleMRIRule = (
  state,
  cognito_user_id = "",
  cognito_user_fullname = ""
) => {
  return (dispatch) => {
    dispatch(toggleActiveRuleStarted());

    axios
      .post(`${process.env.REACT_APP_HTTP_API_URL}/rules`, {
        operation: state.active ? "ACTIVATE" : "DEACTIVATE",
        id: state.id,
        cognito_user_fullname,
        cognito_user_id,
      })
      .then((response) => {
        dispatch(toggleActiveRuleSuccess(state));
      })
      .catch((e) => {
        dispatch(toggleActiveRuleFailure(e));
      });
  };
};

export const changeRuleSort = (columnName) => {
  return {
    type: CHANGE_RULE_SORT,
    column: columnName,
  };
};
