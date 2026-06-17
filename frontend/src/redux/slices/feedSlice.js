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

    socketPostCreated: (state, action) => {
      state.allPosts.unshift(action.payload);
    },

    // Post deleted by its owner or admin — remove from every list it could be in
    socketPostDeleted: (state, action) => {
      const id = action.payload._id;
      state.allPosts = state.allPosts.filter(p => p._id !== id);
      state.topPosts = state.topPosts.filter(p => p._id !== id);
      state.myPosts  = state.myPosts.filter(p => p._id !== id);
    },

    // Vote count changed — find the matching post in each list and update votes only
    socketPostUpvoted: (state, action) => {
      const { _id, votes } = action.payload;
      const updateVotes = (list) => {
        const post = list.find(p => p._id === _id);
        if (post) post.votes = votes;
      };
      updateVotes(state.allPosts);
      updateVotes(state.topPosts);
      updateVotes(state.myPosts);
    },

    // Post text edited — replace that one post object in each list
    socketPostUpdated: (state, action) => {
      const updated = action.payload;
      const replacePost = (list) => {
        const index = list.findIndex(p => p._id === updated._id);
        if (index !== -1) list[index] = updated;
      };
      replacePost(state.allPosts);
      replacePost(state.topPosts);
      replacePost(state.myPosts);
    },
  },
});

export const {
  setAllPosts, setTopPosts, setMyPosts, setLoading, setError,
  socketPostCreated, socketPostDeleted, socketPostUpvoted, socketPostUpdated
} = feedSlice.actions;

export default feedSlice.reducer;