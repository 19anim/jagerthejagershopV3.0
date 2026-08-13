import axios from "axios";
import { apiUrl } from "../utils/api.utils";

const request = (config) =>
  axios.request({ ...config, url: apiUrl(config.url), withCredentials: true }).then((response) => response.data);

export const assetsApi = {
  list: (params) => request({ method: "GET", url: "/api/assets", params }),
  getById: (id) => request({ method: "GET", url: `/api/assets/${id}` }),
  usage: (id) => request({ method: "GET", url: `/api/assets/${id}/usage` }),
  upload: ({ category, label, file }) => {
    const data = new FormData();
    data.append("category", category);
    data.append("label", label);
    data.append("file", file);
    return request({ method: "POST", url: "/api/assets/upload", data, headers: { "Content-Type": "multipart/form-data" } });
  },
  replace: (id, file) => {
    const data = new FormData();
    data.append("file", file);
    return request({ method: "POST", url: `/api/assets/${id}/upload`, data, headers: { "Content-Type": "multipart/form-data" } });
  },
  setActiveVersion: (id, version) =>
    request({ method: "PATCH", url: `/api/assets/${id}/active-version`, data: { version } }),
  archive: (id) => request({ method: "PATCH", url: `/api/assets/${id}/archive` }),
  remove: (id) => request({ method: "DELETE", url: `/api/assets/${id}` }),
};
