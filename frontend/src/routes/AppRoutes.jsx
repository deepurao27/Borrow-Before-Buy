import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { LandingPage } from '../pages/public/LandingPage';
import { HowItWorksPage } from '../pages/public/HowItWorksPage';
import { SafetyPage } from '../pages/public/SafetyPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';

import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { CheckInboxPage } from '../pages/auth/CheckInboxPage';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';

import { SearchBrowsePage } from '../pages/app/SearchBrowsePage';
import { ItemDetailPage } from '../pages/app/ItemDetailPage';
import { PostItemPage } from '../pages/app/PostItemPage';
import { RequestsPage } from '../pages/app/RequestsPage';
import { TransactionsListPage } from '../pages/app/TransactionsListPage';
import { TransactionDetailPage } from '../pages/app/TransactionDetailPage';
import { DashboardPage } from '../pages/app/DashboardPage';
import { ProfilePage } from '../pages/app/ProfilePage';
import { LeaderboardPage } from '../pages/app/LeaderboardPage';
import { AdminModerationPage } from '../pages/app/AdminModerationPage';

import { ProtectedRoute } from './ProtectedRoute';

import { GuestRoute } from './GuestRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        {/* Public Marketing & Noticeboard Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/safety" element={<SafetyPage />} />
        <Route path="/search" element={<SearchBrowsePage />} />
        <Route path="/items" element={<Navigate to="/search" replace />} />
        <Route path="/items/:id" element={<ItemDetailPage />} />

        {/* Auth Pages (Guest Only) */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route path="/check-inbox" element={<CheckInboxPage />} />
        <Route path="/verify" element={<VerifyEmailPage />} />
        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPasswordPage />
            </GuestRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <GuestRoute>
              <ResetPasswordPage />
            </GuestRoute>
          }
        />

        {/* Protected Student Pages */}
        <Route
          path="/post-item"
          element={
            <ProtectedRoute>
              <PostItemPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <RequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions/:id"
          element={
            <ProtectedRoute>
              <TransactionDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminModerationPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

