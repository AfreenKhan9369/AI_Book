# Deploying AI_Book on Netlify

This application is fully configured and ready for 1-click deployment on **Netlify**.

---

## 🚀 Key Files Created & Configured

1. **`netlify.toml`**: Configures the build command, functions directory, Node.js runtime (`NODE_VERSION = "22"`), security headers, and rewrite rules:
   - `/api/*` ➔ Routes to `/.netlify/functions/api/:splat` (serverless Express backend)
   - `/uploads/*` ➔ Routes to `/.netlify/functions/api/uploads/:splat` (static note downloads)
   - `/*` ➔ Serves `index.html` (for client-side React Router navigation)

2. **`netlify/functions/api.ts`**: Serverless function handler powered by `serverless-http` running your Express backend endpoints (`/auth`, `/subjects`, `/materials`, `/ai`, `/users`, `/supabase`).

3. **`public/_redirects`**: Backup Netlify rewrite configuration copied directly into `dist` upon build to prevent 404s when refreshing subpages (e.g. `/admin`, `/login`, `/notes`, `/pyqs`).

4. **`server/app.ts`**: Modular Express backend designed to run both as a standalone Node.js server and as a Netlify serverless function with read-only `/tmp` safety.

---

## 📋 Step-by-Step Netlify Deployment Instructions

### Step 1: Push Code to GitHub / GitLab / Bitbucket
Ensure your repository is pushed to your Git provider with all project files.

### Step 2: Create a New Site on Netlify
1. Log in to [Netlify](https://app.netlify.com/).
2. Click **"Add new site"** ➔ **"Import an existing project"**.
3. Choose your Git provider (**GitHub**) and select your repository.

### Step 3: Verify Build Settings (Auto-detected from `netlify.toml`)
Netlify will automatically detect the settings from `netlify.toml`:
- **Base directory:** *(leave blank / root)*
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Functions directory:** `netlify/functions`

### Step 4: Add Environment Variables in Netlify
Go to **Site configuration** ➔ **Environment variables** ➔ **Add a variable**, and add:

| Key | Recommended Value / Source |
|---|---|
| `NODE_VERSION` | `22` |
| `JWT_SECRET` | A secure random string (e.g., `ai_book_super_secret_jwt_key_2026`) |
| `GEMINI_API_KEY` | Your Google Gemini API Key (for AI features) |
| `VITE_SUPABASE_PROJECT_ID` | `udsvohrfzzeanqnjfazb` |
| `VITE_SUPABASE_URL` | `https://udsvohrfzzeanqnjfazb.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_4Jt6bVElnKJlpU_qqP4dkA_lOihoATw` |
| `SUPABASE_PROJECT_ID` | `udsvohrfzzeanqnjfazb` |
| `SUPABASE_URL` | `https://udsvohrfzzeanqnjfazb.supabase.co` |
| `SUPABASE_ANON_KEY` | `sb_publishable_4Jt6bVElnKJlpU_qqP4dkA_lOihoATw` |

*(Optional: If you ever want to point to an external MySQL server, you can also add `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`)*.

### Step 5: Deploy
Click **"Deploy [your-project-name]"**.
Netlify will install dependencies, build the Vite frontend, bundle the serverless functions, and publish your site!
