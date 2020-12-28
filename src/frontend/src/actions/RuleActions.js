import axios from "axios";
import {
    GET_MRI_RULES_FAILURE,
    GET_MRI_RULES_STARTED,
    GET_MRI_RULES_SUCCESS,
    ADD_MRI_RULE_FAILURE,
    ADD_MRI_RULE_STARTED,
    ADD_MRI_RULE_SUCCESS,
    MODIFY_MRI_RULE_FAILURE,
    MODIFY_MRI_RULE_STARTED,
    MODIFY_MRI_RULE_SUCCESS,
    TOGGLE_ACTIVE_RULE_FAILURE,
    TOGGLE_ACTIVE_RULE_STARTED,
    TOGGLE_ACTIVE_RULE_SUCCESS,
    CHANGE_RULE_SORT
} from "../constants/rulesConstant";


export const getMRIRulesStarted = () => {
    return {
        type: GET_MRI_RULES_STARTED
    };
};

export const getMRIRulesSuccess = (response) => {
    return {
        type: GET_MRI_RULES_SUCCESS,
        response
    };
};

export const getMRIRulesFailure = (error) => {
    return {
        type: GET_MRI_RULES_FAILURE,
        error
    };
};

export const addMRIRuleStarted = () => {
    return {
        type: ADD_MRI_RULE_STARTED
    };
};

export const addMRIRuleSuccess = (response) => {
    return {
        type: ADD_MRI_RULE_SUCCESS,
        response
    };
};

export const addMRIRuleFailure = (error) => {
    return {
        type: ADD_MRI_RULE_FAILURE,
        error
    };
};

export const modifyMRIRuleStarted = () => {
    return {
        type: MODIFY_MRI_RULE_STARTED
    };
};

export const modifyMRIRuleSuccess = (response) => {
    return {
        type: MODIFY_MRI_RULE_SUCCESS,
        response
    };
};

export const modifyMRIRuleFailure = (error) => {
    return {
        type: MODIFY_MRI_RULE_FAILURE,
        error
    };
};

export const toggleActiveRuleStarted = () => {
    return {
        type: TOGGLE_ACTIVE_RULE_STARTED
    };
};

export const toggleActiveRuleSuccess = (state) => {
    return {
        type: TOGGLE_ACTIVE_RULE_SUCCESS,
        ...state
    };
};

export const toggleActiveRuleFailure = (error) => {
    return {
        type: TOGGLE_ACTIVE_RULE_FAILURE,
        error
    };
};

export const getMRIRules = () => {
    return dispatch => {
        dispatch(getMRIRulesStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/rules`, {
            "operation": "GET",
            "count": -1
        })
            .then(response => {
                dispatch(getMRIRulesSuccess(response.data));
            })
            .catch(e => {
                dispatch(getMRIRulesFailure(e));
            });
    }
};

export const addMRIRule = (state) => {
    return dispatch => {
        dispatch(addMRIRuleStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/rules`, {
            "operation": "ADD",
            "values": [ state ]
        })
            .then(response => {
                dispatch(addMRIRuleSuccess(response.data));
            })
            .catch(e => {
                dispatch(addMRIRuleFailure(e));
            });
    }
};

export const modifyMRIRule = (state) => {
    return dispatch => {
        dispatch(modifyMRIRuleStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/rules`, {
            "operation": "UPDATE",
            "values": [ state ]
        })
            .then(response => {
                dispatch(modifyMRIRuleSuccess(response.data));
            })
            .catch(e => {
                dispatch(modifyMRIRuleFailure(e));
            });
    }
};

export const toggleMRIRule = (state) => {
    return dispatch => {
        dispatch(toggleActiveRuleStarted());

        axios.post(`${process.env.REACT_APP_HTTP_API_URL}/rules`, {
            "operation": (state.active ? "ACTIVATE" : "DEACTIVATE"),
            "id": state.id
        })
            .then(response => {
                dispatch(toggleActiveRuleSuccess(state));
            })
            .catch(e => {
                dispatch(toggleActiveRuleFailure(e));
            });
    }
};

export const changeRuleSort = (columnName) => {
    return {
        type: CHANGE_RULE_SORT,
        column: columnName
    }
};