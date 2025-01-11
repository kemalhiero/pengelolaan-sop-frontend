import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getUserByRole = (role) => getRequest(`user?role=${role}`, getToken());

const getAllDrafter = () => getRequest('user/drafter', getToken());
const getDrafterByIdDetail = (id) => getRequest(`user/drafter/sopdetail/${id}`);
const createDrafter = (data) => postRequest('user/drafter', data, getToken());

const addHod = (data) => postRequest('user/hod', data, getToken());
const getHodCandidate = () => getRequest('user/hod/candidate', getToken());

const getAllPic = () => getRequest('user/pic', getToken());

export {
    getAllDrafter, getDrafterByIdDetail, createDrafter,
    getUserByRole, addHod, getHodCandidate,
    getAllPic,
};
