import { Link, useNavigate } from "react-router-dom";
import "../css/Dashboard.css";
import axios from "axios";
import React, { useEffect, useState } from "react";
const UniAdminDash = () => {
  const username = sessionStorage.getItem("username");
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
  // ✅ Fetch unread guest count
  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/guest/unreadCount`);
      if (res.data.success) setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);
  // Redirect to Bulk Student Upload Page
  const goToBulkInsert = () => navigate("/BulkStudentInsert");

  return (
    <div className="admin-dash-container container mt-5">
      {/* Welcome Section */}
      <div className="welcome-box text-center mb-4">
        <h2>
          Welcome, <span className="username">{username || "University Admin"}</span>
        </h2>
        <p className="lead">
          Manage users, upload student data, and update your account settings.
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="row justify-content-center">
        {/* Add New User */}
        <div className="col-md-3">
          <div className="dash-card card shadow text-center p-4 mb-4">
            <h4>Add New User</h4>
            <p>Create new accounts for Department Admin or Security Guards.</p>
            <Link to="/signup" className="btn btn-outline-primary">
              Go to Sign Up
            </Link>
          </div>
        </div>

        {/* Profile */}
        <div className="col-md-3">
          <div className="dash-card card shadow text-center p-4 mb-4">
            <h4>Your Profile</h4>
            <p>View and update your personal details.</p>
            <Link to="/UniAdminProfile" className="btn btn-outline-secondary">
              View Profile
            </Link>
          </div>
        </div>

        {/* Change Password */}
        <div className="col-md-3">
          <div className="dash-card card shadow text-center p-4 mb-4">
            <h4>Change Password</h4>
            <p>Securely update your password to protect your account.</p>
            <Link to="/changePassword" className="btn btn-outline-warning">
              Change Password
            </Link>
          </div>
        </div>

        {/* ✅ Student Bulk Insert */}
        <div className="col-md-3">
          <div className="dash-card card shadow text-center p-4 mb-4">
            <h4>Student Bulk Insertion</h4>
            <p>Upload a CSV file to register multiple students at once.</p>
            <button className="btn btn-outline-success" onClick={goToBulkInsert}>
              Upload CSV
            </button>
          </div>
        </div>

        {/* ✅ Guest Requests */}
        <div className="col-md-3">
          <div className="dash-card card shadow text-center p-4 mb-4">
            <h4>Guest Approvals</h4>
            <p>View and approve guest entries submitted by HODs.</p>
            {/* <Link to="/GuestApprovals" className="btn btn-outline-primary">
              View Guests
            </Link> */}
            <Link to="/GuestApprovals" className="btn btn-outline-primary position-relative">
              View Guests
              {unreadCount > 0 && (
                <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ✅ Manage HODs */}
        <div className="col-md-3">
          <div className="dash-card card shadow text-center p-4 mb-4">
            <h4>Manage HODs</h4>
            <p>View, search, and toggle HOD status.</p>
            <Link to="/manageHODs" className="btn btn-outline-info">
              View HODs
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UniAdminDash;
