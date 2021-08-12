import axios from "axios";
import {
  GET_SYNONYMS_FAILURE,
  GET_SYNONYMS_STARTED,
  GET_SYNONYMS_SUCCESS,
  ADD_SYNONYM_FAILURE,
  ADD_SYNONYM_STARTED,
  ADD_SYNONYM_SUCCESS,
  MODIFY_SYNONYM_FAILURE,
  MODIFY_SYNONYM_STARTED,
  MODIFY_SYNONYM_SUCCESS,
  DELETE_SYNONYM_FAILURE,
  DELETE_SYNONYM_STARTED,
  DELETE_SYNONYM_SUCCESS,
  CHANGE_SYNONYM_SORT,
} from "../constants/synonymsConstants";

export const getSynonymsStarted = () => {
  return {
    type: GET_SYNONYMS_STARTED,
  };
};

export const getSynonymsSuccess = (response) => {
  return {
    type: GET_SYNONYMS_SUCCESS,
    response,
  };
};

export const getSynonymsFailure = (error) => {
  return {
    type: GET_SYNONYMS_FAILURE,
    error,
  };
};

export const addSynonymStarted = () => {
  return {
    type: ADD_SYNONYM_STARTED,
  };
};

export const addSynonymSuccess = (response) => {
  return {
    type: ADD_SYNONYM_SUCCESS,
    response,
  };
};

export const addSynonymFailure = (error) => {
  return {
    type: ADD_SYNONYM_FAILURE,
    error,
  };
};

export const modifySynonymStarted = () => {
  return {
    type: MODIFY_SYNONYM_STARTED,
  };
};

export const modifySynonymSuccess = (response) => {
  return {
    type: MODIFY_SYNONYM_SUCCESS,
    response,
  };
};

export const modifySynonymFailure = (error) => {
  return {
    type: MODIFY_SYNONYM_FAILURE,
    error,
  };
};

export const deleteSynonymStarted = () => {
  return {
    type: DELETE_SYNONYM_STARTED,
  };
};

export const deleteSynonymSuccess = (key) => {
  return {
    type: DELETE_SYNONYM_SUCCESS,
    key,
  };
};

export const deleteSynonymFailure = (error) => {
  return {
    type: DELETE_SYNONYM_FAILURE,
    error,
  };
};

export const getSynonyms = () => {
  return (dispatch) => {
    dispatch(getSynonymsStarted());

    axios
      .post(`${process.env.REACT_APP_HTTP_API_URL}/synonyms`, {
        operation: "GET",
      })
      .then((response) => {
        dispatch(getSynonymsSuccess(response.data));
      })
      .catch((e) => {
        dispatch(getSynonymsFailure(e));
      });
  };
};

export const addSynonym = (state) => {
  return (dispatch) => {
    dispatch(addSynonymStarted());

    axios
      .post(`${process.env.REACT_APP_HTTP_API_URL}/synonyms`, {
        operation: "ADD",
        values: [state],
      })
      .then((response) => {
        dispatch(addSynonymSuccess(response.data));
      })
      .catch((e) => {
        dispatch(addSynonymFailure(e));
      });
  };
};

export const modifySynonym = (state) => {
  return (dispatch) => {
    dispatch(modifySynonymStarted());

    axios
      .post(`${process.env.REACT_APP_HTTP_API_URL}/synonyms`, {
        operation: "UPDATE",
        values: [state],
      })
      .then((response) => {
        dispatch(modifySynonymSuccess(response.data));
      })
      .catch((e) => {
        dispatch(modifySynonymFailure(e));
      });
  };
};

export const deleteSynonym = (key) => {
  console.log(`deleteSynonym key: ${key}`);
  return (dispatch) => {
    dispatch(deleteSynonymStarted());

    axios
      .post(`${process.env.REACT_APP_HTTP_API_URL}/synonyms`, {
        operation: "DELETE",
        id: key,
      })
      .then((response) => {
        dispatch(deleteSynonymSuccess(key));
      })
      .catch((e) => {
        dispatch(deleteSynonymFailure(e));
      });
  };
};

export const changeSynonymSort = (columnName) => {
  return {
    type: CHANGE_SYNONYM_SORT,
    column: columnName,
  };
};
