const mongoose = require("mongoose");

const mongoURI = "mongodb://localhost:27017/SmartCampusEntry";

const connectToMongo = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectToMongo;
//npm i -D nodemon

//cd smartcampusentry
//cd backend
//npx nodemon index.js