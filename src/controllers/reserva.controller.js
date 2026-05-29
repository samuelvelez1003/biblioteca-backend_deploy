import Book from "../models/book.model.js";
import Loan from "../models/loan.model.js";
import Reservation from "../models/reservation.model.js";

export const crearReserva = async (req, res) => {
  try {
    const { libro_id } = req.body;
    const usuario_id = req.user.id;

    const book = await Book.findById(libro_id);
    if (!book) {
      return res.status(404).json({ message: "Libro no encontrado" });
    }

    const existe = await Reservation.findOne({
      usuario: usuario_id,
      libro: libro_id,
      estado: { $in: ["pendiente", "aprobada", "devolucion_pendiente"] },
    });

    if (existe) {
      return res.status(400).json({ message: "Ya tienes una reserva activa para este libro" });
    }

    const reserva = await Reservation.create({ usuario: usuario_id, libro: libro_id });
    res.status(201).json({ message: "Reserva enviada", reserva });
  } catch (error) {
    res.status(500).json({ message: "Error al crear reserva", error: error.message });
  }
};


export const crearReservaOpenLibrary = async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { titulo, autor, isbn } = req.body;

    if (!titulo) {
      return res.status(400).json({ message: "El titulo del libro es obligatorio" });
    }

    let book = await Book.findOne({
      $or: [
        ...(isbn ? [{ isbn }] : []),
        { titulo, autor: autor || "Autor desconocido" },
      ],
    });

    if (!book) {
      book = await Book.create({
        titulo,
        autor: autor || "Autor desconocido",
        anio: req.body.anio || null,
        isbn: isbn || null,
        categoria: req.body.categoria || "General",
        descripcion: req.body.descripcion || "Libro consultado desde Open Library",
        cantidad: Number(req.body.cantidad || 1),
        portada: req.body.portada || null,
        fuente: req.body.fuente || "openlibrary",
      });
    }

    const existe = await Reservation.findOne({
      usuario: usuario_id,
      libro: book._id,
      estado: { $in: ["pendiente", "aprobada", "devolucion_pendiente"] },
    });

    if (existe) {
      return res.status(400).json({ message: "Ya tienes una reserva activa para este libro" });
    }

    const reserva = await Reservation.create({ usuario: usuario_id, libro: book._id });

    res.status(201).json({
      message: "Libro guardado y reserva enviada",
      book,
      reserva,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al reservar libro de Open Library", error: error.message });
  }
};

export const getReservas = async (req, res) => {
  try {
    const rows = await Reservation.find({ estado: { $in: ["pendiente", "devolucion_pendiente"] } })
      .populate("libro", "titulo autor portada")
      .populate("usuario", "name username email")
      .sort({ createdAt: -1 });

    res.json(rows.map((r) => ({
      id: r._id,
      estado: r.estado,
      titulo: r.libro?.titulo,
      autor: r.libro?.autor,
      portada: r.libro?.portada,
      nombre: r.usuario?.name || r.usuario?.username || r.usuario?.email,
      email: r.usuario?.email,
      fecha_reserva: r.fecha_reserva,
    })));
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reservas", error: error.message });
  }
};

export const aprobarReserva = async (req, res) => {
  try {
    const { id } = req.params;

    const reserva = await Reservation.findById(id).populate("libro");
    if (!reserva) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    if (reserva.estado !== "pendiente") {
      return res.status(400).json({ message: "La reserva no esta pendiente" });
    }

    const libro = await Book.findById(reserva.libro._id);
    if (!libro || libro.cantidad <= 0) {
      return res.status(400).json({ message: "No hay ejemplares disponibles" });
    }

    libro.cantidad -= 1;
    await libro.save();

    const prestamo = await Loan.create({
      usuario: reserva.usuario,
      libro: reserva.libro._id,
      reserva: reserva._id,
      estado: "activo",
    });

    reserva.estado = "aprobada";
    await reserva.save();

    res.json({ message: "Reserva aprobada y prestamo creado", prestamo });
  } catch (error) {
    res.status(500).json({ message: "Error al aprobar reserva", error: error.message });
  }
};

export const getMisReservas = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const rows = await Reservation.find({ usuario: usuario_id })
      .populate("libro", "titulo autor portada")
      .sort({ createdAt: -1 });

    res.json(rows.map((r) => ({
      id: r._id,
      estado: r.estado,
      titulo: r.libro?.titulo,
      autor: r.libro?.autor,
      portada: r.libro?.portada,
      fecha_reserva: r.fecha_reserva,
    })));
  } catch (error) {
    res.status(500).json({ message: "Error al obtener mis reservas", error: error.message });
  }
};

export const cancelarReserva = async (req, res) => {
  try {
    const reserva = await Reservation.findOne({
      _id: req.params.id,
      usuario: req.user.id,
      estado: "pendiente",
    });

    if (!reserva) {
      return res.status(404).json({ message: "Reserva pendiente no encontrada" });
    }

    reserva.estado = "cancelada";
    await reserva.save();

    res.json({ message: "Reserva cancelada" });
  } catch (error) {
    res.status(500).json({ message: "Error al cancelar", error: error.message });
  }
};

export const solicitarDevolucion = async (req, res) => {
  try {
    const reserva = await Reservation.findOne({
      _id: req.params.id,
      usuario: req.user.id,
      estado: "aprobada",
    });

    if (!reserva) {
      return res.status(404).json({ message: "Prestamo activo no encontrado" });
    }

    reserva.estado = "devolucion_pendiente";
    await reserva.save();

    res.json({ message: "Solicitud de devolucion enviada" });
  } catch (error) {
    res.status(500).json({ message: "Error al solicitar devolucion", error: error.message });
  }
};

export const confirmarDevolucion = async (req, res) => {
  try {
    const reserva = await Reservation.findById(req.params.id);

    if (!reserva || reserva.estado !== "devolucion_pendiente") {
      return res.status(404).json({ message: "Devolucion pendiente no encontrada" });
    }

    const loan = await Loan.findOne({ reserva: reserva._id, estado: "activo" });
    if (loan) {
      loan.estado = "devuelto";
      loan.fecha_devolucion = new Date();
      await loan.save();
    }

    await Book.findByIdAndUpdate(reserva.libro, { $inc: { cantidad: 1 } });

    reserva.estado = "devuelto";
    await reserva.save();

    res.json({ message: "Libro devuelto correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error en devolucion", error: error.message });
  }
};
