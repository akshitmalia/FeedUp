import API from "./axios";

export const getStatsAPI = () => API.get("/admin/stats");
export const getAllUsersAPI = () => API.get("/admin/users");
export const getAllPostsAdminAPI = () => API.get("/admin/posts");
export const deleteAnyPostAPI = (id) => API.delete(`/admin/posts/${id}`);
export const getUserStatsAPI = () => API.get("/admin/user/stats");