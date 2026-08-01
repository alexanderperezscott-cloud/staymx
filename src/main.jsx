import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'react-hot-toast' // <-- 1. Agrega esta importación

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster position="bottom-center" /> {/* <-- 2. Agrega el componente aquí */}
  </React.StrictMode>,
)