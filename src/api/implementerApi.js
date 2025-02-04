import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getImplementer = () => getRequest('implementer', getToken());
const addImplementer = (data) => postRequest('implementer', data, getToken());
const updateImplementer = (id, data) => patchRequest(`implementer/${id}`, data, getToken());
const deleteImplementer = (id) => deleteRequest(`implementer/${id}`, getToken());

const createSopImplementer = (data) => postRequest('implementer/sop', data, getToken());
const getSopImplementer = (id) => getRequest(`implementer/sop?id=${id}`, getToken());
const deleteSopImplementer = (idsopdetail, idimplementer) => deleteRequest(`implementer/sop?id_sop_detail=${idsopdetail}&id_implementer=${idimplementer}`, getToken());

export { 
    getImplementer, addImplementer, updateImplementer, deleteImplementer,
    createSopImplementer, getSopImplementer, deleteSopImplementer 
};
