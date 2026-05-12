import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TooltipProvider } from '@roaster/ui/components/tooltip'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <TooltipProvider>
      <App />
   </TooltipProvider>
  </StrictMode>,
)
