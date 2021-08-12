import {Storage} from "@aws-amplify/storage";
import {
    CHANGE_SYNONYM_SORT,
    GET_SYNONYMS_FAILURE,
    GET_SYNONYMS_STARTED,
    GET_SYNONYMS_SUCCESS,
    ADD_SYNONYM,
    MODIFY_SYNONYM,
    DELETE_SYNONYM
} from "../constants/synonymsConstants";

export const getSynonymsStarted = () => {
    return {
        type: GET_SYNONYMS_STARTED
    };
};

export const getSynonymsSuccess = (response) => {
    return {
        type: GET_SYNONYMS_SUCCESS,
        response
    };
};

export const getSynonymsFailure = (error) => {
    return {
        type: GET_SYNONYMS_FAILURE,
        error
    };
};

export const getSynonyms = () => {
    return dispatch => {
        dispatch(getSynonymsStarted());

        Storage.get('thesaurus_medical.ths', {
            download: true,
            cacheControl: 'no-cache'
        })
            .then(data => {
                data.Body.text().then(string => {
                    let synonymStrings = string.split(/[\r\n]+/);
                    let synonyms = synonymStrings.map((s) => {
                        let words = s.split(' : ');
                        return {word: words[0], synonymList: words[1].split(' / ')}
                    });
                    dispatch(getSynonymsSuccess(synonyms));
                });
            })
            .catch(e => {
                dispatch(getSynonymsFailure(e));
            });
    }
};

export const addSynonym = (synonym) => {
    return {
        type: ADD_SYNONYM,
        synonym
    }
};

export const modifySynonym = (state) => {
    return {
        type: MODIFY_SYNONYM,
        ...state
    }
};

export const deleteSynonym = (index) => {
    return {
        type: DELETE_SYNONYM,
        index
    }
};

export const changeSynonymSort = (columnName) => {
    return {
        type: CHANGE_SYNONYM_SORT,
        column: columnName
    }
};