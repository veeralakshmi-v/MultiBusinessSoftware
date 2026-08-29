import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeEngine } from './lib/theme/themeEngine.ts';

// Apply saved theme configuration immediately on app startup
ThemeEngine.applyTheme(ThemeEngine.getThemeConfig());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

