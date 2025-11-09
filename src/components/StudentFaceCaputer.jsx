// src/components/StudentFaceCapture.jsx
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import "../css/StudentFaceCapture.css";
import * as tf from "@tensorflow/tfjs";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function StudentFaceCapture() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showRetake, setShowRetake] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);

  const blinkCountRef = useRef(0);
  const eyeClosedRef = useRef(false);
  const consecutiveNoFaceCountRef = useRef(0);

  const EAR_THRESHOLD = 0.26;
  const BLINKS_REQUIRED = 3;

  // ✅ TensorFlow backend setup
  useEffect(() => {
    const setupBackend = async () => {
      try {
        await tf.setBackend("webgl");
        await tf.ready();
        console.log("✅ WebGL backend ready");
      } catch (err) {
        console.warn("⚠️ WebGL failed, switching to CPU");
        await tf.setBackend("cpu");
        await tf.ready();
        console.log("✅ CPU backend ready");
      }
    };
    setupBackend();
  }, []);

  // ✅ Load departments
  useEffect(() => {
    const fetchDeps = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/departments`);
        setDepartments(res.data || []);
      } catch (err) {
        console.error("Unable to load departments", err);
      }
    };
    fetchDeps();
  }, []);

  // ✅ Load students based on department
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedDept) return;
      setLoadingStudents(true);
      try {
        const res = await axios.get(
          `${API_BASE}/api/students/${encodeURIComponent(selectedDept)}`
        );
        setStudents(res.data || []);
      } catch (err) {
        console.warn("No students or error", err);
        setStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedDept]);

  // ✅ Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
        console.log("✅ face-api models loaded");
      } catch (err) {
        console.error("Error loading face-api models", err);
      }
    };
    loadModels();
  }, []);

  // ✅ Camera start/stop
  useEffect(() => {
    if (!selectedEnrollment) {
      stopCameraAndDetection();
      resetBlinkState();
      return;
    }

    startCamera();
    detectionIntervalRef.current = setInterval(runDetection, 150);
    return () => {
      stopCameraAndDetection();
    };
  }, [selectedEnrollment, modelsLoaded]);

  async function startCamera() {
    resetBlinkState(); // reset blink detection
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user", // ✅ use front camera
          width: { ideal: 1080 },
          height: { ideal: 1920 }, // ✅ portrait style height
          aspectRatio: 0.5625, // ✅ 9:16 ratio (tall frame)
        },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      console.log("🎥 Portrait camera started successfully");
    } catch (err) {
      console.error("❌ Camera permission denied or error:", err);
      alert("Unable to access camera. Please allow camera access and try again.");
    }
  }


  function stopCameraAndDetection() {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    try {
      const stream = videoRef.current?.srcObject;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    } catch { }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }

  // ✅ Reset blink
  function resetBlinkState() {
    blinkCountRef.current = 0;
    eyeClosedRef.current = false;
    consecutiveNoFaceCountRef.current = 0;
  }

  // ✅ Face + Blink Detection
  async function runDetection() {
    if (!modelsLoaded || !videoRef.current) return;
    const video = videoRef.current;
    if (video.paused || video.ended) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      const detections = await faceapi
        .detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
        )
        .withFaceLandmarks(true);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!detections || detections.length === 0) return;

      const main = detections.reduce(
        (best, det) =>
          det.detection.box.area > (best?.detection.box.area || 0) ? det : best,
        null
      );

      const { x, y, width, height } = main.detection.box;

      ctx.lineWidth = 3;
      ctx.strokeStyle = "limegreen";
      ctx.strokeRect(x - 6, y - 6, width + 12, height + 12);
      ctx.font = "14px Arial";
      ctx.fillStyle = "limegreen";
      ctx.fillText(`Blink: ${blinkCountRef.current}/3`, x, y - 10);

      const landmarks = main.landmarks;
      const leftEye = landmarks?.getLeftEye?.();
      const rightEye = landmarks?.getRightEye?.();
      if (!leftEye || !rightEye) return;

      const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
      const computeEAR = (eye) => {
        const A = dist(eye[1], eye[5]);
        const B = dist(eye[2], eye[4]);
        const C = dist(eye[0], eye[3]);
        return (A + B) / (2.0 * C);
      };

      const leftEAR = computeEAR(leftEye);
      const rightEAR = computeEAR(rightEye);
      const ear = (leftEAR + rightEAR) / 2;
      if (!isFinite(ear)) return;

      if (ear < EAR_THRESHOLD) {
        eyeClosedRef.current = true;
      } else {
        if (eyeClosedRef.current) {
          blinkCountRef.current++;
          console.log(`👁️ Blink ${blinkCountRef.current}/3`);
          eyeClosedRef.current = false;
        }
      }

      if (blinkCountRef.current >= BLINKS_REQUIRED) {
        console.log("📸 Capturing after 3 blinks...");
        blinkCountRef.current = 0;
        await capturePreview(); // show preview instead of uploading directly
        stopCameraAndDetection();
      }
    } catch (err) {
      console.error("Detection error:", err);
    }
  }

  // ✅ Capture Preview (before saving)
  async function capturePreview() {
    try {
      const vd = videoRef.current;
      if (!vd || vd.readyState !== 4) return;

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = vd.videoWidth;
      tempCanvas.height = vd.videoHeight;
      const ctx = tempCanvas.getContext("2d");
      ctx.drawImage(vd, 0, 0, tempCanvas.width, tempCanvas.height);

      const imageDataUrl = tempCanvas.toDataURL("image/jpeg");
      setPreviewImage(imageDataUrl);
      setShowRetake(true);
      stopCameraAndDetection();
    } catch (err) {
      console.error("❌ Capture error:", err);
    }
  }

  // ✅ Save Captured Photo
  async function saveCapturedPhoto() {
    try {
      if (!previewImage) return;

      const blob = await (await fetch(previewImage)).blob();
      const filename = `${selectedEnrollment}.jpg`;

      // ✅ Create FormData in correct order
      const formData = new FormData();
      formData.append("enrollmentNo", selectedEnrollment);
      formData.append("faceImage", blob, filename);

      const res = await axios.post(`${API_BASE}/api/faces/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        console.log("✅ Photo saved successfully");
        showPopupMessage("✅ Face saved successfully!", "success");
        fetchStudentsForSelectedDept();
        setShowRetake(false);
        setPreviewImage(null);
      } else {
        showPopupMessage("⚠️ Upload failed. Try again.", "error");
      }
    } catch (err) {
      console.error("❌ Save error:", err);
    }
  }

  // ✅ Retake Photo
  function retakePhoto() {
    setPreviewImage(null);
    setShowRetake(false);
    resetBlinkState(); // reset previous blink count

    startCamera(); // start webcam again

    // 🧠 restart detection loop
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    detectionIntervalRef.current = setInterval(runDetection, 150);
  }

  // ✅ Popup message
  function showPopupMessage(message, type = "success") {
    const popup = document.createElement("div");
    popup.textContent = message;
    popup.className = `popup-message ${type}`;
    document.body.appendChild(popup);
    setTimeout(() => popup.classList.add("show"), 10);
    setTimeout(() => {
      popup.classList.remove("show");
      setTimeout(() => popup.remove(), 300);
    }, 2500);
  }

  async function fetchStudentsForSelectedDept() {
    if (!selectedDept) return;
    try {
      const res = await axios.get(
        `${API_BASE}/api/students/${encodeURIComponent(selectedDept)}`
      );
      setStudents(res.data || []);
    } catch {
      setStudents([]);
    } finally {
      setSelectedEnrollment("");
    }
  }

  // ✅ Render UI
  return (
    <div className="face-capture-container">
      <h2 className="face-capture-title">📸 Student Face Capture (Auto)</h2>
      <p className="face-capture-subtitle">
        Select Enrollment to open camera — blink 3× to auto-capture
      </p>

      <div className="face-capture-field">
        <label className="face-capture-label">Select Department:</label>
        <select
          className="face-capture-select"
          value={selectedDept}
          onChange={(e) => {
            setSelectedDept(e.target.value);
            setStudents([]);
            setSelectedEnrollment("");
          }}
        >
          <option value="">-- Choose Department --</option>
          {departments.map((d) => (
            <option key={d.deptId} value={d.deptName}>
              {d.deptName}
            </option>
          ))}
        </select>
      </div>

      <div className="face-capture-field">
        <label className="face-capture-label">Select Enrollment No:</label>
        <select
          className="face-capture-select"
          value={selectedEnrollment}
          onChange={(e) => setSelectedEnrollment(e.target.value)}
        >
          <option value="">
            {loadingStudents ? "Loading..." : "-- Choose Enrollment No --"}
          </option>
          {students.map((stu) => (
            <option key={stu.enrollmentNo} value={stu.enrollmentNo}>
              {stu.enrollmentNo} - {stu.firstName || ""}
            </option>
          ))}
        </select>
      </div>

      {/* Camera + Preview Section */}
      <div style={{ textAlign: "center", marginTop: 8 }}>
        {showRetake && previewImage ? (
          <div>
            <div className="face-preview-container">
              <img src={previewImage} alt="Captured Preview" />
            </div>
            <div className="mt-2">
              <button className="btn btn-success me-2" onClick={saveCapturedPhoto}>
                ✅ Save Photo
              </button>
              <button className="btn btn-warning" onClick={retakePhoto}>
                🔄 Retake
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              position: "relative",
              display: selectedEnrollment ? "inline-block" : "none",
              width: "100%",
              maxWidth: "480px",
              margin: "0 auto",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <video
              ref={videoRef}
              muted
              playsInline
              style={{
                width: "100%",
                maxWidth: "480px",
                height: "640px",
                borderRadius: "12px",
                objectFit: "cover",
                objectPosition: "center top",
                backgroundColor: "#000",
              }}
            />
            <canvas
              ref={canvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "640px",
                pointerEvents: "none",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
