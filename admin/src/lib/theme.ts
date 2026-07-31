export type Theme = "light" | "dark";

const STORAGE_KEY = "whitebear-admin-theme";

export function getPreferredTheme(): Theme {
  const storedTheme = localStorage.getItem(STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") return storedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}

export function initializeTheme() {
  applyTheme(getPreferredTheme());
}
