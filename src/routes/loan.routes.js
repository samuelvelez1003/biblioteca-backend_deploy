import { Router } from "express";
import { getAllLoans, getMyLoans, returnBook } from "../controllers/loan.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { checkRole } from "../middleware/roles.js";

const router = Router();

router.get("/", verifyToken, checkRole("bibliotecario"), getAllLoans);
router.get("/mis-prestamos", verifyToken, checkRole("usuario"), getMyLoans);
router.put("/:id/devolver", verifyToken, checkRole("bibliotecario"), returnBook);

export default router;
