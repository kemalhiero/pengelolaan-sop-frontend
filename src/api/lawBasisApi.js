import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getLawBasis = () => getRequest('law', getToken());
const createLawBasis = (data) => postRequest('law', data, getToken());
const updateLawBasis = (id, data) => patchRequest(`law?id=${id}`, data, getToken());
const deleteLawBasis = (id) => deleteRequest(`law?id=${id}`, getToken());

const createSopLawBasis = (data) => postRequest('law/sop', data, getToken());
const getSopLawBasis = (id) => getRequest(`law/sop?id=${id}`, getToken());
const deleteSopLawBasis = (idsopdetail, idlegal) => deleteRequest(`law/sop?id_sop_detail=${idsopdetail}&id_legal=${idlegal}`, getToken());

export {
    getLawBasis, createLawBasis, updateLawBasis, deleteLawBasis,
    createSopLawBasis, getSopLawBasis, deleteSopLawBasis
};
