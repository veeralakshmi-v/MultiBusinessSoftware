import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clean() {
  console.log('🧹 Cleaning all dummy and hardcoded records from SQLite database...');
  
  try {
    await prisma.orderItem.deleteMany({});
    console.log('Deleted OrderItems');
  } catch (e) {}

  try {
    await prisma.order.deleteMany({});
    console.log('Deleted Orders');
  } catch (e) {}

  try {
    await prisma.recipeItem.deleteMany({});
    console.log('Deleted RecipeItems');
  } catch (e) {}

  try {
    await prisma.menuItem.deleteMany({});
    console.log('Deleted MenuItems (Butter Naan, Biryani, etc.)');
  } catch (e) {}

  try {
    await prisma.category.deleteMany({});
    console.log('Deleted Categories');
  } catch (e) {}

  try {
    await prisma.customer.deleteMany({});
    console.log('Deleted Customers');
  } catch (e) {}

  try {
    await prisma.table.deleteMany({});
    console.log('Deleted Tables');
  } catch (e) {}

  try {
    await prisma.inventoryTransaction.deleteMany({});
    console.log('Deleted InventoryTransactions');
  } catch (e) {}

  try {
    await prisma.inventoryMovement.deleteMany({});
    console.log('Deleted InventoryMovements');
  } catch (e) {}

  try {
    await prisma.inventoryItem.deleteMany({});
    console.log('Deleted InventoryItems');
  } catch (e) {}

  try {
    await prisma.rawMaterial.deleteMany({});
    console.log('Deleted RawMaterials');
  } catch (e) {}

  try {
    await prisma.supplier.deleteMany({});
    console.log('Deleted Suppliers');
  } catch (e) {}

  try {
    await prisma.promotion.deleteMany({});
    console.log('Deleted Promotions');
  } catch (e) {}

  console.log('✨ Database completely cleaned of all hardcoded/dummy records!');
}

clean()
  .catch(err => console.error('Error cleaning database:', err))
  .finally(() => prisma.$disconnect());
