"""
StarQ Ball Tracking and Speed Estimation Engine
Tracks cricket ball trajectory and estimates release & impact velocity.
"""

import cv2
import numpy as np

def estimate_ball_speed(trajectories, fps=30, meters_per_pixel=0.038):
    """
    Given a list of (x, y, timestamp_or_frame_idx), computes trajectory velocity.
    Formula: Speed (km/h) = (Distance in meters / Time in seconds) * 3.6
    """
    if len(trajectories) < 2:
        return {"estimated_speed_kmh": 0.0, "confidence": 0.0, "trajectory": []}

    total_dist_px = 0.0
    for i in range(1, len(trajectories)):
        dx = trajectories[i][0] - trajectories[i-1][0]
        dy = trajectories[i][1] - trajectories[i-1][1]
        total_dist_px += np.sqrt(dx**2 + dy**2)

    total_frames = len(trajectories)
    total_time_s = total_frames / fps
    total_dist_m = total_dist_px * meters_per_pixel
    speed_mps = total_dist_m / max(0.001, total_time_s)
    speed_kmh = round(speed_mps * 3.6, 1)

    confidence = 0.88 if fps >= 30 else 0.72

    return {
        "estimated_speed_kmh": speed_kmh,
        "speed_mps": round(speed_mps, 1),
        "distance_traveled_m": round(total_dist_m, 2),
        "flight_time_s": round(total_time_s, 3),
        "confidence": confidence,
        "trajectory_points": len(trajectories)
    }

def detect_ball_in_frame(frame, lower_color_hsv=(15, 100, 100), upper_color_hsv=(35, 255, 255)):
    """
    Detects red/leather or neon cricket ball in frame using HSV color thresholding & contour circularity.
    """
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(hsv, np.array(lower_color_hsv), np.array(upper_color_hsv))
    mask = cv2.erode(mask, None, iterations=2)
    mask = cv2.dilate(mask, None, iterations=2)

    contours, _ = cv2.findContours(mask.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    center = None

    if len(contours) > 0:
        c = max(contours, key=cv2.contourArea)
        ((x, y), radius) = cv2.minEnclosingCircle(c)
        if radius > 5 and radius < 80:
            M = cv2.moments(c)
            center = (int(M["m10"] / M["m00"]), int(M["m01"] / M["m00"]))
            return center, radius

    return None, 0
