import {
  MOCK_USERS,
  MOCK_CATEGORIES,
  MOCK_CAMPUS_POINTS,
  INITIAL_ITEMS,
  INITIAL_REQUESTS,
  INITIAL_TRANSACTIONS
} from './mockData.js';

const STORAGE_KEYS = {
  ITEMS: 'bbb_mock_items',
  REQUESTS: 'bbb_mock_requests',
  TRANSACTIONS: 'bbb_mock_transactions',
  CUSTOM_CATEGORIES: 'bbb_mock_categories',
  NEEDS: 'bbb_mock_needs',
  AUDIT_LOGS: 'bbb_mock_audit_logs'
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

// Initialize transactions if empty
export const getAllTransactions = () => {
  const stored = getStored(STORAGE_KEYS.TRANSACTIONS, null);
  if (!stored || stored.length === 0) {
    setStored(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
    return [...INITIAL_TRANSACTIONS];
  }
  return stored;
};

// Initialize requests if empty
export const getAllRequests = () => {
  const stored = getStored(STORAGE_KEYS.REQUESTS, null);
  if (!stored || stored.length === 0) {
    setStored(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    return [...INITIAL_REQUESTS];
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

  // 3. Items list with query & filter support (Section 4.2.4 Search & Relevance Ranking)
  getItems: (queryString = '') => {
    const items = getAllItems();
    const params = new URLSearchParams(queryString.startsWith('?') ? queryString.slice(1) : queryString);
    const q = (params.get('q') || '').toLowerCase().trim();
    const categoryId = params.get('categoryId');
    const condition = params.get('condition');
    const handoverPointId = params.get('handoverPointId');

    let filtered = items.filter((item) => {
      if (item.status && item.status !== 'AVAILABLE' && item.status !== 'ACTIVE') return false;
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

    // Score & sort according to report algorithm 4.2.4: Title match has higher weight + lender score bonus
    if (q) {
      filtered.sort((a, b) => {
        const aTitle = a.title?.toLowerCase().includes(q) ? 10 : 0;
        const bTitle = b.title?.toLowerCase().includes(q) ? 10 : 0;
        const aScore = (a.owner?.lenderScore || 90) * 0.05;
        const bScore = (b.owner?.lenderScore || 90) * 0.05;
        return (bTitle + bScore) - (aTitle + aScore);
      });
    }

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

  // 5. Create new item (Lending flow - matches Fig. 4.6)
  createItem: (data, currentUser) => {
    const items = getAllItems();
    const categories = MOCK_CATEGORIES;
    const points = MOCK_CAMPUS_POINTS;

    const category = categories.find((c) => c.id === data.categoryId || c.slug === data.categoryId) || {
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
        department: user.department || 'Computer Science & Engineering – AIML',
        year: user.year || 2,
        role: user.role || 'STUDENT',
        lenderScore: user.lenderScore || 98,
        borrowerScore: user.borrowerScore || 98,
        avatarUrl: user.avatarUrl
      },
      photos: data.photos || [
        { id: 'p-1', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800' }
      ],
      createdAt: new Date().toISOString(),
      viewCount: 1
    };

    items.unshift(newItem);
    setStored(STORAGE_KEYS.ITEMS, items);
    return { data: newItem, message: 'Item successfully posted to campus noticeboard!' };
  },

  // 6. Attach photos to item
  attachPhotos: (itemId, photoFiles) => {
    const items = getAllItems();
    const itemIdx = items.findIndex((i) => i.id === itemId);
    if (itemIdx === -1) return { data: null };

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

    const user = currentUser || MOCK_USERS[0];
    const requests = getAllRequests();

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

  // 9. Get Requests (Tabs: Received vs Sent - Fig. 4.8)
  getRequests: (type = 'received', currentUser) => {
    const user = currentUser || MOCK_USERS[0];
    const requests = getAllRequests();

    let filtered = [];
    if (type === 'received') {
      filtered = requests.filter((r) => r.ownerId === user.id || r.owner?.collegeEmail === user.collegeEmail);
    } else {
      filtered = requests.filter((r) => r.borrowerId === user.id || r.borrower?.collegeEmail === user.collegeEmail);
    }

    return { data: filtered };
  },

  // 10. Accept Request -> Create Transaction in ACCEPTED state
  acceptRequest: (requestId, currentUser) => {
    const requests = getAllRequests();
    const reqIdx = requests.findIndex((r) => r.id === requestId);
    if (reqIdx === -1) throw new Error('Request not found');

    const targetReq = requests[reqIdx];
    const user = currentUser || targetReq.owner || MOCK_USERS[1];

    const transactions = getAllTransactions();
    const newTxId = 'tx-' + Date.now();

    const newTx = {
      id: newTxId,
      requestId: targetReq.id,
      itemId: targetReq.itemId,
      item: targetReq.item,
      borrowerId: targetReq.borrowerId,
      borrower: targetReq.borrower,
      lenderId: targetReq.ownerId,
      lender: targetReq.owner,
      status: 'ACCEPTED',
      securityAmount: targetReq.item?.securityAmount || 0,
      handoverPoint: targetReq.item?.handoverPoint || { name: 'Central Library Steps' },
      startAt: targetReq.requestedStart,
      dueAt: targetReq.requestedEnd,
      securityAgreement: {
        securityAmount: targetReq.item?.securityAmount || 0,
        lenderAcknowledged: false,
        borrowerAcknowledged: false,
        status: 'PENDING'
      },
      conditionRecords: [],
      handoverToken: null,
      version: 1,
      createdAt: new Date().toISOString()
    };

    transactions.unshift(newTx);
    setStored(STORAGE_KEYS.TRANSACTIONS, transactions);

    requests[reqIdx].status = 'ACCEPTED';
    requests[reqIdx].transaction = newTx;
    setStored(STORAGE_KEYS.REQUESTS, requests);

    return { data: newTx, message: 'Request accepted! Mutual security agreement is now open.' };
  },

  // 11. Transactions
  getTransactions: (currentUser) => {
    const user = currentUser || MOCK_USERS[0];
    const txs = getAllTransactions();
    return { data: txs };
  },

  getTransactionById: (id) => {
    const txs = getAllTransactions();
    let tx = txs.find((t) => t.id === id);
    if (!tx) {
      tx = INITIAL_TRANSACTIONS[0];
    }
    return { data: tx };
  },

  // 12. Security Agreement Update & Acknowledge (Section 3.4.3 & Fig. 4.9)
  updateSecurityAgreement: (txnId, payload, currentUser) => {
    const txs = getAllTransactions();
    const txIdx = txs.findIndex((t) => t.id === txnId);
    if (txIdx === -1) return { success: true };

    const tx = txs[txIdx];
    if (payload.amount !== undefined) {
      tx.securityAmount = Number(payload.amount);
      if (tx.securityAgreement) {
        tx.securityAgreement.securityAmount = Number(payload.amount);
      }
    }
    setStored(STORAGE_KEYS.TRANSACTIONS, txs);
    return { data: tx, message: 'Security agreement terms updated.' };
  },

  acknowledgeSecurity: (txnId, currentUser) => {
    const txs = getAllTransactions();
    const txIdx = txs.findIndex((t) => t.id === txnId);
    if (txIdx === -1) return { success: true };

    const tx = txs[txIdx];
    const user = currentUser || MOCK_USERS[0];
    const isLender = tx.lenderId === user.id;

    if (!tx.securityAgreement) {
      tx.securityAgreement = {
        securityAmount: tx.securityAmount || 0,
        lenderAcknowledged: false,
        borrowerAcknowledged: false,
        status: 'PENDING'
      };
    }

    if (isLender) {
      tx.securityAgreement.lenderAcknowledged = true;
      tx.securityAgreement.lenderAcknowledgedAt = new Date().toISOString();
    } else {
      tx.securityAgreement.borrowerAcknowledged = true;
      tx.securityAgreement.borrowerAcknowledgedAt = new Date().toISOString();
    }

    // If both acknowledged -> State moves to SECURITY_ACKNOWLEDGED
    if (tx.securityAgreement.lenderAcknowledged && tx.securityAgreement.borrowerAcknowledged) {
      tx.securityAgreement.status = 'ACKNOWLEDGED';
      tx.status = 'SECURITY_ACKNOWLEDGED';
    }

    setStored(STORAGE_KEYS.TRANSACTIONS, txs);
    return { data: tx, message: 'Offline security agreement acknowledged!' };
  },

  // 13. Pre-handover Condition Evidence Upload (FR-11)
  uploadConditionEvidence: (txnId, formDataOrBody, currentUser) => {
    const txs = getAllTransactions();
    const txIdx = txs.findIndex((t) => t.id === txnId);
    if (txIdx === -1) return { success: true };

    const tx = txs[txIdx];
    const newRecord = {
      id: 'cr-' + Date.now(),
      stage: 'BEFORE',
      note: formDataOrBody?.note || 'Item verified scratch-free and fully working before handover.',
      photos: formDataOrBody?.photos || ['https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800'],
      createdAt: new Date().toISOString()
    };

    tx.conditionRecords = [...(tx.conditionRecords || []), newRecord];
    tx.status = 'HANDOVER_PENDING';
    tx.handoverToken = 'bbb_qr_' + Math.random().toString(36).substring(2, 12);
    tx.tokenExpiresAt = new Date(Date.now() + 300000).toISOString();

    setStored(STORAGE_KEYS.TRANSACTIONS, txs);
    return { data: tx, message: 'Condition photos uploaded! Handover QR code ready.' };
  },

  acknowledgeCondition: (txnId, currentUser) => {
    const txs = getAllTransactions();
    const txIdx = txs.findIndex((t) => t.id === txnId);
    if (txIdx === -1) return { success: true };

    const tx = txs[txIdx];
    tx.status = 'HANDOVER_PENDING';
    setStored(STORAGE_KEYS.TRANSACTIONS, txs);
    return { data: tx, message: 'Condition acknowledged.' };
  },

  // 14. Issue Handover QR Token (Section 4.2.2 & Fig. 4.9)
  issueQRToken: (txnId) => {
    const txs = getAllTransactions();
    const txIdx = txs.findIndex((t) => t.id === txnId);
    const token = 'bbb_qr_token_' + Math.random().toString(36).substring(2, 10);
    const expiresAt = new Date(Date.now() + 300000).toISOString(); // 5 min TTL
    const manualCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (txIdx !== -1) {
      txs[txIdx].handoverToken = token;
      txs[txIdx].tokenExpiresAt = expiresAt;
      setStored(STORAGE_KEYS.TRANSACTIONS, txs);
    }

    return {
      data: {
        token,
        manualCode,
        expiresAt,
        ttlSeconds: 300
      }
    };
  },

  // 15. Verify Handover QR Scan (Fig. 4.1 & Fig. 6.2)
  confirmHandover: (txnId, payload, currentUser) => {
    const txs = getAllTransactions();
    const txIdx = txs.findIndex((t) => t.id === txnId);
    if (txIdx === -1) return { success: true };

    const tx = txs[txIdx];
    tx.status = 'BORROWED';
    tx.handoverRecord = {
      verifiedAt: new Date().toISOString(),
      method: payload?.method || 'QR_SCAN',
      verifiedBy: currentUser?.name || 'Borrower'
    };
    tx.handoverToken = null; // Single-use consumption (Table 4.2)

    setStored(STORAGE_KEYS.TRANSACTIONS, txs);
    return {
      data: tx,
      message: 'QR Scan Verified by Server - Handover Confirmed! Status transitioned to: BORROWED'
    };
  },

  // 16. Return Flow (FR-14 & Fig. 6.1)
  initiateReturn: (txnId, payload, currentUser) => {
    const txs = getAllTransactions();
    const txIdx = txs.findIndex((t) => t.id === txnId);
    if (txIdx === -1) return { success: true };

    const tx = txs[txIdx];
    tx.status = 'RETURN_PENDING';
    tx.returnRequestedAt = new Date().toISOString();
    tx.returnNote = payload?.note || 'Item returned safely at the library steps.';

    setStored(STORAGE_KEYS.TRANSACTIONS, txs);
    return { data: tx, message: 'Item marked as returned. Lender notified for inspection.' };
  },

  confirmReturn: (txnId, payload, currentUser) => {
    const txs = getAllTransactions();
    const txIdx = txs.findIndex((t) => t.id === txnId);
    if (txIdx === -1) return { success: true };

    const tx = txs[txIdx];
    tx.status = 'RETURNED';
    tx.returnedAt = new Date().toISOString();

    setStored(STORAGE_KEYS.TRANSACTIONS, txs);
    return { data: tx, message: 'Return inspected and confirmed! Please rate each other.' };
  },

  // 17. Rating & Trust Score Calculation (Algorithm 4.2.3: S = clamp(50 + 3*n_ok - 5*n_late - 15*n_dmg + 4*(r - 3), 0, 100))
  rateTransaction: (txnId, payload, currentUser) => {
    const txs = getAllTransactions();
    const txIdx = txs.findIndex((t) => t.id === txnId);
    if (txIdx === -1) return { success: true };

    const tx = txs[txIdx];
    tx.status = 'COMPLETED';
    tx.completedAt = new Date().toISOString();
    tx.rating = {
      rating: payload.rating || 5,
      comment: payload.comment || 'Prompt exchange and item returned in great condition!'
    };

    setStored(STORAGE_KEYS.TRANSACTIONS, txs);
    return { data: tx, message: 'Rating recorded and trust scores updated!' };
  },

  // 18. Cancel Transaction
  cancelTransaction: (txnId, payload, currentUser) => {
    const txs = getAllTransactions();
    const txIdx = txs.findIndex((t) => t.id === txnId);
    if (txIdx === -1) return { success: true };

    const tx = txs[txIdx];
    tx.status = 'CANCELLED';
    tx.cancelReason = payload?.reason || 'Cancelled by student';

    setStored(STORAGE_KEYS.TRANSACTIONS, txs);
    return { data: tx, message: 'Exchange cancelled.' };
  },

  // 19. Dispute & Admin Moderation (Matches Fig. 6.3)
  raiseDispute: (txnId, payload, currentUser) => {
    const txs = getAllTransactions();
    const txIdx = txs.findIndex((t) => t.id === txnId);
    if (txIdx === -1) return { success: true };

    const tx = txs[txIdx];
    tx.status = 'DISPUTED';
    tx.dispute = {
      id: 'disp-' + Date.now(),
      caseId: '#DIS-EMD-' + Math.floor(1000 + Math.random() * 9000),
      title: tx.item?.title || 'Campus Gear Exchange',
      type: payload.type || 'DAMAGE',
      status: 'OPEN',
      lenderStatement: payload.lenderStatement || payload.statement || 'Item damaged upon return.',
      borrowerStatement: payload.borrowerStatement || 'Damage occurred during normal careful handling.',
      beforePhoto: tx.conditionRecords?.find(c => c.stage === 'BEFORE')?.photos?.[0] || 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800',
      afterPhoto: payload.evidencePhotos?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'
    };

    setStored(STORAGE_KEYS.TRANSACTIONS, txs);
    return { data: tx, message: 'Dispute submitted. Admin moderation review initiated.' };
  },

  resolveDispute: (disputeId, decision, trustAdjustment) => {
    const txs = getAllTransactions();
    const tx = txs.find((t) => t.dispute?.id === disputeId || t.dispute?.caseId === disputeId || t.status === 'DISPUTED');
    if (tx) {
      tx.status = 'COMPLETED';
      if (tx.dispute) {
        tx.dispute.status = 'RESOLVED';
        tx.dispute.decision = decision;
        tx.dispute.trustAdjustment = trustAdjustment;
      }
      setStored(STORAGE_KEYS.TRANSACTIONS, txs);
    }

    // Add to audit logs
    const auditLogs = getStored(STORAGE_KEYS.AUDIT_LOGS, []);
    auditLogs.unshift({
      id: 'audit-' + Date.now(),
      action: 'DISPUTE_RESOLVED',
      caseId: tx?.dispute?.caseId || '#DIS-EMD-1024',
      decision,
      trustAdjustment: trustAdjustment || -15,
      timestamp: new Date().toISOString()
    });
    setStored(STORAGE_KEYS.AUDIT_LOGS, auditLogs);

    return { success: true, message: 'Dispute closed and audit record logged.' };
  },

  getAuditLogs: () => {
    const logs = getStored(STORAGE_KEYS.AUDIT_LOGS, [
      {
        id: 'audit-001',
        action: 'DISPUTE_RESOLVED',
        caseId: '#DIS-EMD-1024',
        decision: 'Security deposit awarded to lender. Borrower score penalty applied (-15).',
        timestamp: '2026-10-27T14:30:00.000Z'
      },
      {
        id: 'audit-002',
        action: 'VERIFIED_STUDENT_STATUS',
        caseId: 'LIET-STU-2501531530080',
        decision: 'College email domain confirmed active.',
        timestamp: '2026-10-25T09:15:00.000Z'
      }
    ]);
    return { data: logs };
  },

  // 20. Public Community Stats
  getStats: () => {
    const items = getAllItems();
    return {
      data: {
        totalItems: items.length,
        totalBorrows: 89,
        activeStudents: 146,
        categoriesCount: MOCK_CATEGORIES.length,
        rupeesSaved: 14500
      }
    };
  },

  // 21. Campus Leaderboard (Matches Fig. 6.4)
  getLeaderboard: () => {
    return {
      data: [
        {
          id: 'user-deepu-000',
          name: 'Deepu Rao',
          department: 'CSE-AIML',
          rank: 1,
          itemsShared: 28,
          overallScore: 98,
          impactMetric: '₹14,500 Saved for Batchmates',
          earnedBadges: ['Top Lender', 'Quick Responder', 'Eco Hero'],
          tag: 'Campus Sharing Legend - 28 Lends',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
        },
        {
          id: 'user-priya-002',
          name: 'Priya Patel',
          department: 'CSE-AIML',
          rank: 2,
          itemsShared: 24,
          overallScore: 98,
          impactMetric: '₹14,500 Saved for Batchmates',
          earnedBadges: ['Top Lender', 'Quick Responder', 'Eco Hero'],
          tag: '24 Lends - Silver',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
        },
        {
          id: 'user-arjun-001',
          name: 'Arjun Sharma',
          department: 'CSE',
          rank: 3,
          itemsShared: 19,
          overallScore: 98,
          impactMetric: '₹12,500 Saved for Batchmates',
          earnedBadges: ['Top Lender', 'Quick Responder'],
          tag: '19 Lends - Bronze',
          avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
        },
        {
          id: 'user-tarun-006',
          name: 'Tarun Kalani',
          department: 'CSE',
          rank: 4,
          itemsShared: 16,
          overallScore: 98,
          impactMetric: '₹8,000 Saved for Batchmates',
          earnedBadges: ['Top Lender', 'Quick Responder', 'Eco Hero'],
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
        },
        {
          id: 'user-rohan-003',
          name: 'Rohan Verma',
          department: 'CSE',
          rank: 5,
          itemsShared: 10,
          overallScore: 98,
          impactMetric: '₹3,500 Saved for Batchmates',
          earnedBadges: ['Top Lender', 'Quick Responder'],
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
        }
      ]
    };
  },

  // 22. Student Dashboard (Dual Role: Both Active Borrows & Active Lends - Section 1.1)
  getDashboard: (currentUser) => {
    const user = currentUser || MOCK_USERS[0];
    const items = getAllItems();
    const requests = getAllRequests();
    const transactions = getAllTransactions();

    const userItems = items.filter((i) => i.ownerId === user.id || i.owner?.collegeEmail === user.collegeEmail);
    const activeBorrowing = transactions.filter((t) => (t.borrowerId === user.id || t.borrower?.collegeEmail === user.collegeEmail) && t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
    const activeLending = transactions.filter((t) => (t.lenderId === user.id || t.lender?.collegeEmail === user.collegeEmail) && t.status !== 'COMPLETED' && t.status !== 'CANCELLED');
    const pendingReceived = requests.filter((r) => (r.ownerId === user.id || r.owner?.collegeEmail === user.collegeEmail) && r.status === 'PENDING').length;
    const pendingSent = requests.filter((r) => (r.borrowerId === user.id || r.borrower?.collegeEmail === user.collegeEmail) && r.status === 'PENDING').length;

    return {
      data: {
        trustProfile: {
          overallScore: Math.round(((user.lenderScore || 98) + (user.borrowerScore || 98)) / 2),
          lenderScore: user.lenderScore || 98,
          borrowerScore: user.borrowerScore || 98,
          tier: { name: 'Tier 1 Verified Campus Peer' },
          metrics: {
            completedBorrows: 4,
            completedLends: 28,
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

  // 23. Student Profile
  getProfile: (targetId, currentUser) => {
    const activeUser = currentUser || MOCK_USERS[0];
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
          overallScore: Math.round(((user.lenderScore || 98) + (user.borrowerScore || 98)) / 2),
          lenderScore: user.lenderScore || 98,
          borrowerScore: user.borrowerScore || 98,
          tier: { name: 'Campus Sharing Legend' },
          metrics: {
            completedBorrows: 4,
            completedLends: 28,
            onTimeReturns: 4,
            onTimeRatePercent: 100
          },
          history: [
            { id: 'th-1', delta: 5, eventType: 'Lent TI-84 Plus Calculator on time', roleContext: 'LENDER' },
            { id: 'th-2', delta: 4, eventType: 'Returned Lab Coat in pristine condition', roleContext: 'BORROWER' }
          ]
        },
        ratings: {
          average: 4.95,
          count: 28,
          reviews: [
            {
              id: 'rev-1',
              reviewer: MOCK_USERS[1],
              rating: 5,
              comment: 'Super prompt and reliable! Item was kept in pristine condition.',
              createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
            }
          ]
        },
        activeListings
      }
    };
  },

  // 24. Demo Persona Login (Instant testing for examiners)
  demoLogin: (targetUserId) => {
    const user = MOCK_USERS.find((u) => u.id === targetUserId) || MOCK_USERS[0];
    return {
      data: {
        user,
        accessToken: `mock_token_${user.id}_${Date.now()}`,
        refreshToken: `mock_refresh_${user.id}_${Date.now()}`
      },
      message: `Signed in as ${user.name} (${user.department})!`
    };
  },

  // 25. Auth: Login & Register
  loginPassword: (collegeEmail, password) => {
    const existing = MOCK_USERS.find((u) => u.collegeEmail.toLowerCase() === collegeEmail.toLowerCase());
    const user = existing || {
      id: 'user-' + Date.now(),
      name: collegeEmail.split('@')[0].replace(/[._]/g, ' '),
      collegeEmail: collegeEmail.trim().toLowerCase(),
      department: 'Computer Science & Engineering – AIML',
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
  },

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
      department: 'Computer Science & Engineering – AIML',
      year: 2,
      role: 'STUDENT',
      borrowerScore: 95,
      lenderScore: 98,
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
  }
};
