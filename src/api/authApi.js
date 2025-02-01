import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const loginUser = (data) => postRequest('auth/login', data);
const registUser = (data) => postRequest('auth/regist', data);
const logoutUser = () => postRequest('auth/logout', null, getToken());

const forgetPw = (data) => postRequest('auth/forget-pw', data);
const resetPw = (data) => postRequest('auth/reset-pw', data);
const updatePw = (data) => postRequest('auth/update-pw', data, getToken());

const sendCode = (data) => postRequest('auth/send-code', data, getToken());
const verifCode = (data) => postRequest('auth/verify-code', data, getToken());
const updateEmail = (data) => postRequest('auth/update-email', data, getToken());

export { 
    loginUser, registUser, logoutUser, 
    forgetPw, resetPw, updatePw,
    sendCode, verifCode, updateEmail
};
