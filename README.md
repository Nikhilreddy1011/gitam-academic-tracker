# GITAM Academic Tracker

Full-stack academic tracker: React client, Express API, MongoDB, JWT auth.

## Repository layout

| Folder   | Role                                      |
|----------|-------------------------------------------|
| `client/` | React app (Create React App)             |
| `server/` | Express REST API + Swagger at `/swagger` |

## Prerequisites

- Node.js 18+ recommended  
- MongoDB Atlas (or local MongoDB)  
- npm

## Run everything on port 5000 (API + React)

The Express server serves the **production** React build from `client/build` on the **same port** as the API (default **5000**). One URL for the whole app.

```bash
# From repo root (academic-tracker)
npm install --prefix client
npm run build --prefix client
npm install --prefix server
cd server
copy .env.example .env
# edit .env — MONGO_URI, JWT_SECRET, etc.
npm start
```

Open **http://localhost:5000** — UI and `/api/*` share that port.  
Swagger: **http://localhost:5000/swagger**

If `client/build` is missing, `GET /` shows instructions to build the client first.

## Local development (optional — hot reload on port 3000)

Use two terminals if you want CRA dev server + API:

1. **Server:** `cd server && npm run dev` → API on **5000**  
2. **Client:** `cd client && npm start` → UI on **3000** (uses `proxy` to forward `/api` to 5000)

Do **not** set `REACT_APP_API_URL` for this mode (or leave it empty); the proxy handles API calls.

## Local setup (manual)

### Backend only

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

### Frontend build only

```bash
cd client
npm install
npm run build
```

## Environment variables

### Server (`server/.env`)

| Variable        | Required | Description |
|-----------------|----------|-------------|
| `PORT`          | No       | Defaults to `5000` |
| `MONGO_URI`     | Yes      | MongoDB connection string |
| `JWT_SECRET`    | Yes      | Secret for signing JWTs (use a long random string) |
| `EMAIL_USER`    | For mail | SMTP / app email user |
| `EMAIL_PASS`    | For mail | App password or SMTP secret |
| `CLIENT_ORIGIN` | No       | Comma-separated allowed browser origins for CORS. Default includes `http://localhost:3000` and `http://localhost:5000`. Add your public URL when deploying. |
| `HOST`          | No       | Bind address. Default `0.0.0.0` (needed for Render/cloud). |

### Client (`client/.env`)

| Variable              | Description |
|-----------------------|-------------|
| `REACT_APP_API_URL`   | Leave **unset** or empty when the UI is served from the **same** host as the API (single-port / same-origin). Set only if the frontend is on a **different** domain (e.g. Vercel UI + Render API). |

Create React App injects `REACT_APP_*` at **build** time.

## Security notes

- **Never commit** `server/.env` or `client/.env`. They are listed in `.gitignore`.
- **Rotate** `JWT_SECRET`, database passwords, and email app passwords if they were ever exposed.
- Use strong, random `JWT_SECRET` in production.

## Deploying (single service — recommended)

Deploy **one** [Render](https://render.com) Web Service (or similar) that builds the React app and runs Express.

1. Push this repo to GitHub (see below).  
2. **Web Service** → connect repo, branch `main`.  
3. **Root directory:** leave empty (repository root).  
4. **Build command:**  
   `npm install --prefix client && npm run build --prefix client && npm install --prefix server`  
5. **Start command:**  
   `npm start --prefix server`  
6. **Environment:** copy values from `server/.env.example` into Render’s env (real `MONGO_URI`, `JWT_SECRET`, etc.). Render sets `PORT` automatically.  
7. **CLIENT_ORIGIN:** set to your Render app URL, e.g. `https://your-app.onrender.com` (and keep localhost entries only if you need them for testing).

Do **not** set `REACT_APP_API_URL` for the build unless the static files are hosted on a **different** domain than the API.

### Split deploy (optional)

- **API only on Render:** root `server`, build `npm install`, start `npm start`.  
- **Frontend on Vercel:** root `client`, set `REACT_APP_API_URL` to your API URL (HTTPS, no trailing slash).

## Git and GitHub

Initialize git **inside this project folder** (not your user home directory):

```bash
cd academic-tracker
git init
git add .
git commit -m "Initial commit: academic tracker"
```

Create an empty repository on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

Confirm `server/.env` and `client/.env` are **not** listed by `git status` before pushing.

## API overview

Main routes (all under the API base URL): `/api/auth`, `/api/tasks`, `/api/attendance`, `/api/profile`, `/api/study`, `/api/events`, `/api/dashboard`, `/api/aptitude`, `/api/sgpa`.  
See Swagger at `/swagger` when the server is running.

## License

Private / educational use unless you add a license file.
