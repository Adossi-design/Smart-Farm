const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  buyerId: { type: DataTypes.INTEGER, allowNull: false },
  items: { type: DataTypes.JSON },
  subtotal: { type: DataTypes.FLOAT },
  platformFee: { type: DataTypes.FLOAT },
  total: { type: DataTypes.FLOAT },
  paymentMethod: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'pending' }
});

module.exports = Order;
