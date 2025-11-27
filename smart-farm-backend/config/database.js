const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Explicitly require pg + pg-hstore so serverless bundles include them
const pg = require('pg');
const PgHStore = require('pg-hstore');

// no-op references to avoid tree-shaking by bundlers
void pg; // ensures pg stays in the bundle
void PgHStore; // ensures pg-hstore stays in the bundle

const resolvePostgresUrl = () => {
  const candidates = [
    process.env.DATABASE_POSTGRES_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING
  ].filter(Boolean);

  if (!candidates.length) {
    return null;
  }

  const raw = candidates[0];
  try {
    const parsed = new URL(raw);
    const sslmode = parsed.searchParams.get('sslmode');
    if (!sslmode || sslmode.toLowerCase() === 'require') {
      parsed.searchParams.set('sslmode', 'no-verify');
    }
    return parsed.toString();
  } catch (error) {
    // Fallback: simple string replace if URL parsing fails
    return raw.replace('sslmode=require', 'sslmode=no-verify');
  }
};

const postgresUrl = resolvePostgresUrl();

let sequelize;
if (process.env.NODE_ENV === 'production' || postgresUrl) {
  if (!postgresUrl) {
    throw new Error('A Postgres connection string is required for production/deployment.');
  }
  sequelize = new Sequelize(postgresUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for many cloud providers like Neon/Vercel Postgres
      }
    }
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false
  });
}

module.exports = sequelize;