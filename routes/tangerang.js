const express = require("express");
const router = express.Router();
const database = require("../model/database");

function handleError(err, res) {
  console.error("Error:", err);
  res.status(500).json({ error: "Terjadi kesalahan pada server" });
}

// Fungsi untuk mengencode gambar ke base64
function encodeImageToBase64(imageData) {
  return Buffer.from(imageData).toString("base64");
}

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
        th.gambar,
        AVG(up.rating) as average_rating
      FROM 
        tempat_wisata th 
      JOIN 
        ulasan_pengguna up 
      ON 
        th.id_tempat = up.tempat_id
      WHERE
        th.kategori_lokasi = 4
      GROUP BY
        th.id_tempat;
    `);

    const places = results.map((place) => {
      // Mengencode gambar longblob ke base64
      const imageDataBase64 = encodeImageToBase64(place.gambar);
      return {
        ...place,
        gambarBase64: imageDataBase64,
        average_rating: parseFloat(place.average_rating).toFixed(1),
      };
    });

    res.json(places);
  } catch (err) {
    handleError(err, res); // Call the error handler from server.js
  }
});

module.exports = router;
