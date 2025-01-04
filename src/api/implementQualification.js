import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const createIQ = (data) => postRequest('iq', data, getToken());
const getIQ = (id) => getRequest(`iq?id=${id}`, getToken());
const deleteIQ = (id) => deleteRequest(`iq?id=${id}`, getToken());

export { createIQ, getIQ, deleteIQ };
