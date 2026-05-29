import Book from "../models/book.model.js";
import Loan from "../models/loan.model.js";
import Reservation from "../models/reservation.model.js";
import User from "../models/user.models.js";

export const initCollections = async () => {
  await Promise.all([
    User.createCollection(),
    Book.createCollection(),
    Reservation.createCollection(),
    Loan.createCollection(),
  ]);
};
