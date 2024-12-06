import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getImplementer = () => getRequest('implementer');

const createSopImplementer = (data) => postRequest('implementer/sop', data);

export { getImplementer, createSopImplementer }
