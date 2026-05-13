require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Product, Conversation, ConversationParticipant, Message } = require('../models');

async function main() {
  try {
    await sequelize.authenticate();
    console.log('DB connection OK');

    // Find farmer (seeded by server) or create one
    const farmerEmail = process.env.FARMER_EMAIL || 'farmer@test.com';
    let farmer = await User.findOne({ where: { email: farmerEmail } });
    if (!farmer) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(process.env.FARMER_PASSWORD || '123456', salt);
      farmer = await User.create({ name: 'Farmer John', email: farmerEmail, password: hashed, role: 'farmer' });
      console.log('Created farmer', farmer.email);
    }

    // Create or find a buyer
    const buyerEmail = process.env.BUYER_EMAIL || 'buyer@test.com';
    let buyer = await User.findOne({ where: { email: buyerEmail } });
    if (!buyer) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(process.env.BUYER_PASSWORD || '123456', salt);
      buyer = await User.create({ name: 'Buyer Zoe', email: buyerEmail, password: hashed, role: 'buyer' });
      console.log('Created buyer', buyer.email);
    }

    // Create a sample product by farmer
    const [product, created] = await Product.findOrCreate({
      where: { name: 'Sample Potatoes', sellerId: farmer.id },
      defaults: {
        name: 'Sample Potatoes',
        description: 'Fresh sample potatoes for testing',
        price: 500,
        category: 'Vegetables',
        quantity: '100 kg',
        quantityAvailable: 100,
        unit: 'kg',
        sellerId: farmer.id
      }
    });
    if (created) console.log('Created sample product', product.name);

    // Create a conversation between buyer and farmer about the product
    const conv = await Conversation.create({ productId: product.id, title: `Inquiry: ${product.name}`, createdBy: buyer.id });
    await ConversationParticipant.bulkCreate([
      { conversationId: conv.id, userId: buyer.id, role: 'buyer' },
      { conversationId: conv.id, userId: farmer.id, role: 'farmer' }
    ]);
    console.log('Created conversation', conv.id);

    // Add an initial message
    const msg = await Message.create({ conversationId: conv.id, senderId: buyer.id, body: 'Hi, is this still available?' });
    console.log('Created message', msg.id);

    console.log('Sample seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seed error', err);
    process.exit(1);
  }
}

main();
