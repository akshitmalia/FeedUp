import API from "./axios";

export const registerAPI = (data) => API.post("/feedup/register", data);
export const loginAPI = (data) => API.post("/feedup/login", data);
export const logoutAPI = () => API.get("/feedup/signout");