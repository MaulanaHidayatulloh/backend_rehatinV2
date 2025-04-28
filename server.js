const express = require("express");
const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);
const knex = require("knex")(require("./knexfile"));
const cors = require("cors");
const dotenv = require("dotenv");
const { PORT } = require("./config/appConfig");

// Load environment variables
dotenv.config();

if (!process.env.SESSION_SECRET) {
  console.error("SESSION_SECRET is not defined in .env!");
  process.exit(1); // Hentikan aplikasi jika tidak ada SESSION_SECRET
}

const app = express();

// Middleware untuk parsing JSON & URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Middleware untuk serving gambar dari folder /public/uploads
app.use("/uploads", express.static("public/uploads"));

// Middleware untuk serving gambar dari folder /public/gambar_komentar
app.use("/gambar_komentar", express.static("public/gambar_komentar"));

// Konfigurasi Session Store menggunakan Knex
const store = new KnexSessionStore({
  knex,
  tablename: "sessions", // Nama tabel untuk menyimpan sesi
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      maxAge: 1000 * 60 * 60, // Sesi kedaluwarsa setelah 1 jam
      secure: false, // Set ke true jika menggunakan HTTPS
    },
  })
);

// Import & Gunakan Routes
const jakartaRoutes = require("./routes/jakarta");
const bogorRoutes = require("./routes/bogor");
const depokRoutes = require("./routes/depok");
const tangerangRoutes = require("./routes/tangerang");
const bekasiRoutes = require("./routes/bekasi");
const bandungRoutes = require("./routes/bandung");
const semuaTempatRoutes = require("./routes/SemuaTempat");
const authRoutes = require("./auth");
const parkRoutes = require("./routes/park");
const wishlistRoutes = require("./routes/wishlist");
const adminPlaceRoutes = require("./routes/adminPlace");

app.use("/jakarta", jakartaRoutes);
app.use("/bogor", bogorRoutes);
app.use("/depok", depokRoutes);
app.use("/tangerang", tangerangRoutes);
app.use("/bekasi", bekasiRoutes);
app.use("/bandung", bandungRoutes);
app.use("/place", semuaTempatRoutes);
app.use("/auth", authRoutes);
app.use("/park", parkRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/adminPlace", adminPlaceRoutes);

// Middleware untuk menangani error
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Terjadi kesalahan pada server",
  });
});

// Jalankan server
app.listen(PORT, () => console.log(`🚀 Server berjalan di port ${PORT}`));
