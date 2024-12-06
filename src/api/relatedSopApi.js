import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const createRelatedSop = (data) => postRequest('relatedsop', data);

export { createRelatedSop };
