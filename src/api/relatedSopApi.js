import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const createRelatedSop = (data) => postRequest('relatedsop', data);
const getRelatedSop = (id) => getRequest(`relatedsop?id=${id}`);

export { createRelatedSop, getRelatedSop };
