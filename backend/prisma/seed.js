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
    { name: 'Central Library Steps', zone: 'Central Academic Block' },
    { name: 'Library Steps', zone: 'Central Campus' },
    { name: 'Main Campus Gate', zone: 'North Security Point' },
    { name: 'Main Gate', zone: 'North Entrance' },
    { name: 'Student Canteen / Food Court', zone: 'Student Activity Center' },
    { name: 'Canteen', zone: 'Student Activity Center' },
    { name: 'Block A Lobby (Ground Floor)', zone: 'Computer & IT Block' },
    { name: 'Block A Lobby', zone: 'Academic Block A' },
    { name: 'Sports Pavilion Bench', zone: 'Athletic Ground & Gym' },
    { name: 'Sports Pavilion', zone: 'Athletic Grounds' },
    { name: 'Designated Spot', zone: 'Mutually agreed campus location' },
    { name: 'Others', zone: 'Custom Spot / Designated Location' }
  ];

  for (const pt of campusPoints) {
    await prisma.campusPoint.upsert({
      where: { name: pt.name },
      update: pt,
      create: pt
    });
  }

  console.log('Seeding demo campus students (matches Project Report)...');
  const dummyHash = '$argon2id$v=19$m=65536,t=3,p=1$abcdefghijklmnopqrstuvwxyz012345$abcdefghijklmnopqrstuvwxyz012345';

  const demoStudents = [
    {
      id: 'user-deepu-000',
      name: 'Deepu Rao',
      collegeEmail: 'deepurao.cse25-29@liet.com',
      passwordHash: dummyHash,
      department: 'Computer Science & Engineering – AIML',
      year: 2,
      role: 'STUDENT',
      accountStatus: 'ACTIVE',
      verifiedAt: new Date()
    },
    {
      id: 'user-arjun-001',
      name: 'Arjun Sharma',
      collegeEmail: 'arjun.student@iet.edu',
      passwordHash: dummyHash,
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
      passwordHash: dummyHash,
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
      passwordHash: dummyHash,
      department: 'Mechanical Engineering',
      year: 2,
      role: 'STUDENT',
      accountStatus: 'ACTIVE',
      verifiedAt: new Date()
    },
    {
      id: 'user-sneha-004',
      name: 'Sneha Verma',
      collegeEmail: 'sneha.verma@iet.edu',
      passwordHash: dummyHash,
      department: 'Electronics & Communication',
      year: 3,
      role: 'STUDENT',
      accountStatus: 'ACTIVE',
      verifiedAt: new Date()
    },
    {
      id: 'user-kunal-005',
      name: 'Kunal Verma',
      collegeEmail: 'kunal.verma@iet.edu',
      passwordHash: dummyHash,
      department: 'Mechanical Engineering',
      year: 2,
      role: 'STUDENT',
      accountStatus: 'ACTIVE',
      verifiedAt: new Date()
    },
    {
      id: 'user-admin-099',
      name: 'Campus Moderator (Admin)',
      collegeEmail: 'admin@liet.edu',
      passwordHash: dummyHash,
      department: 'Student Affairs & Campus Noticeboard',
      year: 4,
      role: 'ADMIN',
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

  // Get primary category and point IDs
  const calcCat = await prisma.category.findUnique({ where: { slug: 'calculators' } });
  const cableCat = await prisma.category.findUnique({ where: { slug: 'cables-adapters' } });
  const labCat = await prisma.category.findUnique({ where: { slug: 'lab-gear' } });
  const drawCat = await prisma.category.findUnique({ where: { slug: 'stationery' } });
  const elecCat = await prisma.category.findUnique({ where: { slug: 'electronics' } });
  const photoCat = await prisma.category.findUnique({ where: { slug: 'photography' } });

  const libPoint = await prisma.campusPoint.findFirst({ where: { name: { contains: 'Library' } } });
  const blockAPoint = await prisma.campusPoint.findFirst({ where: { name: { contains: 'Block A' } } });
  const canteenPoint = await prisma.campusPoint.findFirst({ where: { name: { contains: 'Canteen' } } });

  console.log('Seeding initial campus gear items...');
  const items = [
    {
      id: 'item-calc-001',
      title: 'Texas Instruments TI-84 Plus CE Color Graphing Calculator',
      description: 'Fully charged and loaded with calculus and stats functions. Perfect for Math 201 and Signal Processing exams. Includes protective sliding cover.',
      categoryId: calcCat.id,
      condition: 'LIKE_NEW',
      securityAmount: 500,
      handoverPointId: libPoint.id,
      ownerId: 'user-arjun-001',
      status: 'ACTIVE'
    },
    {
      id: 'item-elec-005',
      title: 'Arduino Uno R3 Microcontroller Kit + Breadboard & Jumper Wires',
      description: 'Genuine Arduino board with USB cable, 830-point breadboard, ultrasonic sensor, servo motor, and 40 jumper cables. Ideal for mini-projects and IoT assignments.',
      categoryId: elecCat.id,
      condition: 'GOOD',
      securityAmount: 200,
      handoverPointId: blockAPoint.id,
      ownerId: 'user-sneha-004',
      status: 'ACTIVE'
    },
    {
      id: 'item-cable-002',
      title: 'Anker USB-C to HDMI 4K Adapter (Braided Cable)',
      description: 'Needed for seminar hall and project presentations. Supports 4K@60Hz and works with MacBooks, iPads, and Windows USB-C laptops. No driver required.',
      categoryId: cableCat.id,
      condition: 'GOOD',
      securityAmount: 200,
      handoverPointId: blockAPoint.id,
      ownerId: 'user-priya-002',
      status: 'ACTIVE'
    },
    {
      id: 'item-lab-003',
      title: 'Pure White Cotton Chemistry Lab Coat (Unisex, Size M/L)',
      description: 'Freshly washed and ironed lab coat with deep front pockets. Mandatory for Organic Chemistry and Materials Science lab sessions.',
      categoryId: labCat.id,
      condition: 'GOOD',
      securityAmount: 150,
      handoverPointId: canteenPoint.id,
      ownerId: 'user-rohan-003',
      status: 'ACTIVE'
    },
    {
      id: 'item-draw-004',
      title: 'Rotring Engineering Mini Drafter with Precision Protractor',
      description: 'Complete with scale, clamp, and sheet pins for Engineering Graphics / CAD drawing sheet submissions. Very smooth movement, calibrated protractor.',
      categoryId: drawCat.id,
      condition: 'LIKE_NEW',
      securityAmount: 400,
      handoverPointId: libPoint.id,
      ownerId: 'user-deepu-000',
      status: 'ACTIVE'
    },
    {
      id: 'item-photo-006',
      title: 'Lightweight Aluminum Tripod with Smartphone Clamp',
      description: 'Extends up to 50 inches. 3-way pan head with bubble level. Perfect for club event photography, YouTube presentations, and group projects.',
      categoryId: photoCat.id,
      condition: 'LIKE_NEW',
      securityAmount: 300,
      handoverPointId: libPoint.id,
      ownerId: 'user-priya-002',
      status: 'ACTIVE'
    }
  ];

  for (const it of items) {
    await prisma.item.upsert({
      where: { id: it.id },
      update: it,
      create: it
    });
  }

  // Seed sample request: Deepu Rao requested TI-84 from Arjun Sharma
  await prisma.borrowRequest.upsert({
    where: { id: 'req-calc-deepu-001' },
    update: {},
    create: {
      id: 'req-calc-deepu-001',
      itemId: 'item-calc-001',
      borrowerId: 'user-deepu-000',
      requestedStart: new Date(Date.now() + 86400000),
      requestedEnd: new Date(Date.now() + 86400000 * 3),
      message: 'Hey Arjun! I have internal exams coming up for Math 201, would love to borrow your TI-84 for 2 days.',
      status: 'PENDING'
    }
  });

  // Seed active transaction: Arduino Uno Kit (Sneha Verma lending to Deepu Rao) - from Fig. 6.1
  const startAt = new Date();
  const dueAt = new Date(Date.now() + 86400000 * 2);
  dueAt.setHours(17, 0, 0, 0);

  const txArduino = await prisma.transaction.upsert({
    where: { id: 'tx-arduino-sneha-deepu' },
    update: {},
    create: {
      id: 'tx-arduino-sneha-deepu',
      itemId: 'item-elec-005',
      lenderId: 'user-sneha-004',
      borrowerId: 'user-deepu-000',
      status: 'HANDOVER_PENDING',
      startAt,
      dueAt,
      version: 2
    }
  });

  await prisma.securityAgreement.upsert({
    where: { transactionId: 'tx-arduino-sneha-deepu' },
    update: {},
    create: {
      transactionId: 'tx-arduino-sneha-deepu',
      securityAmount: 200,
      lenderAcknowledged: true,
      lenderAcknowledgedAt: new Date(Date.now() - 3600000),
      borrowerAcknowledged: true,
      borrowerAcknowledgedAt: new Date(Date.now() - 3500000),
      status: 'ACKNOWLEDGED'
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
