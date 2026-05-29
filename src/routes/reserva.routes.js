import { Router } from "express";
import { verifyToken } from "../middleware/auth.js";
import { checkRole } from "../middleware/roles.js";
import {
  aprobarReserva,
  cancelarReserva,
  confirmarDevolucion,
  crearReserva,
  crearReservaOpenLibrary,
  getMisReservas,
  getReservas,
  solicitarDevolucion,
} from "../controllers/reserva.controller.js";

const router = Router();

router.post("/", verifyToken, checkRole("usuario"), crearReserva);
router.post("/openlibrary", verifyToken, checkRole("usuario"), crearReservaOpenLibrary);
router.get("/", verifyToken, checkRole("bibliotecario"), getReservas);
router.get("/mis", verifyToken, checkRole("usuario"), getMisReservas);
router.put("/:id/aprobar", verifyToken, checkRole("bibliotecario"), aprobarReserva);
router.delete("/:id", verifyToken, checkRole("usuario"), cancelarReserva);
router.put("/:id/devolver", verifyToken, checkRole("usuario"), solicitarDevolucion);
router.put("/:id/confirmar-devolucion", verifyToken, checkRole("bibliotecario"), confirmarDevolucion);

export default router;
