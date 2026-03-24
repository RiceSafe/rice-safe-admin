# RiceSafe Admin Portal

![CI](https://github.com/RiceSafe/rice-safe-admin/actions/workflows/test.yml/badge.svg)

RiceSafe Admin Portal is a web interface designed for administrators and rice experts. It serves as the command center for monitoring rice disease outbreaks, managing the disease knowledge base, moderating community interactions, and overseeing user roles.

## Features

- **Dashboard:** Real-time visibility into active outbreaks, pending expert reviews, total disease data, and user demographics.
- **Disease Library Management:** Robust CRUD operations for rice disease entries, featuring automated image processing and multi-section details.
- **Outbreak Command Center:** Lifecycle management of outbreak reports—from user submission through expert verification to final resolution.
- **Expert Verification Flow:** Specialized interface for rice experts to review, confirm, or reject community-reported disease instances.
- **Community Moderation:** Tools for monitoring social interactions and maintaining a healthy, professional environment within the platform.
- **User & Role Orchestration:** Advanced management of user accounts and permissions with JWT and OAuth integration.
- **Secure Access:** Enterprise-grade authentication with Google OAuth 2.0 and JWT-based session management.

## Tech Stack

- **Framework:** Vite (Vanilla JavaScript - ESM)
- **Styling:** Custom Vanilla CSS (Modern Design System with Dark Mode/Glassmorphism)
- **Auth:** Google OAuth 2.0 & JWT (Bearer Token)
- **API Connectivity:** RESTful Backend integration via Fetch API
- **Testing:** Vitest with `jsdom` (Comprehensive Unit & DOM Testing)
- **Icons:** SVG-based iconography (Minimal footprint)
- **Typography:** Google Fonts (Inter)

## Project Structure

```text
rice-safe-admin/
├── src/
│   ├── pages/           # Modular page logic (Single Page App)
│   │   ├── community.js  # Forum & moderation logic
│   │   ├── dashboard.js  # Stats & overview
│   │   ├── diseases.js   # Disease library CRUD
│   │   ├── outbreaks.js  # All outbreak reports
│   │   ├── users.js      # Role & user management
│   │   └── verify.js     # Expert verification workflow
│   ├── tests/           # Robust Vitest test suite (9+ modules)
│   ├── api.js           # API Communication Layer (Fetch wrapper)
│   ├── ui.js            # Shared UI Toolkit (Toasts, Modals, Badges)
│   ├── main.js          # App Entry, Routing, & Auth Lifecycle
│   └── style.css        # Core Design System & Global Styles
├── index.html           # SPA Shell & Modal Definitions
├── Makefile             # Standardized development workflows
├── vite.config.js       # Vite & Vitest configuration
└── package.json         # Dependency management
```

## Getting Started

### 1. Prerequisites
- Node.js
- NPM or PNPM

### 2. Setup
```bash
# Install dependencies
npm install
```

#### Configure environment
```bash
cp .env.example .env
# Open .env and set your VITE_API_URL and VITE_GOOGLE_CLIENT_ID
```

### 3. Development Workflows
Use the provided `Makefile` for consistent commands:

| Command | Action |
|---------|--------|
| `make dev` | Start local development server (Port 3000) |
| `make test` | Run the full Vitest test suite once |
| `make test-watch` | Run tests in watch mode |
| `make build` | Generate production build |
| `make preview` | Preview production build |
| `make clean` | Remove `dist` and `node_modules` |

## Environment Variables

Create a `.env` file in the root directory:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Endpoint for the RiceSafe Backend |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth Client ID for admin/expert login |

## Role-based Access Control (RBAC)

The portal enforces strict role checks. Only accounts with `ADMIN` or `EXPERT` roles can bypass the login screen.

- **ADMIN:** Full system access—including User Management and Community Moderation.
- **EXPERT:** Focused access—specializing in Outbreak Verification and Disease Library Updates.

## Testing State

- **API Logic:** Verified fetch wrappers and error handling.
- **UI Components:** Tested modals, toasts, and dynamic button states.
- **Page Modules:** Individual logic tests for Dashboard, Outbreaks, Users, and Verification flows.
- **DOM Integration:** JSDOM-based verification of UI state transitions.

Run `make test` to verify current health.
