import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    autor: { type: String, default: "Autor desconocido", trim: true },
    anio: { type: Number, default: null },
    isbn: { type: String, default: null },
    categoria: { type: String, default: "General", trim: true },
    descripcion: { type: String, default: "Sin descripcion" },
    cantidad: { type: Number, default: 1, min: 0 },
    portada: { type: String, default: null },
    fuente: { type: String, default: "manual" },
  },
  { timestamps: true }
);

export default mongoose.model("Book", bookSchema);
