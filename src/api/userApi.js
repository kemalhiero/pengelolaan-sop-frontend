import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getEmploye = () => getRequest('user/employe');

export { getEmploye };
