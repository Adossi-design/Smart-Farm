const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('farmer', 'advisor', 'admin'),
    defaultValue: 'farmer'
  },
  phone: {
    type: DataTypes.STRING
  },
  location: {
    type: DataTypes.STRING
  },
  organization: {
    type: DataTypes.STRING // For advisors
  },
  specialization: {
    type: DataTypes.STRING // For advisors
  }
});

module.exports = User;