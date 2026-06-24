import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Pizza from './models/Pizza.js';
import Inventory from './models/Inventory.js';

/**
 * Seed the database with:
 *  - One admin user (from .env)
 *  - Sample pizzas
 *  - Initial inventory (5 bases, 5 sauces, 5 cheeses, 5 veggies, 5 meats)
 *
 * Usage: npm run seed
 */
const seed = async () => {
  try {
    console.log('🌱 Starting seed...');
    await connectDB();

    // ---------- Admin ----------
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pizza.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: process.env.ADMIN_NAME || 'Super Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'admin',
        isEmailVerified: true,
      });
      console.log(`✅ Admin user created: ${adminEmail} / ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    } else {
      console.log(`ℹ️  Admin already exists: ${adminEmail}`);
    }

    // ---------- Sample user ----------
    const sampleEmail = 'user@pizza.com';
    const existingUser = await User.findOne({ email: sampleEmail });
    if (!existingUser) {
      await User.create({
        name: 'Sample User',
        email: sampleEmail,
        password: 'User@123',
        role: 'user',
        isEmailVerified: true,
      });
      console.log('✅ Sample user created: user@pizza.com / User@123');
    }

    // ---------- Pizzas ----------
    await Pizza.deleteMany({});
    await Pizza.insertMany([
      {
        name: 'Margherita Classic',
        description: 'Fresh mozzarella, basil, and tomato sauce on a hand-tossed crust.',
        category: 'veg',
        price: { small: 199, medium: 399, large: 599 },
        ingredients: ['Mozzarella', 'Tomato', 'Basil', 'Olive Oil'],
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600',
      },
      {
        name: 'Pepperoni Feast',
        description: 'Loaded with pepperoni and double cheese — every bite is a flavour bomb.',
        category: 'non-veg',
        price: { small: 249, medium: 499, large: 749 },
        ingredients: ['Pepperoni', 'Mozzarella', 'Tomato Sauce'],
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600',
      },
      {
        name: 'Farmhouse Deluxe',
        description: 'Onion, capsicum, mushroom, tomato — a garden on a crust.',
        category: 'veg',
        price: { small: 229, medium: 449, large: 679 },
        ingredients: ['Onion', 'Capsicum', 'Mushroom', 'Tomato', 'Cheese'],
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
      },
      {
        name: 'BBQ Chicken Supreme',
        description: 'Smoky BBQ chicken, onions, and a triple-cheese blend.',
        category: 'non-veg',
        price: { small: 269, medium: 549, large: 829 },
        ingredients: ['Chicken', 'BBQ Sauce', 'Onion', 'Cheese'],
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
      },
      {
        name: 'Paneer Tikka Twist',
        description: 'Spicy marinated paneer with peppers and mint chutney drizzle.',
        category: 'veg',
        price: { small: 239, medium: 479, large: 719 },
        ingredients: ['Paneer', 'Capsicum', 'Mint Chutney', 'Cheese'],
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600',
      },
      {
        name: 'Hawaiian Sweet',
        description: 'Ham and pineapple with mozzarella — the sweet & savoury classic.',
        category: 'non-veg',
        price: { small: 259, medium: 519, large: 789 },
        ingredients: ['Ham', 'Pineapple', 'Cheese', 'Tomato Sauce'],
        rating: 4.3,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600',
      },
    ]);
    console.log('✅ Seeded 6 pizzas');

    // ---------- Inventory ----------
    await Inventory.deleteMany({});
    await Inventory.insertMany([
      {
        category: 'base',
        items: [
          { name: 'Thin Crust', price: 50, stock: 100, threshold: 20 },
          { name: 'Classic Hand Tossed', price: 40, stock: 100, threshold: 20 },
          { name: 'Cheese Burst', price: 80, stock: 80, threshold: 20 },
          { name: 'Wheat Thin', price: 60, stock: 60, threshold: 15 },
          { name: 'Sicilian Thick', price: 70, stock: 50, threshold: 15 },
        ],
      },
      {
        category: 'sauce',
        items: [
          { name: 'Classic Tomato', price: 20, stock: 200, threshold: 30 },
          { name: 'Spicy Arrabbiata', price: 25, stock: 150, threshold: 25 },
          { name: 'BBQ Sauce', price: 30, stock: 120, threshold: 25 },
          { name: 'Pesto Sauce', price: 35, stock: 80, threshold: 20 },
          { name: 'White Garlic Sauce', price: 30, stock: 80, threshold: 20 },
        ],
      },
      {
        category: 'cheese',
        items: [
          { name: 'Mozzarella', price: 40, stock: 200, threshold: 30 },
          { name: 'Cheddar', price: 45, stock: 150, threshold: 25 },
          { name: 'Parmesan', price: 60, stock: 100, threshold: 20 },
          { name: 'Feta', price: 55, stock: 80, threshold: 20 },
          { name: 'Vegan Cheese', price: 70, stock: 50, threshold: 15 },
        ],
      },
      {
        category: 'veggie',
        items: [
          { name: 'Onion', price: 15, stock: 200, threshold: 30 },
          { name: 'Capsicum', price: 20, stock: 150, threshold: 25 },
          { name: 'Mushroom', price: 30, stock: 100, threshold: 20 },
          { name: 'Olive', price: 35, stock: 80, threshold: 20 },
          { name: 'Jalapeno', price: 25, stock: 100, threshold: 20 },
          { name: 'Corn', price: 20, stock: 120, threshold: 25 },
          { name: 'Tomato', price: 15, stock: 150, threshold: 25 },
          { name: 'Pineapple', price: 30, stock: 60, threshold: 15 },
        ],
      },
      {
        category: 'meat',
        items: [
          { name: 'Pepperoni', price: 60, stock: 100, threshold: 20 },
          { name: 'Grilled Chicken', price: 70, stock: 80, threshold: 20 },
          { name: 'Ham', price: 55, stock: 80, threshold: 20 },
          { name: 'Bacon', price: 65, stock: 60, threshold: 15 },
          { name: 'Sausage', price: 50, stock: 80, threshold: 20 },
        ],
      },
    ]);
    console.log('✅ Seeded inventory (5 categories)');

    console.log('\n🎉 Seed completed!');
    console.log('   Admin login:    ' + adminEmail + ' / ' + (process.env.ADMIN_PASSWORD || 'Admin@123'));
    console.log('   Sample user:    user@pizza.com / User@123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
};

seed();
