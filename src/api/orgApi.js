import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getOrg = () => getRequest('org');
const createOrg = (data) => postRequest('org', data);
const updateOrg = (id, data) => patchRequest(`org?=${id}`, data);
const deleteOrg = (id) => deleteRequest(`org?=${id}`);

export { getOrg, createOrg, updateOrg, deleteOrg }
