const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();



let sequelize;
if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable must be set for production/deployment.');
  }
  sequelize = new Sequelize(process.env.DATABASE_URL, {
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