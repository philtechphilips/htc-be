const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

async function runMigration() {
  try {
    // Get all .sql files from models and migrations folders
    const folders = [
      path.join(__dirname, "../models"),
      path.join(__dirname, "../migrations"),
    ];
    let sqlFiles = [];
    for (const folder of folders) {
      if (fs.existsSync(folder)) {
        const files = fs.readdirSync(folder).filter((f) => f.endsWith(".sql"));
        sqlFiles.push(...files.map((f) => path.join(folder, f)));
      }
    }
    if (sqlFiles.length === 0) {
      console.log("No .sql files found in models/ or migrations/.");
      process.exit(0);
    }
    for (const file of sqlFiles) {
      const sql = fs.readFileSync(file, "utf8");
      try {
        await pool.query(sql);
        console.log(`Migration completed for: ${path.basename(file)}`);
      } catch (err) {
        console.error(`Migration failed for ${path.basename(file)}:`, err.message);
      }
    }
    // Example: Add ALTER TABLE logic for new columns (customize as needed)
    // await pool.query("ALTER TABLE users ADD COLUMN ...");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

runMigration();
