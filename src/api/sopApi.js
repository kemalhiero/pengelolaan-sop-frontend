import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const createSop = (data) => postRequest('sop', data);

export {createSop};
