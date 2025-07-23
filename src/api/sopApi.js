import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getAllSop = () => getRequest('sop');
const createSop = (data) => postRequest('sop', data, getToken());
const getOneSop = (id) => getRequest(`sop/${id}`);
const updateSop = (id, data) => patchRequest(`sop/${id}`, data, getToken());
const deleteSop = (id) => deleteRequest(`sop/${id}`, getToken());

const getSopVersion = (id) => getRequest(`sop/version/${id}`);
const getLatestSopInYear = (year) => getRequest(`sop/latest/year/${year}`);

const createSopDetail = (id, data) => postRequest(`sop/detail/${id}`, data, getToken());
const updateSopDetail = (id, data) => patchRequest(`sop/detail/${id}`, data, getToken());
const deleteSopDetail = (id) => deleteRequest(`sop/detail/${id}`, getToken());

const saveSopDisplayConfig = (id, data) => patchRequest(`sop/detail/display/${id}`, data, getToken());
const getSopDisplayConfig = (id) => getRequest(`sop/detail/display/${id}`, getToken());
const clearSopDisplayConfig = (id, type) => patchRequest(`sop/detail/display/${id}/arrow?type=${type}`, null, getToken());

const getManagedSop = () => getRequest('sop/managed', getToken());

const getAssignment = () => getRequest('sop/assignment', getToken());
const getAssignmentDetail = (id) => getRequest(`sop/assignment/${id}`, getToken());

const getSectionandWarning = (iddetail) => getRequest(`sop/info/${iddetail}`, getToken());

const getSopStep = (id) => getRequest(`sop/step/${id}`);
const createSopStep = (data) => postRequest('sop/step', data, getToken());
const updateSopStep = (id, data) => patchRequest(`sop/step/${id}`, data, getToken());
const deleteSopStep = (id) => deleteRequest(`sop/step/${id}`, getToken());

const confirmSopandBpmn = (id) => patchRequest(`sop/confirm/${id}`, null, getToken());

export {
    getAllSop, createSop, getOneSop, updateSop, deleteSop,             //tabel sop
    createSopDetail, updateSopDetail, deleteSopDetail, getAssignment, getAssignmentDetail, 
    getSectionandWarning, getLatestSopInYear, getManagedSop, getSopVersion,      //tabel detail sop
    createSopStep, getSopStep, updateSopStep, deleteSopStep,    //tabel sop step
    confirmSopandBpmn, saveSopDisplayConfig, getSopDisplayConfig, clearSopDisplayConfig
};
