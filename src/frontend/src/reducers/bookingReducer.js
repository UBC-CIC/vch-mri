import {
    SEND_MRI_REQUEST_FAILURE,
    SEND_MRI_REQUEST_STARTED,
    SEND_MRI_REQUEST_SUCCESS
} from "../constants/bookingConstant";

let initialState = {
    bookingResults: {
        rule_id: "",
        priority: "",
        contrast: null,
        p5_flag: null,
        specialty_exams: null
    },
    context: null,
    submitted: false,
    loading: false,
    error: null
};

export const booking = (state = initialState, action) => {
    switch(action.type) {
        case SEND_MRI_REQUEST_STARTED:
            return {
                ...state,
                loading: true,
                success: '',
                error: null
            };
        case SEND_MRI_REQUEST_SUCCESS:
            return {
                ...state,
                bookingResults: {
                    ...action.response.result
                },
                context: action.response.context,
                submitted: true,
                loading: false,
            };
        case SEND_MRI_REQUEST_FAILURE:
            return {
                ...state,
                error: action.error,
                loading: false
            };
        default:
            return state;
    }
};