import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/config/prisma.js';

describe('Authentication Flow & Security Tests', () => {
  const app = createApp();
  const testStudent = {
    name: 'Aman Verma',
    collegeEmail: `aman.test.${Date.now()}@iet.edu`,
    password: 'Password123!',
    department: 'Computer Science',
    year: 3
  };

  let verificationToken = '';
  let authCookies = [];

  it('should reject registration with invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('X-Requested-With', 'bbb')
      .send({
        ...testStudent,
        collegeEmail: 'not-an-email'
      });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.fields.collegeEmail).toContain('Please enter a valid email address');
  });

  it('should reject requests without CSRF header', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testStudent);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('CSRF_VALIDATION_FAILED');
  });

  it('should register a student with valid college email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('X-Requested-With', 'bbb')
      .send(testStudent);

    expect(res.status).toBe(201);
    expect(res.body.data.collegeEmail).toBe(testStudent.collegeEmail);

    // Retrieve generated email token from database
    const tokenRecord = await prisma.emailToken.findFirst({
      where: { user: { collegeEmail: testStudent.collegeEmail } }
    });
    expect(tokenRecord).toBeDefined();
  });

  it('should register anyone with a personal email (e.g. gmail.com) and auto-activate', async () => {
    const personalStudent = {
      name: 'Priya Sharma',
      collegeEmail: `priya.sharma.${Date.now()}@gmail.com`,
      password: 'SecurePassword123!',
      department: 'Electronics',
      year: 2
    };

    const res = await request(app)
      .post('/api/auth/register')
      .set('X-Requested-With', 'bbb')
      .send(personalStudent);

    expect(res.status).toBe(201);
    expect(res.body.data.collegeEmail).toBe(personalStudent.collegeEmail);
    expect(res.body.data.user).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should immediately allow login with activated account without verification blockers', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('X-Requested-With', 'bbb')
      .send({
        collegeEmail: testStudent.collegeEmail,
        password: testStudent.password
      });

    expect(res.status).toBe(200);
    expect(res.body.data.user.name).toBe(testStudent.name);
    expect(res.headers['set-cookie']).toBeDefined();
    authCookies = res.headers['set-cookie'];
  });

  it('should access /api/auth/me with auth cookies', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', authCookies);

    expect(res.status).toBe(200);
    expect(res.body.data.user.collegeEmail).toBe(testStudent.collegeEmail);
    expect(res.body.data.user.borrowerScore).toBe(50);
    expect(res.body.data.user.lenderScore).toBe(50);
  });

  it('should reject login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('X-Requested-With', 'bbb')
      .send({
        collegeEmail: testStudent.collegeEmail,
        password: 'WrongPassword999!'
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});
