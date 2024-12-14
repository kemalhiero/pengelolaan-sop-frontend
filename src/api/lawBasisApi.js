import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getLawBasis = () => getRequest('law');
const createLawBasis = (data) => postRequest('law', data);
const updateLawBasis = (id, data) => patchRequest(`law?id=${id}`, data);
const deleteLawBasis = (id) => deleteRequest(`law?id=${id}`);

const createSopLawBasis = (data) => postRequest('law/sop', data);
const getSopLawBasis = (id) => getRequest(`law/sop?id=${id}`);
const deleteSopLawBasis = (idsopdetail, idlegal) => deleteRequest(`law/sop?id_sop_detail=16${idsopdetail}&id_legal=${idlegal}`);

export { 
    getLawBasis, createLawBasis, updateLawBasis, deleteLawBasis, 
    createSopLawBasis, getSopLawBasis, deleteSopLawBasis 
};
