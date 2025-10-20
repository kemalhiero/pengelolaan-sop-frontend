import getToken from "@/utils/getToken";
import { getRequest, postRequest, deleteRequest } from "./apiClient";

const createRelatedSop = (data) => postRequest('relatedsop', data, getToken());
const getRelatedSop = (id) => getRequest(`relatedsop/${id}`, getToken());
const deleteRelatedSop = (idsopdetail, idsop) => deleteRequest(`relatedsop/${idsopdetail}/${idsop}`, getToken());

export { createRelatedSop, getRelatedSop, deleteRelatedSop };
