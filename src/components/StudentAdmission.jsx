import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../css/Profile.css";
import Papa from "papaparse";
import * as XLSX from "xlsx-js-style";
import { saveAs } from "file-saver";


const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const emptyForm = {
  enrollmentNo: "",
  firstName: "",
  lastName: "",
  gender: "Male",
  dob: "",
  aadharNo: "",
  email: "",
  phone: "",
  address: "",
  cityId: "",
  cityName: "",
  district: "",
  stateId: "",
  stateName: "",
  pincode: "",
  category: "",
  nationality: "",
  fatherName: "",
  motherName: "",
  schoolName: "",
  religion: "",
  deptId: "",
  deptName: "",
  courseId: "",
  courseName: "",
  academicYear: "",
};

const StudentAdmission = ({ showAlert }) => {
  const [form, setForm] = useState({ ...emptyForm });
  const [buffer, setBuffer] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [religions, setReligions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const enrollmentRef = useRef(null);

  // ✅ Load dropdown data (States, Departments, Meta)
  useEffect(() => {
    const loadLists = async () => {
      try {
        const [st, deps, metaCat, metaNat, metaRel] = await Promise.all([
          axios.get(`${API_BASE}/api/states`),
          axios.get(`${API_BASE}/api/departments`),
          axios.get(`${API_BASE}/api/meta/categories`),
          axios.get(`${API_BASE}/api/meta/nationalities`),
          axios.get(`${API_BASE}/api/meta/religions`),
        ]);
        setStates(st.data || []);
        setDepartments(deps.data || []);
        setCategories(metaCat.data.data || []);
        setNationalities(metaNat.data.data || []);
        setReligions(metaRel.data.data || []);
      } catch (err) {
        console.error("Failed to load lists", err);
        showAlert && showAlert("Failed to load dropdown lists", "danger");
      } finally {
        setLoading(false);
      }
    };
    loadLists();
  }, []);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const month = new Date().getMonth();
    const yearString =
      month >= 6
        ? `${currentYear}-${(currentYear + 1).toString().slice(-2)}`
        : `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
    setForm((prev) => ({ ...prev, academicYear: yearString }));
  }, []);


  // ✅ Load cities when state changes
  useEffect(() => {
    if (!form.stateId) {
      setCities([]);
      setForm((p) => ({ ...p, cityId: "", cityName: "" }));
      return;
    }
    axios
      .get(`${API_BASE}/api/cities?stateId=${encodeURIComponent(form.stateId)}`)
      .then((res) => setCities(res.data || []))
      .catch(() => setCities([]));
  }, [form.stateId]);

  // ✅ Load courses when department changes
  useEffect(() => {
    if (!form.deptId) {
      setCourses([]);
      setForm((p) => ({ ...p, courseId: "", courseName: "" }));
      return;
    }
    axios
      .get(`${API_BASE}/api/courses?deptId=${encodeURIComponent(form.deptId)}`)
      .then((res) => setCourses(res.data || []))
      .catch(() => setCourses([]));
  }, [form.deptId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "stateId") {
      const s = states.find((x) => String(x.sId) === String(value));
      setForm((p) => ({ ...p, stateId: value, stateName: s ? s.sName : "", cityId: "", cityName: "" }));
      return;
    }
    if (name === "cityId") {
      const c = cities.find((x) => String(x.cId) === String(value));
      setForm((p) => ({ ...p, cityId: value, cityName: c ? c.cName : "" }));
      return;
    }
    if (name === "deptId") {
      const d = departments.find((x) => String(x.deptId) === String(value));
      setForm((p) => ({ ...p, deptId: value, deptName: d ? d.deptName : "", courseId: "", courseName: "" }));
      return;
    }
    if (name === "courseId") {
      const c = courses.find((x) => String(x.courseId) === String(value));
      setForm((p) => ({ ...p, courseId: value, courseName: c ? c.courseName : "" }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateRow = () => {
    if (!form.enrollmentNo) return "Enrollment number required";
    if (!form.firstName) return "First name required";
    if (buffer.some((r) => String(r.enrollmentNo) === String(form.enrollmentNo)))
      return "Duplicate enrollment number in current buffer";
    return null;
  };
  // ==========================================================
  // ✅ Add Row Function
  // ==========================================================
  const handleAddRow = (e) => {
    e.preventDefault();
    const err = validateRow();
    if (err) return showAlert ? showAlert(err, "warning") : alert(err);
    const row = {
      ...form,
      academicYear: form.academicYear || "",
    };
    setBuffer((b) => [...b, row]);
    setForm({ ...emptyForm });
    if (enrollmentRef.current) enrollmentRef.current.focus();
    showAlert && showAlert("Row added to buffer", "success");
  };


  // ==========================================================
  // ✅ Excel Download Function (Final, only this one)
  // ==========================================================
  const handleDownloadExcel = () => {
    if (buffer.length === 0) {
      showAlert && showAlert("No records to export!", "warning");
      return;
    }

    // ✅ Format clean readable data (no IDs)
    const formattedData = buffer.map((student) => ({
      enrollmentNo: student.enrollmentNo,
      firstName: student.firstName,
      lastName: student.lastName,
      gender: student.gender,
      dob: student.dob
        ? new Date(student.dob).toISOString().split("T")[0]
        : "",
      aadharNo: student.aadharNo,
      email: student.email,
      phone: student.phone,
      address: student.address,
      cityName: student.cityName || "",
      district: student.district || "",
      stateName: student.stateName || "",
      pincode: student.pincode || "",
      category: student.category || "",
      nationality: student.nationality || "",
      fatherName: student.fatherName || "",
      motherName: student.motherName || "",
      schoolName: student.schoolName || "",
      religion: student.religion || "",
      deptName: student.deptName || "",
      courseName: student.courseName || "",
      academicYear: student.academicYear || "",
    }));

    // ✅ Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // ✅ Style header row (blue background + white bold text)
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "305496" } },
      alignment: { horizontal: "center", vertical: "center" },
    };

    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (worksheet[cellAddress]) worksheet[cellAddress].s = headerStyle;
    }

    // ✅ Alternating row colors
    for (let R = 1; R <= range.e.r; ++R) {
      const fillColor = R % 2 === 0 ? "F2F2F2" : "FFFFFF";
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            fill: { fgColor: { rgb: fillColor } },
            alignment: { vertical: "center" },
          };
        }
      }
    }

    // ✅ Auto column width
    const colWidths = Object.keys(formattedData[0]).map((key) => ({
      wch: Math.max(15, key.length + 5),
    }));
    worksheet["!cols"] = colWidths;

    // ✅ Freeze header row (stays visible while scrolling)
    worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

    // ✅ Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    // ✅ Generate Excel
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const fileName = `student_admission_${new Date()
      .toISOString()
      .split("T")[0]}.xlsx`;

    saveAs(blob, fileName);

    setBuffer([]);
    showAlert && showAlert("✅ Excel file downloaded successfully!", "success");
  };

  // ==========================================================
  // ✅ Clear Buffer (same as before)
  // ==========================================================
  const handleClearBuffer = () => {
    if (!window.confirm("Clear all rows in buffer?")) return;
    setBuffer([]);
    showAlert && showAlert("Buffer cleared", "info");
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card shadow" style={{ maxWidth: 900 }}>
        <h2 className="text-center mb-4">Student Admission Form</h2>

        <form onSubmit={handleAddRow}>
          <div className="row">
            <div className="col-md-3 mb-2">
              <label>Enrollment No</label>
              <input
                ref={enrollmentRef}
                name="enrollmentNo"
                value={form.enrollmentNo}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="col-md-3 mb-2">
              <label>First Name</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} className="form-control" required />
            </div>

            <div className="col-md-3 mb-2">
              <label>Last Name</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-3 mb-2">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="form-control">
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <div className="col-md-3 mb-2">
              <label>DOB</label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-3 mb-2">
              <label>Aadhar No</label>
              <input name="aadharNo" value={form.aadharNo} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-3 mb-2">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-3 mb-2">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-3 mb-2">
              <label>Academic Year</label>
              <select
                name="academicYear"
                value={form.academicYear}
                onChange={handleChange}
                className="form-control"
                required
              >
                <option value="">Select Year</option>
                <option value="2022-23">2022-23</option>
                <option value="2023-24">2023-24</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
              </select>
            </div>

            <div className="col-md-6 mb-2">
              <label>Address</label>
              <input name="address" value={form.address} onChange={handleChange} className="form-control" />
            </div>

            {/* State & City */}
            <div className="col-md-3 mb-2">
              <label>State</label>
              <select name="stateId" value={form.stateId} onChange={handleChange} className="form-control">
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.sId} value={s.sId}>{s.sName}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3 mb-2">
              <label>City</label>
              <select
                name="cityId"
                value={form.cityId}
                onChange={handleChange}
                className="form-control"
                disabled={!form.stateId}
              >
                <option value="">{form.stateId ? "Select City" : "Select State First"}</option>
                {cities.map((c) => (
                  <option key={c.cId} value={c.cId}>{c.cName}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3 mb-2">
              <label>Pincode</label>
              <input name="pincode" value={form.pincode} onChange={handleChange} className="form-control" />
            </div>

            {/* ✅ Category Dropdown */}
            <div className="col-md-3 mb-2">
              <label>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Select Category</option>
                {categories.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* ✅ Nationality */}
            <div className="col-md-3 mb-2">
              <label>Nationality</label>
              <select
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Select Nationality</option>
                {nationalities.map((n, i) => (
                  <option key={i} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* ✅ Religion */}
            <div className="col-md-3 mb-2">
              <label>Religion</label>
              <select
                name="religion"
                value={form.religion}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Select Religion</option>
                {religions.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3 mb-2">
              <label>Father's Name</label>
              <input name="fatherName" value={form.fatherName} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-3 mb-2">
              <label>Mother's Name</label>
              <input name="motherName" value={form.motherName} onChange={handleChange} className="form-control" />
            </div>

            <div className="col-md-3 mb-2">
              <label>School Name</label>
              <input name="schoolName" value={form.schoolName} onChange={handleChange} className="form-control" />
            </div>

            {/* Department & Course */}
            <div className="col-md-3 mb-2">
              <label>Department</label>
              <select name="deptId" value={form.deptId} onChange={handleChange} className="form-control">
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.deptId} value={d.deptId}>{d.deptName}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3 mb-2">
              <label>Course</label>
              <select
                name="courseId"
                value={form.courseId}
                onChange={handleChange}
                className="form-control"
                disabled={!form.deptId}
              >
                <option value="">{form.deptId ? "Select Course" : "Select Department First"}</option>
                {courses.map((c) => (
                  <option key={c.courseId} value={c.courseId}>{c.courseName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary" type="submit">Add to CSV buffer</button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setForm({ ...emptyForm })}>Reset Form</button>
          </div>
        </form>

        <hr />

        <h5>Buffered rows ({buffer.length})</h5>
        <div style={{ maxHeight: 240, overflow: "auto", marginBottom: 12 }}>
          {buffer.length === 0 ? (
            <p>No rows yet</p>
          ) : (
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Enroll</th><th>Name</th><th>State</th><th>Dept</th><th>Course</th>
                </tr>
              </thead>
              <tbody>
                {buffer.map((r, i) => (
                  <tr key={i}>
                    <td>{r.enrollmentNo}</td>
                    <td>{r.firstName} {r.lastName}</td>
                    <td>{r.stateName}</td>
                    <td>{r.deptName}</td>
                    <td>{r.courseName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-success"
            onClick={handleDownloadExcel}
            disabled={buffer.length === 0}
          >
            Download Excel & Clear
          </button>
          <button className="btn btn-warning" onClick={handleClearBuffer} disabled={buffer.length === 0}>Clear Buffer</button>
        </div>
      </div>
    </div>
  );
};

export default StudentAdmission;
