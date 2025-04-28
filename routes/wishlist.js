const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware"); // pastikan path sesuai
const database = require("../model/database");

// Tambahkan ke wishlist
router.post("/", authMiddleware, async (req, res) => {
  const { tempat_id } = req.body;
  const user_id = req.session.user.id;

  try {
    await database.query(
      "INSERT INTO wishlist (user_id, tempat_id, created_at) VALUES (?, ?, NOW())",
      [user_id, tempat_id]
    );
    res.status(201).json({ message: "Berhasil ditambahkan ke wishlist" });
  } catch (error) {
    console.error("Gagal tambah wishlist:", error);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat menambahkan ke wishlist" });
  }
});

// Hapus dari wishlist
router.delete("/", authMiddleware, async (req, res) => {
  const { tempat_id } = req.body;
  const user_id = req.session.user.id;

  try {
    await database.query(
      "DELETE FROM wishlist WHERE user_id = ? AND tempat_id = ?",
      [user_id, tempat_id]
    );
    res.json({ message: "Berhasil dihapus dari wishlist" });
  } catch (error) {
    console.error("Gagal hapus wishlist:", error);
    res
      .status(500)
      .json({ error: "Terjadi kesalahan saat menghapus dari wishlist" });
  }
});

// Ambil semua wishlist user yang login
router.get("/", authMiddleware, async (req, res) => {
  const user_id = req.session.user.id;

  try {
    const [data] = await database.query(
      `SELECT 
          t.id_tempat,
          t.nama_tempat,
          t.lokasi,
          t.harga,
          t.deskripsi,
          t.gambar_path,
          AVG(u.rating) AS average_rating
        FROM wishlist w
        JOIN tempat_wisata t ON w.tempat_id = t.id_tempat
        LEFT JOIN ulasan_pengguna u ON t.id_tempat = u.tempat_id
        WHERE w.user_id = ?
        GROUP BY t.id_tempat`,
      [user_id]
    );

    res.json({ wishlist: data });
  } catch (error) {
    console.error("Gagal mengambil wishlist:", error);
    res.status(500).json({ error: "Gagal mengambil data wishlist" });
  }
});

module.exports = router;
