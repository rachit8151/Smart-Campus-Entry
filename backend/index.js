// ==========================================
// ✅ BACKEND ENTRY POINT (index.js)
// ==========================================
require('dotenv').config();
const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');
const http = require("http");
const { Server } = require("socket.io");
// ==========================================
// ✅ CONNECT TO MONGODB
// ==========================================
connectToMongo();

const app = express();
const port = process.env.PORT || 3000;

// ==========================================
// ✅ CREATE SERVER + SOCKET.IO
// ==========================================
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // React frontend
    methods: ["GET", "POST", "PUT"],
  },
});

// ✅ Global map to track connected HODs
global.connectedHODs = {};

// ==========================================
// ✅ SOCKET.IO HANDLERS
// ==========================================
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // HOD registers with department ID
  socket.on("registerHOD", (dId) => {
    if (dId) {
      global.connectedHODs[dId] = socket.id;
      console.log(`✅ HOD ${dId} registered with socket ${socket.id}`);
    }
  });

  // When a user disconnects
  socket.on("disconnect", () => {
    for (const [key, value] of Object.entries(global.connectedHODs)) {
      if (value === socket.id) {
        delete global.connectedHODs[key];
        console.log(`🔴 HOD ${key} disconnected (${socket.id})`);
      }
    }
  });
});

// Make io available inside routes (like /guest)
app.set("io", io);
// ==========================================
// ✅ MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json()); // parses application/json
app.use(express.urlencoded({ extended: true })); // parses form data (extra safety)

// ==========================================
// ✅ ROUTE MOUNTING
// ==========================================

// 🔹 Auth routes: signup, login, etc.
app.use('/api/auth', require('./routes/auth'));

// 🔹 Change password (for first login or reset)
app.use('/api/changePassword', require('./routes/changePassword'));

// 🔹 OTP password reset routes
app.use('/api/otp', require('./routes/otp'));

// 🔹 University Admin routes
app.use('/api/universityAdmin', require('./routes/universityAdmin'));
// app.use("/uniAdmin", require("./routes/uniAdmin"));
// 🔹 Departments route (for HOD signup dropdown)
app.use('/api/departments', require('./routes/departments'));

// 🔹 Guest routes: register
app.use('/api/guest', require('./routes/guest'));

// 🔹 HOD routes: Profile
app.use("/uploads", express.static("uploads"));
app.use("/api/hod", require("./routes/hod"));
app.use("/api/location", require("./routes/location"));

// 🔹 Security Guard routes : profile
app.use("/api/securityGuard", require("./routes/securityGuard"));

app.use("/api/courses", require("./routes/courses"));
app.use("/api/states", require("./routes/states"));
app.use("/api/cities", require("./routes/cities"));
app.use("/api/meta", require("./routes/metaData"));
app.use("/api/students", require("./routes/students"));

app.use("/api/faces", require("./routes/faces"));
// ==========================================
// ✅ ROOT ROUTE
// ==========================================
app.get('/', (req, res) => {
  res.send('✅ SmartCampusEntry backend running successfully');
});

// ==========================================
// ✅ GLOBAL ERROR HANDLER
// ==========================================
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ==========================================
// ✅ START SERVER
// ==========================================
// app.listen(port, () => {
//   console.log(`✅ Server running at http://localhost:${port}`);
// });
server.listen(port, () => {
  console.log(`✅ Server running with Socket.IO at http://localhost:${port}`);
});
