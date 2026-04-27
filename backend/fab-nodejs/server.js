// server.js

// ------------------ Module Imports ------------------
const express = require("express");
const cors = require("cors");

const dotenv = require("dotenv");
const env = process.env.NODE_ENV || "development";
dotenv.config({ path: `.env.${env}` });
console.log(`Running in ${env} mode`);

// Custom Modules
const routes = require("./routes");

const config = require("./config"); // Define constants like PORT in config.js

const authMiddleware = require("./middleware/authMiddleware");

// ------------------ Server Setup ------------------
const app = express();

// ------------------ Middleware ------------------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ------------------ Routes ------------------
app.use("/api/fp", routes); // Main API routes with watchMan middleware
// app.use("/", (req, res) => {
//   res.send("Welcome to the Fabric Consumption NODE BACKEND");
// }); // Welcome route

// ------------------ Error Handling ------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

// ------------------ Server Start ------------------
const PORT = config.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // logger.info(`Server is running on port ${PORT}`);
});
