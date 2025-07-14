# Database Migration Guide

This application uses a custom migration system to manage database schema changes.

## Overview

The migration system consists of:
- **Migration files**: SQL files in the `migrations/` directory
- **Migration script**: `scripts/migrate.js` that executes migrations in order
- **Migration tracking**: A `migrations` table that tracks which migrations have been executed

## How to Run Migrations

### Prerequisites
1. Ensure your database connection is properly configured in `config/db.js`
2. Make sure your `.env` file has the correct database credentials:
   ```
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   ```

### Running Migrations

```bash
# Run all pending migrations
npm run migrate

# Or directly with node
node scripts/migrate.js
```

## Migration Files

### Current Migration
- `001_initial_schema.sql` - Creates all initial tables with proper structure

### Migration Naming Convention
Use the format: `XXX_description.sql` where:
- `XXX` is a sequential number (001, 002, 003, etc.)
- `description` is a brief description of what the migration does
- Use underscores instead of spaces

Examples:
- `001_initial_schema.sql`
- `002_add_price_to_products.sql`
- `003_create_orders_table.sql`

## Database Schema

The initial migration creates the following tables:

### Users Table
- `id` (CHAR(36)) - Primary key
- `firstName`, `lastName` (VARCHAR(100)) - User names
- `email` (VARCHAR(255)) - Unique email address
- `password` (VARCHAR(255)) - Hashed password
- `role` (ENUM) - 'user' or 'admin'
- `phoneNumber`, `address`, `street`, `apartment`, `city`, `state` - Address fields
- `isDeleted` (BOOLEAN) - Soft delete flag
- `created_at` (TIMESTAMP) - Creation timestamp

### Categories Table
- `id` (CHAR(36)) - Primary key
- `name` (VARCHAR(100)) - Category name
- `description` (TEXT) - Category description
- `image` (MEDIUMTEXT) - Category image
- `isDeleted` (BOOLEAN) - Soft delete flag
- `created_at` (TIMESTAMP) - Creation timestamp

### Products Table
- `id` (CHAR(36)) - Primary key
- `name` (VARCHAR(255)) - Product name
- `slug` (VARCHAR(255)) - Unique URL slug
- `image` (MEDIUMTEXT) - Main product image
- `category_id` (CHAR(36)) - Foreign key to categories
- `details` (TEXT) - Product details
- `images` (JSON) - Additional product images
- `isFeatured` (BOOLEAN) - Featured product flag
- `isDeleted` (BOOLEAN) - Soft delete flag
- `created_at` (TIMESTAMP) - Creation timestamp

### Cart Table
- `id` (CHAR(36)) - Primary key
- `user_id` (CHAR(36)) - Foreign key to users
- `product_id` (CHAR(36)) - Foreign key to products
- `quantity` (INT) - Product quantity
- `isDeleted` (BOOLEAN) - Soft delete flag
- `created_at`, `updated_at` (TIMESTAMP) - Timestamps

### Wishlist Table
- `id` (CHAR(36)) - Primary key
- `user_id` (CHAR(36)) - Foreign key to users
- `product_id` (CHAR(36)) - Foreign key to products
- `note` (TEXT) - User notes
- `priority` (INT) - Priority level
- `isDeleted` (BOOLEAN) - Soft delete flag
- `created_at`, `updated_at` (TIMESTAMP) - Timestamps

### Contact Table
- `id` (CHAR(36)) - Primary key
- `name` (VARCHAR(100)) - Contact name
- `email` (VARCHAR(255)) - Contact email
- `subject` (VARCHAR(255)) - Message subject
- `message` (TEXT) - Message content
- `isRead` (BOOLEAN) - Read status
- `created_at` (TIMESTAMP) - Creation timestamp

## Creating New Migrations

1. Create a new SQL file in the `migrations/` directory
2. Use the naming convention: `XXX_description.sql`
3. Write your SQL statements
4. Run `npm run migrate` to execute the new migration

### Example Migration File
```sql
-- Migration: 002_add_price_to_products.sql
-- Description: Add price field to products table
-- Date: 2024-01-02

ALTER TABLE products ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0.00;
ALTER TABLE products ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'USD';

-- Add index for price queries
CREATE INDEX idx_products_price ON products(price);
```

## Migration Features

### Transaction Safety
- Each migration runs in a transaction
- If any statement fails, the entire migration is rolled back
- No partial migrations are applied

### Migration Tracking
- The system tracks which migrations have been executed
- Migrations are only run once
- You can safely run the migration script multiple times

### Error Handling
- Detailed error messages for failed migrations
- Graceful handling of connection issues
- Proper cleanup on errors

### Performance
- Indexes are created for commonly queried fields
- Foreign key constraints ensure data integrity
- Optimized table structures

## Troubleshooting

### Common Issues

1. **Connection Error**
   - Check your `.env` file configuration
   - Ensure the database server is running
   - Verify database credentials

2. **Migration Already Executed**
   - This is normal behavior
   - The system will skip already executed migrations

3. **Foreign Key Constraint Error**
   - Ensure tables are created in the correct order
   - Check that referenced tables exist

4. **Permission Error**
   - Ensure your database user has CREATE, ALTER, and INDEX permissions

### Resetting Migrations (Development Only)
If you need to reset migrations during development:

```sql
-- Drop the migrations table
DROP TABLE IF EXISTS migrations;

-- Drop all application tables
DROP TABLE IF EXISTS contact;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
```

**Warning**: This will delete all data and migration history. Only use in development!

## Best Practices

1. **Always backup your database** before running migrations in production
2. **Test migrations** in a development environment first
3. **Use descriptive migration names** that explain what the migration does
4. **Keep migrations small and focused** on a single change
5. **Never modify existing migration files** that have been executed
6. **Use transactions** for complex migrations
7. **Add appropriate indexes** for performance
8. **Document breaking changes** in migration comments 