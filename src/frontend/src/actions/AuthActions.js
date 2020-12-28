import {userConstants} from "../constants/userConstant";
import { Cache } from 'aws-amplify';

export const loginSuccess = (user) => {
    return {
        type: userConstants.LOGIN_SUCCESS,
        name: user.attributes.name,
        email: user.attributes.email
    }
};

export const getUserInfo = () => {
    return {
        type: userConstants.GET_USER_INFO
    }
};

export const loginFailure = (error) => {
    return {
        type: userConstants.LOGIN_FAILURE,
        error
    }
};

export const logout = () => {
    return {
        type: userConstants.LOGOUT
    }
};

// export const login = (state) => {
//     return dispatch => {
//         dispatch(loginRequested());
//
//         Auth.signIn(state.email, state.password)
//             .then(user => {
//                 const token = user.signInUserSession.accessToken.jwtToken;
//                 Cache.setItem(AUTH_USER_ACCESS_TOKEN_KEY, token);
//                 dispatch(loginSuccess(user));
//             })
//             .catch(e => {
//                 dispatch(loginFailure(e));
//             });
//     }
// };