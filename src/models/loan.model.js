import mongoose from "mongoose";

const loanSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    libro: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    reserva: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation", default: null },
    estado: {
      type: String,
      enum: ["activo", "devuelto"],
      default: "activo",
    },
    fecha_prestamo: { type: Date, default: Date.now },
    fecha_devolucion: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Loan", loanSchema);
