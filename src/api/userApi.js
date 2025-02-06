import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";
import { uploadFile } from "./fileApi";

const getUserByRole = (role) => getRequest(`user?role=${role}`, getToken());
const getUserProfile = () => getRequest('user/profile', getToken());

const addProfilePhoto = (data) => uploadFile('user/profile/photo', data, getToken());
const deleteUserProfile = () => deleteRequest('user/profile/photo', getToken());

const addSignatureFile = (data) => uploadFile('user/signature', data, getToken());

const addDrafter = (data) => postRequest('user/drafter', data, getToken());
const getAllDrafter = () => getRequest('user/drafter', getToken());
const getDrafterByIdDetail = (id) => getRequest(`user/drafter/sopdetail/${id}`);
const createSopDrafter = (data) => postRequest('user/drafter/sop', data, getToken());
const getDrafterDetail = (id) => getRequest(`user/drafter/${id}`, getToken());

const getHod = () => getRequest('user/hod', getToken());
const updateHod = (data) => patchRequest('user/hod', data, getToken());
const getHodCandidate = () => getRequest('user/hod/candidate', getToken());
const getCurrentHod = () => getRequest('user/hod/current', getToken());

const addPic = (data) => postRequest('user/pic', data, getToken());
const getAllPic = () => getRequest('user/pic', getToken());
const getPicCandidate = () => getRequest('user/pic/candidate', getToken());
const getUnassignedPic = () => getRequest('user/pic/unassigned', getToken());
const getPicDetail = (id) => getRequest(`user/pic/${id}`, getToken());

export {
    getUserByRole, getUserProfile, 
    addProfilePhoto, deleteUserProfile,
    addSignatureFile,
    getAllDrafter, getDrafterByIdDetail, createSopDrafter, addDrafter, getDrafterDetail,
    updateHod, getHodCandidate, getHod, getCurrentHod,
    getAllPic, addPic, getUnassignedPic, getPicCandidate, getPicDetail
};
