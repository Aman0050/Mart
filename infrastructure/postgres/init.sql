-- Nexmarto PostgreSQL Init Script
-- Creates shadow database for Prisma migrations

CREATE DATABASE nexmarto_shadow
    WITH
    OWNER = nexmarto
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.utf8'
    LC_CTYPE = 'en_US.utf8'
    TEMPLATE = template0;

-- Enable UUID extension
\c nexmarto_dev
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For full-text search
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- For accent-insensitive search

\c nexmarto_shadow
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
