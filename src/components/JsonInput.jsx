import React, { useState } from "react";
import "./JsonInput.css";

export default function JsonInput({ onJsonSubmit }) {
  const [input, setInput] = useState(`
  {
    "user": {
      "id": 1,
      "name": "John Doe",
      "address": {
        "city": "London",
        "country": "USA"
      },
      "items": [{
        "name": "item1"}, 
        {"name": "item2"}
      ]
    }
  }`);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    try {
      const parsed = JSON.parse(input);
      onJsonSubmit(parsed);
      setError("");
    } catch {
      setError("Invalid JSON format.");
    }
  };

  const handleClear = () => {
    setInput("");
    setError("");
    onJsonSubmit(null);
  };

  return (
    <div className="json-input">
      <h2>JSON Input</h2>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste your JSON here..."
      />
      <div className="button-row">
        <button className="visualize-btn" onClick={handleSubmit}>
          Generate Tree
        </button>
        <button className="clear-btn" onClick={handleClear}>
          Clear
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
