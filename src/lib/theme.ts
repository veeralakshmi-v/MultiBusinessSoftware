export interface ThemeSettings {
  activeTheme: string; // 'DARK_GOLD' | 'DARK_SLATE' | 'EMERALD' | 'LIGHT'
  fontSize: string;   // 'SMALL' | 'MEDIUM' | 'LARGE'
}

export function applyTheme(themeSettings?: Partial<ThemeSettings>) {
  if (!themeSettings) return;
  const root = document.documentElement;

  // Font Size
  if (themeSettings.fontSize === 'SMALL') {
    root.style.fontSize = '13px';
  } else if (themeSettings.fontSize === 'LARGE') {
    root.style.fontSize = '16px';
  } else {
    root.style.fontSize = '14px';
  }

  // Active Theme
  const theme = themeSettings.activeTheme || 'DARK_GOLD';
  root.setAttribute('data-theme', theme);
  
  if (theme === 'DARK_SLATE') {
    root.style.setProperty('--accent-color', '#0EA5E9');
    root.style.filter = 'hue-rotate(175deg)';
  } else if (theme === 'EMERALD') {
    root.style.setProperty('--accent-color', '#10B981');
    root.style.filter = 'hue-rotate(95deg)';
  } else if (theme === 'LIGHT') {
    root.style.setProperty('--accent-color', '#C5A059');
    root.style.filter = 'invert(0.93) hue-rotate(180deg)';
  } else {
    root.style.setProperty('--accent-color', '#C5A059');
    root.style.filter = 'none';
  }
}

export function initTheme() {
  const saved = localStorage.getItem('theme_settings');
  if (saved) {
    try {
      applyTheme(JSON.parse(saved));
    } catch {}
  }
  
  fetch('/api/settings')
    .then(res => res.json())
    .then(data => {
      if (data.themeSettings) {
        applyTheme(data.themeSettings);
        localStorage.setItem('theme_settings', JSON.stringify(data.themeSettings));
      }
    })
    .catch(() => {});
}
