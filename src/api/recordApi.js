import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const createRecord = (data) => postRequest('record', data);

export { createRecord };
