import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const loginUser = (data) => postRequest('user/login', data);
const registUser = (data) => postRequest('user/regist', data);
const logoutUser = () => postRequest('user/logout', null, getToken());

export { loginUser, registUser, logoutUser };
