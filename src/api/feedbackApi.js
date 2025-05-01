import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const addDraftFeedback = (data) => postRequest('feedback/draft', data, getToken());
const getAllDraftFeedback = () => getRequest('feedback/draft', getToken());    
const getDraftFeedback = (id) => getRequest(`feedback/draft/${id}`, getToken());    
const getGeneralFeedback = (id) => getRequest(`feedback/draft/${id}/general`, getToken());
const deleteDraftFeedback = (id) => deleteRequest(`feedback/draft/${id}`, getToken());   

export { addDraftFeedback, getAllDraftFeedback, getDraftFeedback, getGeneralFeedback, deleteDraftFeedback };
