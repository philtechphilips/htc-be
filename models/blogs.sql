-- Blogs table schema
CREATE TABLE IF NOT EXISTS blogs (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id CHAR(36) NOT NULL,
    tags JSON,
    featured_image MEDIUMTEXT,
    status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    views INT DEFAULT 0,
    meta_title VARCHAR(255),
    meta_description TEXT,
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    isDeleted BOOLEAN NOT NULL DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX idx_blogs_author_id ON blogs(author_id);
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_created_at ON blogs(created_at);
CREATE INDEX idx_blogs_published_at ON blogs(published_at); 