import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";
 
// Restores session from httpOnly cookie on every page load/refresh
export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get("/feedup/me");
      return {
        user: res.data.user,
        role: res.data.role
      };
    } catch (err) {
      return rejectWithValue("Not authenticated");
    }
  }
);
 
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isLoggedIn: false,
    role: null,
    loading: true,  // starts true so ProtectedRoute waits before rendering
    error: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.isLoggedIn = true;
      state.role = action.payload.role;
      state.loading = false;
      state.error = null;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.role = null;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.error = null;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.user = null;
        state.role = null;
      });
  }
});
 
export const { loginSuccess, logoutSuccess, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;