import { AUTH_USER_ID_TOKEN_KEY } from "../constants/userConstant";
import { Cache } from "aws-amplify";
import jwt_decode from "jwt-decode";

export function getCognitoUser() {
  const storedUser = jwt_decode(Cache.getItem(AUTH_USER_ID_TOKEN_KEY));
  return {
    userID: storedUser.sub,
    userName: storedUser.name.trim(),
  };
}
