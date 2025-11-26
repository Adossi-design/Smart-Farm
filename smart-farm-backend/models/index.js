const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Advice = require('./Advice');

// Associations
User.hasMany(Product, { foreignKey: 'sellerId' });
Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

User.hasMany(Advice, { foreignKey: 'authorId' });
Advice.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

module.exports = {
  sequelize,
  User,
  Product,
  Advice
};