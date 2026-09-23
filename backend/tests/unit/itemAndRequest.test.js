import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

describe('Items & Borrow Requests Flow', () => {
  const app = createApp();

  let lenderCookies = [];
  let borrowerCookies = [];
  let lenderId = '';
  let borrowerId = '';
  let testItemId = '';
  let testRequestId = '';
  let categoryId = '';
  let handoverPointId = '';

  beforeAll(async () => {
    // Fetch seeded category and handover point
    const category = await prisma.category.findFirst();
    const point = await prisma.campusPoint.findFirst();
    categoryId = category.id;
    handoverPointId = point.id;

    // Register & verify lender (Rahul)
    const lenderEmail = `rahul.${Date.now()}@iet.edu`;
    await request(app)
      .post('/api/auth/register')
      .set('X-Requested-With', 'bbb')
      .send({
        name: 'Rahul Sharma',
        collegeEmail: lenderEmail,
        password: 'Password123!',
        department: 'Electronics',
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

    // Register & verify borrower (Aman)
    const borrowerEmail = `aman.${Date.now()}@iet.edu`;
    await request(app)
      .post('/api/auth/register')
      .set('X-Requested-With', 'bbb')
      .send({
        name: 'Aman Verma',
        collegeEmail: borrowerEmail,
        password: 'Password123!',
        department: 'Computer Science',
        year: 3
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
  });

  it('should allow lender to post an item', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Cookie', lenderCookies)
      .set('X-Requested-With', 'bbb')
      .send({
        title: 'Texas Instruments TI-84 Plus',
        description: 'Scientific graphing calculator for engineering maths and physics lab.',
        categoryId,
        condition: 'GOOD',
        securityAmount: 500,
        handoverPointId
      });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.securityAmount).toBe(500);
    testItemId = res.body.data.id;
  });

  it('should prevent lender from requesting to borrow their own item', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);

    const res = await request(app)
      .post(`/api/requests/items/${testItemId}`)
      .set('Cookie', lenderCookies)
      .set('X-Requested-With', 'bbb')
      .send({
        requestedStart: tomorrow.toISOString(),
        requestedEnd: dayAfter.toISOString(),
        message: 'Trying to borrow my own item'
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('You cannot borrow your own item');
  });

  it('should allow verified borrower to submit a borrow request', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);

    const res = await request(app)
      .post(`/api/requests/items/${testItemId}`)
      .set('Cookie', borrowerCookies)
      .set('X-Requested-With', 'bbb')
      .send({
        requestedStart: tomorrow.toISOString(),
        requestedEnd: dayAfter.toISOString(),
        message: 'Need this for 2 days for the upcoming engineering maths lab exam.'
      });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.status).toBe('PENDING');
    testRequestId = res.body.data.id;
  });

  it('should list requests for borrower and lender', async () => {
    const resSent = await request(app)
      .get('/api/requests?type=sent')
      .set('Cookie', borrowerCookies);

    expect(resSent.status).toBe(200);
    expect(resSent.body.data.length).toBeGreaterThanOrEqual(1);

    const resReceived = await request(app)
      .get('/api/requests?type=received')
      .set('Cookie', lenderCookies);

    expect(resReceived.status).toBe(200);
    expect(resReceived.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should allow lender to accept the borrow request and instantiate a Transaction', async () => {
    const res = await request(app)
      .patch(`/api/requests/${testRequestId}/accept`)
      .set('Cookie', lenderCookies)
      .set('X-Requested-With', 'bbb');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACCEPTED');
    expect(res.body.data.lenderId).toBe(lenderId);
    expect(res.body.data.borrowerId).toBe(borrowerId);

    // Verify Security Agreement created
    const secAgreement = await prisma.securityAgreement.findUnique({
      where: { transactionId: res.body.data.id }
    });
    expect(secAgreement).toBeDefined();
    expect(secAgreement.securityAmount).toBe(500);
    expect(secAgreement.status).toBe('PENDING');
  });
});
