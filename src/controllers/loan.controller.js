import Book from "../models/book.model.js";
import Loan from "../models/loan.model.js";

export const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate("libro", "titulo autor portada")
      .populate("usuario", "name username email")
      .sort({ createdAt: -1 });

    res.json(loans.map((p) => ({
      id: p._id,
      estado: p.estado,
      titulo: p.libro?.titulo,
      autor: p.libro?.autor,
      portada: p.libro?.portada,
      usuario: p.usuario?.name || p.usuario?.username || p.usuario?.email,
      email: p.usuario?.email,
      fecha_prestamo: p.fecha_prestamo,
      fecha_devolucion: p.fecha_devolucion,
    })));
  } catch (error) {
    res.status(500).json({ message: "Error al obtener prestamos", error: error.message });
  }
};

export const getMyLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ usuario: req.user.id })
      .populate("libro", "titulo autor portada")
      .sort({ createdAt: -1 });

    res.json(loans.map((p) => ({
      id: p._id,
      estado: p.estado,
      titulo: p.libro?.titulo,
      autor: p.libro?.autor,
      portada: p.libro?.portada,
      fecha_prestamo: p.fecha_prestamo,
      fecha_devolucion: p.fecha_devolucion,
    })));
  } catch (error) {
    res.status(500).json({ message: "Error al obtener historial", error: error.message });
  }
};

export const returnBook = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan || loan.estado !== "activo") {
      return res.status(404).json({ message: "Prestamo activo no encontrado" });
    }

    loan.estado = "devuelto";
    loan.fecha_devolucion = new Date();
    await loan.save();

    await Book.findByIdAndUpdate(loan.libro, { $inc: { cantidad: 1 } });

    res.json({ message: "Libro devuelto" });
  } catch (error) {
    res.status(500).json({ message: "Error al devolver", error: error.message });
  }
};
