import { getRequest, postRequest, patchRequest, deleteRequest } from "./apiClient";

const getLawType = () => getRequest('lawtype');
const createLawType = (data) => postRequest('lawtype', data);
const updateLawType = (id, data) => patchRequest(`lawtype?id=${id}`, data);
const deleteLawType = (id) => deleteRequest(`lawtype?id=${id}`);

export { getLawType, createLawType, updateLawType, deleteLawType }
