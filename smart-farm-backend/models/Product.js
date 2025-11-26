const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.STRING, // Keeping as string to match frontend "500 RWF" format, or could be float
    allowNull: false
  },
  quantity: {
    type: DataTypes.STRING
  },
  location: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  image: {
    type: DataTypes.STRING // URL or path
  },
  whatsapp: {
    type: DataTypes.STRING
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Product;