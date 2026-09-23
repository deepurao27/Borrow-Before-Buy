# Borrow Before Buy (BBB) - Complete Deployment Guide

This guide walks you through deploying the complete **Borrow Before Buy** web application for free using the recommended modern cloud stack:
- **Database**: [Neon.tech](https://neon.tech) (Free Serverless PostgreSQL) or [Supabase](https://supabase.com)
- **Backend API**: [Render](https://render.com) (Free Node.js Web Service)
- **Frontend App**: [Vercel](https://vercel.com) (Free Global Edge Static Hosting)

---

## Architecture Overview

```mermaid
graph LR
    User[Student Browser] -->|HTTPS Requests| Vercel[Frontend on Vercel<br/>borrow-before-buy.vercel.app]
    Vercel -->|API & Cookies with credentials| Render[Backend API on Render<br/>bbb-api.onrender.com]
    Render -->|Prisma Client / SSL| Neon[(PostgreSQL on Neon / Supabase)]
```

---

## Step 1: Push Code to GitHub

Make sure your project is committed and pushed to a GitHub repository (e.g. `your-username/borrow-before-buy`):

```bash
git init
git add .
git commit -m "feat: complete Borrow Before Buy with universal email & instant activation"
git remote add origin https://github.com/your-username/borrow-before-buy.git
git branch -M main
git push -u origin main
```

---

## Step 2: Provision Free PostgreSQL Database (Neon.tech)

1. Go to **[https://neon.tech](https://neon.tech)** and sign up / log in with GitHub.
2. Click **Create Project**:
   - **Project Name**: `borrow-before-buy`
   - **Database Name**: `bbb_db`
   - **Region**: Choose closest to you (e.g., *AWS Frankfurt*, *US East*, or *Singapore*).
3. Once created, copy the **Connection Details** connection string. It will look like:
   ```text
   postgresql://bbb_user:password@ep-cool-cloud-12345.region.aws.neon.tech/bbb_db?sslmode=require
   ```
   *(Keep this connection string handy for Step 3).*

---

## Step 3: Deploy Backend on Render

1. Go to **[https://render.com](https://render.com)** and sign in with GitHub.
2. Click **New +** > **Web Service**.
3. Select your GitHub repository (`borrow-before-buy`).
4. Configure the settings:
   - **Name**: `bbb-api` (or any unique name)
   - **Region**: Same region as your Neon database.
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build && npx prisma migrate deploy
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Instance Type**: `Free`
5. In the **Environment Variables** section, add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode & security |
| `PORT` | `5000` | Render internal port |
| `DATABASE_URL` | `postgresql://...neon.tech/bbb_db?sslmode=require` | Your Neon connection string from Step 2 |
| `JWT_ACCESS_SECRET` | *(64-char random string or generate)* | Secret for signing 15m access tokens |
| `JWT_REFRESH_SECRET` | *(64-char random string or generate)* | Secret for signing refresh tokens |
| `HANDOVER_TOKEN_SECRET` | *(64-char random string or generate)* | Secret for signing 5-minute QR handover codes |
| `COOKIE_SAME_SITE` | `none` | Allows cross-origin authentication cookies from Vercel |
| `CLIENT_URL` | `https://your-frontend.vercel.app` | Your Vercel frontend URL *(you can add this right after Step 4)* |

6. Click **Create Web Service**. Render will install dependencies, generate Prisma client, run the migrations automatically, and start your backend.
7. Once finished, copy your Render public URL (e.g., `https://bbb-api.onrender.com`).
   - Test it by visiting: `https://bbb-api.onrender.com/api/health`
   - It should respond with: `{"status":"ok", ...}`.

---

## Step 4: Deploy Frontend on Vercel

1. Go to **[https://vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **Add New...** > **Project**.
3. Import your GitHub repository (`borrow-before-buy`).
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`frontend`**.
   - **Build Command**: `npm run build` *(default)*
   - **Output Directory**: `dist` *(default)*
5. Open **Environment Variables** and add:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://bbb-api.onrender.com/api` *(Your Render backend URL with `/api`)* |

6. Click **Deploy**. Vercel will build your React application in ~30 seconds and provide you with a live domain (e.g. `https://borrow-before-buy.vercel.app`).
7. **Important final sync**: Go back to your Render Dashboard for `bbb-api`, update the `CLIENT_URL` environment variable with your actual Vercel URL (`https://borrow-before-buy.vercel.app`), and click **Save Changes** (Render will redeploy with CORS updated).

---

## Step 5: Verify Live Deployment

1. Open your Vercel URL: `https://borrow-before-buy.vercel.app`.
2. Click **Get Started** or **Sign Up**:
   - Register a new account with your personal email (e.g., Gmail, Outlook, Yahoo) or college email.
   - Observe **instant activation**: you are automatically logged in and taken directly to `/board`.
3. Try posting an item (e.g., a scientific calculator or lab coat).
4. Try logging in on a second incognito browser tab using **Email OTP** or **Password** to test real peer interactions and the QR handover!

---

## Summary of Files Configured for Deployment

- [`frontend/vercel.json`](file:///c:/Users/DIVAKAR%20RAO/Desktop/Borrow%20before%20buy/frontend/vercel.json): Configured with SPA rewrites for React Router.
- [`backend/package.json`](file:///c:/Users/DIVAKAR%20RAO/Desktop/Borrow%20before%20buy/backend/package.json): Added `build` and `prisma:deploy` scripts.
- [`backend/src/app.js`](file:///c:/Users/DIVAKAR%20RAO/Desktop/Borrow%20before%20buy/backend/src/app.js): Added reverse proxy support (`trust proxy`) and dynamic CORS for Vercel.
- [`backend/src/utils/tokens.js`](file:///c:/Users/DIVAKAR%20RAO/Desktop/Borrow%20before%20buy/backend/src/utils/tokens.js): Configured `sameSite: 'none'` & `secure: true` for cross-site cookies.
- [`render.yaml`](file:///c:/Users/DIVAKAR%20RAO/Desktop/Borrow%20before%20buy/render.yaml): Optional one-click Render Blueprint definition.
