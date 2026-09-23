import { z } from 'zod';
import { env } from '../config/env.js';
import { CONSTANTS } from '../config/constants.js';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters'),
  collegeEmail: z.string().trim().toLowerCase()
    .email('Please enter a valid email address'),
  department: z.string().trim().min(2, 'Department is required').max(50),
  year: z.coerce.number().int().min(1, 'Year must be between 1 and 5').max(5, 'Year must be between 1 and 5'),
  password: z.string()
    .min(CONSTANTS.PASSWORD_MIN_LENGTH, `Password must be at least ${CONSTANTS.PASSWORD_MIN_LENGTH} characters`)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});

export const sendOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  name: z.string().trim().optional()
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  otp: z.string().trim().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits')
});


export const loginSchema = z.object({
  collegeEmail: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const verifySchema = z.object({
  token: z.string().trim().min(1, 'Verification token is required')
});

export const resendVerificationSchema = z.object({
  collegeEmail: z.string().trim().toLowerCase().email('Invalid email address')
});

export const forgotPasswordSchema = z.object({
  collegeEmail: z.string().trim().toLowerCase().email('Invalid email address')
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Reset token is required'),
  password: z.string()
    .min(CONSTANTS.PASSWORD_MIN_LENGTH, `Password must be at least ${CONSTANTS.PASSWORD_MIN_LENGTH} characters`)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});
