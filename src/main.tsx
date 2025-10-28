import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ViewProvider } from './context/view.provider.tsx'
import { WebSocketProvider } from './context/ws.provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebSocketProvider>

        <ViewProvider>
          <App />
        </ViewProvider>
    </WebSocketProvider>
  </StrictMode>,
)
