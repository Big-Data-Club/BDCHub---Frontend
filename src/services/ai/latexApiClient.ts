import axios from "axios";
import { authenticateAxios } from "../common/authenticatedAxios";

export const latexApiClient = authenticateAxios(axios.create({
  baseURL: "/latexapiv1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
}));
