import {
  MOCK_USERS,
  MOCK_CATEGORIES,
  MOCK_CAMPUS_POINTS,
  INITIAL_ITEMS
} from './mockData.js';

const STORAGE_KEYS = {
  ITEMS: 'bbb_mock_items',
  REQUESTS: 'bbb_mock_requests',
  TRANSACTIONS: 'bbb_mock_transactions',
  CUSTOM_CATEGORIES: 'bbb_mock_categories'
};

const getStored = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setStored = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore localStorage write error
  }
};

// Initialize items if empty
export const getAllItems = () => {
  const stored = getStored(STORAGE_KEYS.ITEMS, null);
  if (!stored || stored.length === 0) {
    setStored(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
    return [...INITIAL_ITEMS];
  }
  return stored;
};

export const mockEngine = {
  // 1. Categories
  getCategories: () => {
    return { data: MOCK_CATEGORIES };
  },

  // 2. Campus Handover Points
  getCampusPoints: () => {
    return { data: MOCK_CAMPUS_POINTS };
  },

  // 3. Items list with query & filter support
  getItems: (queryString = '') => {
    const items = getAllItems();
    const params = new URLSearchParams(queryString.startsWith('?') ? queryString.slice(1) : queryString);
    const q = (params.get('q') || '').toLowerCase().trim();
    const categoryId = params.get('categoryId');
    const condition = params.get('condition');
    const handoverPointId = params.get('handoverPointId');

    let filtered = items.filter((item) => {
      if (item.status && item.status !== 'AVAILABLE') return false;
      if (q) {
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesCat = item.category?.name?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }
      if (categoryId && item.categoryId !== categoryId && item.category?.id !== categoryId) {
        return false;
      }
      if (condition && item.condition !== condition) {
        return false;
      }
      if (handoverPointId && item.handoverPointId !== handoverPointId) {
        return false;
      }
      return true;
    });

    return { data: filtered, count: filtered.length };
  },

  // 4. Single Item Detail
  getItemById: (id) => {
    const items = getAllItems();
    const item = items.find((i) => i.id === id);
    if (!item) {
      const err = new Error('Item not found on campus noticeboard');
      err.status = 404;
      throw err;
    }
    return { data: item };
  },

  // 5. Create new item (Lending flow)
  createItem: (data, currentUser) => {
    const items = getAllItems();
    const categories = MOCK_CATEGORIES;
    const points = MOCK_CAMPUS_POINTS;

    const category = categories.find((c) => c.id === data.categoryId) || {
      id: data.categoryId || 'cat-custom',
      name: data.customCategory || 'Custom Category',
      slug: 'others'
    };

    const handoverPoint = points.find((p) => p.id === data.handoverPointId) || {
      id: data.handoverPointId || 'pt-custom',
      name: data.customHandoverPoint || 'Designated Campus Spot',
      zone: 'Agreed on campus'
    };

    const user = currentUser || MOCK_USERS[0];

    const newItem = {
      id: 'item-' + Date.now(),
      title: data.title,
      description: data.description,
      categoryId: category.id,
      category,
      condition: data.condition || 'GOOD',
      securityAmount: Number(data.securityAmount) || 0,
      handoverPointId: handoverPoint.id,
      handoverPoint,
      status: 'AVAILABLE',
      ownerId: user.id,
      owner: {
        id: user.id,
        name: user.name,
        collegeEmail: user.collegeEmail,
        department: user.department || 'Student Community',
        year: user.year || 3,
        role: user.role || 'STUDENT',
        lenderScore: user.lenderScore || 95,
        borrowerScore: user.borrowerScore || 90,
        avatarUrl: user.avatarUrl
      },
      photos: [],
      createdAt: new Date().toISOString(),
      viewCount: 1
    };

    items.unshift(newItem);
    setStored(STORAGE_KEYS.ITEMS, items);
    return { data: newItem, message: 'Item successfully posted to noticeboard!' };
  },

  // 6. Attach photos to item
  attachPhotos: (itemId, photoFiles) => {
    const items = getAllItems();
    const itemIdx = items.findIndex((i) => i.id === itemId);
    if (itemIdx === -1) return { data: null };

    // In-browser preview URLs
    const newPhotos = photoFiles.map((f, idx) => ({
      id: `photo-${Date.now()}-${idx}`,
      url: typeof f === 'string' ? f : URL.createObjectURL(f)
    }));

    items[itemIdx].photos = [...(items[itemIdx].photos || []), ...newPhotos];
    setStored(STORAGE_KEYS.ITEMS, items);
    return { data: items[itemIdx] };
  },

  // 7. Delete Item
  deleteItem: (itemId) => {
    let items = getAllItems();
    items = items.filter((i) => i.id !== itemId);
    setStored(STORAGE_KEYS.ITEMS, items);
    return { message: 'Item listing removed.' };
  },

  // 8. Borrow Requests
  createBorrowRequest: (itemId, data, currentUser) => {
    const items = getAllItems();
    const item = items.find((i) => i.id === itemId);
    if (!item) throw new Error('Item does not exist');

    const user = currentUser || MOCK_USERS[1];
    const requests = getStored(STORAGE_KEYS.REQUESTS, []);

    const newRequest = {
      id: 'req-' + Date.now(),
      itemId: item.id,
      item,
      borrowerId: user.id,
      borrower: user,
      ownerId: item.ownerId,
      owner: item.owner,
      requestedStart: data.requestedStart,
      requestedEnd: data.requestedEnd,
      message: data.message || 'Hi! I would love to borrow this for my lab/class.',
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    requests.unshift(newRequest);
    setStored(STORAGE_KEYS.REQUESTS, requests);
    return { data: newRequest, message: 'Borrow request dispatched to lender!' };
  },

  // 9. Get Requests
  getRequests: (type = 'received', currentUser) => {
    const user = currentUser || MOCK_USERS[0];
    const requests = getStored(STORAGE_KEYS.REQUESTS, [
      {
        id: 'sample-req-001',
        itemId: 'item-calc-001',
        item: INITIAL_ITEMS[0],
        borrowerId: 'user-priya-002',
        borrower: MOCK_USERS[1],
        ownerId: user.id,
        owner: user,
        requestedStart: new Date(Date.now() + 86400000).toISOString(),
        requestedEnd: new Date(Date.now() + 86400000 * 3).toISOString(),
        message: 'Hi Arjun! I have a control systems exam on Wednesday, can I borrow your TI-84 for 2 days?',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ]);

    let filtered = [];
    if (type === 'received') {
      filtered = requests.filter((r) => r.ownerId === user.id || r.owner?.collegeEmail === user.collegeEmail);
    } else {
      filtered = requests.filter((r) => r.borrowerId === user.id || r.borrower?.collegeEmail === user.collegeEmail);
    }

    return { data: filtered };
  },

  // 10. Accept Request -> Create Transaction
  acceptRequest: (requestId, currentUser) => {
    const requests = getStored(STORAGE_KEYS.REQUESTS, []);
    const reqIdx = requests.findIndex((r) => r.id === requestId);
    if (reqIdx === -1) throw new Error('Request not found');

    requests[reqIdx].status = 'ACCEPTED';
    setStored(STORAGE_KEYS.REQUESTS, requests);

    const targetReq = requests[reqIdx];
    const transactions = getStored(STORAGE_KEYS.TRANSACTIONS, []);

    const newTx = {
      id: 'tx-' + Date.now(),
      requestId: targetReq.id,
      itemId: targetReq.itemId,
      item: targetReq.item,
      borrowerId: targetReq.borrowerId,
      borrower: targetReq.borrower,
      lenderId: targetReq.ownerId,
      lender: targetReq.owner,
      status: 'HANDOVER_SCHEDULED',
      securityAmount: targetReq.item?.securityAmount || 0,
      handoverPoint: targetReq.item?.handoverPoint || { name: 'Library Steps' },
      scheduledStart: targetReq.requestedStart,
      scheduledEnd: targetReq.requestedEnd,
      handoverToken: 'bbb_qr_' + Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString()
    };

    transactions.unshift(newTx);
    setStored(STORAGE_KEYS.TRANSACTIONS, transactions);

    return { data: newTx, message: 'Request accepted! Handover QR code generated.' };
  },

  // 11. Transactions
  getTransactions: (currentUser) => {
    const user = currentUser || MOCK_USERS[0];
    const txs = getStored(STORAGE_KEYS.TRANSACTIONS, []);
    return { data: txs };
  },

  getTransactionById: (id) => {
    const txs = getStored(STORAGE_KEYS.TRANSACTIONS, []);
    const tx = txs.find((t) => t.id === id);
    if (!tx) {
      // Provide fallback mock transaction
      return {
        data: {
          id,
          status: 'HANDOVER_SCHEDULED',
          item: INITIAL_ITEMS[0],
          borrower: MOCK_USERS[1],
          lender: MOCK_USERS[0],
          securityAmount: 500,
          scheduledStart: new Date().toISOString(),
          scheduledEnd: new Date(Date.now() + 86400000 * 2).toISOString(),
          handoverToken: 'bbb_demo_qr_token'
        }
      };
    }
    return { data: tx };
  },

  // 12. Public Community Stats
  getStats: () => {
    const items = getAllItems();
    return {
      data: {
        totalItems: items.length,
        totalBorrows: 89,
        activeStudents: 146,
        categoriesCount: MOCK_CATEGORIES.length
      }
    };
  },

  // 13. Student Dashboard (Dual Role: Both Active Borrows & Active Lends)
  getDashboard: (currentUser) => {
    const user = currentUser || MOCK_USERS[1];
    const items = getAllItems();
    const requests = getStored(STORAGE_KEYS.REQUESTS, []);
    const transactions = getStored(STORAGE_KEYS.TRANSACTIONS, []);

    const userItems = items.filter((i) => i.ownerId === user.id || i.owner?.collegeEmail === user.collegeEmail);
    const activeBorrowing = transactions.filter((t) => t.borrowerId === user.id || t.borrower?.collegeEmail === user.collegeEmail);
    const activeLending = transactions.filter((t) => t.lenderId === user.id || t.lender?.collegeEmail === user.collegeEmail);
    const pendingReceived = requests.filter((r) => (r.ownerId === user.id || r.owner?.collegeEmail === user.collegeEmail) && r.status === 'PENDING').length;
    const pendingSent = requests.filter((r) => (r.borrowerId === user.id || r.borrower?.collegeEmail === user.collegeEmail) && r.status === 'PENDING').length;

    return {
      data: {
        trustProfile: {
          overallScore: Math.round(((user.lenderScore || 95) + (user.borrowerScore || 92)) / 2),
          lenderScore: user.lenderScore || 95,
          borrowerScore: user.borrowerScore || 92,
          tier: { name: 'Tier 1 Verified Campus Peer' },
          metrics: {
            completedBorrows: activeBorrowing.filter((t) => t.status === 'COMPLETED').length + 4,
            completedLends: activeLending.filter((t) => t.status === 'COMPLETED').length + 6,
            onTimeReturns: 4,
            onTimeRatePercent: 100
          },
          history: [
            { id: 'th-1', delta: 5, eventType: 'Lent TI-84 Plus Calculator on time', roleContext: 'LENDER' },
            { id: 'th-2', delta: 4, eventType: 'Returned Lab Coat in pristine condition', roleContext: 'BORROWER' }
          ]
        },
        counts: {
          activeBorrowing: activeBorrowing.length,
          activeLending: activeLending.length,
          dueSoon: 0,
          pendingRequestsReceived: pendingReceived,
          pendingRequestsSent: pendingSent
        },
        dueSoonItems: [],
        activeBorrowing,
        activeLending,
        myListings: userItems
      }
    };
  },

  // 14. Student Public Profile
  getProfile: (targetId, currentUser) => {
    const activeUser = currentUser || MOCK_USERS[1];
    let user = activeUser;
    if (targetId && targetId !== 'me' && targetId !== activeUser.id) {
      user = MOCK_USERS.find((u) => u.id === targetId || u.collegeEmail === targetId) || activeUser;
    }
    const items = getAllItems();
    const activeListings = items.filter((i) => i.ownerId === user.id || i.owner?.collegeEmail === user.collegeEmail);

    return {
      data: {
        user,
        trustProfile: {
          overallScore: Math.round(((user.lenderScore || 95) + (user.borrowerScore || 92)) / 2),
          lenderScore: user.lenderScore || 95,
          borrowerScore: user.borrowerScore || 92,
          tier: { name: 'Verified Campus Sharer' },
          metrics: {
            completedBorrows: 4,
            completedLends: 6,
            onTimeReturns: 4,
            onTimeRatePercent: 100
          },
          history: [
            { id: 'th-1', delta: 5, eventType: 'Lent TI-84 Plus Calculator on time', roleContext: 'LENDER' },
            { id: 'th-2', delta: 4, eventType: 'Returned Lab Coat in pristine condition', roleContext: 'BORROWER' }
          ]
        },
        ratings: {
          average: 4.9,
          count: 3,
          reviews: [
            {
              id: 'rev-1',
              reviewer: MOCK_USERS[0],
              rating: 5,
              comment: 'Great peer! Returned the gear cleanly and prompt on time.',
              createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
            }
          ]
        },
        activeListings
      }
    };
  },

  // 15. Campus Leaderboard
  getLeaderboard: () => {
    return {
      data: MOCK_USERS.map((u, idx) => ({
        ...u,
        rank: idx + 1,
        overallScore: Math.round(((u.lenderScore || 90) + (u.borrowerScore || 90)) / 2),
        totalExchanges: 12 - idx * 2
      }))
    };
  },

  // 16. Demo / 1-Click Login
  demoLogin: (targetUserId) => {
    const user = MOCK_USERS.find((u) => u.id === targetUserId) || MOCK_USERS[1];
    return {
      data: {
        user,
        accessToken: `mock_token_${user.id}_${Date.now()}`,
        refreshToken: `mock_refresh_${user.id}_${Date.now()}`
      },
      message: `Signed in as ${user.name}!`
    };
  },

  // 17. Auth (OTP and Password Mock Handling)
  sendOtp: (email, name) => {
    return {
      success: true,
      message: `6-digit code dispatched to ${email}! (Demo code: 123456)`
    };
  },

  verifyOtp: (email, otp, name) => {
    const existing = MOCK_USERS.find((u) => u.collegeEmail.toLowerCase() === email.toLowerCase());
    const user = existing || {
      id: 'user-' + Date.now(),
      name: name?.trim() || email.split('@')[0].replace(/[._]/g, ' '),
      collegeEmail: email.trim().toLowerCase(),
      department: 'Campus Student Community',
      year: 2,
      role: 'STUDENT',
      borrowerScore: 92,
      lenderScore: 95,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
    };

    return {
      data: {
        user,
        accessToken: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now()
      },
      message: `Welcome to Borrow Before Buy, ${user.name}!`
    };
  },

  loginPassword: (collegeEmail, password) => {
    const existing = MOCK_USERS.find((u) => u.collegeEmail.toLowerCase() === collegeEmail.toLowerCase());
    const user = existing || {
      id: 'user-' + Date.now(),
      name: collegeEmail.split('@')[0].replace(/[._]/g, ' '),
      collegeEmail: collegeEmail.trim().toLowerCase(),
      department: 'Campus Student Community',
      year: 2,
      role: 'STUDENT',
      borrowerScore: 90,
      lenderScore: 92,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
    };

    return {
      data: {
        user,
        accessToken: 'mock_jwt_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now()
      },
      message: `Welcome back, ${user.name}!`
    };
  }
};
