const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: { type: DataTypes.INTEGER, allowNull: true },
  title: { type: DataTypes.STRING, allowNull: true },
  createdBy: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Conversation;
