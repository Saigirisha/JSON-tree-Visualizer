import React, { useState } from "react";
import "./SearchBar.css";

export default function SearchBar({ onSearch }) {
  const [term, setTerm] = useState("");

  return (
    <div className="search-bar">
      <input
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder=" Search by JSON path e.g. $.user.name"
        onKeyDown={(e) => e.key === "Enter" && onSearch(term)}
      />
      <button onClick={() => onSearch(term)}>Search</button>
    </div>
  );
}
