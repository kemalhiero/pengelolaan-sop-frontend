import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getImplementer = () => getRequest('implementer');

export {getImplementer}
