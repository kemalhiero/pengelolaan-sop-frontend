import getToken from "@/utils/getToken";
import { getRequest, postRequest, deleteRequest } from "./apiClient";

const createRecord = (data) => postRequest('record', data, getToken());
const getSopRecord = (id) => getRequest(`record/${id}`, getToken());
const deleteSopRecord = (id) => deleteRequest(`record/${id}`, getToken());

export { createRecord, getSopRecord, deleteSopRecord };
