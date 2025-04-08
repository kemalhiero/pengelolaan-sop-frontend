import getToken from "@/utils/getToken";
import { postRequest } from "./apiClient";

const loginUser = (data) => postRequest('auth/login', data);
const registUser = (data) => postRequest('auth/regist', data);
const logoutUser = () => postRequest('auth/logout', null, getToken());

const forgetPw = (data) => postRequest('auth/password/forgot', data);
const resetPw = (data) => postRequest('auth/password/reset', data);
const updatePw = (data) => postRequest('auth/password/update', data, getToken());

const sendCode = (data) => postRequest('auth/send-code', data, getToken());
const verifCode = (data) => postRequest('auth/verify-code', data, getToken());
const updateEmail = (data) => postRequest('auth/update-email', data, getToken());

export { 
    loginUser, registUser, logoutUser, 
    forgetPw, resetPw, updatePw,
    sendCode, verifCode, updateEmail
};
