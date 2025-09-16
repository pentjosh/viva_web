import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Routers } from './pages/Routers';
import ThemeContextProvider from './context/ThemeContextProvider';
import { RouterProvider } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeContextProvider>
      <RouterProvider router={Routers} />
    </ThemeContextProvider>
  </StrictMode>,
)
