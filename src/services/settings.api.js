import axios from "axios";
import { apiUrl } from "../utils/api.utils";

export const settingsApi = {
  getShop3dTheme: () => axios.get(apiUrl("/api/settings/shop3d")).then((response) => response.data),
  setShop3dTheme: (shop3dTheme) =>
    axios.put(apiUrl("/api/settings/shop3d"), { shop3dTheme }, { withCredentials: true }).then((response) => response.data),
};
