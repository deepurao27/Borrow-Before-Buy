import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

describe('Milestone 2: Transaction Engine, Security Agreement & QR Handover', () => {
  const app = createApp();

  let lenderCookies = [];
  let borrowerCookies = [];
  let strangerCookies = [];
  let lenderId = '';
  let borrowerId = '';
  let transactionId = '';
  let handoverToken = '';
  let manualCode = '';

  beforeAll(async () => {
    // 1. Fetch category and campus handover point
    const category = await prisma.category.findFirst();
    const point = await prisma.campusPoint.findFirst();

    // 2. Register & login Lender
    const lenderEmail = `lender.m2.${Date.now()}@iet.edu`;
    await request(app)
      .post('/api/auth/register')
      .set('X-Requested-With', 'bbb')
      .send({
        name: 'Priya Sharma',
        collegeEmail: lenderEmail,
        password: 'Password123!',
        department: 'Electrical Engineering',
        year: 4
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
    const borrowerEmail = `borrower.m2.${Date.now()}@iet.edu`;
    await request(app)
      .post('/api/auth/register')
      .set('X-Requested-With', 'bbb')
      .send({
        name: 'Rohan Gupta',
        collegeEmail: borrowerEmail,
        password: 'Password123!',
        department: 'Mechanical Engineering',
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

    // 4. Register & login a third student (Stranger)
    const strangerEmail = `stranger.m2.${Date.now()}@iet.edu`;
    await request(app)
      .post('/api/auth/register')
      .set('X-Requested-With', 'bbb')
      .send({
        name: 'Third Student',
        collegeEmail: strangerEmail,
        password: 'Password123!',
        department: 'Civil Engineering',
        year: 1
      });
    await prisma.user.update({
      where: { collegeEmail: strangerEmail },
      data: { verifiedAt: new Date() }
    });
    const strangerLogin = await request(app)
      .post('/api/auth/login')
      .set('X-Requested-With', 'bbb')
      .send({ collegeEmail: strangerEmail, password: 'Password123!' });
    strangerCookies = strangerLogin.headers['set-cookie'];

    // 5. Lender posts an item
    const itemRes = await request(app)
      .post('/api/items')
      .set('Cookie', lenderCookies)
      .set('X-Requested-With', 'bbb')
      .send({
        title: 'Sony WH-1000XM4 Noise Canceling Headphones',
        description: 'Great for focused study sessions in the campus central library.',
        categoryId: category.id,
        condition: 'LIKE_NEW',
        securityAmount: 800,
        handoverPointId: point.id
      });
    const itemId = itemRes.body.data.id;

    // 6. Borrower requests item
    const start = new Date(Date.now() + 86400000);
    const end = new Date(Date.now() + 3 * 86400000);
    const reqRes = await request(app)
      .post(`/api/requests/items/${itemId}`)
      .set('Cookie', borrowerCookies)
      .set('X-Requested-With', 'bbb')
      .send({
        requestedStart: start.toISOString(),
        requestedEnd: end.toISOString(),
        message: 'Need these for studying during semester exams week.'
      });
    const requestId = reqRes.body.data.id;

    // 7. Lender accepts request -> creates Transaction
    const acceptRes = await request(app)
      .patch(`/api/requests/${requestId}/accept`)
      .set('Cookie', lenderCookies)
      .set('X-Requested-With', 'bbb');

    transactionId = acceptRes.body.data.id;
  });

  it('should fetch transaction details and enforce privacy', async () => {
    // Participant (Borrower) can view
    const res = await request(app)
      .get(`/api/transactions/${transactionId}`)
      .set('Cookie', borrowerCookies);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(transactionId);
    expect(res.body.data.status).toBe('ACCEPTED');
    expect(res.body.data.securityAgreement).toBeDefined();

    // Stranger cannot view
    const forbiddenRes = await request(app)
      .get(`/api/transactions/${transactionId}`)
      .set('Cookie', strangerCookies);

    expect(forbiddenRes.status).toBe(403);
  });

  it('should allow lender to modify security deposit amount before acknowledgement', async () => {
    const res = await request(app)
      .patch(`/api/transactions/${transactionId}/security`)
      .set('Cookie', lenderCookies)
      .set('X-Requested-With', 'bbb')
      .send({
        securityAmount: 750,
        offlineTipNote: 'Please keep Rs 750 exact cash or direct peer transfer at library steps.'
      });

    expect(res.status).toBe(200);
    expect(res.body.data.securityAgreement.securityAmount).toBe(750);
  });

  it('should execute bilateral offline security agreement acknowledgement and transition to SECURITY_ACKNOWLEDGED', async () => {
    // Borrower acknowledges first
    const borrowerAck = await request(app)
      .post(`/api/transactions/${transactionId}/security/acknowledge`)
      .set('Cookie', borrowerCookies)
      .set('X-Requested-With', 'bbb');

    expect(borrowerAck.status).toBe(200);
    expect(borrowerAck.body.data.status).toBe('ACCEPTED'); // Needs both!
    expect(borrowerAck.body.data.securityAgreement.borrowerAcknowledged).toBe(true);
    expect(borrowerAck.body.data.securityAgreement.lenderAcknowledged).toBe(false);

    // Lender acknowledges second -> triggers transition
    const lenderAck = await request(app)
      .post(`/api/transactions/${transactionId}/security/acknowledge`)
      .set('Cookie', lenderCookies)
      .set('X-Requested-With', 'bbb');

    expect(lenderAck.status).toBe(200);
    expect(lenderAck.body.data.status).toBe('SECURITY_ACKNOWLEDGED');
    expect(lenderAck.body.data.securityAgreement.status).toBe('ACKNOWLEDGED');
  });

  it('should handle condition checklist and photo evidence upload', async () => {
    // 1x1 1-pixel valid PNG buffer for test
    const dummyPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    // Lender uploads checklist + photo
    const uploadRes = await request(app)
      .post(`/api/transactions/${transactionId}/condition`)
      .set('Cookie', lenderCookies)
      .set('X-Requested-With', 'bbb')
      .field('stage', 'BEFORE')
      .field('notes', 'Ear cushions sanitized, zero scratches, carrying case and cable included.')
      .field('checklist', JSON.stringify({
        workingCondition: true,
        scratchesChecked: true,
        accessoriesComplete: true
      }))
      .attach('photos', dummyPngBuffer, 'condition1.png');

    expect(uploadRes.status).toBe(200);
    expect(uploadRes.body.data.record).toBeDefined();
    expect(uploadRes.body.data.record.photoKeys.length).toBe(1);

    // Borrower acknowledges condition inspection -> transitions to HANDOVER_PENDING
    const ackRes = await request(app)
      .post(`/api/transactions/${transactionId}/condition/acknowledge`)
      .set('Cookie', borrowerCookies)
      .set('X-Requested-With', 'bbb');

    expect(ackRes.status).toBe(200);
    expect(ackRes.body.data.status).toBe('HANDOVER_PENDING');
  });

  it('should generate dynamic single-use 5-minute QR handover token', async () => {
    // Only lender can generate
    const borrowerAttempt = await request(app)
      .post(`/api/transactions/${transactionId}/handover/token`)
      .set('Cookie', borrowerCookies)
      .set('X-Requested-With', 'bbb');

    expect(borrowerAttempt.status).toBe(403);

    // Lender generates
    const res = await request(app)
      .post(`/api/transactions/${transactionId}/handover/token`)
      .set('Cookie', lenderCookies)
      .set('X-Requested-With', 'bbb');

    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.manualCode).toBeDefined();
    expect(res.body.data.expiresInSeconds).toBe(300);

    handoverToken = res.body.data.token;
    manualCode = res.body.data.manualCode;
  });

  it('should confirm physical handover via QR scan and reject replay attack', async () => {
    // Stranger scanning must fail
    const strangerScan = await request(app)
      .post(`/api/transactions/${transactionId}/handover/confirm`)
      .set('Cookie', strangerCookies)
      .set('X-Requested-With', 'bbb')
      .send({ token: handoverToken });

    expect(strangerScan.status).toBe(403);

    // Borrower scans QR code -> transitions to BORROWED
    const confirmRes = await request(app)
      .post(`/api/transactions/${transactionId}/handover/confirm`)
      .set('Cookie', borrowerCookies)
      .set('X-Requested-With', 'bbb')
      .send({ token: handoverToken });

    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.data.status).toBe('BORROWED');
    expect(confirmRes.body.data.handoverRecords.length).toBeGreaterThanOrEqual(1);

    // Replay attack: Borrower scans same token again -> must be rejected
    const replayRes = await request(app)
      .post(`/api/transactions/${transactionId}/handover/confirm`)
      .set('Cookie', borrowerCookies)
      .set('X-Requested-With', 'bbb')
      .send({ token: handoverToken });

    expect(replayRes.status).toBe(400);
    expect(replayRes.body.error.message).toContain('already been used');
  });
});
