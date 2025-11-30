from ultralytics import YOLO
import numpy as np, os, torch
from typing import List, Dict

DEFAULT_CLASSES = ["cardboard", "glass", "metal", "paper", "plastic", "trash"]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WASTE_WEIGHTS = os.path.join(BASE_DIR, "..", "weights", "best.pt")

class WasteYOLO:
    def __init__(self, weights: str | None = None, classes=None):
        self.weights = weights or WASTE_WEIGHTS

        if not os.path.exists(self.weights):
            raise FileNotFoundError(f"YOLO weights not found at {self.weights}")

        self.model = YOLO(self.weights)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.classes = classes or DEFAULT_CLASSES

    def predict(self, image_path: str, conf=0.3) -> List[Dict]:
        results = self.model.predict(
            source=image_path,
            conf=conf,
            device=self.device,
            verbose=False,
        )
        detections = []
        for r in results:
            names = r.names  # should be your 6 waste classes
            for b in r.boxes:
                cls = int(b.cls.item())
                conf_val = float(b.conf.item())
                detections.append(
                    {
                        "label": names[cls],
                        "confidence": round(conf_val, 3),
                    }
                )
        return detections