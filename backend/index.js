const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const conectareDB = require("./MongoDB/mongoConnect");
require("dotenv").config();

const authRoutes = require("./Routes/AuthRoutes");
const citizenRoutes = require("./Routes/CetateniRoute");

const app = express();

app.use(cors());
app.use(express.json());
app.use(fileUpload());  

app.use("/api/auth", authRoutes);
app.use("/api/cetateni", citizenRoutes);

app.get("/", (req, res) => {
  res.send("✅ MDT Police Server is running.");
});

conectareDB();

const port = 3001;
app.listen(port, () => {
    console.log(`Serverul a pornit pe portul ${port}`);
});
