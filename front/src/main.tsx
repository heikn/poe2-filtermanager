import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import "./index.css"
import { Routes, Route, BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/filter/:id" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
