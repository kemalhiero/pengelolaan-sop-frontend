import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const createEquipment = (data) => postRequest('equipment', data);
const getSopEquipment = (id) => getRequest(`equipment?id=${id}`);

export { createEquipment, getSopEquipment };
