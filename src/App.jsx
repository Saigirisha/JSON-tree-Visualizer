import React, { useState } from "react";
import JsonInput from "./components/JsonInput";
import SearchBar from "./components/SearchBar";
import TreeVisualizer from "./components/TreeVisualizer";
import ThemeToggle from "./components/ThemeToggle";
import "./App.css";

export default function App() {
  const [jsonData, setJsonData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightPath, setHighlightPath] = useState("");
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "light"
  );

  const handleSearch = (term) => {
    setSearchTerm(term);

    if (!term) {
      setMessage("");
      setHighlightPath("");
      return;
    }

    if (!jsonData) {
      setMessage("❌ No JSON loaded");
      setHighlightPath("");
      return;
    }
    const cleanTerm = term.startsWith("$.") ? term : "$." + term;
    const found = doesPathExist(jsonData, cleanTerm);

    if (found) {
      setMessage("✅ Match found");
      setHighlightPath(cleanTerm);
    } else {
      setMessage("❌ No match found");
      setHighlightPath("");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="app" data-theme={theme}>
      <header className="header">
        <h1> JSON Tree Visualizer</h1>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </header>
      <main className="main">
        <div className="left-section">
          <JsonInput onJsonSubmit={setJsonData} />
        </div>
        <div className="right-section">
          <SearchBar onSearch={handleSearch} />
          {message && <p className="status-msg">{message}</p>}

          {jsonData ? (
            <TreeVisualizer
              jsonData={jsonData}
              searchTerm={searchTerm}
              highlightPath={highlightPath}
              theme={theme}
            />
          ) : (
            <div className="placeholder">Paste JSON and click Visualize</div>
          )}
        </div>
      </main>
    </div>
  );
}

function doesPathExist(obj, rawPath) {
  if (!rawPath || !obj) return false;

  let path = rawPath.trim().replace(/^\$\./, "");
  const parts = path.split(/\.|\[|\]/).filter(Boolean);

  let current = obj;
  for (let key of parts) {
    if (current === undefined || current === null) return false;

    if (Object.prototype.hasOwnProperty.call(current, key)) {
      current = current[key];
    } else if (Array.isArray(current) && !isNaN(Number(key))) {
      current = current[Number(key)];
    } else {
      return false;
    }
  }
  return true;
}
