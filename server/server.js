require("dotenv").config({ path: __dirname + "/.env" });

const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();

// ================= DB =================
connectDB();

// ================= MIDDLEWARE =================
const clientOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000,http://localhost:5000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors({
  origin: clientOrigins.length <= 1 ? clientOrigins[0] || "http://localhost:5000" : clientOrigins,
  credentials: true
}));

app.use(express.json());

// ================= REQUEST LOGGER =================
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// ================= SWAGGER =================
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ================= API ROUTES =================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/study", require("./routes/studyRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/aptitude", require("./routes/aptitudeRoutes"));
app.use("/api/sgpa", require("./routes/sgpaRoutes"));

// ================= REACT SPA (production build) =================
const clientBuild = path.join(__dirname, "..", "client", "build");
const indexHtml = path.join(clientBuild, "index.html");
const hasClientBuild = fs.existsSync(indexHtml);

if (hasClientBuild) {
  app.use(express.static(clientBuild));
  app.use((req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.path.startsWith("/api") || req.path.startsWith("/swagger")) return next();
    res.sendFile(indexHtml, (err) => (err ? next(err) : undefined));
  });
} else {
  app.get("/", (req, res) => {
    res.type("html").send(
      "<p>API is running. Build the client first:</p><pre>cd client && npm install && npm run build</pre>" +
      "<p>Then restart the server — app will be served on this port.</p>"
    );
  });
}

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack || err.message);
  res.status(500).json({ msg: "Internal Server Error" });
});

// ================= SERVER =================
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server on http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
  if (hasClientBuild) {
    console.log(`📱 React app + API (same port)`);
  } else {
    console.log(`📄 API only — Swagger: http://localhost:${PORT}/swagger`);
  }
});
