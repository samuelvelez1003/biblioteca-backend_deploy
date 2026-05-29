import { Router } from "express";
import { generateReportPDF, loansByUser, topBooks, totalLoans } from "../controllers/report.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { checkRole } from "../middleware/roles.js";

const router = Router();

router.get("/total", verifyToken, checkRole("admin"), totalLoans);
router.get("/top-libros", verifyToken, checkRole("admin"), topBooks);
router.get("/por-usuario", verifyToken, checkRole("admin"), loansByUser);
router.get("/pdf", verifyToken, checkRole("admin"), generateReportPDF);

export default router;
