const { sequelize, Product } = require('./models');

const updates = [
  { name: 'Organic Tomatoes', image: 'https://images.unsplash.com/photo-1546470427-e3f6e0bd0f05?auto=format&fit=crop&w=800&q=80' },
  { name: 'Fresh Carrots', image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=800&q=80' },
  { name: 'Lettuce Heads', image: 'https://images.unsplash.com/photo-1557844352-761f2565b576?auto=format&fit=crop&w=800&q=80' },
  { name: 'Apple Orchard Mix', image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=80' },
  { name: 'Corn - Fresh Ears', image: 'https://images.unsplash.com/photo-1603048297172-c92544798c54?auto=format&fit=crop&w=800&q=80' },
  { name: 'Organic Potatoes', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80' },
  { name: 'Strawberries', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80' },
  { name: 'Bell Peppers (Mix)', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80' },
  { name: 'Cucumber - Organic', image: 'https://images.unsplash.com/photo-1447594392731-4d4d5b1f3c3d?auto=format&fit=crop&w=800&q=80' },
  { name: 'Banana Bunch', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=800&q=80' }
];

async function main() {
  try {
    await sequelize.sync();
    for (const update of updates) {
      const product = await Product.findOne({ where: { name: update.name } });
      if (!product) {
        console.log(`Skipping missing product: ${update.name}`);
        continue;
      }
      product.image = update.image;
      await product.save();
      console.log(`Updated image: ${update.name}`);
    }
    console.log('Sample product images updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating product images:', error);
    process.exit(1);
  }
}

main();
