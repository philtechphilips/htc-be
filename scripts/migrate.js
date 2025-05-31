const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

async function runMigration() {
  try {
    const schemaPath = path.join(__dirname, "../models/schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf8");
    await pool.query(sql);
    console.log("Migration completed: users table created.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

runMigration();
