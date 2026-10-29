// Campus Mock Seed Data for Borrow Before Buy (BBB)
// Perfectly aligned with the Mini Project Report by Deepu Rao (LIET, Greater Noida / AKTU)

export const MOCK_USERS = [
  {
    id: 'user-deepu-000',
    name: 'Deepu Rao',
    collegeEmail: 'deepurao.cse25-29@liet.com',
    department: 'Computer Science & Engineering – AIML',
    year: 2,
    role: 'STUDENT',
    borrowerScore: 98,
    lenderScore: 99,
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    bio: 'CSE-AIML Sophomore at LIET. Campus Sharing Legend with 28 completed lends. Happy to share calculators, drafters, and presentation cords!'
  },
  {
    id: 'user-arjun-001',
    name: 'Arjun Sharma',
    collegeEmail: 'arjun.student@iet.edu',
    department: 'Computer Science & Engineering',
    year: 3,
    role: 'STUDENT',
    borrowerScore: 94,
    lenderScore: 98,
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    bio: 'CS Junior building hackathon projects. Always happy to lend my calculator, dev boards, and HDMI cords.'
  },
  {
    id: 'user-priya-002',
    name: 'Priya Patel',
    collegeEmail: 'priya.patel@iet.edu',
    department: 'Electrical & Electronics',
    year: 2,
    role: 'STUDENT',
    borrowerScore: 96,
    lenderScore: 98,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    bio: 'EEE sophomore. Pinned lab coat and circuit components. Let us save each other textbook and equipment costs!'
  },
  {
    id: 'user-sneha-004',
    name: 'Sneha Verma',
    collegeEmail: 'sneha.verma@iet.edu',
    department: 'Electronics & Communication',
    year: 3,
    role: 'STUDENT',
    borrowerScore: 95,
    lenderScore: 96,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    bio: 'ECE Junior. Active lender for Arduino kits, multimeters, and test bench gear.'
  },
  {
    id: 'user-kunal-005',
    name: 'Kunal Verma',
    collegeEmail: 'kunal.verma@iet.edu',
    department: 'Mechanical Engineering',
    year: 2,
    role: 'STUDENT',
    borrowerScore: 82,
    lenderScore: 85,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    bio: 'Mechanical branch. Always looking for drafting sheets and mini drafters for design submissions.'
  },
  {
    id: 'user-admin-099',
    name: 'Campus Moderator (Admin)',
    collegeEmail: 'admin@liet.edu',
    department: 'Student Affairs & Campus Noticeboard',
    year: 4,
    role: 'ADMIN',
    borrowerScore: 100,
    lenderScore: 100,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    bio: 'Managing campus safety, verifying student IDs, and moderating peer exchanges.'
  }
];

export const MOCK_CATEGORIES = [
  { id: 'cat-calc-001', name: 'Calculators', slug: 'calculators', icon: 'Calculator', description: 'Scientific & graphing calculators for lab exams' },
  { id: 'cat-cable-002', name: 'Cables & Adapters', slug: 'cables-adapters', icon: 'Cable', description: 'HDMI, USB-C hubs, display dongles, chargers' },
  { id: 'cat-lab-003', name: 'Lab Gear', slug: 'lab-gear', icon: 'FlaskConical', description: 'Lab coats, safety goggles, dissection kits' },
  { id: 'cat-draw-004', name: 'Stationery & Drawing', slug: 'stationery', icon: 'PenTool', description: 'Mini drafters, T-squares, compass sets, drawing boards' },
  { id: 'cat-elec-005', name: 'Electronics & Dev Boards', slug: 'electronics', icon: 'Cpu', description: 'Arduino, Raspberry Pi, multimeters, breadboards' },
  { id: 'cat-photo-006', name: 'Tripods & Cameras', slug: 'photography', icon: 'Camera', description: 'Phone gimbals, ring lights, DSLR tripods for projects' },
  { id: 'cat-sport-007', name: 'Sports Equipment', slug: 'sports', icon: 'Trophy', description: 'Basketballs, badminton rackets, TT paddles' },
  { id: 'cat-book-008', name: 'Textbooks & Notes', slug: 'books', icon: 'BookOpen', description: 'Reference books, solved question banks, handwritten notes' },
  { id: 'cat-other-009', name: 'Others', slug: 'others', icon: 'Package', description: 'Miscellaneous short-term student equipment' }
];

