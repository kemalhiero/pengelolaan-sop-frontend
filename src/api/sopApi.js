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

// tampilan
const getSopDisplayConfig = (id) => getRequest(`sop/detail/display/${id}`, getToken()); // mengambil seluruh konfigurasi tampilan (pagination, layout, panah dan label)
const saveSopLayout = (id, data) => patchRequest(`sop/detail/display/${id}/layout`, data, getToken());  // menyimpan konfigurasi layout dan pagination saja
const saveFlowchartConfig = (id, data) => patchRequest(`sop/detail/display/${id}/flowchart`, data, getToken()); // menyimpan konfigurasi panah dan label flowchart saja
const clearFlowchartConfig = (id) => deleteRequest(`sop/detail/display/${id}/flowchart`, getToken()); // menghapus konfigurasi panah dan label flowchart
const saveBpmnConfig = (id, data) => patchRequest(`sop/detail/display/${id}/bpmn`, data, getToken()); // menyimpan konfigurasi panah dan label bpmn saja
const clearBpmnConfig = (id) => deleteRequest(`sop/detail/display/${id}/bpmn`, getToken()); // menghapus konfigurasi panah dan label bpmn

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
    getSopDisplayConfig, saveSopLayout, saveFlowchartConfig, saveBpmnConfig, clearFlowchartConfig, clearBpmnConfig,
    confirmSopandBpmn,
};
