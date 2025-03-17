import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const addDraftFeedback = (data) => postRequest('feedback/draft', data, getToken());

export { addDraftFeedback };
