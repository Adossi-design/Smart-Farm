const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Explicitly require pg + pg-hstore so serverless bundles include them
const pg = require('pg');
const PgHStore = require('pg-hstore');

// no-op references to avoid tree-shaking by bundlers
void pg; // ensures pg stays in the bundle
void PgHStore; // ensures pg-hstore stays in the bundle




let sequelize;
if (process.env.NODE_ENV === 'production' || process.env.DATABASE_POSTGRES_URL) {
  if (!process.env.DATABASE_POSTGRES_URL) {
    throw new Error('DATABASE_POSTGRES_URL environment variable must be set for production/deployment.');
  }
  sequelize = new Sequelize(process.env.DATABASE_POSTGRES_URL, {
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