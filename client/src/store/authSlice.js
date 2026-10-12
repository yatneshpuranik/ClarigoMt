import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Async thunk to fetch current user profile from /auth/me once on session startup
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return rejectWithValue('No token found');
    }
    try {
      const response = await api.get('/auth/me');
      const user = response.data.user || response.data;
      sessionStorage.setItem('role', user.role);
      sessionStorage.setItem('user', JSON.stringify(user));
      return { user, token };
    } catch (error) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('role');
      return rejectWithValue(
        error.response?.data?.message || 'Session verification failed'
      );
    }
  }
);

const getInitialUser = () => {
  try {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const token = sessionStorage.getItem('token');
const cachedUser = getInitialUser();

const initialState = {
  token: token || null,
  user: cachedUser,
  role: sessionStorage.getItem('role') || cachedUser?.role || null,
  isAuthenticated: !!token,
  loading: !!token && !cachedUser,
  isInitialized: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.token = token;
      state.user = user;
      state.role = user?.role || null;
      state.isAuthenticated = true;
      state.loading = false;
      state.isInitialized = true;
      state.error = null;

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('role', user?.role || '');
    },
    updateUserSuccess: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      if (action.payload.role) {
        state.role = action.payload.role;
        sessionStorage.setItem('role', action.payload.role);
      }
      sessionStorage.setItem('user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.isInitialized = true;
      state.error = null;

      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('role');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.role = action.payload.user?.role || null;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
        state.isInitialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.user = null;
        state.role = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.isInitialized = true;
        state.error = action.payload;
      });
  },
});

export const { setCredentials, updateUserSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
