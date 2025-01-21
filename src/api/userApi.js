import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getUserByRole = (role) => getRequest(`user?role=${role}`, getToken());

const addDrafter = (data) => postRequest('user/drafter', data, getToken());
const getAllDrafter = () => getRequest('user/drafter', getToken());
const getDrafterByIdDetail = (id) => getRequest(`user/drafter/sopdetail/${id}`);
const createSopDrafter = (data) => postRequest('user/drafter/sop', data, getToken());

const getHod = () => getRequest('user/hod', getToken());
const addHod = (data) => postRequest('user/hod', data, getToken());
const getHodCandidate = () => getRequest('user/hod/candidate', getToken());

const addPic = (data) => postRequest('user/pic', data, getToken());
const getAllPic = () => getRequest('user/pic', getToken());
const getPicCandidate = () => getRequest('user/pic/candidate', getToken());
const getUnassignedPic = () => getRequest('user/pic/unassigned', getToken());

export {
    getUserByRole,
    getAllDrafter, getDrafterByIdDetail, createSopDrafter, addDrafter,
    addHod, getHodCandidate, getHod,
    getAllPic, addPic, getUnassignedPic, getPicCandidate
};
