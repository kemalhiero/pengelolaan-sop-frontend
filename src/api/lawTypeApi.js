import getToken from "@/utils/getToken";
import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getLawType = () => getRequest('lawtype', getToken());
const createLawType = (data) => postRequest('lawtype', data, getToken());
const updateLawType = (id, data) => patchRequest(`lawtype?id=${id}`, data, getToken());
const deleteLawType = (id) => deleteRequest(`lawtype?id=${id}`, getToken());

export { getLawType, createLawType, updateLawType, deleteLawType }
