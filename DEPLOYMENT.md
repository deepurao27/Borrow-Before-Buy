# Borrow Before Buy (BBB) - Complete Deployment Guide

This guide walks you through deploying the complete **Borrow Before Buy** web application using:
- **Database**: [Supabase](https://supabase.com) (Free Managed PostgreSQL)
- **Backend API**: [Render](https://render.com) (Free Node.js Web Service)
- **Frontend App**: [Vercel](https://vercel.com) (Free Global Edge Static Hosting)

---

## Architecture Overview

```mermaid
graph LR
    User[Student Browser] -->|HTTPS Requests| Vercel[Frontend on Vercel<br/>borrow-before-buy.vercel.app]
    Vercel -->|API & Cookies with credentials| Render[Backend API on Render<br/>bbb-api.onrender.com]
    Render -->|Pooled Port 6543 / Direct Port 5432| Supabase[(PostgreSQL on Supabase)]
```

---

## Step 1: Provision Free PostgreSQL Database on Supabase

1. Go to **[https://supabase.com](https://supabase.com)** and sign in with GitHub.
2. Click **New Project**:
   - **Name**: `borrow-before-buy`
   - **Database Password**: Set a strong password *(remember this password!)*
   - **Region**: Choose the region closest to your users (e.g. *Central India (Mumbai)*, *Frankfurt*, or *East US*).
   - **Pricing Plan**: Free Tier
3. Click **Create new project** (takes ~1-2 minutes to spin up).
4. Once your project is created:
   - In the left sidebar, click the **Settings gear icon (Project Settings)**.
   - Navigate to **Database**.
   - Scroll down to the **Connection string** section.
   - Select the **URI** tab.

You will need **TWO** connection strings for Prisma:

### A. Pooled Connection String (`DATABASE_URL`)
- Set mode to **Transaction** (port `6543`).
- Copy the URI string:
  ```text
  postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
  ```
  *(Replace `[YOUR-PASSWORD]` with your actual database password).*

### B. Direct Connection String (`DIRECT_URL`)
- Set mode to **Session** or choose the direct connection (port `5432`).
- Copy the URI string:
  ```text
  postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
  ```
  *(Prisma uses this for running migrations without connection pooler restrictions).*

---

## Step 2: Push Latest Code to GitHub

Your code is connected to your GitHub repository:
```bash
git add .
git commit -m "chore: configure Supabase directUrl and deployment configs"
git push origin main
```

---

## Step 3: Deploy Backend on Render

1. Go to **[https://render.com](https://render.com)** and sign in with GitHub.
2. Click **New +** > **Web Service**.
3. Select your GitHub repository: **`deepurao27/Borrow-Before-Buy`**.
4. Configure the service settings:
   - **Name**: `bbb-api` (or any name you prefer)
   - **Region**: Select the same region as your Supabase database.
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm run build && npx prisma db push --skip-generate
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Instance Type**: `Free`
5. In the **Environment Variables** section, add the following variables:

| Key | Example / Recommended Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production mode & security |
| `PORT` | `5000` | Render port |
| `DATABASE_URL` | `postgresql://postgres.[REF]:[PASS]@...:6543/postgres?pgbouncer=true` | Supabase pooled connection string (port 6543) |
| `DIRECT_URL` | `postgresql://postgres.[REF]:[PASS]@...:5432/postgres` | Supabase direct connection string (port 5432) |
| `COOKIE_SAME_SITE` | `none` | Allows cross-origin authentication cookies from Vercel |
| `JWT_ACCESS_SECRET` | *(Random 32+ char string)* | Secret for signing 15-minute access tokens |
| `JWT_REFRESH_SECRET` | *(Random 32+ char string)* | Secret for signing refresh tokens |
| `HANDOVER_TOKEN_SECRET` | *(Random 32+ char string)* | Secret for signing 5-minute dynamic QR codes |
| `CLIENT_URL` | `https://your-frontend.vercel.app` | Your Vercel frontend URL *(update in Step 5)* |

6. Click **Create Web Service**. Render will build the backend, generate Prisma, run `prisma migrate deploy` against your Supabase database, and start the API.
7. Copy your public Render URL: e.g. `https://bbb-api.onrender.com`.
   - Test it by opening: `https://bbb-api.onrender.com/api/health`
   - Should return: `{"status":"ok", ...}`.

---

## Step 4: Deploy Frontend on Vercel

1. Go to **[https://vercel.com](https://vercel.com)** and sign in with GitHub.
2. Click **Add New...** > **Project**.
3. Import your GitHub repository: **`deepurao27/Borrow-Before-Buy`**.
4. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and choose **`frontend`**.
   - **Build Command**: `npm run build` *(default)*
   - **Output Directory**: `dist` *(default)*
5. Under **Environment Variables**, add:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://bbb-api.onrender.com/api` *(Your Render backend URL with `/api`)* |

6. Click **Deploy**. Vercel will build and deploy your frontend in ~30 seconds, generating your live domain (e.g. `https://borrow-before-buy.vercel.app`).

---

## Step 5: Final Sync & Verification

1. Go back to your **Render Dashboard** for `bbb-api`.
2. Under **Environment**, update `CLIENT_URL` to match your actual Vercel URL (e.g. `https://borrow-before-buy.vercel.app`).
3. Click **Save Changes** (Render will redeploy with updated CORS origin).
4. Visit your live site:
   - Create a student account with any personal email (Gmail, Yahoo, Outlook, etc.).
   - Verify instant activation and redirection to the borrowing board!
