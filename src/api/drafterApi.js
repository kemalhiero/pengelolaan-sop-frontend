import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getAllDrafter = () => getRequest('drafter', getToken());
const getDrafterByIdDetail = (id) => getRequest(`drafter/sopdetail/${id}`);
const createDrafter = (data) => postRequest('drafter', data, getToken());

const getAllLecturer = () => getRequest('user/lecturer', getToken());

export { getAllDrafter, getDrafterByIdDetail, createDrafter, getAllLecturer };
