import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GuestApprovals = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all guests
  const fetchGuests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/guest/byDepartment/1`);
      setGuests(res.data || []);
    } catch (err) {
      console.error("❌ Error fetching guests:", err);
      toast.error("Failed to fetch guest list.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load guest list on component mount
  useEffect(() => {
    fetchGuests();

    const fetchGuestsAndMarkRead = async () => {
      try {
        await axios.put(`${API_BASE}/api/guest/markAllRead`);
        console.log("✅ All pending guests marked as read.");
      } catch (err) {
        console.error("Error marking guests as read:", err);
      }
    };
    fetchGuestsAndMarkRead();
  }, []);

  // ✅ Update guest status (Approve / Reject)
  const updateStatus = async (gId, status) => {
    try {
      const res = await axios.put(`${API_BASE}/api/guest/updateStatus/${gId}`, { status });

      if (res.data.success) {
        toast.success(`Guest ${status.toLowerCase()} successfully!`);
        fetchGuests();
      } else {
        toast.warning("Guest update failed!");
      }
    } catch (err) {
      console.error("❌ Error updating status:", err);
      toast.error("Server error while updating guest status.");
    }
  };

  return (
    <div className="container mt-5">
      {/* Toast Container */}
      <ToastContainer position="bottom-right" autoClose={3000} />

      <h3 className="text-center mb-4">Guest Approval Requests</h3>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading guests...</p>
        </div>
      ) : (
        <table className="table table-bordered shadow text-center align-middle">
          <thead className="table-dark">
            <tr>
              <th>Guest Name</th>
              <th>Contact</th>
              <th>Purpose</th>
              <th>Visit Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {guests.length > 0 ? (
              guests.map((g) => (
                <tr key={g._id}>
                  <td>{g.guestName}</td>
                  <td>{g.contact}</td>
                  <td>{g.visitPurpose}</td>
                  <td>{new Date(g.visitDate).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={`badge ${
                        g.status === "Approved"
                          ? "bg-success"
                          : g.status === "Rejected"
                          ? "bg-danger"
                          : "bg-secondary"
                      }`}
                    >
                      {g.status}
                    </span>
                  </td>
                  <td>
                    {g.status === "Pending" ? (
                      <>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => updateStatus(g.gId, "Approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => updateStatus(g.gId, "Rejected")}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-muted fst-italic">
                        {g.status} by Admin
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-muted">
                  No guest records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default GuestApprovals;
