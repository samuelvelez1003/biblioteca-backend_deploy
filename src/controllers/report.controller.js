import PDFDocument from "pdfkit";
import Loan from "../models/loan.model.js";

export const totalLoans = async (req, res) => {
  try {
    const total = await Loan.countDocuments();
    const activos = await Loan.countDocuments({ estado: "activo" });
    const devueltos = await Loan.countDocuments({ estado: "devuelto" });
    res.json({ total, activos, devueltos });
  } catch (error) {
    res.status(500).json({ message: "Error en reporte", error: error.message });
  }
};

export const topBooks = async (req, res) => {
  try {
    const rows = await Loan.aggregate([
      { $group: { _id: "$libro", total_prestamos: { $sum: 1 } } },
      { $sort: { total_prestamos: -1 } },
      { $limit: 5 },
      { $lookup: { from: "books", localField: "_id", foreignField: "_id", as: "libro" } },
      { $unwind: { path: "$libro", preserveNullAndEmptyArrays: true } },
      { $project: { titulo: { $ifNull: ["$libro.titulo", "Libro eliminado"] }, autor: { $ifNull: ["$libro.autor", "Autor desconocido"] }, total_prestamos: 1 } },
    ]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error en reporte", error: error.message });
  }
};

export const loansByUser = async (req, res) => {
  try {
    const rows = await Loan.aggregate([
      { $group: { _id: "$usuario", total_prestamos: { $sum: 1 } } },
      { $sort: { total_prestamos: -1 } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "usuario" } },
      { $unwind: "$usuario" },
      { $project: { nombre: "$usuario.name", email: "$usuario.email", total_prestamos: 1 } },
    ]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error en reporte", error: error.message });
  }
};

export const generateReportPDF = async (req, res) => {
  try {
    const total = await Loan.countDocuments();
    const activos = await Loan.countDocuments({ estado: "activo" });
    const devueltos = await Loan.countDocuments({ estado: "devuelto" });
    const top = await Loan.aggregate([
      { $group: { _id: "$libro", total_prestamos: { $sum: 1 } } },
      { $sort: { total_prestamos: -1 } },
      { $limit: 10 },
      { $lookup: { from: "books", localField: "_id", foreignField: "_id", as: "libro" } },
      { $unwind: { path: "$libro", preserveNullAndEmptyArrays: true } },
      { $project: { titulo: { $ifNull: ["$libro.titulo", "Libro eliminado"] }, autor: { $ifNull: ["$libro.autor", "Autor desconocido"] }, total_prestamos: 1 } },
    ]);

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=reporte-prestamos.pdf");
    res.setHeader("Cache-Control", "no-store");
    doc.pipe(res);

    doc.fontSize(20).text("Reporte de prestamos de biblioteca", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Fecha: ${new Date().toLocaleString("es-CO")}`);
    doc.moveDown();
    doc.fontSize(14).text("Resumen");
    doc.fontSize(12).text(`Total de libros prestados: ${total}`);
    doc.text(`Prestamos activos: ${activos}`);
    doc.text(`Prestamos devueltos: ${devueltos}`);
    doc.moveDown();
    doc.fontSize(14).text("Libros mas prestados");

    if (!top.length) {
      doc.fontSize(12).text("Todavia no hay prestamos registrados.");
    } else {
      top.forEach((book, index) => {
        doc.fontSize(12).text(`${index + 1}. ${book.titulo} - ${book.autor || "Autor desconocido"} - ${book.total_prestamos} prestamos`);
      });
    }

    doc.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: "Error generando PDF", error: error.message });
    } else {
      res.end();
    }
  }
};
