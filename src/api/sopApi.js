import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getSop = () => getRequest('sop');
const createSop = (data) => postRequest('sop', data);

const getOneSop = (idSop) => getRequest(`sop/${idSop}`);

const createSopDetail = (id, data) => postRequest(`sop/detail?id=${id}`, data);
const updateSopDetail = (id, data) => patchRequest(`sop/detail?id=${id}`, data);

const getAssignmentDetail = (id) => getRequest(`sop/assignment/${id}`);

const getSectionandWarning = (iddetail) => getRequest(`sop/info/${iddetail}`);

const createSopStep = (data) => postRequest('sop/step', data);
const getSopStep = (id) => getRequest(`sop/step?id=${id}`);
const updateSopStep = (id, data) => patchRequest(`sop/step?id=${id}`, data);
const deleteSopStep = (id) => deleteRequest(`sop/step?id=${id}`);

export {
    getSop, createSop, getOneSop,               //tabel sop
    createSopDetail, updateSopDetail, getAssignmentDetail, getSectionandWarning,       //tabel detail sop
    createSopStep, getSopStep, updateSopStep, deleteSopStep    //tabel sop step
};
