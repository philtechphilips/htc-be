const fs = require('fs');
const path = require('path');

function createMigration() {
  const description = process.argv[2];

  if (!description) {
    console.error('❌ Please provide a migration description');
    console.log('Usage: node scripts/create-migration.js <description>');
    console.log('Example: node scripts/create-migration.js add_price_to_products');
    process.exit(1);
  }

  // Get the next migration number
  const migrationsDir = path.join(__dirname, '../migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  const existingFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .map((file) => parseInt(file.split('_')[0]))
    .filter((num) => !isNaN(num));

  const nextNumber = existingFiles.length > 0 ? Math.max(...existingFiles) + 1 : 1;
  const migrationNumber = nextNumber.toString().padStart(3, '0');

  const filename = `${migrationNumber}_${description}.sql`;
  const filePath = path.join(migrationsDir, filename);

  const template = `-- Migration: ${filename}
-- Description: ${description.replace(/_/g, ' ')}
-- Date: ${new Date().toISOString().split('T')[0]}

-- Add your SQL statements here
-- Example:
-- ALTER TABLE table_name ADD COLUMN column_name VARCHAR(255);
-- CREATE INDEX idx_table_column ON table_name(column_name);

`;

  try {
    fs.writeFileSync(filePath, template);
    console.log(`✅ Created migration file: ${filename}`);
    console.log(`📁 Location: ${filePath}`);
    console.log(`\n📝 Edit the file to add your SQL statements, then run:`);
    console.log(`   npm run migrate`);
  } catch (error) {
    console.error('❌ Error creating migration file:', error.message);
    process.exit(1);
  }
}

createMigration();
