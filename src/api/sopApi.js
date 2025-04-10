import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getAllSop = () => getRequest('sop');
const createSop = (data) => postRequest('sop', data, getToken());

const getOneSop = (idSop) => getRequest(`sop/${idSop}`);
const getSopVersion = (id) => getRequest(`sop/version/${id}`);
const getLatestSopInYear = (year) => getRequest(`sop/latest/year/${year}`);

const createSopDetail = (id, data) => postRequest(`sop/detail/${id}`, data, getToken());
const updateSopDetail = (id, data) => patchRequest(`sop/detail/${id}`, data, getToken());
const deleteSopDetail = (id) => deleteRequest(`sop/detail/${id}`, getToken());

const getManagedSop = () => getRequest(`sop/managed`, getToken());

const getAssignment = () => getRequest(`sop/assignment`, getToken());
const getAssignmentDetail = (id) => getRequest(`sop/assignment/${id}`, getToken());

const getSectionandWarning = (iddetail) => getRequest(`sop/info/${iddetail}`, getToken());

const getSopStep = (id) => getRequest(`sop/step/${id}`);
const createSopStep = (data) => postRequest('sop/step', data, getToken());
const updateSopStep = (id, data) => patchRequest(`sop/step/${id}`, data, getToken());
const deleteSopStep = (id) => deleteRequest(`sop/step/${id}`, getToken());

export {
    getAllSop, createSop, getOneSop,               //tabel sop
    createSopDetail, updateSopDetail, deleteSopDetail, getAssignment, getAssignmentDetail, 
    getSectionandWarning, getLatestSopInYear, getManagedSop, getSopVersion,      //tabel detail sop
    createSopStep, getSopStep, updateSopStep, deleteSopStep    //tabel sop step
};
