import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const createEquipment = (data) => postRequest('equipment', data);

export { createEquipment };
