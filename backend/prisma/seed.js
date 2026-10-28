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
    { name: 'Textbooks & Notes', slug: 'books', icon: 'BookOpen', typicalPriceInr: 750 },
    { name: 'Others', slug: 'others', icon: 'MoreHorizontal', typicalPriceInr: 500 }
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
    { name: 'Sports Pavilion', zone: 'Athletic Grounds' },
    { name: 'Others', zone: 'Custom Spot / Designated Location' }
  ];

  for (const pt of campusPoints) {
    await prisma.campusPoint.upsert({
      where: { name: pt.name },
      update: pt,
      create: pt
    });
  }

  console.log('Seeding demo campus students (each can both lend and borrow)...');
  const demoStudents = [
    {
      id: 'user-arjun-001',
      name: 'Arjun Sharma',
      collegeEmail: 'arjun.student@iet.edu',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=1$abcdefghijklmnopqrstuvwxyz012345$abcdefghijklmnopqrstuvwxyz012345',
      department: 'Computer Science & Engineering',
      year: 3,
      role: 'STUDENT',
      accountStatus: 'ACTIVE',
      verifiedAt: new Date()
    },
    {
      id: 'user-priya-002',
      name: 'Priya Patel',
      collegeEmail: 'priya.patel@iet.edu',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=1$abcdefghijklmnopqrstuvwxyz012345$abcdefghijklmnopqrstuvwxyz012345',
      department: 'Electrical & Electronics',
      year: 2,
      role: 'STUDENT',
      accountStatus: 'ACTIVE',
      verifiedAt: new Date()
    },
    {
      id: 'user-rohan-003',
      name: 'Rohan Verma',
      collegeEmail: 'rohan.v@iet.edu',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=1$abcdefghijklmnopqrstuvwxyz012345$abcdefghijklmnopqrstuvwxyz012345',
      department: 'Mechanical Engineering',
      year: 2,
      role: 'STUDENT',
      accountStatus: 'ACTIVE',
      verifiedAt: new Date()
    },
    {
      id: 'user-sneha-004',
      name: 'Sneha Kulkarni',
      collegeEmail: 'sneha.k@iet.edu',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=1$abcdefghijklmnopqrstuvwxyz012345$abcdefghijklmnopqrstuvwxyz012345',
      department: 'Information Technology',
      year: 4,
      role: 'STUDENT',
      accountStatus: 'ACTIVE',
      verifiedAt: new Date()
    }
  ];

  for (const s of demoStudents) {
    await prisma.user.upsert({
      where: { id: s.id },
      update: s,
      create: s
    });
  }

  console.log('Categories, campus points, and students seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
