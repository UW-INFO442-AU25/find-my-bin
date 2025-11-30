// WasteModel/src/pages/WasteModel.jsx
import React, { useState } from "react";
import "./App.css";

export default function WasteModel() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handlePredict(e) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("http://localhost:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Prediction failed." });
    }
    setLoading(false);
  }

  return (
    <div className="app-container">
      <h1>Waste Model Predictor</h1>
      <form onSubmit={handlePredict}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter input for model"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Predicting..." : "Predict"}
        </button>
      </form>
      {result && (
        <div className="result">
          {result.error ? (
            <span style={{ color: "red" }}>{result.error}</span>
          ) : (
            <pre>{JSON.stringify(result, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}