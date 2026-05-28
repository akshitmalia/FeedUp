import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";

// Thunk to restore session from cookie
export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await API.get("/feedup/me"); // backend route to check cookie
      dispatch(loginSuccess({
        user: { email: res.data.email },
        role: res.data.role
      }));
      return res.data;
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
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isLoggedIn = false;
      });
  }
});

export const { loginSuccess, logoutSuccess, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
