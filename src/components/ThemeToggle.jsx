import React, { useEffect } from "react";
import "./ThemeToggle.css";

export default function ThemeToggle({ theme, toggleTheme }) {
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <button className="theme-toggle-btn" onClick={toggleTheme}>
      {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
    </button>
  );
}
