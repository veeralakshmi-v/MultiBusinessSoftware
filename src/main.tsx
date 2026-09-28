import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installApiInterceptor } from './lib/apiInterceptor.ts';
import { ThemeEngine } from './lib/theme/themeEngine.ts';
import { TenantDatabaseManager } from './lib/tenant/tenantDatabaseManager.ts';
import { CloudSync } from './lib/sync/cloudSync.ts';

// 0. Install client API network interceptor to eliminate 500 errors
installApiInterceptor();

// 1. Initialize Database-Per-Tenant storage router immediately on app startup
TenantDatabaseManager.initializeStorageRouter();

// 2. Synchronize cloud PostgreSQL data
CloudSync.syncAllData();

// 3. Apply saved theme configuration immediately on app startup
ThemeEngine.applyTheme(ThemeEngine.getThemeConfig());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
