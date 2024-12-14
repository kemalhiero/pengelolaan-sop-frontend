import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const createRelatedSop = (data) => postRequest('relatedsop', data);
const getRelatedSop = (id) => getRequest(`relatedsop?id=${id}`);
const deleteRelatedSop = (id) => deleteRequest(`relatedsop?id=${id}`);

export { createRelatedSop, getRelatedSop, deleteRelatedSop };
