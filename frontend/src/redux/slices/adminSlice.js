import { createSlice } from "@reduxjs/toolkit";

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    stats: null,      // total users, total posts
    allUsers: [],     // all users list
    allPosts: [],     // all posts for admin view
    loading: false,
    error: null,
  },
  reducers: {
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setAllUsers: (state, action) => {
      state.allUsers = action.payload;
    },
    setAllPosts: (state, action) => {
      state.allPosts = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setStats, setAllUsers, setAllPosts, setLoading, setError } = adminSlice.actions;
export default adminSlice.reducer;