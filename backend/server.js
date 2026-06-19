require("dotenv").config();

const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const departmentRoutes = require("./routes/departmentRoutes");
const skillRoutes = require("./routes/skillRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Employee Management Backend is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/skills", skillRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});