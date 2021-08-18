import {
  GET_CONJUNCTIONS_FAILURE,
  GET_CONJUNCTIONS_STARTED,
  GET_CONJUNCTIONS_SUCCESS,
  ADD_CONJUNCTION_FAILURE,
  ADD_CONJUNCTION_STARTED,
  ADD_CONJUNCTION_SUCCESS,
  MODIFY_CONJUNCTION_FAILURE,
  MODIFY_CONJUNCTION_STARTED,
  MODIFY_CONJUNCTION_SUCCESS,
  DELETE_CONJUNCTION_FAILURE,
  DELETE_CONJUNCTION_STARTED,
  DELETE_CONJUNCTION_SUCCESS,
  CHANGE_CONJUNCTION_SORT,
} from "../constants/conjunctionConstants";
import _ from "lodash";

let initialState = {
  conjunctionsList: [],
  loading: false,
  success: "",
  error: null,
  column: null,
  direction: null,
};

export const conjunctions = (state = initialState, action) => {
  switch (action.type) {
    case GET_CONJUNCTIONS_STARTED:
    case ADD_CONJUNCTION_STARTED:
    case MODIFY_CONJUNCTION_STARTED:
    case DELETE_CONJUNCTION_STARTED:
      return {
        ...state,
        loading: true,
        success: "",
        error: null,
      };
    case GET_CONJUNCTIONS_SUCCESS:
      return {
        ...state,
        conjunctionsList: action.response.data,
        loading: false,
        column: null,
        direction: null,
      };
    case ADD_CONJUNCTION_SUCCESS:
      return {
        ...state,
        conjunctionsList: state.conjunctionsList.concat(
          action.response.data[0]
        ),
        loading: false,
        success: "Abbreviation successfully added!",
      };
    case MODIFY_CONJUNCTION_SUCCESS:
      console.log("MODIFY_CONJUNCTION_SUCCESS");
      const updConj = action.response.data[0];
      return {
        ...state,
        conjunctionsList: state.conjunctionsList.map((conjunction) =>
          conjunction.key === updConj.key || conjunction.key === updConj.old_key
            ? updConj
            : conjunction
        ),
        loading: false,
        success: "Abbreviation successfully modified!",
      };
    case DELETE_CONJUNCTION_SUCCESS:
      return {
        ...state,
        conjunctionsList: state.conjunctionsList.filter(
          (conjunction) => conjunction.key !== action.key
        ),
        loading: false,
        success: "Abbreviation successfully deleted!",
      };
    case GET_CONJUNCTIONS_FAILURE:
    case ADD_CONJUNCTION_FAILURE:
    case MODIFY_CONJUNCTION_FAILURE:
    case DELETE_CONJUNCTION_FAILURE:
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    case CHANGE_CONJUNCTION_SORT:
      if (state.column === action.column) {
        return {
          ...state,
          conjunctionsList: state.conjunctionsList.reverse(),
          direction:
            state.direction === "ascending" ? "descending" : "ascending",
        };
      } else {
        return {
          ...state,
          column: action.column,
          conjunctionsList: _.sortBy(state.conjunctionsList, [action.column]),
          direction: "ascending",
        };
      }
    default:
      return state;
  }
};
