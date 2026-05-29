import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

import userRoutes from "./routes/user.routes.js";
import bookRoutes from "./routes/book.routes.js";
import reservaRoutes from "./routes/reserva.routes.js";
import loanRoutes from "./routes/loan.routes.js";
import reportRoutes from "./routes/report.routes.js";
import { seedDefaultUsers } from "./utils/seedUsers.js";
import { initCollections } from "./utils/initCollections.js";

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "https://biblioteca-frontend-deploy.vercel.app",
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("No permitido por CORS"));
  },
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));

await connectDB();
await initCollections();
await seedDefaultUsers();

app.use("/api/users", userRoutes);
app.use("/api/libros", bookRoutes);
app.use("/api/reservas", reservaRoutes);
app.use("/api/prestamos", loanRoutes);
app.use("/api/reportes", reportRoutes);

app.get("/", (req, res) => {
  res.send("API Biblioteca con MongoDB funcionando");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "biblioteca-backend" });
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
