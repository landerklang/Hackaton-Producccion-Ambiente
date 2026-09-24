const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "tachyon-dream-formosa-secret";
const JWT_EXPIRES_IN = "2h";

const toPublicUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
});

const signToken = (user) =>
  jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios." });
    }

    const normalizedUsername = String(username).trim();
    const normalizedEmail = String(email).trim().toLowerCase();

    if (normalizedUsername.length < 3) {
      return res.status(400).json({
        error: "El nombre de usuario debe tener al menos 3 caracteres.",
      });
    }

    if (/\s/.test(normalizedUsername)) {
      return res
        .status(400)
        .json({ error: "El nombre de usuario no puede contener espacios." });
    }

    if (!/^[a-z0-9._-]+$/.test(normalizedUsername)) {
      return res.status(400).json({
        error:
          "El nombre de usuario solo puede contener letras, números y . _ -",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res
        .status(400)
        .json({ error: "El email no tiene un formato válido." });
    }

    if (!["client", "producer"].includes(role)) {
      return res
        .status(400)
        .json({ error: "El rol debe ser client o producer." });
    }

    const existingUser = await User.findOne({
      $or: [
        { username: normalizedUsername.toLowerCase() },
        { email: normalizedEmail },
      ],
    });

    if (existingUser) {
      const duplicateMessage =
        existingUser.username === normalizedUsername.toLowerCase()
          ? "El nombre de usuario ya está registrado."
          : "El email ya está registrado.";

      return res.status(409).json({ error: duplicateMessage });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: normalizedUsername.toLowerCase(),
      email: normalizedEmail,
      passwordHash,
      role,
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ error: "El usuario o email ya existen." });
    }

    console.error("Register failed:", error.message);
    return res
      .status(500)
      .json({ error: "Error del servidor al registrar el usuario." });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ error: "El identificador y la contraseña son obligatorios." });
    }

    const normalizedIdentifier = String(identifier).trim().toLowerCase();

    const user = await User.findOne({
      $or: [
        { username: normalizedIdentifier },
        { email: normalizedIdentifier },
      ],
    });

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Credenciales inválidas." });
    }

    const token = signToken(user);

    return res.status(200).json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error("Login failed:", error.message);
    return res
      .status(500)
      .json({ error: "Error del servidor al iniciar sesión." });
  }
};

const me = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token no válido o ausente." });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: "Token inválido o expirado." });
    }

    const user = await User.findById(decoded.userId).select("-passwordHash");

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado." });
    }

    return res.status(200).json({
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error("Me failed:", error.message);
    return res
      .status(500)
      .json({ error: "Error del servidor al consultar el usuario." });
  }
};

module.exports = {
  register,
  login,
  me,
};
