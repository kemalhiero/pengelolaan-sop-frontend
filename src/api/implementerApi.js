import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getImplementer = () => getRequest('implementer');

const createSopImplementer = (data) => postRequest('implementer/sop', data, getToken());
const getSopImplementer = (id) => getRequest(`implementer/sop?id=${id}`, getToken());
const deleteSopImplementer = (idsopdetail, idimplementer) => deleteRequest(`implementer/sop?id_sop_detail=${idsopdetail}&id_implementer=${idimplementer}`, getToken());

export { getImplementer, createSopImplementer, getSopImplementer, deleteSopImplementer }
