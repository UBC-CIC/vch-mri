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
import _ from "lodash";

let initialState = {
  synonymsList: [],
  loading: false,
  success: "",
  error: null,
  column: null,
  direction: null,
};

export const synonyms = (state = initialState, action) => {
  switch (action.type) {
    case GET_SYNONYMS_STARTED:
    case ADD_SYNONYM_STARTED:
    case MODIFY_SYNONYM_STARTED:
    case DELETE_SYNONYM_STARTED:
      return {
        ...state,
        loading: true,
        success: "",
        error: null,
      };
    case GET_SYNONYMS_SUCCESS:
      return {
        ...state,
        synonymsList: action.response.data,
        loading: false,
        column: null,
        direction: null,
      };
    case ADD_SYNONYM_SUCCESS:
      console.log("ADD_SYNONYM_SUCCESS");
      const addConj = action.response.data[0];
      console.log(addConj);
      return {
        ...state,
        synonymsList: state.synonymsList.concat(addConj),
        loading: false,
        success: "Synonym successfully added!",
      };
    case MODIFY_SYNONYM_SUCCESS:
      console.log("MODIFY_SYNONYM_SUCCESS");
      const updConj = action.response.data[0];
      console.log(updConj);
      return {
        ...state,
        synonymsList: state.synonymsList.map((synonym) =>
          synonym.key === updConj.key || synonym.key === updConj.old_key
            ? updConj
            : synonym
        ),
        loading: false,
        success: "Synonym successfully modified!",
      };
    case DELETE_SYNONYM_SUCCESS:
      return {
        ...state,
        synonymsList: state.synonymsList.filter(
          (synonym) => synonym.key !== action.key
        ),
        loading: false,
        success: "Synonym successfully deleted!",
      };
    case GET_SYNONYMS_FAILURE:
    case ADD_SYNONYM_FAILURE:
    case MODIFY_SYNONYM_FAILURE:
    case DELETE_SYNONYM_FAILURE:
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    case CHANGE_SYNONYM_SORT:
      if (state.column === action.column) {
        return {
          ...state,
          synonymsList: state.synonymsList.reverse(),
          direction:
            state.direction === "ascending" ? "descending" : "ascending",
        };
      } else {
        return {
          ...state,
          column: action.column,
          synonymsList: _.sortBy(state.synonymsList, [action.column]),
          direction: "ascending",
        };
      }
    default:
      return state;
  }
};
