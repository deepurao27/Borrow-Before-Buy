// Campus Mock Seed Data for Borrow Before Buy (BBB)
// Provides realistic, humanised college items, verified students, categories, and handover spots.

export const MOCK_USERS = [
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
    borrowerScore: 91,
    lenderScore: 96,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    bio: 'EEE sophomore. Pinned lab coat and circuit components. Let us save each other textbook and equipment costs!'
  },
  {
    id: 'user-rohan-003',
    name: 'Rohan Verma',
    collegeEmail: 'rohan.v@iet.edu',
    department: 'Mechanical Engineering',
    year: 2,
    role: 'STUDENT',
    borrowerScore: 88,
    lenderScore: 90,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    bio: 'Mechanical branch. Have drafting tools and lab gear sitting idle after mid-terms.'
  },
  {
    id: 'user-sneha-004',
    name: 'Sneha Kulkarni',
    collegeEmail: 'sneha.k@iet.edu',
    department: 'Information Technology',
    year: 4,
    role: 'STUDENT',
    borrowerScore: 96,
    lenderScore: 95,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    bio: 'IT Senior. Graduating soon and passing forward gear to juniors.'
  },
  {
    id: 'user-admin-099',
    name: 'Campus Moderator (Admin)',
    collegeEmail: 'admin@iet.edu',
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
    handoverPoint: { id: 'pt-lib-001', name: 'Central Library Steps', zone: 'Central Academic Block' },
    ownerId: 'user-arjun-001',
    owner: MOCK_USERS[0],
    photos: [
      { id: 'photo-1', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    viewCount: 142
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
    owner: MOCK_USERS[1],
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
    ownerId: 'user-rohan-003',
    owner: MOCK_USERS[2],
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
    ownerId: 'user-sneha-004',
    owner: MOCK_USERS[3],
    photos: [
      { id: 'photo-4', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    viewCount: 120
  },
  {
    id: 'item-elec-005',
    title: 'Arduino Uno R3 Microcontroller Kit + Breadboard & Jumper Wires',
    description: 'Genuine Arduino board with USB cable, 830-point breadboard, ultrasonic sensor, servo motor, and 40 jumper cables. Ideal for mini-projects and IoT assignments.',
    categoryId: 'cat-elec-005',
    category: { id: 'cat-elec-005', name: 'Electronics & Dev Boards', slug: 'electronics' },
    condition: 'GOOD',
    securityAmount: 500,
    status: 'AVAILABLE',
    handoverPointId: 'pt-blocka-004',
    handoverPoint: { id: 'pt-blocka-004', name: 'Block A Lobby (Ground Floor)', zone: 'Computer & IT Block' },
    ownerId: 'user-arjun-001',
    owner: MOCK_USERS[0],
    photos: [
      { id: 'photo-5', url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&auto=format&fit=crop&q=80' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    viewCount: 97
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
    owner: MOCK_USERS[1],
    photos: [
      { id: 'photo-6', url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 60).toISOString(),
    viewCount: 78
  },
  {
    id: 'item-sport-007',
    title: 'Yonex Carbonex Badminton Racket + Shuttles Tube',
    description: 'Lightweight carbon composite frame with high string tension. Great for weekend hostel matches or inter-college sports practice.',
    categoryId: 'cat-sport-007',
    category: { id: 'cat-sport-007', name: 'Sports Equipment', slug: 'sports' },
    condition: 'GOOD',
    securityAmount: 250,
    status: 'AVAILABLE',
    handoverPointId: 'pt-sport-005',
    handoverPoint: { id: 'pt-sport-005', name: 'Sports Pavilion Bench', zone: 'Athletic Ground & Gym' },
    ownerId: 'user-rohan-003',
    owner: MOCK_USERS[2],
    photos: [
      { id: 'photo-7', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    viewCount: 52
  },
  {
    id: 'item-calc-008',
    title: 'Casio fx-991EX ClassWiz Non-Programmable Scientific Calculator',
    description: 'High-resolution display with spreadsheet functions and matrix calculations. University exam hall approved. Battery is fresh.',
    categoryId: 'cat-calc-001',
    category: { id: 'cat-calc-001', name: 'Calculators', slug: 'calculators' },
    condition: 'LIKE_NEW',
    securityAmount: 300,
    status: 'AVAILABLE',
    handoverPointId: 'pt-lib-001',
    handoverPoint: { id: 'pt-lib-001', name: 'Central Library Steps', zone: 'Central Academic Block' },
    ownerId: 'user-sneha-004',
    owner: MOCK_USERS[3],
    photos: [
      { id: 'photo-8', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80' }
    ],
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    viewCount: 115
  }
];

export const MOCK_REVIEWS = [
  {
    id: 'rev-1',
    borrowerName: 'Ananya Deshmukh',
    borrowerYear: '2nd Year Electrical',
    borrowerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    itemTitle: 'TI-84 Plus CE Calculator',
    rating: 5,
    comment: 'Saved me ₹4,200 for my Linear Algebra mid-semester exam! Arjun handed it over at the library steps in under 5 minutes with full battery. Returned the next evening without a hitch.',
    date: '2 days ago'
  },
  {
    id: 'rev-2',
    borrowerName: 'Vikram Joshi',
    borrowerYear: '4th Year Computer Science',
    borrowerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    itemTitle: 'USB-C to HDMI Adapter',
    rating: 5,
    comment: 'Our final year capstone presentation was in 20 minutes and our monitor cable broke. Priya accepted my request within 3 minutes. Total lifesaver.',
    date: 'Yesterday'
  },
  {
    id: 'rev-3',
    borrowerName: 'Kavita Nair',
    borrowerYear: '1st Year Mechanical',
    borrowerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    itemTitle: 'Rotring Engineering Drafter',
    rating: 5,
    comment: 'Buying a drafter for just one engineering graphics course felt like a waste of money. Sneha’s drafter was in mint condition. The QR return check is super clean.',
    date: '3 days ago'
  }
];

export const SAMPLE_ITEM_PHOTOS = [
  { label: 'Calculator', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80' },
  { label: 'Cable / Dongle', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80' },
  { label: 'Lab Coat', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80' },
  { label: 'Drafter / Tools', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80' },
  { label: 'Dev Board', url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&auto=format&fit=crop&q=80' },
  { label: 'Tripod', url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80' },
  { label: 'Sports', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80' },
  { label: 'Textbook', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80' }
];
