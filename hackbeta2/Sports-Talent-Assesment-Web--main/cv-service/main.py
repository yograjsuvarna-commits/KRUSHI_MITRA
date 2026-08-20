"""
StarQ Computer Vision and Machine Learning Microservice
FastAPI server on port 8001
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from pose_analyzer import analyze_batting_pose
from ball_tracker import estimate_ball_speed
from talent_model import talent_ml_instance

app = FastAPI(title="StarQ CV & ML Microservice", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LandmarkPoint(BaseModel):
    x: float
    y: float
    z: Optional[float] = 0.0
    visibility: Optional[float] = 1.0

class PoseAnalysisRequest(BaseModel):
    landmarks: List[Dict[str, float]]
    exercise_type: Optional[str] = "batting_mechanics"

class BallSpeedRequest(BaseModel):
    trajectories: List[List[float]] # [[x, y, frame_idx], ...]
    fps: Optional[int] = 30
    meters_per_pixel: Optional[float] = 0.038

class TalentPredictionRequest(BaseModel):
    features: Dict[str, Any]

@app.get("/")
def read_root():
    return {
        "service": "StarQ CV & ML Microservice",
        "status": "active",
        "supported_models": ["MediaPipe_Pose_Biomechanics", "Optical_Ball_Speed_Tracker", "Random_Forest_Talent_Regressor"]
    }

@app.post("/analyze-pose")
def analyze_pose_endpoint(req: PoseAnalysisRequest):
    try:
        metrics = analyze_batting_pose(req.landmarks)
        return {"status": "success", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/estimate-ball-speed")
def estimate_speed_endpoint(req: BallSpeedRequest):
    try:
        result = estimate_ball_speed(req.trajectories, req.fps, req.meters_per_pixel)
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-talent")
def predict_talent_endpoint(req: TalentPredictionRequest):
    try:
        prediction = talent_ml_instance.predict_talent(req.features)
        return {"status": "success", "prediction": prediction}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
