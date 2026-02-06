# Making the deployed version work (Vercel + backend)

You **do not need to change any application code**. The app already uses `VITE_API_URL` for the API and falls back to localStorage when it’s not set. To get full functionality on the deployed site, do the following.

---

## 1. Deploy the backend (if not already)

The `server/` folder must run somewhere public so the Vercel frontend can call it.

- **Railway:** New Project → Deploy from GitHub → same repo. Set **Start Command** to `node server/index.js`. Copy the public URL (e.g. `https://your-app.up.railway.app`).
- **Render:** New Web Service → connect repo. **Start Command:** `node server/index.js`. Copy the service URL.

No trailing slash on the URL.

---

## 2. Set the API URL in Vercel (required for shared data)

`VITE_*` variables are baked in at **build time**. So the value must be set in Vercel, not only in a local `.env`.

1. Open **Vercel** → your project → **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** your backend URL (e.g. `https://your-app.up.railway.app`)
   - **Environment:** Production (and optionally Preview).
3. Save.

---

## 3. Redeploy the frontend

After adding or changing `VITE_API_URL`, trigger a new deployment (e.g. Deployments → … → Redeploy, or push a new commit). The new build will include the API URL.

---

## What works when `VITE_API_URL` is set in Vercel

| Feature | Without backend URL | With backend URL set in Vercel |
|--------|----------------------|---------------------------------|
| Expert intake form | Saves to localStorage (per device) | Saves to backend; shared for everyone |
| Admin dashboard table | Empty or only local data | Shows all experts from backend |
| Admin sign up | Stored in localStorage (per device) | Stored on backend; shared |
| Admin login | Validates against localStorage only | Validates against backend; works across devices |

---

## Summary: what you need to change

- **In the code:** Nothing. Keep using the repo as is.
- **In Vercel:** Add (or fix) **Environment Variable** `VITE_API_URL` = your backend URL, then **redeploy**.
- **Backend:** Ensure the Node server is deployed and its URL is the one you put in `VITE_API_URL`.

After that, the deployed version will use the backend for experts and admin auth and behave like localhost with the server running.
