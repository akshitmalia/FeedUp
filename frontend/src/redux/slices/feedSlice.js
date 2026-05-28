import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
  name: "feed",
  initialState: {
    allPosts: [],     // all posts
    topPosts: [],     // top voted posts
    myPosts: [],      // logged in user's posts
    loading: false,
    error: null,
  },
  reducers: {
    setAllPosts: (state, action) => {
      state.allPosts = action.payload;
    },
    setTopPosts: (state, action) => {
      state.topPosts = action.payload;
    },
    setMyPosts: (state, action) => {
      state.myPosts = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setAllPosts, setTopPosts, setMyPosts, setLoading, setError } = feedSlice.actions;
export default feedSlice.reducer;