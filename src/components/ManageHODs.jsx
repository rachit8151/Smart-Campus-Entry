import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageHODs = () => {
  const [hods, setHODs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://localhost:3000/api/universityAdmin";

  // ✅ Fetch HODs (with optional search)
  const fetchHODs = async (query = "") => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/hods?search=${query}`);
      setHODs(res.data.hods || []);
    } catch (err) {
      console.error("Error fetching HODs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHODs();
  }, []);

  // ✅ Async search handler
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchHODs(value);
  };

  // ✅ Toggle HOD status
  const toggleStatus = async (regId) => {
    try {
      await axios.put(`${API_BASE}/hods/toggle/${regId}`);
      fetchHODs(search);
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Manage HODs</h2>

      {/* 🔍 Search Bar */}
      <div className="mb-3 text-center">
        <input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="Search by username or department"
          className="form-control w-50 d-inline"
        />
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <table className="table table-bordered table-striped text-center">
          <thead className="table-dark">
            <tr>
              <th>Sr No</th>
              <th>Username</th>
              <th>Department</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {hods.length > 0 ? (
              hods.map((h, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{h.username}</td>
                  <td>{h.department}</td>
                  <td>
                    <span
                      className={`badge ${
                        h.status === "Active" ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {h.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${
                        h.status === "Active" ? "btn-danger" : "btn-success"
                      }`}
                      onClick={() => toggleStatus(h.regId)}
                    >
                      {h.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-muted">
                  No HODs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageHODs;
