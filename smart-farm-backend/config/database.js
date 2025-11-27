const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Explicitly require pg so serverless bundles include the Postgres driver
require('pg');




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