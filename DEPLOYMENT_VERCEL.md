# 🚀 Complete Guide: Deploying Social Media Content Analyzer on Vercel

This document outlines the step-by-step procedure to deploy the full-stack **Social Media Content Analyzer** on **Vercel** with a public production URL.

---

## 🏗️ How the Vercel Architecture Works

The repository is configured for **Unified Full-Stack Deployment on Vercel**:
- **Frontend**: The React 19 + TypeScript + Tailwind client compiles to `server/dist/public` and is served as high-speed static assets via Vercel Edge CDN.
- **Backend API**: The Express router (`/api/analyze` and `/api/health`) runs natively as a Vercel Serverless Function via [`api/index.ts`](./api/index.ts) with configuration managed in [`vercel.json`](./vercel.json).

---

## 📋 Prerequisites

1. A free **[GitHub](https://github.com/)** account.
2. A free **[Vercel](https://vercel.com/)** account (can sign in with GitHub).
3. Git installed on your machine.

---

## 🔹 Method 1: Deploy via Vercel Web Dashboard (Recommended)

### Step 1: Initialize Git and Push to GitHub

Open your terminal and run the following commands from the project root:

```bash
cd /Users/armaanbudhiraja/social-media-content-analyzer

# 1. Initialize git (if not already done)
git init

# 2. Add all files
git add .

# 3. Create your initial commit
git commit -m "feat: complete Social Media Content Analyzer application"

# 4. Set the main branch
git branch -M main

# 5. Link your GitHub repository (replace with your actual GitHub repo URL)
git remote add origin https://github.com/<your-username>/social-media-content-analyzer.git

# 6. Push to GitHub
git push -u origin main
```

---

### Step 2: Import Project on Vercel

1. Go to **[https://vercel.com/new](https://vercel.com/new)**.
2. Under **"Import Git Repository"**, select your newly pushed repository: `social-media-content-analyzer`.
3. Click **"Import"**.

---

### Step 3: Configure Project Settings on Vercel

Vercel will detect the repository settings automatically. Ensure the following configurations match:

- **Project Name**: `social-media-content-analyzer` (or your preferred name)
- **Framework Preset**: `Other` (or leave default)
- **Root Directory**: `./` (leave as default root)
- **Build Command**: `npm run build` (automatic from `package.json`)
- **Output Directory**: `server/dist/public` (automatic from `vercel.json`)
- **Install Command**: `npm run postinstall` (automatic)

---

### Step 4: Configure Environment Variables (Optional)

In the **"Environment Variables"** accordion section on Vercel:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Production mode |
| `GEMINI_API_KEY` | `your_api_key_here` | *(Optional)* If you wish to enable Google Gemini AI rewrites in addition to the built-in deterministic heuristic engine. |

> **Note**: The application is 100% functional out of the box even without `GEMINI_API_KEY` using its built-in rule-based NLP engine.

---

### Step 5: Click Deploy

1. Click the **"Deploy"** button.
2. Vercel will build the frontend, package the serverless backend function, and provision a live URL (e.g., `https://social-media-content-analyzer-xyz.vercel.app`).
3. Once completed (usually 45-60 seconds), click **"Visit"** to view your live app.

---

## 🔹 Method 2: Deploy via Vercel CLI (Direct from Terminal)

If you prefer deploying directly from the command line:

### Step 1: Install Vercel CLI & Login
```bash
npm install -g vercel
vercel login
```

### Step 2: Deploy to Preview
From the project root:
```bash
cd /Users/armaanbudhiraja/social-media-content-analyzer
vercel
```
Follow the interactive prompts:
- *Set up and deploy?* -> `Y`
- *Which scope?* -> Select your account
- *Link to existing project?* -> `N`
- *What's your project's name?* -> `social-media-content-analyzer`
- *In which directory is your code located?* -> `./`
- *Want to modify settings?* -> `N`

### Step 3: Deploy to Production
```bash
vercel --prod
```

Vercel will output the live production URL in your terminal!

---

## 🔍 How to Verify Your Live Vercel Deployment

Once deployed, verify that both the frontend and backend function properly:

1. **Check Backend API Health**:
   Open:
   ```text
   https://<your-vercel-app>.vercel.app/api/health
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "services": {
       "pdfParser": "available",
       "tesseractOcr": "available",
       "heuristicEngine": "available",
       "aiAssistant": "heuristic_mode"
     }
   }
   ```

2. **Test Document Upload on the Live Site**:
   - Navigate to `https://<your-vercel-app>.vercel.app`.
   - Click one of the preloaded sample documents or upload a local PDF/image file.
   - Verify that text extraction, metrics table, platform preview, and recommendations render instantly.

---

## 🛠️ Summary of Files Powering Vercel Deployment

- [`vercel.json`](./vercel.json): Configures build command, static output directory, and `/api/*` rewrites to serverless function.
- [`api/index.ts`](./api/index.ts): Vercel Serverless Function entrypoint wrapping the Express app.
- [`server/src/app.ts`](./server/src/app.ts): Reusable Express router instance shared across standalone Node server and Vercel serverless functions.
- [`package.json`](./package.json): Root orchestration scripts (`postinstall`, `build`, `start`).
