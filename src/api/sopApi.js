import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getSop = () => getRequest('sop');
const createSop = (data) => postRequest('sop', data);

const getOneSop = (idSop) => getRequest(`sop/${idSop}`);

const createSopDetail = (idSop, data) => postRequest(`sop/detail?id_sop=${idSop}`, data);

const getAssignmentDetail = (idsop) => getRequest(`sop/assignment/${idsop}`);

export { getSop, createSop, createSopDetail, getAssignmentDetail, getOneSop };
