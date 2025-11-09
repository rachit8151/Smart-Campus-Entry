import React, { useState, useEffect } from "react";
import axios from "axios";

const RegisterGuest = () => {
  const username = sessionStorage.getItem("username");
  const dId = Number(sessionStorage.getItem("dId"));
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [guests, setGuests] = useState([]);
  const [formData, setFormData] = useState({
    guestName: "",
    contact: "",
    visitPurpose: "",
    visitDate: "",
    enterTime: "",
    outTime: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchGuests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/guest/byDepartment/${dId}`);
      setGuests(res.data);
    } catch (err) {
      console.error("Error fetching guests:", err);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Validation before submit
  const validateForm = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const contactRegex = /^[0-9]{10}$/;

    if (!nameRegex.test(formData.guestName)) {
      alert("❌ Guest name should contain only letters and spaces");
      return false;
    }
    if (!contactRegex.test(formData.contact)) {
      alert("❌ Contact number must be exactly 10 digits");
      return false;
    }
    if (formData.visitPurpose.trim().length < 5) {
      alert("❌ Visit purpose should be at least 5 characters long");
      return false;
    }

    const selectedDate = new Date(formData.visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      alert("❌ Visit date must be later than today");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await axios.post(`${API_BASE}/api/guest/add`, { ...formData, dId });
      alert("✅ Guest Registered Successfully!");
      fetchGuests();
      setFormData({
        guestName: "",
        contact: "",
        visitPurpose: "",
        visitDate: "",
        enterTime: "",
        outTime: "",
      });
    } catch (err) {
      console.error("Error registering guest:", err);
      alert(err.response?.data?.message || "❌ Error registering guest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Welcome, {username}</h2>

      <div className="card p-4 shadow mt-3">
        <h4>Register New Guest</h4>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <label>Guest Name</label>
              <input
                type="text"
                name="guestName"
                value={formData.guestName}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="col-md-6">
              <label>Contact</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-6">
              <label>Purpose of Visit</label>
              <textarea
                name="visitPurpose"
                value={formData.visitPurpose}
                onChange={handleChange}
                className="form-control"
                rows="2"
                required
              />
            </div>
            <div className="col-md-3">
              <label>Visit Date</label>
              <input
                type="date"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="col-md-3">
              <label>Enter Time</label>
              <input
                type="time"
                name="enterTime"
                value={formData.enterTime}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-md-3">
              <label>Out Time</label>
              <input
                type="time"
                name="outTime"
                value={formData.outTime}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <button className="btn btn-primary mt-3" disabled={loading}>
            {loading ? "⏳ Registering..." : "Register Guest"}
          </button>
        </form>
      </div>

      <div className="card p-4 shadow mt-4">
        <h4>Your Registered Guests</h4>
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Contact</th>
              <th>Purpose</th>
              <th>Visit Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr key={g._id}>
                <td>{g.guestName}</td>
                <td>{g.contact}</td>
                <td>{g.visitPurpose}</td>
                <td>{new Date(g.visitDate).toLocaleDateString()}</td>
                <td>{g.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegisterGuest;
