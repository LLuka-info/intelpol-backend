const express = require("express");
const cors = require("cors");
const conectareDB = require("./MongoDB/mongoConnect");
require("dotenv").config();

const authRoutes = require("./Routes/AuthRoutes");
const citizenRoutes = require("./Routes/CetateniRoute");

const app = express();

app.use(cors());
app.use(express.json());

// Register API Routes
app.use("/api/auth", authRoutes);
app.use("/api/cetateni", citizenRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("✅ MDT Police Server is running.");
});

// Connect DB and Start Server
conectareDB();

const port = 3001;
app.listen(port, () => {
  console.log(`Serverul a pornit pe portul ${port}`);
});
