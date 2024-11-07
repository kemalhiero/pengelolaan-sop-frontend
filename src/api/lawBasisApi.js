import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getLawBasis = () => getRequest('law');
const createLawBasis = (data) => postRequest('law', data);
const updateLawBasis = (id, data) => patchRequest(`law?id=${id}`, data);
const deleteLawBasis = (id) => deleteRequest(`law?id=${id}`);

export { getLawBasis, createLawBasis, updateLawBasis, deleteLawBasis };
