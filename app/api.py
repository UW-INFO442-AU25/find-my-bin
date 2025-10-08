import os, uuid
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .yolo_model import WasteYOLO

app = FastAPI(title="WasteVision YOLO API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

model = WasteYOLO()

@app.get("/")
def root():
    return {"message": "WasteVision API running"}

@app.post("/predict")
async def predict(image: UploadFile = File(...)):
    os.makedirs("uploads", exist_ok=True)
    path = f"uploads/{uuid.uuid4().hex}_{image.filename}"
    with open(path, "wb") as f:
        f.write(await image.read())
    detections = model.predict(path)
    return JSONResponse({"detections": detections})
