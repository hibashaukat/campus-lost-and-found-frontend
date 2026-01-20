import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
// 2. Ye line yahan add karein (Semicolon ka dhayan rakhein)
axios.defaults.baseURL = 'https://campus-lost-and-found-backend.vercel.app';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);