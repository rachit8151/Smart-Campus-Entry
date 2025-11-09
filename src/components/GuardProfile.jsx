import React, { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import "../css/Profile.css";
import { useNavigate } from "react-router-dom";

const GuardProfile = ({ showAlert }) => {
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const sgId = sessionStorage.getItem("sgId");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    aadharNo: "",
    address: "",
    shift: "",
    joiningDate: "",
    photoUrl: "",
  });
  const [preview, setPreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // ✅ Camera State
  const [cameraMode, setCameraMode] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const webcamRef = useRef(null);

  // ✅ Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!sgId) return;
        const { data } = await axios.get(`${API_BASE}/api/securityGuard/profile/${sgId}`);
        if (data.success && data.guard) {
          setFormData(data.guard);
          if (data.guard.photoUrl) {
            const fullUrl = data.guard.photoUrl.startsWith("http")
              ? data.guard.photoUrl
              : `${API_BASE}${data.guard.photoUrl}`;
            setPreview(fullUrl);
          }
        }
      } catch (err) {
        console.error("❌ Error fetching Security Guard profile:", err);
        showAlert("Failed to load profile", "danger");
      }
    };
    fetchProfile();
  }, [sgId]);

  // ✅ Handle text inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Trigger photo action — ask user
  const handlePhotoClick = () => {
    const choice = window.confirm(
      "Press OK to open Camera or Cancel to upload photo from system"
    );
    if (choice) {
      // only request permission when OK clicked
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => {
          console.log("✅ Camera permission granted");
          setCameraError(false);
          setCameraMode(true);
        })
        .catch((err) => {
          console.error("🚫 Camera permission denied:", err);
          setCameraError(true);
          showAlert("Camera access denied. Please check permissions.", "danger");
        });
    } else {
      document.getElementById("photoUpload").click();
    }
  };

  // ✅ Capture from camera
  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return showAlert("Unable to capture image.", "danger");

    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "captured_photo.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
        setPreview(imageSrc);
        setCameraMode(false);
      });
  };

  // ✅ Handle file upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => form.append(key, formData[key]));
      if (selectedFile) form.append("photo", selectedFile);

      const { data } = await axios.put(
        `${API_BASE}/api/securityGuard/profile/${sgId}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data.success) {
        showAlert("Profile updated successfully!", "success");
        if (data.guard.photoUrl) {
          setPreview(`${API_BASE}${data.guard.photoUrl}`);
        }
        setTimeout(() => navigate("/GuardDash"), 2500);
      }
    } catch (err) {
      console.error("❌ Error updating Security Guard profile:", err);
      showAlert("Update failed. Try again.", "danger");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card shadow">
        <h2 className="text-center mb-4">Security Guard Profile</h2>

        {/* ✅ CAMERA / PHOTO AREA */}
        <div className="text-center mb-3">
          {!cameraMode ? (
            <>
              <label onClick={handlePhotoClick} className="profile-img-label">
                <img
                  src={
                    preview || "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                  }
                  alt="Profile"
                  className="profile-img-square shadow"
                />
              </label>
              <p className="text-muted small mt-1">
                Click image to use Camera or Upload Photo
              </p>
              <input
                type="file"
                id="photoUpload"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </>
          ) : (
            <div className="camera-box">
              {cameraError ? (
                <p className="text-danger">
                  🚫 Unable to access camera. Please check browser settings or close other apps.
                </p>
              ) : (
                <>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    playsInline={true}
                    className="webcam-preview"
                    videoConstraints={{
                      facingMode: { ideal: "user" },
                    }}
                  />
                  <div className="mt-2">
                    <button
                      className="btn btn-success me-2"
                      type="button"
                      onClick={capturePhoto}
                    >
                      Capture
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => setCameraMode(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ✅ Profile Fields */}
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Gender</label>
              <select
                name="gender"
                className="form-control"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <div className="col-md-6 mb-3">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob ? formData.dob.substring(0, 10) : ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Aadhar Number</label>
              <input
                type="text"
                name="aadharNo"
                value={formData.aadharNo}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-12 mb-3">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Shift</label>
              <input
                type="text"
                name="shift"
                value={formData.shift}
                className="form-control"
                disabled
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate ? formData.joiningDate.substring(0, 10) : ""}
                className="form-control"
                disabled
              />
            </div>
          </div>

          <div className="text-center">
            <button type="submit" className="btn btn-primary px-4">
              Update Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuardProfile;
