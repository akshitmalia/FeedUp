import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './redux/store'
import './index.css'
import App from './App.jsx'
import { getMeAPI } from './api/authAPI'
import { loginSuccess, setLoading } from './redux/slices/authSlice'
 
const init = async () => {
  // Set loading = true so ProtectedRoute shows spinner, not redirect
  store.dispatch(setLoading(true));
 
  try {
    const res = await getMeAPI();
    store.dispatch(loginSuccess({
      user: res.data.user,
      role: res.data.role
    }));
  } catch (_) {
    // No valid session — stays logged out
  } finally {
    store.dispatch(setLoading(false));
  }
 
  createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <App />
    </Provider>
  );
};
 
init();