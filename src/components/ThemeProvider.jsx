import React, { createContext, useContext, useMemo } from "react";

const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => {},
});

/**
 * Custom hook to access current theme context.
 */
export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * ThemeProvider wraps Stellar Payment UI components to enable dynamic light/dark
 * theming and custom CSS variable overrides.
 *
 * @param {"dark" | "light" | "auto"} [theme="dark"]
 * @param {object} [customTheme] - Optional CSS custom property overrides (e.g. { "--stellar-accent": "#8b5cf6" })
 */
export function ThemeProvider({
  children,
  theme = "dark",
  customTheme = {},
  className = "",
}) {
  const value = useMemo(() => ({ theme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <div
        data-stellar-theme={theme}
        className={`stellar-ui-theme-root ${className}`}
        style={customTheme}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
