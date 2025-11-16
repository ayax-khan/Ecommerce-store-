import 'dotenv/config';
import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import { ProductSchema } from '../src/products/schemas/product.schema';
import * as bcrypt from 'bcrypt';

async function main() {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/buy2enjoy';
  await mongoose.connect(mongoUrl);
  const Product = mongoose.model('Product', ProductSchema);

  const prisma = new PrismaClient();

  // Seed admin and test users
  const adminEmail = 'admin@buy2enjoy.local';
  const userEmail = 'user@buy2enjoy.local';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    create: { email: adminEmail, passwordHash: await bcrypt.hash('Admin#123', 10), role: 'admin', name: 'Admin' },
    update: {},
  });
  const user = await prisma.user.upsert({
    where: { email: userEmail },
    create: { email: userEmail, passwordHash: await bcrypt.hash('User#123', 10), role: 'customer', name: 'Test User' },
    update: {},
  });
  console.log(`Seeded users: admin=${admin.email}, user=${user.email}`);

  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`Products already exist: ${count}`);
  } else {
    const docs = [
      { title: 'A4 Notebook', description: '200 pages ruled notebook', price: 350, images: [], categoryIds: ['school'], brand: 'Stationer', availableQty: 100 },
      { title: 'Blue Ball Pen', description: '0.7mm smooth writing', price: 90, images: [], categoryIds: ['pens'], brand: 'Parker', availableQty: 250 },
      { title: 'HB Pencil Set', description: 'Set of 12 HB pencils', price: 220, images: [], categoryIds: ['school'], brand: 'Faber-Castell', availableQty: 150 },
      { title: 'Acrylic Paints', description: '12 colors pack', price: 1450, images: [], categoryIds: ['fine-arts'], brand: 'Winsor & Newton', availableQty: 60 },
      { title: 'Canvas 12x16', description: 'Cotton canvas board', price: 800, images: [], categoryIds: ['canvas'], brand: 'Artify', availableQty: 40 },
      { title: 'Highlighter Pack', description: 'Pack of 5 assorted colors', price: 560, images: [], categoryIds: ['office'], brand: 'Stabilo', availableQty: 120 },
      { title: 'Glue Stick', description: 'Non-toxic glue', price: 150, images: [], categoryIds: ['school'], brand: 'UHU', availableQty: 180 },
      { title: 'Easel Stand', description: 'Portable wooden easel', price: 5200, images: [], categoryIds: ['easel'], brand: 'ArtPro', availableQty: 15 },
      { title: 'Fine Brush Set', description: 'Set of 6 fine brushes', price: 950, images: [], categoryIds: ['brushes'], brand: 'Camel', availableQty: 85 },
      { title: 'Office Diary 2025', description: 'Premium PU leather', price: 1250, images: [], categoryIds: ['office'], brand: 'Executive', availableQty: 70 },
    ];
    const created = await Product.insertMany(docs);
    console.log(`Inserted ${created.length} products`);

    // Seed Inventory in Postgres for each product
    for (const p of created) {
      try {
        await prisma.inventory.create({
          data: { productId: String(p._id), availableQty: p.availableQty ?? 0, allocatedQty: 0 },
        });
      } catch (e) {
        // ignore duplicates
      }
    }
  }

  await mongoose.disconnect();
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
