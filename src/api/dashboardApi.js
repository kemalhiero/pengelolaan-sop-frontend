import getToken from "@/utils/getToken";
import { getRequest } from "./apiClient";

const getNominalSopPerOrg = () => getRequest('dashboard/nominal-sop-each-org');
const getSopDistByStatus = () => getRequest('dashboard/sop-dist-by-status');

const getMostRevisedSop = () => getRequest('dashboard/most-revised-sop', getToken());
const getAnnualSopMakingTrend = () => getRequest('dashboard/annual-sop-trend', getToken());
const getNominalUserEachRole = () => getRequest('dashboard/nominal-user-each-role', getToken());
const getNominalFeedbackTopSop = () => getRequest('dashboard/nominal-feedback-top-sop', getToken());
const getNominalSopEachOrgByStatus = () => getRequest('dashboard/nominal-sop-each-org-by-status', getToken());

export { 
    getNominalSopPerOrg, getSopDistByStatus,
    getAnnualSopMakingTrend, getNominalUserEachRole, getNominalFeedbackTopSop, getNominalSopEachOrgByStatus, getMostRevisedSop
};
