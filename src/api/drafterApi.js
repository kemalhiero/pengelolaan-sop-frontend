import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

// const getDrafter = (id) => getRequest(`drafter?id=${id}`);
const createDrafter = (data) => postRequest('drafter', data);

export { createDrafter };
