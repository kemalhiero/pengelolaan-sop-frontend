import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const createRecord = (data) => postRequest('record', data);
const getSopRecord = (id) => getRequest(`record?id=${id}`);

export { createRecord, getSopRecord };
