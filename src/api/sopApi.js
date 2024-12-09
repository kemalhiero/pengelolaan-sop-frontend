import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getSop = () => getRequest('sop');
const createSop = (data) => postRequest('sop', data);

const getOneSop = (idSop) => getRequest(`sop/${idSop}`);

const createSopDetail = (id, data) => postRequest(`sop/detail?id=${id}`, data);
const updateSopDetail = (id, data) => patchRequest(`sop/detail?id=${id}`, data);

const getAssignmentDetail = (id) => getRequest(`sop/assignment/${id}`);

const getSectionandWarning = (iddetail) => getRequest(`sop/info/${iddetail}`);

export { getSop, createSop, createSopDetail, updateSopDetail, getAssignmentDetail, getOneSop, getSectionandWarning };
