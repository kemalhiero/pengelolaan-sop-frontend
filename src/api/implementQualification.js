import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const createIQ = (data) => postRequest('iq', data);
const getIQ = (id) => getRequest(`iq?id=${id}`);

export { createIQ, getIQ };
