# 🚀 Vercel Deployment Guide: Bhumi-Setu (Land Acquisition & Management System)

This guide provides step-by-step instructions to deploy the **Bhumi-Setu** Next.js 14 web application to [Vercel](https://vercel.com).

---

## 🏗️ Architecture Overview

The repository is organized as an enterprise monorepo (`npm workspaces`):
- `apps/web`: Next.js 14 frontend (App Router, Tailwind CSS, TanStack Query, Leaflet GIS)
- `packages/shared`: Shared TypeScript types, Zod schemas, and RFCTLARR Act 2013 statutory compensation math
- `apps/api`: Node.js Express REST API

---

## ⚡ Deployment to Vercel (Step-by-Step)

### Step 1: Push Code to GitHub
Ensure all code is committed and pushed to your GitHub repository:
```bash
git branch -M main
git remote add origin https://github.com/the-ayushm/bhumi-setu.git
git push -u origin main
```

---

### Step 2: Import Project in Vercel
1. Log in to [vercel.com](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Under **Import Git Repository**, select `the-ayushm/bhumi-setu`.

---

### Step 3: Configure Project Settings

Choose **Option A (Recommended for Monorepos)**:

#### Option A: Deploy from Monorepo Root (Simplest)
- **Framework Preset**: Next.js
- **Root Directory**: `./` (leave default, do not change)
- **Build and Output Settings**:
  - **Build Command**: Toggle Override ON and set:
    ```bash
    npm run vercel-build
    ```
  - **Output Directory**: Toggle Override ON and set:
    ```bash
    apps/web/.next
    ```
  - **Install Command**: Leave as default (`npm install`)

#### Option B: Deploy specifying `apps/web` as Root Directory
- **Root Directory**: Click **Edit** and choose `apps/web`
- Vercel will automatically detect that files outside the root directory (`packages/shared`) need to be included in the build step.
- **Framework Preset**: Next.js
- **Build Command**: `next build` (Next.js automatically transpiles `@sih/shared` via `transpilePackages` in `next.config.mjs`)

---

### Step 4: Configure Environment Variables

Under the **Environment Variables** section in Vercel, add:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://your-api-domain.com/api/v1` | URL of your deployed Express backend (Render / Railway / AWS / Fly.io). For frontend-only demo mode, can point to your mock or live backend. |

*(Note: In development and local presentation mode, it defaults to `http://localhost:5000/api/v1`.)*

---

### Step 5: Click "Deploy"
1. Click the blue **"Deploy"** button.
2. Vercel will clone the repo, install dependencies, run typecheck, and build all static/dynamic routes.
3. Once complete, you will receive a production URL (e.g. `https://bhumi-setu.vercel.app`).

---

## 🛠️ Optional: Deploying the Backend API (`apps/api`)

To have a fully hosted backend alongside Vercel:
1. **Host on Render, Railway, or Fly.io**:
   - Build Command: `npm install && npm run build --workspace=@sih/shared && npm run build --workspace=@sih/api`
   - Start Command: `node apps/api/dist/server.js`
   - Set Environment Variables from `apps/api/.env.example`:
     - `PORT=5000`
     - `JWT_SECRET=your_secret_key`
     - `DATABASE_URL=postgresql://user:password@host:port/dbname`
2. Update `NEXT_PUBLIC_API_URL` in Vercel with your live backend URL.
