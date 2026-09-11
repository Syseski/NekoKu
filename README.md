# 🐾 NekoKu (猫ク) — Specialty Cat Care & Nutrition Platform

> **"Loves Every Meow"** — Premium veterinary-grade cat diets, personalized feline health management, and e-commerce platform.

---

## 🌟 Key Features

### 🛒 Customer Storefront
- **Personalized Feline Nutrition**: Register your cat profiles (Kitten, Adult, Senior) and dietary health concerns (Urinary care, hairball control, sensitive digestion, renal support, weight management).
- **Smart Recommendations**: Dynamic real-time matching engine recommending veterinary and life-stage diets tailored to each cat.
- **Interactive Catalog & Smart Filters**: Instant filtering across categories, age brackets, and clinical nutrition tags.
- **Cart & Simulated Checkout**: Slide-over cart drawer with instant order simulation and item tracking.

### 🛡️ Admin Control Center (`/admin`)
- **1. Overview Dashboard**: Real-time sales KPIs, active orders count, weekly revenue trends, and quick order fulfillment table.
- **2. Product Management (CRUD)**: Create, edit, delete, and quick-adjust inventory levels.
- **3. Order Management Pipeline**: Manage fulfillment statuses (`PENDING_PAYMENT`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`).
- **4. Category Management**: Organize products into feline nutrition and care categories.
- **5. User & Cat Profiles Review**: View registered cat parents and their personalized feline health profiles.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Zustand
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, JWT Authentication, Zod
- **Database**: PostgreSQL 16 (Docker)
- **Monorepo**: npm workspaces (`apps/web`, `apps/api`)

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Docker](https://www.docker.com/) & Docker Compose

### 2. Setup Environment
```bash
# Clone the repository
git clone https://github.com/your-username/NekoKu.git
cd NekoKu

# Install dependencies across workspaces
npm install

# Copy environment template
cp .env.example .env
```

### 3. Start Database & Seed Data
```bash
# Start PostgreSQL database container
docker compose up -d

# Run Prisma migrations & database seeder
npm run prisma:migrate
npm run prisma:seed
```

### 4. Run Development Servers
```bash
npm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:5001/api/v1](http://localhost:5001/api/v1)
- **Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)

---

## 🔑 Default Accounts (Seeded)

- **Admin Account**:
  - Email: `admin@nekoku.my`
  - Password: `admin12345`
- **Customer Account**:
  - Email: `customer@nekoku.my`
  - Password: `customer12345`

---

## 📄 License
MIT © 2026 NekoKu
