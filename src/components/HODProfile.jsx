import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/Profile.css";
import { useNavigate } from "react-router-dom";

const HODProfile = ({ showAlert }) => {
  const [isLocked, setIsLocked] = useState(false);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const dId = sessionStorage.getItem("dId");

  const [loading, setLoading] = useState(true);
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
    course: "",
    qualification: "",
    experienceYear: "",
    photoUrl: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");

  // ✅ Fetch HOD data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!dId) return;
        const { data } = await axios.get(`${API_BASE}/api/hod/profile/${dId}`);
        if (data.success && data.hod) {
          const sanitized = Object.fromEntries(
            Object.entries(data.hod).map(([k, v]) => [k, v ?? ""])
          );
          setFormData(sanitized);
          setIsLocked(data.hod.isProfileLocked); // 👈 track lock state
          if (data.hod.photoUrl) {
            setPreview(`${API_BASE}${data.hod.photoUrl}`);
          }
        }
      } catch (err) {
        console.error("❌ Error fetching HOD profile:", err);
        showAlert && showAlert("Failed to load profile.", "danger");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [dId]);


  // ✅ Handle field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle photo change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file)); // instant preview
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
        `${API_BASE}/api/hod/profile/${dId}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data.success) {
        showAlert && showAlert("Profile updated successfully!", "success");
        if (data.hod.photoUrl) {
          setPreview(`${API_BASE}${data.hod.photoUrl}`);
        }
        // ✅ Wait 5 seconds then redirect to dashboard
        setTimeout(() => {
          navigate("/HODDash");
        }, 3000);
        showAlert && showAlert("Profile updated successfully! Redirecting to dashboard...", "success");
      }
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      showAlert && showAlert("Update failed. Try again.", "danger");
    }
  };

  if (loading)
    return (
      <div className="profile-container text-center mt-5">
        <h4>Loading profile...</h4>
      </div>
    );

  return (
    <div className="profile-container">
      <div className="profile-card shadow">
        <h2 className="text-center mb-4">
          <i className="bi bi-person-circle me-2"></i>My Profile
        </h2>

        {/* Small Square Profile Photo */}
        <div className="text-center mb-3">
          <label htmlFor="photoUpload" className="profile-img-label">
            <img
              src={
                preview ||
                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              alt="Profile"
              className="profile-img-square shadow"
            />
          </label>
          <input
            type="file"
            id="photoUpload"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
          <p className="text-muted small mt-1">
            Click image to change photo
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* First Name */}
            <div className="col-md-6 mb-3">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            {/* Last Name */}
            <div className="col-md-6 mb-3">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            {/* Gender */}
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
                <option>Other</option>
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
                value={formData.aadharNo}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* Department */}
            <div className="col-md-6 mb-3">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                className="form-control"
                disabled
              />
            </div>
            {/* Course */}
            <div className="col-md-6 mb-3">
              <label>Course</label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* Qualification */}
            <div className="col-md-6 mb-3">
              <label>Qualification</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* Experience */}
            <div className="col-md-6 mb-3">
              <label>Experience (Years)</label>
              <input
                type="number"
                name="experienceYear"
                value={formData.experienceYear}
                onChange={handleChange}
                className="form-control"
                min="0"
              />
            </div>

            {/* Address */}
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

            {/* City, State, Pincode */}
            <div className="col-md-4 mb-3">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          {!isLocked ? (
            <div className="text-center">
              <button type="submit" className="btn btn-primary px-4">
                Update Profile
              </button>
            </div>
          ) : (
            <p className="text-center text-success fw-bold mt-3">
              ✅ Profile locked. Contact admin to modify details.
            </p>
          )}

        </form>
      </div>
    </div>
  );
};

export default HODProfile;
