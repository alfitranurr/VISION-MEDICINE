// ========================================
// WEBSITE/backend/server.js
// Versi stable - updated 2025-11-04
// ========================================

import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan"; // untuk log HTTP
import chalk from "chalk"; // warna di terminal
// ➕ NEW: Import untuk auto-ping (axios untuk request internal)
import axios from "axios";

// -------------------------------
// 🧩 Import semua routes
// -------------------------------
import bellRoutes from "./routes/bell.js";
import chatRoutes from "./routes/chat.js";
import directionRoutes from "./routes/direction.js";
import mapsRoutes from "./routes/maps.js";
import medicinesRoutes from "./routes/medicines.js";
import productsRoutes from "./routes/products.js";
import howToUseRoutes from "./routes/how-to-use.js";
import livestreamRoutes from "./routes/livestream.js";
import detectionsRoutes from "./routes/detections.js"; // ➕ NEW: Detections routes
import reminderRoutes from "./routes/reminder.js"; // 🔔 reminder
import googleAuthRoutes from "./routes/googleAuth.js"; // 🔑 Google auth
import n8nRoutes from "./routes/n8n_sse.js"; // 🧠 NEW: n8n SSE integration

// -------------------------------
// ⚙️ Setup express app
// -------------------------------
const app = express();

// -------------------------------
// 🌐 Middleware setup
// -------------------------------

// Allow multiple CORS origins (frontend, ngrok, etc)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://localhost:5173",
      "https://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());
app.use(bodyParser.json());

// Pretty HTTP logs
app.use(
  morgan((tokens, req, res) => {
    const status = tokens.status(req, res);
    const color =
      status >= 500
        ? chalk.red
        : status >= 400
        ? chalk.yellow
        : status >= 300
        ? chalk.cyan
        : chalk.green;

    return [
      chalk.gray(tokens.method(req, res)),
      chalk.white(tokens.url(req, res)),
      color(status),
      chalk.gray(tokens["response-time"](req, res) + " ms"),
    ].join(" ");
  })
);

// -------------------------------
// 🧭 API Routes
// -------------------------------
app.use("/api/bell", bellRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/direction", directionRoutes);
app.use("/api/maps", mapsRoutes);
app.use("/api/medicines", medicinesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/how-to-use", howToUseRoutes);
app.use("/api/livestream", livestreamRoutes);
app.use("/api/detections", detectionsRoutes); // ➕ NEW: Detections API
app.use("/api/reminder", reminderRoutes);
app.use("/api/google", googleAuthRoutes);
app.use("/api/n8n", n8nRoutes); // ✅ Route baru untuk komunikasi SSE

// -------------------------------
// 🩵 Default route
// -------------------------------
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "VISMED Backend aktif 💊",
    timestamp: new Date().toISOString(),
  });
});

// ➕ NEW: Fungsi untuk auto-ping server (request ke diri sendiri)
const autoPingServer = async () => {
  try {
    const PORT = process.env.PORT || 5000;
    const serverUrl = `http://localhost:${PORT}`; // Ganti dengan URL production jika deploy (e.g., process.env.SERVER_URL)
    await axios.get(serverUrl, { timeout: 5000 }); // Tambah timeout biar nggak hang
    console.log(
      chalk.blue(
        `🔔 Auto-ping berhasil: Server tetap hidup! (${new Date().toISOString()})`
      )
    );
  } catch (error) {
    console.error(chalk.red(`❌ Auto-ping gagal: ${error.message}`));
  }
};

// ➕ NEW: Setup setInterval - jalankan setiap 10 menit (600000 ms)
setInterval(autoPingServer, 10 * 60 * 1000);

// -------------------------------
// 🚀 Start server
// -------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    chalk.cyan.bold(`✅ Backend running at: http://localhost:${PORT}`)
  );
  console.log(chalk.magenta(`🧠 n8n SSE endpoint aktif di: /api/n8n/stream`));
  console.log(chalk.green(`📩 Terima data dari n8n via: POST /api/n8n/send`));
  // ➕ NEW: Log konfirmasi auto-ping
  console.log(
    chalk.yellow(`⏰ Auto-ping aktif: Setiap 10 menit via setInterval`)
  );
});
