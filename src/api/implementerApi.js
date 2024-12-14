import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getImplementer = () => getRequest('implementer');

const createSopImplementer = (data) => postRequest('implementer/sop', data);
const getSopImplementer = (id) => getRequest(`implementer/sop?id=${id}`);
const deleteSopImplementer = (idsopdetail, idimplementer) => deleteRequest(`implementer/sop?id_sop_detail=${idsopdetail}&id_implementer=${idimplementer}`);

export { getImplementer, createSopImplementer, getSopImplementer, deleteSopImplementer }
