const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attachment = sequelize.define('Attachment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  messageId: { type: DataTypes.INTEGER, allowNull: true },
  conversationId: { type: DataTypes.INTEGER, allowNull: false },
  uploaderId: { type: DataTypes.INTEGER, allowNull: false },
  filename: { type: DataTypes.STRING, allowNull: false },
  storagePath: { type: DataTypes.STRING, allowNull: false },
  contentType: { type: DataTypes.STRING, allowNull: true },
  size: { type: DataTypes.INTEGER, allowNull: true }
});

module.exports = Attachment;
