import React, { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./FaceAttendance.css";

const backend = "https://cloud-computing-project1.onrender.com";

const FaceAttendance = () => {
  const videoRef = useRef();
  const [status, setStatus] = useState("Initializing...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus("Loading models...");
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
        startVideo();
      } catch (error) {
        console.error("Model error:", error);
        setStatus("Model load failed.");
      }
    };
    loadModels();
  }, []);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      setStatus("Camera ready.");
    } catch {
      setStatus("Camera access denied");
    }
  };

  const markAttendance = async () => {
    try {
      setLoading(true);
      setStatus("Detecting face...");

      const det = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!det) {
        setStatus("Face not detected.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${backend}/api/face/verify-face`,
        { descriptor: det.descriptor },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setStatus(response.data.message);
    } catch (err) {
      console.error(err);
      setStatus("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="face-container">
      <h2>Face Attendance</h2>
      <video ref={videoRef} autoPlay muted width="480" height="360" />
      <button onClick={markAttendance} disabled={loading}>
        {loading ? "Processing..." : "Mark Attendance"}
      </button>
      <p className="status">{status}</p>
    </div>
  );
};

export default FaceAttendance;
