import React, { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./RegisterFace.css";

const RegisterFace = () => {
  const videoRef = useRef();
  const [status, setStatus] = useState("Initializing...");
  const [isLoading, setIsLoading] = useState(false);
  const backend = "https://cloud-computing-project1.onrender.com";

  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus("Loading face models...");

        await faceapi.nets.tinyFaceDetector.loadFromUri(
          "/models/tiny_face_detector_model-weights_manifest.json"
        );
        await faceapi.nets.faceLandmark68Net.loadFromUri(
          "/models/face_landmark_68_model-weights_manifest.json"
        );
        await faceapi.nets.faceRecognitionNet.loadFromUri(
          "/models/face_recognition_model-weights_manifest.json"
        );

        startVideo();
      } catch (error) {
        console.error("Model loading failed:", error);
        setStatus("Error loading models.");
      }
    };

    loadModels();
  }, []);

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setStatus("Camera ready. Position your face clearly.");
      })
      .catch(() => setStatus("Camera access denied."));
  };

  const handleRegisterFace = async () => {
    setIsLoading(true);
    setStatus("Capturing face data...");

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setStatus("No face detected. Try again.");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setStatus("Not logged in.");
        return;
      }

      const userId = jwtDecode(token).id;

      const response = await axios.post(`${backend}/api/face/register-face`, {
        userId,
        descriptor: detection.descriptor,
      });

      setStatus(response.data.message || "Face registered!");
    } catch (error) {
      setStatus("Error registering face");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-face-container">
      <h2>Register Your Face</h2>
      <video ref={videoRef} autoPlay muted width="480" height="360" />
      <button onClick={handleRegisterFace} disabled={isLoading}>
        {isLoading ? "Saving..." : "Register Face"}
      </button>
      <p className="status">{status}</p>
    </div>
  );
};

export default RegisterFace;
