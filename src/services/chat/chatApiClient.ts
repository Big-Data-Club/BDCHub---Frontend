import axios from "axios";
import { authenticateAxios } from "../common/authenticatedAxios";

const chatApiClient = authenticateAxios(axios.create({
  baseURL: "/chatapiv1",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
}));

export default chatApiClient;
