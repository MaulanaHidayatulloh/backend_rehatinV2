const express = require("express");
const router = express.Router();
const database = require("../model/database");

function handleError(err, res) {
  console.error("Error:", err);
  res.status(500).json({ error: "Terjadi kesalahan pada server" });
}

// untuk semua tempat wisata
router.get("/", async (req, res) => {
  try {
    const [results] = await database.query(`
  SELECT 
    id_tempat, nama_tempat, kategori_tempat, kategori_lokasi, 
    lokasi, harga, deskripsi, gambar_path, gambar_map, link_map, rating
  FROM 
    tempat_wisata 
  ORDER BY 
    rating DESC;
    `);

    const places = results.map((place) => ({
      ...place,
      average_rating: parseFloat(place.rating).toFixed(1),
      gambar_path: `http://localhost:8000/uploads/${place.gambar_path}`, // Path gambar otomatis
    }));

    res.json(places);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

// Get semua kategori tempat
router.get("/kategori-tempat", async (req, res) => {
  const [results] = await database.query("SELECT * FROM kategori_tempat");
  res.json(results);
});

// Get semua kategori lokasi
router.get("/kategori-lokasi", async (req, res) => {
  const [results] = await database.query("SELECT * FROM kategori_lokasi");
  res.json(results);
});

router.get("/:id", async (req, res) => {
  try {
    const [results] = await database.query(
      `
      SELECT 
        tw.*, 
        kt.id_kt, kt.nama_kategori_tempat,
        kl.id_kl, kl.nama_kategori_lokasi
      FROM tempat_wisata tw
      LEFT JOIN kategori_tempat kt ON tw.kategori_tempat = kt.id_kt
      LEFT JOIN kategori_lokasi kl ON tw.kategori_lokasi = kl.id_kl
      WHERE tw.id_tempat = ?
      `,
      [req.params.id]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Tempat tidak ditemukan" });
    }

    const tempat = results[0];

    res.json({
      ...tempat,
      gambar_path: `http://localhost:8000/uploads/${tempat.gambar_path}`,
      gambar_map: `http://localhost:8000/uploads/${tempat.gambar_map}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

const multer = require("multer");

// Setup Multer untuk upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Route PUT untuk edit tempat wisata
router.put(
  "/:id",
  upload.fields([
    { name: "gambar_path", maxCount: 1 },
    { name: "gambar_map", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const id = req.params.id;
      const {
        nama_tempat,
        kategori_tempat,
        kategori_lokasi,
        lokasi,
        harga,
        deskripsi,
        link_map,
      } = req.body;

      // Cek apakah ada file baru diupload
      let gambar_path = null;
      let gambar_map = null;

      if (req.files["gambar_path"]) {
        gambar_path = req.files["gambar_path"][0].filename;
      }

      if (req.files["gambar_map"]) {
        gambar_map = req.files["gambar_map"][0].filename;
      }

      // Buat query update dinamis sesuai file yang dikirim
      let query =
        "UPDATE tempat_wisata SET nama_tempat = ?, kategori_tempat = ?, kategori_lokasi = ?, lokasi = ?, harga = ?, deskripsi = ?, link_map = ?";
      const values = [
        nama_tempat,
        kategori_tempat,
        kategori_lokasi,
        lokasi,
        harga,
        deskripsi,
        link_map,
      ];

      if (gambar_path) {
        query += ", gambar_path = ?";
        values.push(gambar_path);
      }

      if (gambar_map) {
        query += ", gambar_map = ?";
        values.push(gambar_map);
      }

      query += " WHERE id_tempat = ?";
      values.push(id);

      await database.query(query, values);
      res.json({ message: "Tempat berhasil diupdate" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Gagal mengupdate tempat" });
    }
  }
);

// Route POST untuk tambah tempat wisata
router.post(
  "/",
  upload.fields([
    { name: "gambar_path", maxCount: 1 },
    { name: "gambar_map", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        nama_tempat,
        kategori_tempat,
        kategori_lokasi,
        lokasi,
        harga,
        deskripsi,
        link_map,
      } = req.body;

      const gambar_path = req.files["gambar_path"]?.[0]?.filename || null;
      const gambar_map = req.files["gambar_map"]?.[0]?.filename || null;

      await database.query(
        `
      INSERT INTO tempat_wisata 
      (nama_tempat, kategori_tempat, kategori_lokasi, lokasi, harga, deskripsi, gambar_path, gambar_map, link_map, rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          nama_tempat,
          kategori_tempat,
          kategori_lokasi,
          lokasi,
          harga,
          deskripsi,
          gambar_path,
          gambar_map,
          link_map,
          0, // default rating
        ]
      );

      res.json({ message: "Tempat wisata berhasil ditambahkan" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Gagal menambahkan tempat wisata" });
    }
  }
);

// Route DELETE untuk hapus tempat wisata
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Cek apakah tempat ada
    const [existing] = await database.query(
      "SELECT * FROM tempat_wisata WHERE id_tempat = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Tempat tidak ditemukan" });
    }

    // Hapus tempat
    await database.query("DELETE FROM tempat_wisata WHERE id_tempat = ?", [id]);

    res.json({ message: "Tempat wisata berhasil dihapus" });
  } catch (err) {
    console.error("Gagal menghapus tempat:", err);
    res.status(500).json({ error: "Gagal menghapus tempat wisata" });
  }
});

// Middleware untuk menyajikan gambar dari folder /public/uploads
const path = require("path");
router.use("/uploads", express.static(path.resolve("public/uploads")));

module.exports = router;
