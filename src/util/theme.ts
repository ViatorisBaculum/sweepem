export type Theme = 'light' | 'dark' | 'system';

interface ThemeConfig {
    theme: Theme;
    systemDark: boolean;
}

export const ThemeManager = {
    STORAGE_KEY: 'theme-preference',

    getCurrentTheme(): Theme {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            const config = JSON.parse(stored) as ThemeConfig;
            return config.theme;
        }
        return 'system';
    },

    getSystemTheme(): boolean {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    },

    setTheme(theme: Theme): void {
        const config: ThemeConfig = {
            theme,
            systemDark: this.getSystemTheme()
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
        this.applyTheme();
    },

    // apply system theme based on user preference or passed argument
    applyTheme(): void {
        const theme = this.getCurrentTheme();
        const darkMode = theme === 'system'
            ? this.getSystemTheme()
            : theme === 'dark';

        document.documentElement.classList.toggle('dark', darkMode);
    },

    initialize(): void {
        // Initial theme application
        this.applyTheme();

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', () => {
                if (this.getCurrentTheme() === 'system') {
                    this.applyTheme();
                }
            });
    }
};