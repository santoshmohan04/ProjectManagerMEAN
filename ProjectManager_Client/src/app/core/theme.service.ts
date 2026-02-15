import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app_theme';
  isDarkMode = signal<boolean>(this.getInitialTheme());

  constructor() {
    // Apply theme on initialization
    this.applyTheme(this.isDarkMode());

    // Effect to persist theme changes
    effect(() => {
      const darkMode = this.isDarkMode();
      this.applyTheme(darkMode);
      localStorage.setItem(this.THEME_KEY, darkMode ? 'dark' : 'light');
    });
  }

  toggleTheme(): void {
    this.isDarkMode.update(value => !value);
  }

  setTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);
  }

  private getInitialTheme(): boolean {
    const stored = localStorage.getItem(this.THEME_KEY);
    if (stored) {
      return stored === 'dark';
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(isDark: boolean): void {
    const body = document.body;
    if (isDark) {
      body.classList.add('dark-mode');
      body.classList.remove('light-mode');
    } else {
      body.classList.add('light-mode');
      body.classList.remove('dark-mode');
    }
  }
}
