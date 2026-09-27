# HIRFA (حِرفة) — The Arab World's On-Demand Skilled Trades Platform

> *"كل حرفة في إيدك" — Every craft at your fingertips*

[![Status](https://img.shields.io/badge/Status-MVP%20Build-orange)]()
[![Market](https://img.shields.io/badge/Market-Egypt%20%26%20MENA-blue)]()
[![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20Native%20%7C%20Next.js-green)]()

---

## 🎯 What is HIRFA?

**HIRFA** is Egypt's first full-stack, AI-powered marketplace connecting households with **verified skilled craftsmen** — plumbers, electricians, AC technicians, carpenters, painters, and more.

Think: **Uber for craftsmen**, built for Egypt and the Arab world.

| Metric | Value |
|--------|-------|
| Target Market | Egypt (108M people) + MENA (400M+) |
| Market Size | $10B+ Egypt informal home services |
| Launch | Cairo (Maadi, Heliopolis, New Cairo) |
| Business Model | 18% commission per completed job |

---

## 🏗️ Architecture Overview

```
hirfa/
├── backend/            # Node.js + Express + PostgreSQL + Redis + Socket.io
├── customer-app/       # Expo/React Native — Customer-facing app (iOS + Android)
├── craftsman-app/      # Expo/React Native — Craftsman-facing app (iOS + Android)
├── admin-dashboard/    # Next.js 14 — Operations team web dashboard
├── shared/
│   └── types/          # Shared TypeScript types & constants
├── docker-compose.yml  # Local dev environment (Postgres + Redis)
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js ≥ 20
- Docker + Docker Compose
- npm ≥ 10
- Expo CLI (`npm install -g expo-cli`)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/hirfa.git
cd hirfa
npm install --workspaces
```

### 2. Start Infrastructure (Database + Redis)

```bash
docker-compose up -d postgres redis
```

This starts:
- **PostgreSQL** at `localhost:5432` (auto-creates all tables + seeds 10 service categories)
- **Redis** at `localhost:6379`

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your API keys (see Environment Variables below)
npm run dev
```

Backend runs at: `http://localhost:3000`

### 4. Start Admin Dashboard

```bash
cd admin-dashboard
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:3000
npm run dev
```

Admin dashboard runs at: `http://localhost:3001`

### 5. Start Mobile Apps

```bash
# Customer App
cd customer-app
npx expo start

# Craftsman App (in another terminal)
cd craftsman-app
npx expo start --port 8082
```

---

## 🔑 Environment Variables

### Backend (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://hirfa_user:hirfa_password_dev@localhost:5432/hirfa_db

# Redis
REDIS_URL=redis://:hirfa_redis_dev@localhost:6379

# JWT (generate secure random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# FawryPay (get from developer.fawrystaging.com)
FAWRY_MERCHANT_CODE=your-merchant-code
FAWRY_SECURITY_KEY=your-security-key
FAWRY_BASE_URL=https://atfawry.fawrystaging.com  # staging

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Firebase (push notifications)
FIREBASE_SERVER_KEY=your-firebase-server-key

# Twilio SMS (for OTP)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# AWS S3 (profile photos)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=hirfa-uploads
AWS_REGION=eu-west-1
```

---

## 📱 Mobile Apps Setup

### Customer App Environment

Create `customer-app/.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your-google-maps-key
```

### Craftsman App Environment

Create `craftsman-app/.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your-google-maps-key
```

---

## 🗄️ Database Schema

The database is **auto-initialized** on first backend start. Tables created:

| Table | Description |
|-------|-------------|
| `users` | All users (customers, craftsmen, admins) |
| `craftsman_profiles` | Extended craftsman data (rating, location, wallet) |
| `craftsman_skills` | Skills per craftsman |
| `service_categories` | 10 HIRFA service types (plumbing, electrical, etc.) |
| `addresses` | Customer delivery addresses with GPS coords |
| `bookings` | Job bookings (full lifecycle) |
| `payments` | Payment records (Fawry, cash, etc.) |
| `reviews` | Post-job ratings and reviews |
| `otp_codes` | OTP verification codes |
| `notifications` | In-app notifications |

---

## 🔌 API Endpoints Summary

### Authentication
```
POST /api/auth/send-otp          Send OTP to phone
POST /api/auth/verify-otp        Verify OTP → get JWT tokens
POST /api/auth/refresh-token     Refresh access token
POST /api/auth/logout            Logout
GET  /api/auth/me                Get current user
```

### Services
```
GET /api/services                List all 10 service categories
GET /api/services/:id            Service details
GET /api/services/:id/craftsmen  Nearby craftsmen for service (lat/lng required)
```

### Bookings
```
POST /api/bookings               Create booking (customer)
GET  /api/bookings               List my bookings
GET  /api/bookings/:id           Booking details
PUT  /api/bookings/:id/accept    Craftsman accepts
PUT  /api/bookings/:id/start     Craftsman starts job
PUT  /api/bookings/:id/complete  Craftsman completes job
PUT  /api/bookings/:id/cancel    Cancel booking
PUT  /api/bookings/:id/rate      Customer rates booking
```

### Craftsmen
```
GET  /api/craftsmen/profile      Get own profile
PUT  /api/craftsmen/profile      Update profile & skills
PUT  /api/craftsmen/availability Toggle available on/off
PUT  /api/craftsmen/location     Update GPS location
GET  /api/craftsmen/earnings     Earnings summary
GET  /api/craftsmen/jobs         Job history
```

### Payments
```
POST /api/payments/initiate/:id  Initiate Fawry payment
POST /api/payments/webhook       FawryPay callback
GET  /api/payments/:bookingId    Payment status
POST /api/payments/cash-confirm  Confirm cash received
```

### Admin (requires admin role)
```
GET  /api/admin/dashboard        Stats overview
GET  /api/admin/users            Users list (paginated)
GET  /api/admin/craftsmen        Craftsmen list
PUT  /api/admin/craftsmen/:id/verify  Approve craftsman
GET  /api/admin/bookings         All bookings
GET  /api/admin/revenue          Revenue report
```

---

## ⚡ Real-time Events (Socket.io)

| Event | Direction | Payload |
|-------|-----------|---------|
| `new_job_request` | Server → Craftsman | Job details + distance |
| `booking_accepted` | Server → Customer | Craftsman info |
| `booking_status_changed` | Server → Both | New status + message |
| `craftsman_location_update` | Server → Customer | lat/lng + ETA |
| `booking_completed` | Server → Customer | Final price |

---

## 💳 Payment Flow

```
1. Customer selects payment method (Cash / Fawry / Vodafone Cash)
2. For DIGITAL: POST /api/payments/initiate/:bookingId
   → Returns FawryPay redirect URL
   → Customer completes payment on Fawry
   → FawryPay calls webhook → payment marked 'paid'
3. For CASH: Craftsman confirms cash received after job
   → POST /api/payments/cash-confirm/:bookingId
4. Platform automatically deducts 18% commission
5. Craftsman earnings credited to wallet
6. Weekly batch payout to craftsman bank account
```

---

## 🧪 Testing the API

```bash
# Install Bruno (free API client) or use Postman

# 1. Send OTP
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "01012345678"}'

# 2. Verify OTP (use 123456 in development mode)
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "01012345678", "code": "123456", "name": "Test User"}'

# 3. List services (with token from step 2)
curl http://localhost:3000/api/services \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Business Metrics Dashboard

The admin dashboard (`/admin`) tracks:
- **North Star**: Weekly Completed Jobs
- **GMV**: Total transaction volume (EGP)
- **Net Revenue**: GMV × 18% commission
- **Active Craftsmen**: Craftsmen with ≥1 job this week
- **NPS**: Net Promoter Score from reviews

---

## 🗺️ Roadmap

### Sprint 1 (Current) — MVP ✅
- [x] Backend API (Node.js + PostgreSQL + Redis)
- [x] Customer App (React Native + Expo)
- [x] Craftsman App (React Native + Expo)
- [x] Admin Dashboard (Next.js 14)
- [x] Shared types package
- [x] Docker development environment

### Sprint 2 — Real-time & Payments
- [ ] Real-time GPS tracking on customer booking screen
- [ ] In-app chat (customer ↔ craftsman)
- [ ] FawryPay production integration
- [ ] FCM push notifications (production)
- [ ] SMS OTP via Twilio (production)

### Sprint 3 — Quality & Operations
- [ ] AI price suggestion engine
- [ ] Craftsman verification photo upload
- [ ] Advanced admin analytics
- [ ] Automated weekly payouts

### Phase 2 — Scale
- [ ] Subscription plans for craftsmen
- [ ] B2B compound/hotel accounts
- [ ] Saudi Arabia localization (SAR currency)
- [ ] Arabic voice search

---

## 🤝 Team

| Role | Responsibility |
|------|---------------|
| **CEO / CPO** | Product vision, GTM, investor relations |
| **CTO** | Technical architecture, engineering team |
| **COO** | Craftsman operations, city expansion |
| **CFO** | Financial model, unit economics |

---

## 📞 Contact

- **Email**: team@hirfa.app
- **Website**: https://hirfa.app
- **Investors**: invest@hirfa.app

---

*Built with ❤️ in Cairo, Egypt 🇪🇬 — Scaling to the Arab World 🌍*