export const MOCK_CAMPUS_POINTS = [
  { id: 'pt-lib-001', name: 'Central Library Steps', zone: 'Central Academic Block' },
  { id: 'pt-gate-002', name: 'Main Campus Gate', zone: 'North Security Point' },
  { id: 'pt-cant-003', name: 'Student Canteen / Food Court', zone: 'Student Activity Center' },
  { id: 'pt-blocka-004', name: 'Block A Lobby (Ground Floor)', zone: 'Computer & IT Block' },
  { id: 'pt-sport-005', name: 'Sports Pavilion Bench', zone: 'Athletic Ground & Gym' },
  { id: 'pt-custom-006', name: 'Designated Spot', zone: 'Mutually agreed campus location' }
];

export const INITIAL_ITEMS = [
  {
    id: 'item-calc-001',
    title: 'Texas Instruments TI-84 Plus CE Color Graphing Calculator',
    description: 'Fully charged and loaded with calculus and stats functions. Perfect for Math 201 and Signal Processing exams. Includes protective sliding cover.',
    categoryId: 'cat-calc-001',
    category: { id: 'cat-calc-001', name: 'Calculators', slug: 'calculators' },
    condition: 'LIKE_NEW',
    securityAmount: 500,
    status: 'AVAILABLE',
    handoverPointId: 'pt-lib-001',
    handoverPoint: { id: 'pt-lib-001', name: 'Central Library Steps (Academic Block A)', zone: 'Central Academic Block' },
    ownerId: 'user-arjun-001',
    owner: MOCK_USERS[1],
    photos: [
      { id: 'photo-1', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    viewCount: 142
  },
  {
    id: 'item-elec-005',
    title: 'Arduino Uno R3 Microcontroller Kit + Breadboard & Jumper Wires',
    description: 'Genuine Arduino board with USB cable, 830-point breadboard, ultrasonic sensor, servo motor, and 40 jumper cables. Ideal for mini-projects and IoT assignments.',
    categoryId: 'cat-elec-005',
    category: { id: 'cat-elec-005', name: 'Electronics & Dev Boards', slug: 'electronics' },
    condition: 'GOOD',
    securityAmount: 200,
    status: 'AVAILABLE',
    handoverPointId: 'pt-blocka-004',
    handoverPoint: { id: 'pt-blocka-004', name: 'Block A Lobby (Ground Floor)', zone: 'Computer & IT Block' },
    ownerId: 'user-sneha-004',
    owner: MOCK_USERS[3],
    photos: [
      { id: 'photo-5', url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&auto=format&fit=crop&q=80' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    viewCount: 97
  },
  {
    id: 'item-cable-002',
    title: 'Anker USB-C to HDMI 4K Adapter (Braided Cable)',
    description: 'Needed for seminar hall and project presentations. Supports 4K@60Hz and works with MacBooks, iPads, and Windows USB-C laptops. No driver required.',
    categoryId: 'cat-cable-002',
    category: { id: 'cat-cable-002', name: 'Cables & Adapters', slug: 'cables-adapters' },
    condition: 'GOOD',
    securityAmount: 200,
    status: 'AVAILABLE',
    handoverPointId: 'pt-blocka-004',
    handoverPoint: { id: 'pt-blocka-004', name: 'Block A Lobby (Ground Floor)', zone: 'Computer & IT Block' },
    ownerId: 'user-priya-002',
    owner: MOCK_USERS[2],
    photos: [
      { id: 'photo-2', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    viewCount: 89
  },
  {
    id: 'item-lab-003',
    title: 'Pure White Cotton Chemistry Lab Coat (Unisex, Size M/L)',
    description: 'Freshly washed and ironed lab coat with deep front pockets. Mandatory for Organic Chemistry and Materials Science lab sessions.',
    categoryId: 'cat-lab-003',
    category: { id: 'cat-lab-003', name: 'Lab Gear', slug: 'lab-gear' },
    condition: 'GOOD',
    securityAmount: 150,
    status: 'AVAILABLE',
    handoverPointId: 'pt-cant-003',
    handoverPoint: { id: 'pt-cant-003', name: 'Student Canteen / Food Court', zone: 'Student Activity Center' },
    ownerId: 'user-deepu-000',
    owner: MOCK_USERS[0],
    photos: [
      { id: 'photo-3', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    viewCount: 64
  },
  {
    id: 'item-draw-004',
    title: 'Rotring Engineering Mini Drafter with Precision Protractor',
    description: 'Complete with scale, clamp, and sheet pins for Engineering Graphics / CAD drawing sheet submissions. Very smooth movement, calibrated protractor.',
    categoryId: 'cat-draw-004',
    category: { id: 'cat-draw-004', name: 'Stationery & Drawing', slug: 'stationery' },
    condition: 'LIKE_NEW',
    securityAmount: 400,
    status: 'AVAILABLE',
    handoverPointId: 'pt-lib-001',
    handoverPoint: { id: 'pt-lib-001', name: 'Central Library Steps', zone: 'Central Academic Block' },
    ownerId: 'user-deepu-000',
    owner: MOCK_USERS[0],
    photos: [
      { id: 'photo-4', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    viewCount: 120
  },
  {
    id: 'item-photo-006',
    title: 'Lightweight Aluminum Tripod with Smartphone Clamp',
    description: 'Extends up to 50 inches. 3-way pan head with bubble level. Perfect for club event photography, YouTube presentations, and group projects.',
    categoryId: 'cat-photo-006',
    category: { id: 'cat-photo-006', name: 'Tripods & Cameras', slug: 'photography' },
    condition: 'LIKE_NEW',
    securityAmount: 300,
    status: 'AVAILABLE',
    handoverPointId: 'pt-sport-005',
    handoverPoint: { id: 'pt-sport-005', name: 'Sports Pavilion Bench', zone: 'Athletic Ground & Gym' },
    ownerId: 'user-priya-002',
    owner: MOCK_USERS[2],
    photos: [
      { id: 'photo-6', url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 60).toISOString(),
    viewCount: 45
  }
];

export const INITIAL_REQUESTS = [
  {
    id: 'sample-req-001',
    itemId: 'item-calc-001',
    item: INITIAL_ITEMS[0],
    borrowerId: 'user-deepu-000',
    borrower: MOCK_USERS[0],
    ownerId: 'user-arjun-001',
    owner: MOCK_USERS[1],
    requestedStart: '2026-10-29T10:30:00.000Z',
    requestedEnd: '2026-10-31T17:00:00.000Z',
    message: 'Hey Arjun! I have internal exams coming up for Math 201, would love to borrow your TI-84 for 2 days.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

export const INITIAL_TRANSACTIONS = [
  // Matches Fig. 6.1: Active Borrowing Arduino Uno Kit from Sneha Verma (Borrower: Deepu Rao)
  {
    id: 'tx-arduino-sneha-deepu',
    requestId: 'req-arduino-001',
    itemId: 'item-elec-005',
    item: INITIAL_ITEMS[1],
    borrowerId: 'user-deepu-000',
    borrower: MOCK_USERS[0],
    lenderId: 'user-sneha-004',
    lender: MOCK_USERS[3],
    status: 'HANDOVER_PENDING',
    securityAmount: 200,
    handoverPoint: { name: 'Campus Stairs / Block A Lobby' },
    startAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    dueAt: '2026-10-31T17:00:00.000Z',
    securityAgreement: {
      lenderAcknowledged: true,
      borrowerAcknowledged: true,
      status: 'ACKNOWLEDGED',
      securityAmount: 200
    },
    conditionRecords: [
      {
        id: 'cr-before-1',
        stage: 'BEFORE',
        note: 'Arduino Uno board in clean anti-static bag with intact breadboard & USB cable.',
        photos: ['https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800'],
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ],
    handoverToken: 'bbb_qr_handover_token_arduino_9981',
    tokenExpiresAt: new Date(Date.now() + 1000 * 300).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  // Matches Fig. 6.3: Disputed case for Engineering Mini Drafter (Lender: Deepu Rao, Borrower: Kunal Verma)
  {
    id: 'tx-drafter-deepu-kunal',
    requestId: 'req-drafter-002',
    itemId: 'item-draw-004',
    item: INITIAL_ITEMS[4],
    borrowerId: 'user-kunal-005',
    borrower: MOCK_USERS[4],
    lenderId: 'user-deepu-000',
    lender: MOCK_USERS[0],
    status: 'DISPUTED',
    securityAmount: 400,
    handoverPoint: { name: 'Central Library Steps' },
    startAt: '2026-10-24T10:00:00.000Z',
    dueAt: '2026-10-26T17:00:00.000Z',
    returnedAt: '2026-10-26T18:00:00.000Z',
    securityAgreement: {
      lenderAcknowledged: true,
      borrowerAcknowledged: true,
      status: 'ACKNOWLEDGED',
      securityAmount: 400
    },
    conditionRecords: [
      {
        id: 'cr-before-drafter',
        stage: 'BEFORE',
        note: 'Mini drafter scratch-free and protractor calibrated.',
        photos: ['https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800'],
        createdAt: '2026-10-24T10:00:00.000Z'
      },
      {
        id: 'cr-after-drafter',
        stage: 'AFTER',
        note: 'Returned with cracked arm bracket.',
        photos: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'],
        createdAt: '2026-10-26T18:00:00.000Z'
      }
    ],
    dispute: {
      id: 'disp-emd-1024',
      caseId: '#DIS-EMD-1024',
      title: 'Engineering Mini Drafter',
      type: 'DAMAGE',
      status: 'OPEN',
      lenderStatement: 'The mini drafter was returned with a cracked arm. It was in perfect working condition when I lent it out.',
      borrowerStatement: 'I noticed the damage when I received it, but thought it was minor. It broke further during normal use.',
      beforePhoto: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800',
      afterPhoto: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'
    },
    createdAt: '2026-10-24T09:30:00.000Z'
  },
  // Matches Fig. 6.2: Completed transaction between Arjun and Priya
  {
    id: 'tx-calc-arjun-priya',
    requestId: 'req-calc-003',
    itemId: 'item-calc-001',
    item: INITIAL_ITEMS[0],
    borrowerId: 'user-priya-002',
    borrower: MOCK_USERS[2],
    lenderId: 'user-arjun-001',
    lender: MOCK_USERS[1],
    status: 'BORROWED',
    securityAmount: 300,
    handoverPoint: { name: 'Central Library Steps' },
    startAt: '2026-10-29T11:42:00.000Z',
    dueAt: '2026-10-31T17:00:00.000Z',
    securityAgreement: {
      lenderAcknowledged: true,
      borrowerAcknowledged: true,
      status: 'ACKNOWLEDGED',
      securityAmount: 300
    },
    handoverRecord: {
      verifiedAt: '2026-10-29T11:42:00.000Z',
      method: 'QR_SCAN'
    },
    createdAt: '2026-10-29T10:00:00.000Z'
  }
];

export const SAMPLE_ITEM_PHOTOS = [
  'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&auto=format&fit=crop&q=80'
];

export const MOCK_REVIEWS = [
  {
    id: 'rev-01',
    borrowerName: 'Priya Patel',
    borrowerYear: '2nd Year, EEE',
    borrowerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    itemTitle: 'TI-84 Plus CE Calculator',
    rating: 5,
    comment: 'Saved me ₹1,200 right before my Math 201 exam! Deepu handed it over with full charge and the sliding case at the library steps.'
  },
  {
    id: 'rev-02',
    borrowerName: 'Arjun Sharma',
    borrowerYear: '3rd Year, CSE',
    borrowerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    itemTitle: 'USB-C to HDMI 4K Cable',
    rating: 5,
    comment: 'Our minor project presentation went super smoothly. The QR scan verification gave us both instant confidence with no awkward security conversations.'
  },
  {
    id: 'rev-03',
    borrowerName: 'Kunal Verma',
    borrowerYear: '2nd Year, ME',
    borrowerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    itemTitle: 'Chemistry Lab Coat',
    rating: 5,
    comment: 'Borrowed for just two practical sessions. Clean, zero hassle, and returned on time. This platform is a gamechanger for our college campus.'
  }
];

