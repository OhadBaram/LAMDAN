import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AppProvider } from '../contexts/AppContext';
import { UserSettingsProvider } from '../contexts/UserSettingsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode>
  <UserSettingsProvider>
    <AppProvider>
      <App />
    </AppProvider>
  </UserSettingsProvider>
</React.StrictMode>);
