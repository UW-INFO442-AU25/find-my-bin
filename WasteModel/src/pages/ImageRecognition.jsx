import React, { useState, useRef, useEffect } from "react";
import "../styles/ImageRecognition.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/predict";

export default function ImageRecognition() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [useCamera, setUseCamera] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // turn camera on or off when toggle changes
  useEffect(() => {
    if (!useCamera) {
      // stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return;
    }

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setError("");
      } catch (err) {
        console.error(err);
        setError("Could not access camera. Check browser permissions.");
        setUseCamera(false);
      }
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      startCamera();
    } else {
      setError("Camera is not supported in this browser.");
      setUseCamera(false);
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [useCamera]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!selected.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    setError("");
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setPredictions([]);
  };

  // capture current frame from video as a File
  const handleCaptureFromCamera = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Failed to capture image from camera.");
          return;
        }
        const capturedFile = new File([blob], "camera-capture.jpg", {
          type: "image/jpeg",
        });

        setError("");
        setFile(capturedFile);
        setPreviewUrl(URL.createObjectURL(blob));
        setPredictions([]);
      },
      "image/jpeg",
      0.9
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload or capture an image first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setPredictions([]);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.json();
      setPredictions(data.detections || []);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while running the model. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setPredictions([]);
    setError("");
  };

  const topPrediction = predictions.length > 0 ? predictions[0] : null;

  return (
    <div className="page-container">
      <div className="content-card">
        <h1 className="feature-title">Image Recognition</h1>
        <p className="feature-sub">
          Upload or capture a photo of an item to see what material the model
          detects (cardboard, glass, metal, paper, plastic, trash).
        </p>
      </div>

      <div className="content-card upload-card">
        <h2 className="section-title">Try the model</h2>
        <p className="section-sub">
          Use your camera or upload an image, then run the YOLO model to get
          predictions.
        </p>

        {/* toggle between upload and camera */}
        <div className="mode-toggle">
          <button
            type="button"
            className={`mode-btn ${useCamera ? "active" : ""}`}
            onClick={() => setUseCamera(true)}
          >
            Camera
          </button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="upload-row">
            {!useCamera ? (
              <label className="upload-label">
                <span className="upload-label-text">Upload an image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                />
              </label>
            ) : (
              <div className="camera-container">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="camera-preview"
                />
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleCaptureFromCamera}
                >
                  Capture photo
                </button>
              </div>
            )}

            <div className="upload-actions">
              <button
                type="submit"
                className="primary-btn"
                disabled={isLoading || !file}
              >
                {isLoading ? "Running model…" : "Run model"}
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
                      {topPrediction.label}{" "}
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