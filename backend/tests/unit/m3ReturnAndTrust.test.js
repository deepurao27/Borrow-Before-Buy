import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';
import { checkOverdueTransactions } from '../../src/services/cronService.js';

describe('Milestone 3: Return Lifecycle, Mutual Ratings, Trust Engine & Dashboard', () => {
  const app = createApp();

  let lenderCookies = [];
  let borrowerCookies = [];
  let lenderId = '';
  let borrowerId = '';
  let transactionId = '';

  beforeAll(async () => {
    // 1. Fetch category and campus handover point
    const category = await prisma.category.findFirst();
    const point = await prisma.campusPoint.findFirst();

    // 2. Register & login Lender
    const lenderEmail = `lender.m3.${Date.now()}@iet.edu`;
    await request(app)
      .post('/api/auth/register')
      .set('X-Requested-With', 'bbb')
      .send({
        name: 'Ananya Roy',
        collegeEmail: lenderEmail,
        password: 'Password123!',
        department: 'Biotechnology',
        year: 3
      });
    const lenderUser = await prisma.user.update({
      where: { collegeEmail: lenderEmail },
      data: { verifiedAt: new Date() }
    });
    lenderId = lenderUser.id;

    const lenderLogin = await request(app)
      .post('/api/auth/login')
      .set('X-Requested-With', 'bbb')
      .send({ collegeEmail: lenderEmail, password: 'Password123!' });
    lenderCookies = lenderLogin.headers['set-cookie'];

    // 3. Register & login Borrower
    const borrowerEmail = `borrower.m3.${Date.now()}@iet.edu`;
    await request(app)
      .post('/api/auth/register')
      .set('X-Requested-With', 'bbb')
      .send({
        name: 'Devansh Joshi',
        collegeEmail: borrowerEmail,
        password: 'Password123!',
        department: 'Information Technology',
        year: 2
      });
    const borrowerUser = await prisma.user.update({
      where: { collegeEmail: borrowerEmail },
      data: { verifiedAt: new Date() }
    });
    borrowerId = borrowerUser.id;

    const borrowerLogin = await request(app)
      .post('/api/auth/login')
      .set('X-Requested-With', 'bbb')
      .send({ collegeEmail: borrowerEmail, password: 'Password123!' });
    borrowerCookies = borrowerLogin.headers['set-cookie'];

    // 4. Post an item
    const itemRes = await request(app)
      .post('/api/items')
      .set('Cookie', lenderCookies)
      .set('X-Requested-With', 'bbb')
      .send({
        title: 'Raspberry Pi 4 Model B (8GB RAM)',
        description: 'Complete with heatsinks, fan case, and official power supply.',
        categoryId: category.id,
        condition: 'LIKE_NEW',
        securityAmount: 600,
        handoverPointId: point.id
      });
    const itemId = itemRes.body.data.id;

    // 5. Request item
    const start = new Date(Date.now() + 86400000);
    const end = new Date(Date.now() + 2 * 86400000);
    const reqRes = await request(app)
      .post(`/api/requests/items/${itemId}`)
      .set('Cookie', borrowerCookies)
      .set('X-Requested-With', 'bbb')
      .send({
        requestedStart: start.toISOString(),
        requestedEnd: end.toISOString(),
        message: 'Need this for my IoT end-semester project demo.'
      });
    const requestId = reqRes.body.data.id;

    // 6. Lender accepts -> Transaction in ACCEPTED state
    const acceptRes = await request(app)
      .patch(`/api/requests/${requestId}/accept`)
      .set('Cookie', lenderCookies)
      .set('X-Requested-With', 'bbb');
    transactionId = acceptRes.body.data.id;

    // 7. Advance through M2 stages to BORROWED
    // Acknowledge security
    await request(app)
      .post(`/api/transactions/${transactionId}/security/acknowledge`)
      .set('Cookie', borrowerCookies)
      .set('X-Requested-With', 'bbb');
    await request(app)
      .post(`/api/transactions/${transactionId}/security/acknowledge`)
      .set('Cookie', lenderCookies)
      .set('X-Requested-With', 'bbb');

    // Condition upload
    const dummyPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    await request(app)
      .post(`/api/transactions/${transactionId}/condition`)
      .set('Cookie', lenderCookies)
      .set('X-Requested-With', 'bbb')
      .field('stage', 'BEFORE')
      .field('notes', 'Tested and running Raspberry Pi OS smoothly.')
      .field('checklist', JSON.stringify({ workingState: true, scratchesChecked: true, accessoriesComplete: true }))
      .attach('photos', dummyPngBuffer, 'rpi.png');

    await request(app)
      .post(`/api/transactions/${transactionId}/condition/acknowledge`)
      .set('Cookie', borrowerCookies)
      .set('X-Requested-With', 'bbb');

    // QR handover
    const tokenRes = await request(app)
      .post(`/api/transactions/${transactionId}/handover/token`)
      .set('Cookie', lenderCookies)
      .set('X-Requested-With', 'bbb');

    await request(app)
      .post(`/api/transactions/${transactionId}/handover/confirm`)
      .set('Cookie', borrowerCookies)
      .set('X-Requested-With', 'bbb')
      .send({ token: tokenRes.body.data.token });
  });

  it('should allow borrower to initiate return and move to RETURN_PENDING', async () => {
    const res = await request(app)
      .post(`/api/transactions/${transactionId}/return/initiate`)
      .set('Cookie', borrowerCookies)
      .set('X-Requested-With', 'bbb')
      .send({ note: 'Ready to meet at the Library Steps.' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('RETURN_PENDING');
  });

  it('should allow lender to confirm return receipt, transition to COMPLETED, and award trust points', async () => {
    const res = await request(app)
      .post(`/api/transactions/${transactionId}/return/confirm`)
      .set('Cookie', lenderCookies)
      .set('X-Requested-With', 'bbb');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
    expect(res.body.data.completedAt).toBeDefined();
    expect(res.body.data.securityAgreement.status).toBe('CLOSED');

    // Verify Trust Events awarded
    const borrowerTrustEvents = await prisma.trustEvent.findMany({
      where: { userId: borrowerId, transactionId }
    });
    const borrowerDeltas = borrowerTrustEvents.map((e) => e.delta);
    expect(borrowerDeltas).toContain(8); // BORROW_COMPLETE
    expect(borrowerDeltas).toContain(5); // ON_TIME_RETURN

    const lenderTrustEvents = await prisma.trustEvent.findMany({
      where: { userId: lenderId, transactionId }
    });
    const lenderDeltas = lenderTrustEvents.map((e) => e.delta);
    expect(lenderDeltas).toContain(10); // LEND_COMPLETE
    expect(lenderDeltas).toContain(5);  // ON_TIME_RETURN
  });

  it('should allow mutual ratings and award HIGH_RATING trust bonus', async () => {
    // 1. Borrower rates Lender 5 stars
    const borrowerRateRes = await request(app)
      .post(`/api/transactions/${transactionId}/rate`)
      .set('Cookie', borrowerCookies)
      .set('X-Requested-With', 'bbb')
      .send({
        rating: 5,
        comment: 'Super polite lender! The Raspberry Pi was in pristine shape with all accessories.'
      });

    expect(borrowerRateRes.status).toBe(201);
    expect(borrowerRateRes.body.data.rating).toBe(5);

    // Verify Lender received HIGH_RATING (+3)
    const lenderHighRatingEvent = await prisma.trustEvent.findFirst({
      where: { userId: lenderId, eventType: 'HIGH_RATING', transactionId }
    });
    expect(lenderHighRatingEvent).toBeDefined();
    expect(lenderHighRatingEvent.delta).toBe(3);

    // 2. Prevent duplicate rating from same reviewer
    const duplicateRes = await request(app)
      .post(`/api/transactions/${transactionId}/rate`)
      .set('Cookie', borrowerCookies)
      .set('X-Requested-With', 'bbb')
      .send({ rating: 4 });

    expect(duplicateRes.status).toBe(400);
    expect(duplicateRes.body.error.message).toContain('already submitted a rating');

    // 3. Lender rates Borrower 5 stars
    const lenderRateRes = await request(app)
      .post(`/api/transactions/${transactionId}/rate`)
      .set('Cookie', lenderCookies)
      .set('X-Requested-With', 'bbb')
      .send({
        rating: 5,
        comment: 'Handled the device with immense care and returned it exactly on time.'
      });

    expect(lenderRateRes.status).toBe(201);
  });

  it('should return complete user profile with reputation and rating breakdown', async () => {
    const res = await request(app)
      .get(`/api/users/${lenderId}/profile`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.name).toBe('Ananya Roy');
    expect(res.body.data.trustProfile.lenderScore).toBeGreaterThanOrEqual(68); // 50 + 10 + 5 + 3 = 68
    expect(res.body.data.ratings.totalReviews).toBe(1);
    expect(res.body.data.ratings.averageRating).toBe(5);
  });

  it('should return authenticated dashboard summary with active items and trust scores', async () => {
    const res = await request(app)
      .get('/api/users/me/dashboard')
      .set('Cookie', borrowerCookies);

    expect(res.status).toBe(200);
    expect(res.body.data.trustProfile).toBeDefined();
    expect(res.body.data.trustProfile.borrowerScore).toBeGreaterThanOrEqual(66); // 50 + 8 + 5 + 3 = 66
    expect(res.body.data.counts).toBeDefined();
  });

  it('should automatically detect overdue items in background cron sweep', async () => {
    const category = await prisma.category.findFirst();
    const point = await prisma.campusPoint.findFirst();

    // Create an item and an already overdue transaction
    const pastItem = await prisma.item.create({
      data: {
        title: 'Overdue Test Textbook',
        description: 'Discrete mathematics and graph theory.',
        categoryId: category.id,
        condition: 'GOOD',
        securityAmount: 200,
        handoverPointId: point.id,
        ownerId: lenderId,
        status: 'ACTIVE'
      }
    });

    const pastDate = new Date(Date.now() - 2 * 86400000); // 2 days ago
    const overdueTx = await prisma.transaction.create({
      data: {
        itemId: pastItem.id,
        lenderId,
        borrowerId,
        status: 'BORROWED',
        startAt: new Date(Date.now() - 5 * 86400000),
        dueAt: pastDate,
        version: 1
      }
    });

    // Run sweep
    const sweepResult = await checkOverdueTransactions();
    expect(sweepResult.updated).toBeGreaterThanOrEqual(1);

    // Verify transaction status changed to OVERDUE
    const updatedTx = await prisma.transaction.findUnique({
      where: { id: overdueTx.id }
    });
    expect(updatedTx.status).toBe('OVERDUE');

    // Verify LATE_RETURN penalty (-6) was logged
    const latePenalty = await prisma.trustEvent.findFirst({
      where: { transactionId: overdueTx.id, eventType: 'LATE_RETURN' }
    });
    expect(latePenalty).toBeDefined();
    expect(latePenalty.delta).toBe(-6);
  });
});
