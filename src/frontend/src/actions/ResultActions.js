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
  MODIFY_RESULT_FAILURE,
  MODIFY_RESULT_STARTED,
  MODIFY_RESULT_SUCCESS,
  AI_RERUN_STARTED,
  AI_RERUN_SUCCESS,
  AI_RERUN_FAILURE,
  CHANGE_RESULT_SORT,
} from "../constants/resultConstants";
import axios from "axios";
// TODO for sample data local testing instead of waiting Lambda containers to load ~5secs
// import SampleData from "../data/SampleDataResults2Pages";
// import SampleDataStatistics from "../data/SampleDataStatistics";

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

// GET_STATISTICS
export const getStatisticsStarted = () => {
  return {
    type: GET_STATISTICS_STARTED,
  };
};

export const getStatisticsSuccess = (response) => {
  return {
    type: GET_STATISTICS_SUCCESS,
    response,
  };
};

export const getStatisticsFailure = (error) => {
  return {
    type: GET_STATISTICS_FAILURE,
    error,
  };
};

// MODIFY_RESULT
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

// AI_RERUN
export const aiRerunStarted = () => {
  return {
    type: AI_RERUN_STARTED,
  };
};

export const aiRerunSuccess = (response) => {
  return {
    type: AI_RERUN_SUCCESS,
    response,
  };
};

export const aiRerunFailure = (error) => {
  return {
    type: AI_RERUN_FAILURE,
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
    console.log("getResultsByPage");
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

export const getStatistics = (startDate, endDate) => {
  return async (dispatch) => {
    dispatch(getStatisticsStarted());

    // dispatch(getStatisticsSuccess(SampleDataStatistics));
    let url = `${process.env.REACT_APP_HTTP_API_URL}/results`;
    axios
      .post(url, {
        operation: "GET_STATISTICS",
        start_date: startDate,
        end_date: endDate,
      })
      .then((response) => {
        dispatch(getStatisticsSuccess(response.data));
      })
      .catch((e) => {
        dispatch(getStatisticsFailure(e));
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

export const rerunAI = (reqId) => {
  return async (dispatch) => {
    dispatch(aiRerunStarted());
    console.log("rerunAI");
    console.log(reqId);

    try {
      // Re-run AI for one result
      await axios.post(`${process.env.REACT_APP_HTTP_API_URL}/parser`, {
        operation: "RERUN_ONE",
        CIO_ID: reqId,
      });

      // Get latest info for result - history and new AI result
      const response = await axios.post(
        `${process.env.REACT_APP_HTTP_API_URL}/results`,
        {
          operation: "GET",
          id: reqId,
        }
      );
      console.log("rerunAI 2");
      console.log(response.data);
      dispatch(aiRerunSuccess(response.data));
    } catch (ex) {
      dispatch(aiRerunFailure(ex));
    }
    // axios
    //   .post(`${process.env.REACT_APP_HTTP_API_URL}/parser`, {
    //     operation: "RERUN_ONE",
    //     CIO_ID: reqId
    //   })
    //   .then((response) => {
    //     dispatch(modifyResultSuccess(response.data));
    //   })
    //   .catch((e) => {
    //     dispatch(modifyResultFailure(e));
    //   });
  };
};
