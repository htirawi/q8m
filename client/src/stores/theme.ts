import { defineStore } from "pinia";
import { ref } from "vue";

export const useThemeStore = defineStore("theme", () => {
  // State
  const isDarkMode = ref(false);
  const isSystemTheme = ref(true);

  // Actions
  const initializeTheme = () => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      isDarkMode.value = stored === "dark";
      isSystemTheme.value = false;
    } else {
      // Use system preference
      isDarkMode.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
      isSystemTheme.value = true;
    }
    applyTheme();
  };

  const setDarkMode = (dark: boolean) => {
    isDarkMode.value = dark;
    isSystemTheme.value = false;
    localStorage.setItem("theme", dark ? "dark" : "light");
    applyTheme();
  };

  const toggleDarkMode = () => {
    setDarkMode(!isDarkMode.value);
  };

  const setSystemTheme = () => {
    isSystemTheme.value = true;
    isDarkMode.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
    localStorage.removeItem("theme");
    applyTheme();
  };

  const applyTheme = () => {
    if (isDarkMode.value) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Watch for system theme changes
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", (e) => {
    if (isSystemTheme.value) {
      isDarkMode.value = e.matches;
      applyTheme();
    }
  });

  return {
    // State
    isDarkMode,
    isSystemTheme,
    // Actions
    initializeTheme,
    setDarkMode,
    toggleDarkMode,
    setSystemTheme,
  };
});
