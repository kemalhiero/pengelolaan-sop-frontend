import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getOrg = () => getRequest('org', getToken());
const createOrg = (data) => postRequest('org', data, getToken());
const updateOrg = (id, data) => patchRequest(`org/${id}`, data, getToken());
const deleteOrg = (id) => deleteRequest(`org/${id}`, getToken());

export { getOrg, createOrg, updateOrg, deleteOrg };
