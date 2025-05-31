-- Add isDeleted column to categories
ALTER TABLE categories ADD COLUMN isDeleted BOOLEAN NOT NULL DEFAULT 0;

-- Add isDeleted column to products
ALTER TABLE products ADD COLUMN isDeleted BOOLEAN NOT NULL DEFAULT 0;

-- Add isDeleted column to users
ALTER TABLE users ADD COLUMN isDeleted BOOLEAN NOT NULL DEFAULT 0;

-- Add isFeatured column to products
ALTER TABLE products ADD COLUMN isFeatured BOOLEAN NOT NULL DEFAULT 0;