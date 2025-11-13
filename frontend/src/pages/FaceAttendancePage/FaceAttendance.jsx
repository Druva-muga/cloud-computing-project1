import React, { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./FaceAttendance.css";

const FaceAttendance = () => {
  const videoRef = useRef();
  const [status, setStatus] = useState("Initializing...");
  const [isLoading, setIsLoading] = useState(false);
  const backend = "https://cloud-computing-project1.onrender.com";

  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus("Loading face models...");
        await faceapi.nets.tinyFaceDetector.loadFromUri(
          "/models/tiny_face_detector_model"
        );
        await faceapi.nets.faceLandmark68Net.loadFromUri(
          "/models/face_landmark_68_model"
        );
        await faceapi.nets.faceRecognitionNet.loadFromUri(
          "/models/face_recognition_model"
        );
        startVideo();
      } catch (error) {
        console.error("Model loading failed:", error);
        setStatus("Error loading models. Please refresh the page.");
      }
    };
    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setStatus("Camera ready. Look straight into the camera.");
      })
      .catch(() => setStatus("Camera access denied."));
  };

  const handleMarkAttendance = async () => {
    setIsLoading(true);
    setStatus("Detecting face...");

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setStatus("No face detected. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setStatus("Not logged in. Please login first.");
        return;
      }

      const userId = jwtDecode(token).id;

      const response = await axios.post(`${backend}/api/face/verify-face`, {
        userId,
        descriptor: detection.descriptor,
      });

      setStatus(response.data.message || "Attendance marked successfully!");
    } catch (error) {
      console.error("Face verification failed:", error);
      setStatus(error.response?.data?.message || "Error verifying face");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="face-container">
      <h2>Face Attendance</h2>
      <video ref={videoRef} autoPlay muted width="480" height="360" />
      <button onClick={handleMarkAttendance} disabled={isLoading}>
        {isLoading ? "Processing..." : "Mark Attendance"}
      </button>
      <p className="status">{status}</p>
    </div>
  );
};

export default FaceAttendance;
