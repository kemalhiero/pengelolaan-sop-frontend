import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const createIQ = (data) => postRequest('iq', data);

export {createIQ};
