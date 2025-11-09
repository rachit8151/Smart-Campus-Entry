import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../css/Profile.css";
import Webcam from "react-webcam";
//npm install react-webcam
const UniAdminProfile = ({ showAlert }) => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const regId = sessionStorage.getItem("regId");

  // ----------------------
  // 🧩 State Management
  // ----------------------
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    aadharNo: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    photoUrl: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [cameraMode, setCameraMode] = useState(false); // ✅ new state
  const webcamRef = useRef(null); // ✅ ref for webcam
  const [cameraError, setCameraError] = useState(false);
  const [cameraId, setCameraId] = useState(null); // ✅ camera device state

  // ----------------------
  // 🧭 Fetch States
  // ----------------------
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/location/states`);
        if (data.success && data.states) setStates(data.states);
      } catch (err) {
        console.error("❌ Error fetching states:", err);
      }
    };
    fetchStates();
  }, []);

  // ----------------------
  // 🏙️ Fetch Cities when State changes
  // ----------------------
  useEffect(() => {
    const fetchCities = async () => {
      if (!formData.state) return; // ✅ stop if state not selected
      const selectedState = states.find((s) => s.sName === formData.state);
      if (!selectedState) return;

      try {
        const { data } = await axios.get(`${API_BASE}/api/location/cities/${selectedState.sId}`);
        if (data.success && data.cities) setCities(data.cities);
      } catch (err) {
        console.error("❌ Error fetching cities:", err);
      }
    };

    fetchCities();
  }, [formData.state, states]);

  // ----------------------
  // 📍 Auto-fill Pincode when City changes
  // ----------------------
  useEffect(() => {
    if (!formData.city) return;
    const selectedCity = cities.find((c) => c.cName === formData.city);
    if (selectedCity && selectedCity.pincode) {
      setFormData((prev) => ({ ...prev, pincode: selectedCity.pincode }));
    }
  }, [formData.city, cities]);

  // ----------------------
  // 🧾 Fetch existing profile
  // ----------------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/universityAdmin/profile/${regId}`);
        if (data.success && data.admin) {
          setFormData((prev) => ({
            ...prev,
            ...data.admin,
          }));
          if (data.admin.photoUrl) setPreview(`${API_BASE}${data.admin.photoUrl}`);
        }
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
        showAlert && showAlert("Failed to load profile.", "danger");
      }
    };
    if (regId) fetchProfile();
  }, [regId]);
  // ---------------------- Detect & Pick Camera ----------------------
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      console.log("🎥 Available cameras:", videoDevices);

      const defaultCam =
        videoDevices.find((d) => !d.label.toLowerCase().includes("redmi")) || videoDevices[0];

      if (defaultCam) {
        console.log("✅ Selected camera:", defaultCam.label);
        setCameraId(defaultCam.deviceId);
      } else {
        setCameraError(true);
        showAlert && showAlert("No camera detected on this device.", "danger");
      }
    });
  }, []);

  // ---------------------- Capture Photo ----------------------
  const capturePhoto = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      showAlert("Unable to capture image. Try again.", "danger");
      return;
    }

    setPreview(imageSrc);
    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "captured_photo.jpg", { type: "image/jpeg" });
        setSelectedFile(file);
        setCameraMode(false);
      });
  };

  // ---------------------- File Upload ----------------------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoClick = () => {
    const choice = window.confirm("Press OK to open camera or Cancel to upload from system");
    if (choice) setCameraMode(true);
    else document.getElementById("photoUpload").click();
  };

  // ----------------------
  // ✍️ Handle changes
  // ----------------------
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ----------------------
  // 🖼️ Handle image change
  // ----------------------
  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setSelectedFile(file);
  //     setPreview(URL.createObjectURL(file));
  //   }
  // };

  // ----------------------
  // 💾 Submit Update
  // ----------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const form = new FormData();
      Object.keys(formData).forEach((key) => form.append(key, formData[key]));
      if (selectedFile) form.append("photo", selectedFile);

      const { data } = await axios.put(
        `${API_BASE}/api/universityAdmin/profile/${regId}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data.success) {
        showAlert && showAlert("Profile updated successfully!", "success");
        if (data.admin.photoUrl) setPreview(`${API_BASE}${data.admin.photoUrl}`);
      } else {
        showAlert && showAlert(data.message || "⚠️ Could not update profile.", "warning");
      }
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      showAlert &&
        showAlert(
          err.response?.data?.message ||
          "🚫 Unexpected error occurred. Please try again.",
          "danger"
        );
    }
  };

  // ----------------------
  // 🖋️ UI Render
  // ----------------------
  return (
    <div className="profile-container">
      <div className="profile-card shadow">
        <h2 className="text-center mb-4">
          <i className="bi bi-person-circle me-2"></i>My Profile
        </h2>

        {/* ✅ Camera / Photo */}
        <div className="text-center mb-3">
          {!cameraMode ? (
            <>
              <label onClick={handlePhotoClick} className="profile-img-label">
                <img
                  src={preview || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                  alt="Profile"
                  className="profile-img-square shadow"
                />
              </label>
              <p className="text-muted small mt-1">Click image to use Camera or Upload photo</p>
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
                  🚫 Unable to access camera. Please check settings or close other apps.
                </p>
              ) : (
                <>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className="webcam-preview"
                    videoConstraints={{
                      deviceId: cameraId ? { exact: cameraId } : undefined,
                      width: 640,
                      height: 480,
                      facingMode: "user",
                    }}
                    onUserMedia={() => console.log("✅ Camera started")}
                    onUserMediaError={(err) => {
                      console.error("🚫 Camera error:", err);
                      setCameraError(true);
                    }}
                  />
                  <div className="mt-2">
                    <button className="btn btn-success me-2" type="button" onClick={capturePhoto}>
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

        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* First Name */}
            <div className="col-md-6 mb-3">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* Last Name */}
            <div className="col-md-6 mb-3">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* Gender */}
            <div className="col-md-6 mb-3">
              <label>Gender</label>
              <select
                name="gender"
                value={formData.gender || ""}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            {/* DOB */}
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

            {/* Aadhar */}
            <div className="col-md-6 mb-3">
              <label>Aadhar Number</label>
              <input
                type="text"
                name="aadharNo"
                value={formData.aadharNo || ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* Address */}
            <div className="col-md-12 mb-3">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* State Dropdown */}
            <div className="col-md-4 mb-3">
              <label>State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.sId} value={s.sName}>
                    {s.sName}
                  </option>
                ))}
              </select>
            </div>

            {/* City Dropdown */}
            <div className="col-md-4 mb-3">
              <label>City</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Select City</option>
                {cities.map((c) => (
                  <option key={c.cId} value={c.cName}>
                    {c.cName}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto-filled Pincode */}
            <div className="col-md-4 mb-3">
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode || ""}
                className="form-control"
                readOnly
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

export default UniAdminProfile;
