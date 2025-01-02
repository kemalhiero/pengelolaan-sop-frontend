import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getDrafter = () => getRequest('user/drafter');
const loginUser = (data) => postRequest('user/login', data);
const registUser = (data) => postRequest('user/regist', data);
const logoutUser = (token) => postRequest('user/logout', null, token);

export { getDrafter, loginUser, registUser, logoutUser };
