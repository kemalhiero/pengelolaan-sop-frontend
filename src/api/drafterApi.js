import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const createSopDrafter = (data) => postRequest('drafter/sop', data);

export {createSopDrafter};
