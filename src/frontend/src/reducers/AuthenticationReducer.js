import { userConstants } from '../constants/userConstant';
import { AUTH_USER_ACCESS_TOKEN_KEY, AUTH_USER_ID_TOKEN_KEY } from "../constants/userConstant";
import { Cache } from 'aws-amplify';

//let user = JSON.parse(Cache.getItem(AUTH_USER_ACCESS_TOKEN_KEY));
const initialState = { loggedIn: false, user: {}, error: "" };

export const authentication = (state = initialState, action) => {
    switch (action.type) {
        case userConstants.LOGIN_SUCCESS:
            return {
                ...state,
                loggedIn: true,
                user: {
                    name: action.name,
                    email: action.email
                },
                error: ""
            };
        case userConstants.LOGIN_FAILURE:
            return {
                ...state,
                loggedIn: false,
                error: action.error
            };
        case userConstants.LOGOUT:
            return {
                ...state,
                loggedIn: false,
                user: {},
            };
        case userConstants.GET_USER_INFO:
            let storedUser = JSON.parse(Cache.getItem(AUTH_USER_ID_TOKEN_KEY));
            return {
                ...state,
                user: {
                    name: storedUser.name,
                    email: storedUser.email
                },
            };
        default:
            return state
    }
};