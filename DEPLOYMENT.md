# Showing expert members on Vercel (shared data)

## Why the admin table is empty on Vercel

- **On localhost:** Expert intake submissions are either stored in your **local backend** (the `server/` that runs with `npm run server`) or in **localStorage** in your browser. The admin dashboard reads from the same place, so you see the list.
- **On Vercel:** Only the **frontend** (React app) is deployed. There is **no backend** and **no shared storage**:
  - `VITE_API_URL` is not set, so the app never calls an API.
  - It falls back to **localStorage**, which is **per browser and per device**. Each visitor has their own empty localStorage on the Vercel domain, so the table stays empty and data is not shared.

So to show expert members on the Vercel link for **everyone**, you need a **shared backend** that stores submissions and that the Vercel app can call.

---

## Option 1: Deploy your existing backend (recommended)

Your `server/` already has the API (POST/GET expert-intake, file upload, DELETE). Deploy it to a host that runs Node.js, then point the Vercel frontend to it.

### Step 1: Deploy the backend (e.g. Railway or Render)

**Railway (free tier):**

1. Go to [railway.app](https://railway.app) and sign in (e.g. with GitHub).
2. **New Project** → **Deploy from GitHub repo** and select this repo.
3. Railway will detect the repo. Configure the service:
   - **Root Directory:** leave default (repo root).
   - **Build Command:** leave empty or `npm install`.
   - **Start Command:** `node server/index.js`
   - **Environment variables:** Add `PORT` if Railway doesn’t set it (they usually do).
4. Deploy. After it’s live, open the generated URL (e.g. `https://your-app.up.railway.app`). No trailing slash.

**Render (free tier):**

1. Go to [render.com](https://render.com) and sign in.
2. **New** → **Web Service** → connect this repo.
3. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server/index.js`
   - **Instance Type:** Free.
4. Deploy and copy the service URL (e.g. `https://your-app.onrender.com`).

**Note:** On free tiers, the filesystem is often ephemeral (uploads may be lost on restart). For permanent file storage you’d add a volume (Railway) or switch to cloud storage (e.g. S3). The **list of experts** (names, emails, etc.) is stored in `server/data/submissions.json` and usually persists as long as the service keeps the same filesystem.

### Step 2: Point the Vercel frontend to the backend

1. In **Vercel** → your project → **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** your backend URL, e.g. `https://your-app.up.railway.app` or `https://your-app.onrender.com`  
   (no trailing slash)
3. **Redeploy** the Vercel project (e.g. trigger a new deployment from the Deployments tab) so the build uses the new variable.

After redeploy:

- Expert intake form (on the Vercel site) will **POST** to your deployed backend → submissions are stored on the server.
- Admin dashboard (on the Vercel site) will **GET** from the same backend → the table will show all experts for anyone using the link.

### Step 3: CORS

Your server uses `cors()` with no options, so it allows all origins. Your Vercel domain (e.g. `https://your-app.vercel.app`) will be able to call the API. If you later restrict CORS, add that domain to the allowed list.

---

## Option 2: Use a backend-only host

If you prefer to keep the frontend on Vercel and only deploy the Node server:

- Deploy **only** the `server/` (e.g. as a separate repo or subdirectory) to Railway, Render, Fly.io, or a small VPS.
- Expose the same API (`/api/expert-intake` GET/POST, `/api/expert-intake/:id/file`, DELETE).
- Set **VITE_API_URL** in Vercel to that backend URL and redeploy the frontend.

---

## Local development with a “production-like” API

To test the same behavior locally:

1. Create a `.env` file in the project root (see `.env.example`).
2. Set `VITE_API_URL=http://localhost:3001` (or whatever port your server uses).
3. Run the server: `npm run server`.
4. Run the app: `npm run dev`.  
Submissions will go to the local server and the admin table will show them. On Vercel, the same code will use the deployed backend URL you set in `VITE_API_URL`.
