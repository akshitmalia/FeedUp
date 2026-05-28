import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isLoggedIn: false,
    role: null,
    loading: false,
    error: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.isLoggedIn = true;
      state.role = action.payload.role;
      state.error = null;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.role = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { loginSuccess, logoutSuccess, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;