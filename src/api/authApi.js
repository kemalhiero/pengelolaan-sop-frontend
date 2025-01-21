import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const loginUser = (data) => postRequest('auth/login', data);
const registUser = (data) => postRequest('auth/regist', data);
const logoutUser = () => postRequest('auth/logout', null, getToken());

const forgetPw = (data) => postRequest('auth/forget-pw', data);
const resetPw = (data) => postRequest('auth/reset-pw', data);

export { loginUser, registUser, logoutUser, forgetPw, resetPw };
