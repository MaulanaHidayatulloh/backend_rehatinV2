const express = require("express");
const router = express.Router();
const database = require("../model/database");

// Route handler for GET /bogor
router.get("/", async (req, res) => {
  try {
    const [results] = await database.query(`
      SELECT 
        th.id_tempat, 
        th.nama_tempat, 
        th.kategori_lokasi, 
        th.lokasi, 
        th.harga, 
        th.deskripsi, 
        th.gambar_path,
        AVG(up.rating) as average_rating
      FROM 
        tempat_wisata th 
      JOIN 
        ulasan_pengguna up 
      ON 
        th.id_tempat = up.tempat_id
      WHERE
        th.kategori_lokasi = 2
      GROUP BY
        th.id_tempat;
    `);

    const places = results.map((place) => ({
      ...place,
      average_rating: parseFloat(place.average_rating).toFixed(1),
      gambar_path: `http://localhost:8000/uploads/${place.gambar_path}`, // Path gambar otomatis
    }));

    res.json(places);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

// Middleware untuk menyajikan gambar dari folder /public/uploads
router.use("/uploads", express.static("public/uploads"));

module.exports = router;
