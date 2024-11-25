import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const createDrafter = (data) => postRequest('drafter', data);

export {createDrafter};
