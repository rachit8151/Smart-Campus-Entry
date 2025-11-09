import { Link, useNavigate } from "react-router-dom";
import "../css/Dashboard.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
//frontEnd: npm install react-toastify
import { io } from "socket.io-client";
//frontEnd: npm install socket.io
//frontEnd: npm install socket.io-client
import React, { useEffect, useState } from "react";
import { Howl } from "howler";
//frontEnd - backEnd: npm install howler
const HODDash = () => {
  const username = sessionStorage.getItem("username");
  const dId = sessionStorage.getItem("dId");
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [popup, setPopup] = useState(null);
  // ✅ Play notification sound
  const playSound = () => {
    const sound = new Howl({
      src: ["/sounds/tring.mp3"],
      volume: 0.6,
    });
    sound.play();
  };

  useEffect(() => {
    if (!dId) {
      console.warn("⚠️ No department ID found in sessionStorage.");
      return;
    }

    // ✅ Initialize socket connection
    const socket = io(API_BASE, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });

    // ✅ When connected
    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
      socket.emit("registerHOD", dId); // Register HOD to receive notifications
    });
    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection failed:", err.message);
    });

    // ✅ When disconnected
    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected. Attempting reconnection...");
    });

    // ✅ Handle guest approval/rejection notifications
    socket.on("guestStatusUpdate", (data) => {
      console.log("📩 Notification received:", data)
      // Play sound and show popup
      playSound();
      setPopup({
        guestName: data.guestName,
        status: data.status,
        date: data.date,
      });
      toast.info(`${data.guestName} — ${data.status} on ${data.date}`, {
        position: "bottom-right",
        autoClose: 5000,
        theme: data.status === "Approved" ? "colored" : "light",
      });
      // Hide popup after 5 seconds
      setTimeout(() => setPopup(null), 5000);
    });

    // ✅ Handle reconnection
    socket.io.on("reconnect", (attempt) => {
      console.log(`🔁 Reconnected after ${attempt} attempts`);
      socket.emit("registerHOD", dId);
    });

    // ✅ Clean up socket on unmount
    return () => {
      socket.disconnect();
      console.log("🧹 Socket disconnected on unmount");
    };
  }, [dId]);
  // Redirect to Guest Registration Page
  const goToGuestRegistration = () => navigate("/RegisterGuest");

  return (
    <div className="admin-dash-container container mt-5">
      {/* Welcome Section */}
      <div className="welcome-box text-center mb-4">
        <h2>
          Welcome, <span className="username">{username || "HOD"}</span>
        </h2>
        <p className="lead">
          Manage your department guests and view their approval status.
        </p>
      </div>

      <ToastContainer />
      {/* 🔔 Real-time Popup Notification */}
      {popup && (
        <div className="custom-alert animate__animated animate__fadeInUp shadow-lg">
          <strong>{popup.guestName}</strong> — {popup.status} <br />
          <small>{popup.date}</small>
        </div>
      )}

      {/* Dashboard Cards */}
      <div className="row justify-content-center">
        {/* Register Guest */}
        <div className="col-md-3">
          <div className="dash-card card shadow text-center p-4 mb-4">
            <h4>Register Guest</h4>
            <p>Add and manage guests visiting your department.</p>
            <button
              className="btn btn-outline-warning"
              onClick={goToGuestRegistration}
            >
              Go to Form
            </button>
          </div>
        </div>

        {/* Profile */}
        <div className="col-md-3">
          <div className="dash-card card shadow text-center p-4 mb-4">
            <h4>Profile</h4>
            <p>View and update your personal details.</p>
            <Link to="/HODProfile" className="btn btn-outline-primary">
              View Profile
            </Link>
          </div>
        </div>

        {/* View Guests */}
        {/* <div className="col-md-3">
          <div className="dash-card card shadow text-center p-4 mb-4">
            <h4>Your Guests</h4>
            <p>View all guests you have registered and their approval status.</p>
            <Link to="/ViewGuests" className="btn btn-outline-primary">
              View Guests
            </Link>
          </div>
        </div> */}

        {/* Change Password */}
        <div className="col-md-3">
          <div className="dash-card card shadow text-center p-4 mb-4">
            <h4>Change Password</h4>
            <p>Update your password to keep your account secure.</p>
            <Link to="/changePassword" className="btn btn-outline-success">
              Change Password
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HODDash;
