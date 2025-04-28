const express = require("express");
const router = express.Router();
const database = require("../model/database");

// Endpoint untuk mendapatkan tempat berdasarkan kategori_tempat
router.get("/category/:categoryId", async (req, res) => {
  const { categoryId } = req.params;

  try {
    const [places] = await database.query(
      "SELECT * FROM tempat_wisata WHERE kategori_tempat = ?",
      [categoryId]
    );

    res.json(places);
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint untuk mendapatkan tempat berdasarkan kategori_lokasi
router.get("/category/:categoryId/location/:locationId", async (req, res) => {
  const { categoryId, locationId } = req.params;

  try {
    const [places] = await database.query(
      "SELECT * FROM tempat_wisata WHERE kategori_tempat = ? AND kategori_lokasi = ?",
      [categoryId, locationId]
    );

    res.json(places);
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
