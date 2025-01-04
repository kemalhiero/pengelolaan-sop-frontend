import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const createRelatedSop = (data) => postRequest('relatedsop', data, getToken());
const getRelatedSop = (id) => getRequest(`relatedsop?id=${id}`, getToken());
const deleteRelatedSop = (id) => deleteRequest(`relatedsop?id=${id}`, getToken());

export { createRelatedSop, getRelatedSop, deleteRelatedSop };
