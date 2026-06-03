"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    // Check local storage or document class list
    const isLight = document.documentElement.classList.contains("light");
    setTheme(isLight ? "light" : "dark");
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.add("light");
      localStorage.theme = "light";
      setTheme("light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.theme = "dark";
      setTheme("dark");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl border border-borderCustom bg-card text-textPrimary hover:text-neonBlue hover:border-neonBlue hover:scale-105 transition-all duration-300 shadow-md flex items-center justify-center"
      aria-label="Toggle light/dark theme"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 transition-transform duration-300 rotate-0" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-300 rotate-0" />
      )}
    </button>
  );
}
