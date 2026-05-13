const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Conversation = require('./Conversation');
const ConversationParticipant = require('./ConversationParticipant');
const Message = require('./Message');
const Attachment = require('./Attachment');
const Order = require('./Order');
const Review = require('./Review');
const Report = require('./Report');

// Associations
User.hasMany(Product, { foreignKey: 'sellerId' });
Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// Orders
User.hasMany(Order, { foreignKey: 'buyerId' });
Order.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

// Messaging associations
User.hasMany(Conversation, { foreignKey: 'createdBy' });
Conversation.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

Conversation.hasMany(ConversationParticipant, { foreignKey: 'conversationId' });
ConversationParticipant.belongsTo(Conversation, { foreignKey: 'conversationId' });

User.hasMany(ConversationParticipant, { foreignKey: 'userId' });
ConversationParticipant.belongsTo(User, { foreignKey: 'userId' });

Conversation.hasMany(Message, { foreignKey: 'conversationId' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

User.hasMany(Message, { foreignKey: 'senderId' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

Message.hasMany(Attachment, { foreignKey: 'messageId' });
Attachment.belongsTo(Message, { foreignKey: 'messageId' });

Conversation.hasMany(Attachment, { foreignKey: 'conversationId' });
Attachment.belongsTo(Conversation, { foreignKey: 'conversationId' });

User.hasMany(Attachment, { foreignKey: 'uploaderId' });
Attachment.belongsTo(User, { foreignKey: 'uploaderId', as: 'uploader' });

// Review associations
User.hasMany(Review, { foreignKey: 'sellerId', as: 'receivedReviews' });
Review.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

User.hasMany(Review, { foreignKey: 'buyerId', as: 'givenReviews' });
Review.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });

Order.hasMany(Review, { foreignKey: 'orderId' });
Review.belongsTo(Order, { foreignKey: 'orderId' });

// Report associations
User.hasMany(Report, { foreignKey: 'reporterId', as: 'submittedReports' });
Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });

User.hasMany(Report, { foreignKey: 'reportedSellerId', as: 'receivedReports' });
Report.belongsTo(User, { foreignKey: 'reportedSellerId', as: 'reportedSeller' });

Order.hasMany(Report, { foreignKey: 'orderId' });
Report.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = {
  sequelize,
  User,
  Product,
  Conversation,
  ConversationParticipant,
  Message,
  Attachment,
  Order,
  Review,
  Report
};