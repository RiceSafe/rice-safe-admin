# RiceSafe Admin Portal

RiceSafe Admin Portal is the web-based management interface for the RiceSafe platform. It allows authorized administrators and rice experts to manage disease records, review and verify outbreak reports, moderate community content, and manage user roles.

## Features

- **Dashboard:** Overview of active outbreaks, pending verifications, disease count, and user stats.
- **Disease Library:** Create, edit, and upload images for rice disease entries shown in the mobile app.
- **Outbreak Management:** View all outbreak reports with image thumbnails; resolve or delete records.
- **Pending Verification:** Experts can review unverified outbreak reports and confirm them.
- **Community Moderation:** Admins can view and delete inappropriate community posts.
- **User Management:** Admins can view all users and change their roles (Farmer, Expert, Admin).

## Tech Stack

- **Framework:** Vite (Vanilla JavaScript)
- **Styling:** Custom CSS (no framework)
- **API:** Connects to the RiceSafe Backend REST API via JWT authentication
- **Image Upload:** Uploads directly to Google Cloud Storage via the backend `/api/upload` endpoint

## Project Structure

```
rice-safe-admin/
├── src/
│   ├── pages/           # Page modules (dashboard, diseases, outbreaks, etc.)
│   │   ├── dashboard.js
│   │   ├── diseases.js
│   │   ├── outbreaks.js
│   │   ├── verify.js
│   │   ├── users.js
│   │   └── community.js
│   ├── api.js           # Fetch helpers and JWT token management
│   ├── ui.js            # Shared UI utilities (toast, modal, badges)
│   ├── main.js          # App entry point, routing, and auth boot
│   └── style.css        # Global design system and CSS variables
├── index.html           # Single-page HTML shell with all modals
├── .env                 # Local environment variables (not committed)
├── .env.example         # Environment variable template
├── vite.config.js       # Vite configuration
└── package.json
```

## Getting Started

**1. Install dependencies:**
```bash
npm install
```

**2. Configure environment:**
```bash
cp .env.example .env
# Edit .env to set the backend URL
```

**3. Run locally:**
```bash
npm run dev
```

The dev server will start at `http://localhost:3000`.

> Make sure the RiceSafe backend is running at the URL configured in `.env`.

## Environment Variables

| Variable      | Description                    | Example                      |
|---------------|--------------------------------|------------------------------|
| `VITE_API_URL`| Base URL of the backend API    | `http://localhost:8080/api`  |

## Access Control

This portal is for internal use only. Users must log in with an account that has the **ADMIN** or **EXPERT** role. Regular farmer accounts will be rejected at the login screen.

| Role     | Capabilities                                                           |
|----------|------------------------------------------------------------------------|
| `ADMIN`  | Full access: user management, community moderation, all outbreaks      |
| `EXPERT` | Verify outbreaks, manage disease library, view reports                 |
