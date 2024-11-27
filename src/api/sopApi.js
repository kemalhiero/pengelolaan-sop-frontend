import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getSop = () => getRequest('sop');
const createSop = (data) => postRequest('sop', data);

export {getSop, createSop};
