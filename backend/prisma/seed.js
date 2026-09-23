import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial categories and campus points...');

  const categories = [
    { name: 'Calculators', slug: 'calculators', icon: 'Calculator', typicalPriceInr: 1200 },
    { name: 'Cables & Adapters', slug: 'cables-adapters', icon: 'Cable', typicalPriceInr: 450 },
    { name: 'Lab Gear', slug: 'lab-gear', icon: 'FlaskConical', typicalPriceInr: 600 },
    { name: 'Stationery & Drawing', slug: 'stationery', icon: 'PenTool', typicalPriceInr: 350 },
    { name: 'Electronics & Dev Boards', slug: 'electronics', icon: 'Cpu', typicalPriceInr: 1500 },
    { name: 'Tripods & Cameras', slug: 'photography', icon: 'Camera', typicalPriceInr: 2200 },
    { name: 'Sports Equipment', slug: 'sports', icon: 'Trophy', typicalPriceInr: 800 },
    { name: 'Textbooks & Notes', slug: 'books', icon: 'BookOpen', typicalPriceInr: 750 }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat
    });
  }

  const campusPoints = [
    { name: 'Library Steps', zone: 'Central Campus' },
    { name: 'Main Gate', zone: 'North Entrance' },
    { name: 'Canteen', zone: 'Student Activity Center' },
    { name: 'Block A Lobby', zone: 'Academic Block A' },
    { name: 'Sports Pavilion', zone: 'Athletic Grounds' }
  ];

  for (const pt of campusPoints) {
    await prisma.campusPoint.upsert({
      where: { name: pt.name },
      update: pt,
      create: pt
    });
  }

  console.log('Initial categories and campus points seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
