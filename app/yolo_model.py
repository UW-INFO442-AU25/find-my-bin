from ultralytics import YOLO
import numpy as np, os, torch
from typing import List, Dict

DEFAULT_CLASSES = ["cardboard", "glass", "metal", "paper", "plastic", "trash"]

class WasteYOLO:
    def __init__(self, weights="weights/best.pt", classes=None):
        self.weights = weights if os.path.exists(weights) else "yolov8n.pt"
        self.model = YOLO(self.weights)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.classes = classes or DEFAULT_CLASSES

    def predict(self, image_path: str, conf=0.3) -> List[Dict]:
        results = self.model.predict(source=image_path, conf=conf, device=self.device, verbose=False)
        detections = []
        for r in results:
            names = r.names
            for b in r.boxes:
                cls = int(b.cls.item())
                conf = float(b.conf.item())
                detections.append({"label": names[cls], "confidence": round(conf, 3)})
        return detections
