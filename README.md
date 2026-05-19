# Smart Leads Dashboard

A production-ready full-stack MERN (MongoDB, Express, React, Node) application developed in TypeScript. Features include real-time CRM metrics, interactive Recharts pipelines, AI-simulated Lead Scores, activity timelines, robust role-based access control (RBAC), and CSV export capabilities.

---

## 🚀 Key Features

*   **Role-Based Access Control (RBAC):**
    *   **Admin:** Full read, write, update, and delete access.
    *   **Sales User:** Full access to view, create, and edit leads, but restricted from deleting lead profiles. Deletes are disabled on the client UI with explanatory tooltips and rejected on the API server with HTTP `403 Forbidden` checks.
*   **AI Lead Score Engine:** Simulates lead affinity scoring based on email corporate domains (versus generic webmails) and sourcing channels, outputting conversion suggestions.
*   **Persistent Interaction Timelines:** An activity logger that saves customer touchpoints (Emails, Calls, Meetings, Notes) to chronological visual feed cards.
*   **Interactive Visual Analytics:** Pipeline conversion charts, sourcing percentages, and lead growth graphs configured using Recharts that adapt dynamically to Dark/Light theme switching.
*   **CSV Exports:** Fetches and streams paginated lead directories into CSV files aligning with search and filter selections.
*   **Dark Mode Support:** A sleek theme switcher toggling between dark-mode-first aesthetics and crisp light modes.

---

## 🛠 Technology Stack

### Frontend Client
*   **Core:** React (v18), TypeScript, Vite
*   **Styling:** Tailwind CSS (v3)
*   **Routing:** React Router DOM (v6)
*   **State Management & Requests:** TanStack React Query (v5), Axios
*   **Forms & Validation:** React Hook Form, Zod
*   **Toasts:** React Hot Toast
*   **Icons:** Lucide React

### Backend Server
*   **Core:** Node.js, Express, TypeScript
*   **Database:** MongoDB, Mongoose (schemas with composite indices)
*   **Security:** JWT, Bcrypt.js, Express Rate Limiter, Helmet, CORS
*   **Validations:** Express Validator

---

## 📋 Directory Structure

```
Smart_Lead_Dashboard/
├── backend/                 # Backend API Server
│   ├── src/
│   │   ├── config/          # DB connector
│   │   ├── controllers/     # Controller handlers (auth, lead)
│   │   ├── middleware/      # Rate limits, error boundaries, auth protection
│   │   ├── models/          # User & Lead schemas and indexes
│   │   ├── routes/          # Express route structures
│   │   ├── services/        # Service modules (CSV streams, tokens)
│   │   ├── types/           # Request/Express types extensions
│   │   ├── utils/           # Custom AppError helper
│   │   └── validations/     # Creation and update validators
│   ├── Dockerfile           # Backend docker configuration
│   └── tsconfig.json        # Compiler parameters
├── frontend/                # Frontend SPA Client
│   ├── src/
│   │   ├── api/             # Axios client configurations
│   │   ├── components/      # Table, charts, sidebars, forms
│   │   ├── context/         # AuthSession & Theme contexts
│   │   ├── hooks/           # useDebounce and query wrappers
│   │   ├── layouts/         # Dashboard base side-nav layout
│   │   ├── pages/           # View panels (dashboard, login, forms, details)
│   │   └── types/           # Shared types
│   ├── Dockerfile           # Multi-stage nginx client build
│   ├── nginx.conf           # Single Page App routing overrides
│   └── tailwind.config.js   # Tailwinds compilation tokens
└── docker-compose.yml       # Orchestrated multi-container config
```

---

## ⚙️ Environment Configuration

Create `.env` files in both the `backend/` and `frontend/` folders.

### Backend (`backend/.env`)
```ini
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart_leads_db
JWT_SECRET=supersecret123_leads_crm
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```ini
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 Setup & Launch Guides

### Option 1: Running via Docker Compose (Recommended)
This spins up MongoDB, Backend, and Frontend containers simultaneously:
```bash
docker-compose up --build
```
*   **React Client:** `http://localhost:3000`
*   **Express API Server:** `http://localhost:5000`

### Option 2: Running Locally
Ensure MongoDB is running locally on `port 27017`.

1.  **Configure and Start Backend:**
    ```bash
    cd backend
    npm install
    npm run build
    npm start
    ```
2.  **Configure and Start Frontend:**
    ```bash
    cd ../frontend
    npm install
    npm run dev
    ```

---

## 📂 API Reference

### Authentication Routing
*   `POST /api/auth/register` - Registers a new user. Expects `name`, `email`, `password`, and optional `role` (Admin | Sales User).
*   `POST /api/auth/login` - Authenticates user. Returns JWT token.
*   `GET /api/auth/me` - Retrieves current logged-in user profile (requires Bearer Token).

### Leads Routing
*   `GET /api/leads` - Fetches paginated leads list. Supports parameters: `page`, `limit`, `search` (name/email), `status`, `source`, `sort` (newest/oldest/name-asc).
*   `POST /api/leads` - Creates a lead (requires Admin or Sales User).
*   `GET /api/leads/export` - Generates and streams matching filtered leads directory as a CSV download.
*   `GET /api/leads/:id` - Fetches single lead profile.
*   `PATCH /api/leads/:id` - Updates lead profile (requires Admin or Sales User).
*   `DELETE /api/leads/:id` - Deletes lead profile (requires **Admin** role privileges).
