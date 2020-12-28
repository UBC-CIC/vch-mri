import { combineReducers } from 'redux';
import {authentication} from './AuthenticationReducer';
import {booking} from './bookingReducer';
import {rules} from './rulesReducer';
import {weights} from "./weightsReducer";
import {spell} from "./spellcheckerReducer"
import {conjunctions} from "./conjunctionReducer";
import {synonyms} from "./synonymsReducer";
import {results} from "./resultsReducer";
import {specialtyExam} from "./specialtyExamReducer";

const rootReducer = combineReducers({
    authentication,
    booking,
    rules,
    results,
    weights,
    spell,
    conjunctions,
    synonyms,
    specialtyExam,
});

export default rootReducer;