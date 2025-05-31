CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    isDeleted BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    phoneNumber VARCHAR(30) NULL,
    address VARCHAR(255) NULL,
    street VARCHAR(255) NULL,
    apartment VARCHAR(255) NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL
)
