require("dotenv").config();

const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
const auth = require("./middleware/auth");
const aiRoutes = require("./modules/ai/aiRoutes");
const favoriteRoutes = require("./modules/favorites/favoriteRoutes");
const producerRoutes = require("./modules/producers/producerRoutes");
const productRoutes = require("./modules/products/productRoutes");
const userRoutes = require("./modules/users/userRoutes");
const authRoutes = require("./routes/authRoutes");
const { getMe } = require("./modules/users/userController");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/producers", producerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/favorites", favoriteRoutes);
app.get("/api/me", auth, getMe);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
