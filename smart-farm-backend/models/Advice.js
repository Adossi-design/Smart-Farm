const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Advice = sequelize.define('Advice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT, // HTML content
    allowNull: false
  },
  image: {
    type: DataTypes.STRING
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Advice;