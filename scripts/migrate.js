const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function createMigrationsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Migrations table created/verified');
  } catch (error) {
    console.error('Error creating migrations table:', error.message);
    throw error;
  }
}

async function getExecutedMigrations() {
  try {
    const [rows] = await pool.query('SELECT filename FROM migrations');
    return rows.map((row) => row.filename);
  } catch (error) {
    console.error('Error getting executed migrations:', error.message);
    return [];
  }
}

async function markMigrationAsExecuted(filename) {
  try {
    await pool.query('INSERT INTO migrations (filename) VALUES (?)', [filename]);
  } catch (error) {
    console.error(`Error marking migration as executed: ${error.message}`);
    throw error;
  }
}

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...\n');

    // Create migrations tracking table
    await createMigrationsTable();

    // Get all migration files from migrations folder
    const migrationsDir = path.join(__dirname, '../migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('❌ Migrations directory not found. Creating it...');
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log('✓ Migrations directory created');
      return;
    }

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations run in order

    if (migrationFiles.length === 0) {
      console.log('ℹ️  No migration files found in migrations/ directory.');
      return;
    }

    // Get already executed migrations
    const executedMigrations = await getExecutedMigrations();

    let executedCount = 0;
    let skippedCount = 0;

    for (const filename of migrationFiles) {
      const filePath = path.join(migrationsDir, filename);

      if (executedMigrations.includes(filename)) {
        console.log(`⏭️  Skipping ${filename} (already executed)`);
        skippedCount++;
        continue;
      }

      console.log(`📄 Executing migration: ${filename}`);

      try {
        const sql = fs.readFileSync(filePath, 'utf8');

        // Split on semicolon followed by optional whitespace and a newline
        const statements = sql
          .split(/;\s*\n/)
          .map((s) => s.trim())
          .filter(Boolean);

        // Execute each statement in a transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
          for (const statement of statements) {
            if (statement.trim()) {
              await connection.query(statement);
            }
          }

          await connection.commit();
          await markMigrationAsExecuted(filename);
          console.log(`✅ Successfully executed: ${filename}`);
          executedCount++;
        } catch (error) {
          await connection.rollback();
          console.error(`❌ Migration failed for ${filename}:`, error.message);
          throw error;
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(`❌ Failed to execute migration ${filename}:`, error.message);
        throw error;
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Executed: ${executedCount} migrations`);
    console.log(`   ⏭️  Skipped: ${skippedCount} migrations`);
    console.log(`   📁 Total: ${migrationFiles.length} migration files`);

    if (executedCount > 0) {
      console.log(`\n🎉 Database migration completed successfully!`);
    } else {
      console.log(`\nℹ️  No new migrations to execute.`);
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Migration interrupted by user');
  await pool.end();
  process.exit(0);
});

runMigration();
