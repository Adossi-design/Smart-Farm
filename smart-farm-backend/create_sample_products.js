const { sequelize, User, Product } = require('./models');

const sampleProducts = [
  {
    name: 'Organic Tomatoes',
    description: 'Fresh, ripe, organic tomatoes from our farm',
    category: 'Vegetables',
    price: 4.50,
    quantity: 100,
    unit: 'kg',
    image: 'tomatoes.jpg',
    sellerId: 2 // farmer user
  },
  {
    name: 'Fresh Carrots',
    description: 'Crispy carrots, pesticide-free',
    category: 'Vegetables',
    price: 3.00,
    quantity: 150,
    unit: 'kg',
    image: 'carrots.jpg',
    sellerId: 2
  },
  {
    name: 'Lettuce Heads',
    description: 'Green, leafy lettuce - perfect for salads',
    category: 'Vegetables',
    price: 2.50,
    quantity: 80,
    unit: 'piece',
    image: 'lettuce.jpg',
    sellerId: 2
  },
  {
    name: 'Apple Orchard Mix',
    description: 'Mix of Red and Green apples from orchard',
    category: 'Fruits',
    price: 5.00,
    quantity: 200,
    unit: 'kg',
    image: 'apples.jpg',
    sellerId: 2
  },
  {
    name: 'Corn - Fresh Ears',
    description: 'Freshly harvested corn, sweet and tender',
    category: 'Grains',
    price: 1.50,
    quantity: 120,
    unit: 'piece',
    image: 'corn.jpg',
    sellerId: 2
  },
  {
    name: 'Organic Potatoes',
    description: 'Versatile potatoes for cooking',
    category: 'Vegetables',
    price: 2.00,
    quantity: 300,
    unit: 'kg',
    image: 'potatoes.jpg',
    sellerId: 2
  },
  {
    name: 'Strawberries',
    description: 'Sweet, juicy strawberries - limited stock',
    category: 'Fruits',
    price: 7.00,
    quantity: 50,
    unit: 'kg',
    image: 'strawberries.jpg',
    sellerId: 2
  },
  {
    name: 'Bell Peppers (Mix)',
    description: 'Red, yellow, and green bell peppers',
    category: 'Vegetables',
    price: 3.50,
    quantity: 90,
    unit: 'kg',
    image: 'peppers.jpg',
    sellerId: 2
  },
  {
    name: 'Cucumber - Organic',
    description: 'Crisp cucumber, great for salads',
    category: 'Vegetables',
    price: 2.75,
    quantity: 110,
    unit: 'kg',
    image: 'cucumber.jpg',
    sellerId: 2
  },
  {
    name: 'Banana Bunch',
    description: 'Fresh bananas, yellow and ready to eat',
    category: 'Fruits',
    price: 2.25,
    quantity: 150,
    unit: 'kg',
    image: 'bananas.jpg',
    sellerId: 2
  }
];

async function createSampleProducts() {
  try {
    await sequelize.sync();
    console.log('Database synced');

    // Create sample products
    for (const product of sampleProducts) {
      await Product.create(product);
      console.log(`Created: ${product.name}`);
    }

    console.log('Sample products created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating products:', error);
    process.exit(1);
  }
}

createSampleProducts();
