const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const logger = require("morgan");
// const connectDB = require('./config/db');
require('dotenv').config();
const app = express();
const mongoose = require("mongoose");
const DB_URL="mongodb://localhost:27017/moabeats";


const connectDB = () => {
  mongoose.connect(DB_URL, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
};

// Export the connection function so it can be used in other files
connectDB();
app.use(
  cors({
    origin: "http://localhost:5173", // Allow only this origin
    methods: "GET,POST", // Allow only these methods
    allowedHeaders: "Content-Type,Authorization", // Allow only these headers
  })
);

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.use("/api/v1", require("./routes/userRoutes"));

module.exports = app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
