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
import axios from "axios";
// TODO for sample data local testing instead of waiting Lambda containers to load ~5secs
// import SampleData from "../data/SampleDataResults2Pages";

export const getResultByIDStarted = () => {
  return {
    type: GET_RESULT_BY_ID_STARTED,
  };
};

export const getResultByIDSuccess = (response) => {
  return {
    type: GET_RESULT_BY_ID_SUCCESS,
    response,
  };
};

export const getResultByIDFailure = (error) => {
  return {
    type: GET_RESULT_BY_ID_FAILURE,
    error,
  };
};

export const getResultsByPageStarted = () => {
  return {
    type: GET_RESULTS_BY_PAGE_STARTED,
  };
};

export const getResultsByPageSuccess = (response) => {
  return {
    type: GET_RESULTS_BY_PAGE_SUCCESS,
    response,
  };
};

export const getResultsByPageFailure = (error) => {
  return {
    type: GET_RESULTS_BY_PAGE_FAILURE,
    error,
  };
};

export const getResultDataStarted = () => {
  return {
    type: GET_RESULT_DATA_STARTED,
  };
};

export const getResultDataSuccess = (response) => {
  return {
    type: GET_RESULT_DATA_SUCCESS,
    response,
  };
};

export const getResultDataFailure = (error) => {
  return {
    type: GET_RESULT_DATA_FAILURE,
    error,
  };
};

export const modifyResultStarted = () => {
  return {
    type: MODIFY_RESULT_STARTED,
  };
};

export const modifyResultSuccess = (response) => {
  return {
    type: MODIFY_RESULT_SUCCESS,
    response,
  };
};

export const modifyResultFailure = (error) => {
  return {
    type: MODIFY_RESULT_FAILURE,
    error,
  };
};

export const changeResultSort = (columnName) => {
  return {
    type: CHANGE_RESULT_SORT,
    column: columnName,
  };
};

export const getResultByID = (id) => {
  return (dispatch) => {
    dispatch(getResultByIDStarted());

    axios
      .post(`${process.env.REACT_APP_HTTP_API_URL}/results`, {
        operation: "GET",
        id: id,
      })
      .then((response) => {
        dispatch(getResultByIDSuccess(response.data));
      })
      .catch((e) => {
        dispatch(getResultByIDFailure(e));
      });
  };
};

export const getResultsByPage = (pageIndex) => {
  return (dispatch) => {
    dispatch(getResultsByPageStarted());

    // TODO for sample data local testing instead of waiting Lambda containers to load ~5secs
    // dispatch(getResultsByPageSuccess(SampleData));
    axios
      .post(`${process.env.REACT_APP_HTTP_API_URL}/results`, {
        operation: "GET",
        page: pageIndex,
      })
      .then((response) => {
        console.log(response.data);
        dispatch(getResultsByPageSuccess(response.data));
      })
      .catch((e) => {
        dispatch(getResultsByPageFailure(e));
      });
  };
};

export const getResultData = () => {
  return async (dispatch) => {
    dispatch(getResultDataStarted());

    let url = `${process.env.REACT_APP_HTTP_API_URL}/results`;
    // try {
    //   const response = await axios.get(url, {
    //     operation: "GET_DATA",
    //   });
    //   dispatch(getResultDataSuccess(response.data));
    // } catch (ex) {
    //   dispatch(getResultDataFailure(ex));
    // }
    axios
      .post(url, {
        operation: "GET_DATA",
      })
      .then((response) => {
        dispatch(getResultDataSuccess(response.data));
      })
      .catch((e) => {
        dispatch(getResultDataFailure(e));
      });
  };
};

export const modifyResult = (state) => {
  return (dispatch) => {
    dispatch(modifyResultStarted());
    console.log("modifyResult");
    console.log(state);

    axios
      .post(`${process.env.REACT_APP_HTTP_API_URL}/results`, {
        operation: "UPDATE_LABELLING",
        ...state,
      })
      .then((response) => {
        dispatch(modifyResultSuccess(response.data));
      })
      .catch((e) => {
        dispatch(modifyResultFailure(e));
      });
  };
};
