import API from "./axios";
 
export const registerAPI = (data) => API.post("/feedup/register", data);
export const loginAPI = (data) => API.post("/feedup/login", data);
export const logoutAPI = () => API.get("/feedup/signout");
export const getMeAPI = () => API.get("/feedup/me"); // checks cookie on refresh