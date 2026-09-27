# HIRFA Backend

This is the Node.js / Express backend for the HIRFA platform (Uber-for-craftsmen in Egypt). 

## Tech Stack
- Node.js & Express
- TypeScript
- PostgreSQL (pg)
- Redis (ioredis)
- Socket.IO
- JWT Authentication

## Setup

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Environment Configuration**
   Copy \`.env.example\` to \`.env\` and update the variables (especially \`DATABASE_URL\` and \`REDIS_URL\`).

3. **Start the Application**
   For development with hot-reloading:
   \`\`\`bash
   npm run dev
   \`\`\`
   
   To build for production:
   \`\`\`bash
   npm run build
   npm start
   \`\`\`

   *Note: On the first run, the system will automatically initialize the database schema and seed the initial service categories.*

## API Endpoints

### Auth
- \`POST /api/auth/send-otp\`
- \`POST /api/auth/verify-otp\`
- \`POST /api/auth/refresh-token\`
- \`GET /api/auth/me\`

### Services
- \`GET /api/services\`
- \`GET /api/services/:id\`
- \`GET /api/services/:id/craftsmen?lat=&lng=\`

### Bookings
- \`POST /api/bookings\`
- \`GET /api/bookings\`
- \`GET /api/bookings/:id\`
- \`PUT /api/bookings/:id/accept\`
- \`PUT /api/bookings/:id/start\`
- \`PUT /api/bookings/:id/complete\`
- \`PUT /api/bookings/:id/cancel\`
- \`PUT /api/bookings/:id/rate\`

### Craftsmen
- \`GET /api/craftsmen/profile\`
- \`PUT /api/craftsmen/profile\`
- \`PUT /api/craftsmen/availability\`
- \`PUT /api/craftsmen/location\`
- \`GET /api/craftsmen/earnings\`
- \`GET /api/craftsmen/jobs\`

### Users
- \`GET /api/users/profile\`
- \`PUT /api/users/profile\`
- \`GET /api/users/addresses\`
- \`POST /api/users/addresses\`
- \`PUT /api/users/addresses/:id\`
- \`DELETE /api/users/addresses/:id\`
- \`GET /api/users/notifications\`
- \`PUT /api/users/notifications/read-all\`

### Payments
- \`POST /api/payments/initiate/:bookingId\`
- \`POST /api/payments/webhook\`
- \`GET /api/payments/:bookingId\`
- \`POST /api/payments/cash-confirm/:bookingId\`

### Admin
- \`GET /api/admin/dashboard\`
- \`GET /api/admin/users\`
- \`GET /api/admin/craftsmen\`
- \`PUT /api/admin/craftsmen/:id/verify\`
- \`GET /api/admin/bookings\`
- \`GET /api/admin/bookings/:id\`
- \`PUT /api/admin/bookings/:id/dispute\`
- \`GET /api/admin/revenue\`

## Socket.io Events
- **craftsman_location_update**: Client -> Server (broadcasts to booking room)
- **new_job_request**: Server -> Craftsmen in area
- **booking_accepted**: Server -> Customer
- **booking_status_changed**: Server -> Room
- **booking_completed**: Server -> Room
