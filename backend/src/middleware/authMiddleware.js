const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "tachyon-dream-formosa-secret";

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token no válido o ausente." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-passwordHash");

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado." });
    }

    req.user = {
      _id: user._id,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado." });
  }
};

module.exports = {
  requireAuth,
};
