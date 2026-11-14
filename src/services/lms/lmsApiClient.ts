import axios from "axios";
import { authenticateAxios } from "../common/authenticatedAxios";

export const lmsApiClient = authenticateAxios(axios.create({
  baseURL: "/lmsapiv1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
}), { disableGetCache: true });
