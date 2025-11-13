import React, { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./RegisterFace.css";

const backend = "https://cloud-computing-project1.onrender.com";

const RegisterFace = () => {
  const videoRef = useRef();
  const [status, setStatus] = useState("Initializing...");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus("Loading models...");
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
        startVideo();
      } catch (err) {
        console.error("Model error:", err);
        setStatus("Model load failed");
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

  const handleRegisterFace = async () => {
    try {
      setIsLoading(true);
      setStatus("Detecting face...");

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus("No face detected.");
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${backend}/api/face/register-face`,
        {
          descriptor: detection.descriptor
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setStatus(response.data.message);
    } catch (err) {
      console.error(err);
      setStatus("Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-face-container">
      <h2>Register Face</h2>
      <video ref={videoRef} autoPlay muted width="480" height="360" />
      <button onClick={handleRegisterFace} disabled={isLoading}>
        {isLoading ? "Saving..." : "Register Face"}
      </button>
      <p className="status">{status}</p>
    </div>
  );
};

export default RegisterFace;
