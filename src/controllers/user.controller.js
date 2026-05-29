import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.models.js";

const allowedRoles = ["usuario", "bibliotecario", "admin"];

export const register = async (req, res) => {
  try {
    const { name, username, email, password, role = "usuario" } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: "Nombre, correo y contraseña son obligatorios" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Rol invalido" });
    }

    const existe = await User.findOne({ email: normalizedEmail });
    if (existe) {
      return res.status(400).json({ message: "Usuario ya existe" });
    }

    const hash = await bcrypt.hash(password, 10);

    const nuevoUsuario = new User({
      name,
      username: username || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      password: hash,
      role,
    });

    await nuevoUsuario.save();

    res.status(201).json({ message: "Usuario registrado" });
  } catch (error) {
    res.status(500).json({ message: "Error interno en register", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "Usuario no existe" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "8h" }
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Error interno en login", error: error.message });
  }
};
