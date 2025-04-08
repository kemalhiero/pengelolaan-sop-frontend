import getToken from "@/utils/getToken";
import { getRequest, postRequest, deleteRequest } from "./apiClient";

const createEquipment = (data) => postRequest('equipment', data, getToken());
const getSopEquipment = (id) => getRequest(`equipment/${id}`, getToken());
const deleteSopEquipment = (id) => deleteRequest(`equipment/${id}`, getToken());

export { createEquipment, getSopEquipment, deleteSopEquipment };
