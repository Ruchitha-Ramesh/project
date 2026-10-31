const express = require("express");
const router = express.Router();
const db = require("./db");

// Check existing database tables
router.get("/tables", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error checking tables:", error);
    res.status(500).json({ message: "Could not retrieve database tables." });
  }
});

module.exports = router;