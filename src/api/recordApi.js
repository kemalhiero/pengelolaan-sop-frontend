import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const createRecord = (data) => postRequest('record', data, getToken());
const getSopRecord = (id) => getRequest(`record?id=${id}`, getToken());
const deleteSopRecord = (id) => deleteRequest(`record?id=${id}`, getToken());

export { createRecord, getSopRecord, deleteSopRecord };
