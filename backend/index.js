const express = require("express");
const cors = require("cors");
const conectareDB = require("./MongoDB/mongoConnect");
require("dotenv").config();

const authRoutes = require("./Routes/AuthRoutes");
const citizenRoutes = require("./Routes/CetateniRoute");
const ofiteriRoutes = require("./Routes/OfiteriRoute");

const app = express();

app.use(cors({
  origin: 'https://intelpol-infoeducatia.vercel.app'
}));
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/cetateni", citizenRoutes);
app.use("/api/ofiteri", ofiteriRoutes); 


app.get("/", (req, res) => {
  res.send("✅ MDT Police Server is running.");
});

conectareDB();

const port = 3001;
app.listen(port, () => {
  console.log(`Serverul a pornit pe portul ${port}`);
});
