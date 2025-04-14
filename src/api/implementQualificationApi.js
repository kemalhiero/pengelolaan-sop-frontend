import getToken from "@/utils/getToken";
import { getRequest, postRequest, deleteRequest } from "./apiClient";

const createIQ = (data) => postRequest('iq', data, getToken());
const getIQ = (id) => getRequest(`iq/${id}`, getToken());
const deleteIQ = (id) => deleteRequest(`iq/${id}`, getToken());

export { createIQ, getIQ, deleteIQ };
