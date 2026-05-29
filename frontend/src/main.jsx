import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './redux/store'
import './index.css'
import App from './app_temp.jsx'
import { restoreSession } from './redux/slices/authSlice'
 
const init = async () => {
  // Use the existing restoreSession thunk — it handles loading/success/fail
  await store.dispatch(restoreSession());
 
  createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <App />
    </Provider>
  );
};
 
init();