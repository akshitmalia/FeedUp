import API from "./axios";

export const getAllPostsAPI = () => API.get("/feedup/posts");
export const getTopPostsAPI = () => API.get("/feedup/posts/top");
export const getMyPostsAPI = () => API.get("/feedup/posts/my");
export const createPostAPI = (data) => API.post("/feedup/posts", data);
export const deletePostAPI = (id) => API.delete(`/feedup/posts/${id}`);
export const updatePostAPI = (id, data) => API.put(`/feedup/posts/${id}`, data); 
export const upvotePostAPI = (id) => API.patch(`/feedup/posts/${id}/upvote`);