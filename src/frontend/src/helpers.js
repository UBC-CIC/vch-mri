import { toast } from 'react-semantic-toasts';
import jwt_decode from 'jwt-decode';

export function sendErrorToast(message) {
    setTimeout(() => {
        toast({
            type: 'error',
            title: 'Error',
            animation: 'fade',
            description: message,
            time: 5000,
        });
    }, 1000);
}

export function sendSuccessToast(message) {
    setTimeout(() => {
        toast({
            type: 'success',
            title: 'Success',
            animation: 'fade',
            description: message,
            time: 5000,
        });
    }, 1000);
}

export const validateToken = (token) => {
    if (!token) {
        return false;
    }
    try {
        const decodedJwt = jwt_decode(token);
        return decodedJwt.exp >= Date.now() / 1000;
    } catch (e) {
        return false;
    }
};