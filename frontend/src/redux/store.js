import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import feedReducer from "./slices/feedSlice";
import adminReducer from "./slices/adminSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    feed: feedReducer,
    admin: adminReducer,
  },
});

export default store;