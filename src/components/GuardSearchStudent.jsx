import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../css/Dashboard.css";
// import StudentFaceScan from "./StudentFaceScan";
const GuardSearchStudent = () => {
  const [enrollmentNo, setEnrollmentNo] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // 🔹 Fetch suggestions dynamically as the guard types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (enrollmentNo.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:3000/api/students/suggest?q=${enrollmentNo}`
        );

        if (res.data.success) {
          setSuggestions(res.data.suggestions);
        }
      } catch (err) {
        console.error("❌ Suggestion Fetch Error:", err);
      }
    };

    fetchSuggestions();
  }, [enrollmentNo]);

  const handleSelectSuggestion = (value) => {
    setEnrollmentNo(value);
    setSuggestions([]);
  };

  const handleSearch = async () => {
    if (!enrollmentNo.trim()) {
      Swal.fire("⚠️ Please enter an Enrollment No", "", "warning");
      return;
    }

    Swal.fire({
      title: "Searching...",
      text: "Please wait while we fetch student data.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const res = await axios.get(
        `http://localhost:3000/api/students/search/${enrollmentNo}`
      );
      Swal.close();

      if (res.data.success) {
        const s = res.data.student;
        const imageUrl = s.faceDataUrl
          ? `http://localhost:3000${s.faceDataUrl}`
          : "/images/default-black-profile.png"; // Default image

        Swal.fire({
          title: "🎓 Student Found",
          html: `
            <div style="text-align:center;">
             <img src="${imageUrl}" alt="Student Photo"
  style="width:160px;height:200px;object-fit:cover;border-radius:10px;border:2px solid #ccc;margin-bottom:10px;" />
              <div style="text-align:left; line-height:1.6;">
                <b>Enrollment No:</b> ${s.enrollmentNo}<br>
                <b>Department:</b> ${s.deptName}<br>
                <b>Course:</b> ${s.courseName}<br>
                <b>Academic Year:</b> ${s.academicYear}
              </div>
            </div>
          `,
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire("❌ Not Found", "No record found for this Enrollment Number.", "error");
      }
    } catch (err) {
      Swal.close();
      Swal.fire("❌ Error", "Server connection failed.", "error");
      console.error("❌ Fetch Error:", err);
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-end align-items-center mb-4 position-relative">
        <input
          type="text"
          placeholder="Enter Enrollment No"
          value={enrollmentNo}
          onChange={(e) => setEnrollmentNo(e.target.value)}
          className="form-control w-25 me-2"
          autoComplete="off"
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          Search
        </button>

        {/* 🔹 Google-style autocomplete dropdown */}
        {suggestions.length > 0 && (
          <ul
            className="list-group position-absolute"
            style={{
              top: "100%",
              right: "8px",
              width: "25%",
              zIndex: 1000,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              borderRadius: "8px",
            }}
          >
            {suggestions.map((s, i) => (
              <li
                key={i}
                className="list-group-item list-group-item-action"
                style={{
                  cursor: "pointer",
                  padding: "8px 12px",
                }}
                onClick={() => handleSelectSuggestion(s.value)}
              >
                <span style={{ fontWeight: "500" }}>{s.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-center text-muted mt-5">
        <p>Type Enrollment Number to search for student details.</p>
      </div>
      {/* <StudentFaceScan /> */}
    </div>
  );
};

export default GuardSearchStudent;
