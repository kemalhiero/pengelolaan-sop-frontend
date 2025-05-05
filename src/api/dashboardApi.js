import getToken from "@/utils/getToken";
import { getRequest } from "./apiClient";

const getNominalSopPerOrg = () => getRequest('dashboard/nominal-sop-each-org');
const getSopDistByStatus = () => getRequest('dashboard/sop-dist-by-status');

export { getNominalSopPerOrg, getSopDistByStatus };
