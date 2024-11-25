import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const createSopDetail = (idSop, data) => postRequest(`sopdetail?id_sop=${idSop}`, data);

export {createSopDetail};
