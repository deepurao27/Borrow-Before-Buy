import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';
import { hashPassword, hashToken } from '../../src/utils/crypto.js';
import { generateAccessToken } from '../../src/utils/tokens.js';

describe('Milestone 4: Disputes, Moderation, Chat, Rewards & Email OTP', () => {
  const app = createApp();

  let borrowerUser;
  let lenderUser;
  let moderatorUser;
  let testItem;
  let testTransaction;
  let borrowerAuthCookie;
  let lenderAuthCookie;
  let modAuthCookie;

  beforeAll(async () => {
    const passwordHash = await hashPassword('Password123!');

    // Create unique users
    const timestamp = Date.now();
    borrowerUser = await prisma.user.create({
      data: {
        name: 'Borrower Test',
        collegeEmail: `borrower.${timestamp}@iet.edu`,
        passwordHash,
        department: 'CS',
        year: 2,
        verifiedAt: new Date(),
        role: 'STUDENT'
      }
    });

    lenderUser = await prisma.user.create({
      data: {
        name: 'Lender Test',
        collegeEmail: `lender.${timestamp}@iet.edu`,
        passwordHash,
        department: 'EC',
        year: 3,
        verifiedAt: new Date(),
        role: 'STUDENT'
      }
    });

    moderatorUser = await prisma.user.create({
      data: {
        name: 'Campus Moderator',
        collegeEmail: `mod.${timestamp}@iet.edu`,
        passwordHash,
        department: 'Admin Office',
        year: 4,
        verifiedAt: new Date(),
        role: 'MODERATOR'
      }
    });

    // Generate JWT access tokens
    borrowerAuthCookie = `bbb_access_token=${generateAccessToken(borrowerUser)}`;
    lenderAuthCookie = `bbb_access_token=${generateAccessToken(lenderUser)}`;
    modAuthCookie = `bbb_access_token=${generateAccessToken(moderatorUser)}`;

    // Create item
    const category = await prisma.category.findFirst() || await prisma.category.create({
      data: { name: `Tech-${timestamp}`, slug: `tech-${timestamp}`, icon: 'laptop' }
    });
    const campusPoint = await prisma.campusPoint.findFirst() || await prisma.campusPoint.create({
      data: { name: `Hostel 1-${timestamp}`, zone: 'North' }
    });

    testItem = await prisma.item.create({
      data: {
        ownerId: lenderUser.id,
        categoryId: category.id,
        handoverPointId: campusPoint.id,
        title: 'Scientific Calculator fx-991EX',
        description: 'Perfect for engineering math exams',
        condition: 'LIKE_NEW',
        securityAmount: 0
      }
    });

    // Create borrowed transaction
    testTransaction = await prisma.transaction.create({
      data: {
        itemId: testItem.id,
        lenderId: lenderUser.id,
        borrowerId: borrowerUser.id,
        status: 'BORROWED',
        startAt: new Date(),
        dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      }
    });
  });

  describe('1. Email OTP Passwordless Login', () => {
    const testOtpEmail = `anybody.${Date.now()}@gmail.com`;

    it('should dispatch a 6-digit OTP to any valid email', async () => {
      const res = await request(app)
        .post('/api/auth/otp/send')
        .set('X-Requested-With', 'bbb')
        .send({
          email: testOtpEmail,
          name: 'Open Access Student'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(testOtpEmail);

      // Verify token created in DB
      const user = await prisma.user.findUnique({ where: { collegeEmail: testOtpEmail } });
      expect(user).toBeDefined();

      const otpToken = await prisma.emailToken.findFirst({
        where: { userId: user.id, type: 'LOGIN_OTP', usedAt: null }
      });
      expect(otpToken).toBeDefined();
    });

    it('should reject verification with incorrect OTP', async () => {
      const res = await request(app)
        .post('/api/auth/otp/verify')
        .set('X-Requested-With', 'bbb')
        .send({
          email: testOtpEmail,
          otp: '000000'
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_OR_EXPIRED_OTP');
    });

    it('should successfully verify valid OTP, auto-verify user and set session cookies', async () => {
      const user = await prisma.user.findUnique({ where: { collegeEmail: testOtpEmail } });
      
      // Clean up previous tokens for this user
      await prisma.emailToken.deleteMany({ where: { userId: user.id } });

      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const tokenHash = hashToken(otpCode);

      // Store known test OTP hash
      await prisma.emailToken.create({
        data: {
          userId: user.id,
          tokenHash,
          type: 'LOGIN_OTP',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        }
      });

      const res = await request(app)
        .post('/api/auth/otp/verify')
        .set('X-Requested-With', 'bbb')
        .send({
          email: testOtpEmail,
          otp: otpCode
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.collegeEmail).toBe(testOtpEmail);

      // Check cookies
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();

      // Check user verified
      const updatedUser = await prisma.user.findUnique({ where: { collegeEmail: testOtpEmail } });
      expect(updatedUser.verifiedAt).not.toBeNull();
    });
  });

  describe('2. Transaction In-App Chat', () => {
    it('should allow borrower to send chat message within transaction', async () => {
      const res = await request(app)
        .post(`/api/transactions/${testTransaction.id}/messages`)
        .set('X-Requested-With', 'bbb')
        .set('Cookie', borrowerAuthCookie)
        .send({
          content: 'Hey, I reached the library gate for handover!'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.message.content).toBe('Hey, I reached the library gate for handover!');
    });

    it('should allow lender to view transaction message history', async () => {
      const res = await request(app)
        .get(`/api/transactions/${testTransaction.id}/messages`)
        .set('Cookie', lenderAuthCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.messages.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.messages[0].content).toContain('Hey, I reached the library gate');
    });

    it('should reject empty message', async () => {
      const res = await request(app)
        .post(`/api/transactions/${testTransaction.id}/messages`)
        .set('X-Requested-With', 'bbb')
        .set('Cookie', lenderAuthCookie)
        .send({ content: '   ' });

      expect(res.status).toBe(422);
    });
  });

  describe('3. Disputes & Moderation', () => {
    let createdDisputeId;

    it('should allow borrower or lender to open a dispute on a borrowed item', async () => {
      const res = await request(app)
        .post('/api/disputes')
        .set('X-Requested-With', 'bbb')
        .set('Cookie', lenderAuthCookie)
        .send({
          transactionId: testTransaction.id,
          type: 'DAMAGE',
          description: 'The display screen on calculator was cracked during usage.'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.dispute.status).toBe('OPEN');
      expect(res.body.data.dispute.type).toBe('DAMAGE');
      createdDisputeId = res.body.data.dispute.id;

      // Verify transaction moved to DISPUTED status
      const tx = await prisma.transaction.findUnique({ where: { id: testTransaction.id } });
      expect(tx.status).toBe('DISPUTED');
    });

    it('should prevent opening duplicate active disputes', async () => {
      const res = await request(app)
        .post('/api/disputes')
        .set('X-Requested-With', 'bbb')
        .set('Cookie', borrowerAuthCookie)
        .send({
          transactionId: testTransaction.id,
          type: 'OTHER',
          description: 'Another duplicate dispute attempt.'
        });

      expect(res.status).toBe(400);
    });

    it('should allow campus moderator to list disputes', async () => {
      const res = await request(app)
        .get('/api/admin/disputes')
        .set('Cookie', modAuthCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.disputes.length).toBeGreaterThanOrEqual(1);
    });

    it('should allow campus moderator to resolve dispute with resolution notes', async () => {
      const res = await request(app)
        .post(`/api/admin/disputes/${createdDisputeId}/resolve`)
        .set('X-Requested-With', 'bbb')
        .set('Cookie', modAuthCookie)
        .send({
          resolution: 'Borrower agreed to replace battery cover, item returned.',
          penaltyUserId: borrowerUser.id,
          trustDelta: 5
        });

      expect(res.status).toBe(200);
      expect(res.body.data.dispute.status).toBe('RESOLVED');

      // Verify transaction moved to RESOLVED status
      const tx = await prisma.transaction.findUnique({ where: { id: testTransaction.id } });
      expect(tx.status).toBe('RESOLVED');
    });
  });

  describe('4. Campus Leaderboard & Rewards', () => {
    it('should retrieve campus leaderboard with reliability ranks', async () => {
      const res = await request(app)
        .get('/api/rewards/leaderboard');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.leaderboard)).toBe(true);
      expect(res.body.data.leaderboard.length).toBeGreaterThan(0);
      expect(res.body.data.leaderboard[0]).toHaveProperty('tier');
      expect(res.body.data.leaderboard[0]).toHaveProperty('averageTrust');
    });

    it('should fetch admin stats overview', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Cookie', modAuthCookie);

      expect(res.status).toBe(200);
      expect(res.body.data.stats).toHaveProperty('totalUsers');
      expect(res.body.data.stats).toHaveProperty('openDisputes');
    });
  });
});
