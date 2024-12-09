import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getImplementer = () => getRequest('implementer');

const createSopImplementer = (data) => postRequest('implementer/sop', data);
const getSopImplementer = (id) => getRequest(`implementer/sop?id=${id}`);

export { getImplementer, createSopImplementer, getSopImplementer }
