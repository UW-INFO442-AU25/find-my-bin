import React, { useState } from 'react';
import '../styles/ImageRecognition.css';

const API_URL = 'http://localhost:8000/predict';
// ^ change this if your FastAPI server is running elsewhere

export default function ImageRecognition() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    // Basic guard on image types
    if (!selected.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setError('');
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setPredictions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setPredictions([]);

    try {
      const formData = new FormData();
      // FastAPI endpoint expects field name "image"
      formData.append('image', file);

      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.json();
      // backend returns: { detections: [{label, confidence}, ...] }
      setPredictions(data.detections || []);
    } catch (err) {
      console.error(err);
      setError('Something went wrong while running the model. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setPredictions([]);
    setError('');
  };

  const topPrediction = predictions.length > 0 ? predictions[0] : null;

  return (
    <div className="page-container">
      <div className="content-card">
        <h1 className="feature-title">Image Recognition</h1>
        <p className="feature-sub">
          Upload a photo of an item to see what material the model detects
          (cardboard, glass, metal, paper, plastic, trash). Later you can map
          that to Recycling, Compost, Landfill, or Hazardous rules.
        </p>
      </div>

      <div className="content-card upload-card">
        <h2 className="section-title">Try the model</h2>
        <p className="section-sub">
          Choose an image and run the YOLO model to get predictions.
        </p>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="upload-row">
            <label className="upload-label">
              <span className="upload-label-text">Upload an image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
              />
            </label>

            <div className="upload-actions">
              <button
                type="submit"
                className="primary-btn"
                disabled={isLoading || !file}
              >
                {isLoading ? 'Running model…' : 'Run model'}
              </button>
              {file && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}
        </form>

        <div className="results-layout">
          {/* Image Preview */}
          <div className="preview-panel">
            <h3 className="panel-title">Image preview</h3>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected item"
                className="preview-image"
              />
            ) : (
              <div className="preview-placeholder">
                No image selected yet.
              </div>
            )}
          </div>

          {/* Predictions */}
          <div className="predictions-panel">
            <h3 className="panel-title">Model predictions</h3>

            {isLoading && <p className="loading-text">Analyzing image…</p>}

            {!isLoading && predictions.length === 0 && (
              <p className="muted-text">
                Predictions will appear here after you run the model.
              </p>
            )}

            {!isLoading && predictions.length > 0 && (
              <div className="predictions-content">
                {topPrediction && (
                  <div className="top-prediction-card">
                    <div className="top-label">Most confident prediction</div>
                    <div className="top-value">
                      {topPrediction.label}{' '}
                      <span className="top-confidence">
                        ({Math.round(topPrediction.confidence * 100)}% confidence)
                      </span>
                    </div>
                  </div>
                )}

                <div className="predictions-list">
                  <div className="predictions-header">
                    <span>Label</span>
                    <span>Confidence</span>
                  </div>
                  {predictions.map((p, idx) => (
                    <div key={idx} className="prediction-row">
                      <span className="prediction-label">{p.label}</span>
                      <span className="prediction-confidence">
                        {Math.round(p.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
