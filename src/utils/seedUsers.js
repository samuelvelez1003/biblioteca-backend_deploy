import bcrypt from "bcrypt";
import User from "../models/user.models.js";

const defaultUsers = [
  {
    name: "Bibliotecario Principal",
    username: "bibliotecario",
    email: "bibliotecario@biblioteca.com",
    password: "Biblio12345",
    role: "bibliotecario",
  },
];

export const seedDefaultUsers = async () => {
  for (const userData of defaultUsers) {
    const exists = await User.findOne({ email: userData.email });

    if (!exists) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      await User.create({
        name: userData.name,
        username: userData.username,
        email: userData.email,
        password: passwordHash,
        role: userData.role,
      });
      console.log(`Usuario inicial creado: ${userData.email} | Rol: ${userData.role}`);
    }
  }
};
