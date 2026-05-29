import { Router } from "express";
import { buscarLibros, createBook, getBooks, saveExternalBook } from "../controllers/book.controller.js";
import { verifyToken } from "../middleware/auth.js";
import { checkRole } from "../middleware/roles.js";

const router = Router();

router.get("/", verifyToken, getBooks);
router.get("/buscar", verifyToken, buscarLibros);
router.post("/", verifyToken, checkRole("bibliotecario"), createBook);
router.post("/guardar-openlibrary", verifyToken, checkRole("bibliotecario"), saveExternalBook);
router.post("/guardar-google", verifyToken, checkRole("bibliotecario"), saveExternalBook);

export default router;
