const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ConversationParticipant = sequelize.define('ConversationParticipant', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  conversationId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'buyer' }
}, {
  indexes: [{ unique: true, fields: ['conversationId', 'userId'] }]
});

module.exports = ConversationParticipant;
