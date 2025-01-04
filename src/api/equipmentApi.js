import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const createEquipment = (data) => postRequest('equipment', data, getToken());
const getSopEquipment = (id) => getRequest(`equipment?id=${id}`, getToken());
const deleteSopEquipment = (id) => deleteRequest(`equipment?id=${id}`, getToken());

export { createEquipment, getSopEquipment, deleteSopEquipment };
