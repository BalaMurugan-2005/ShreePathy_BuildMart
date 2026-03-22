import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Toaster position="top-right" toastOptions={{
      style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '12px' },
      success: { iconTheme: { primary: '#F5C518', secondary: '#1A1A1A' } },
    }} />
    <App />
  </React.StrictMode>,
)
