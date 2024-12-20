import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getDrafter = () => getRequest('user/drafter');

export { getDrafter };
