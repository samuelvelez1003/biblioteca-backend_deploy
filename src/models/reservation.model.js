import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    libro: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    estado: {
      type: String,
      enum: ["pendiente", "aprobada", "devolucion_pendiente", "devuelto", "cancelada"],
      default: "pendiente",
    },
    fecha_reserva: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Reservation", reservationSchema);
