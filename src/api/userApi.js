import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getDrafter = () => getRequest('user/drafter');
const loginUser = (data) => postRequest('user/login', data);
const registUser = (data) => postRequest('user/regist', data);
const logoutUser = (data) => postRequest('user/logout', data);      //TODO buat manual aja, karena dia ngirimin header tersendiri

export { getDrafter, loginUser, registUser, logoutUser };
