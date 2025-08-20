# ⚓ Maritime Weather Engine

A **real-time maritime weather monitoring and alerting system** built with **Node.js, TypeScript, Express, MySQL, and Redis**.  
This backend powers fleet management, voyage planning, weather data processing, and **real-time alerts** for captains and analysts.

---

## 📖 Project Overview

The **Maritime Weather Engine** provides:

- 🔐 **Authentication & RBAC** → Secure login with JWT and role-based access for Captains and Analysts.
- 🚢 **Fleet Management** → Analysts can manage vessels, voyages, and assignments.
- 🌤️ **Weather Engine** → Fetches real-time and forecasted weather data using **Stormglass API** with **Redis caching** for optimization.
- ⚡ **Real-time Alerts** → Captains receive proactive weather alerts via **Socket.IO**.
- 🗄️ **Scalable Architecture** → Modular design with controllers, services, routes, and middleware.

---

## 📂 Folder Structure

```
src
├── config/         # Configuration files (DB, Redis, Socket, Weather API)
├── controllers/    # Route controllers
├── middlewares/    # Authentication & request limiting
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript type definitions
├── utils/          # Helper utilities
├── server.ts       # Entry point
└── tsconfig.json   # TypeScript config
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/aks-1904/weather-engine
cd weather-engine
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Application
PORT=8080
FRONTEND_URL=http://localhost:5173  # Default for React (Vite)
JWT_SECRET=your_jwt_secret
DEMO=true

# MySQL credentials
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=maritime_weather

# Redis
REDIS_URL=redis://localhost:6379

# Stormglass API
STORMGLASS_API_KEY=your_api_key_here
```

### 4️⃣ Setup MySQL Database

Run SQL scripts to create necessary tables (`users`, `vessels`, `voyages`, `alerts`).

```bash
mysql -u root -p < db/schema.sql
```

### 5️⃣ Run the Server

Development mode (with auto-reload):

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

---

## 🛠️ Database Schema & Relations

Below are the tables used in the **Maritime Weather Engine** along with their SQL structure and descriptions.

### 1. Users Table

Stores user login credentials and roles.  
Roles: `captain` or `analyst`.

```sql
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('captain','analyst') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 2. Vessels Table

Stores vessel details with optional assigned captain.

```sql
CREATE TABLE IF NOT EXISTS vessels (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    imo_number INT NOT NULL UNIQUE,
    captain_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (captain_id) REFERENCES users(id) ON DELETE SET NULL
);
```

---

### 3. Voyages Table

Stores voyage plans for vessels, including status and waypoints.

```sql
CREATE TABLE IF NOT EXISTS voyages (
    id VARCHAR(255) PRIMARY KEY,
    vessel_id VARCHAR(255) NOT NULL,
    status ENUM('planned','active','completed') NOT NULL DEFAULT 'planned',
    origin_port VARCHAR(255) NOT NULL,
    destination_port VARCHAR(255) NOT NULL,
    etd TIMESTAMP NULL,
    eta TIMESTAMP NULL,
    route_waypoints TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE
);
```

---

### 4. Alerts Table

Stores system-generated alerts linked to voyages.  
Includes severity, category, recommendations, and weather data.

```sql
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(255) PRIMARY KEY,
    voyage_id VARCHAR(255) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    severity ENUM('info','warning','critical','emergency') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    priority INT DEFAULT 5,
    category VARCHAR(50) DEFAULT 'general',
    recommendations JSON NULL,
    weather_data JSON NULL,
    FOREIGN KEY (voyage_id) REFERENCES voyages(id) ON DELETE CASCADE
);
```

---

## 🚀 API Endpoints

### Authentication

- `POST /api/auth/register` → Register new user and get JWT
- `POST /api/auth/login` → Login and get JWT

### Vessels (Analyst only)

- `POST /api/vessels` → Create vessel
- `GET /api/vessels` → Get all vessels
- `GET /api/vessels/:id` → Get vessel by ID
- `PATCH /api/vessels/:id` → Update vessel
- `DELETE /api/vessels/:id` → Delete vessel

### Voyages (Analyst only)

- `POST /api/voyages` → Create voyage
- `PATCH /api/vessels/:id/assign-captain` → Assign captain

### Weather (Captain & Analyst)

- `GET /api/weather/realtime?lat=...&lon=...`
- `GET /api/weather/forecast?lat=...&lon=...`
- `GET /api/weather/optimal-speed?lat=...&lon=...`

### Alerts (Real-time with Socket.IO)

- `POST /api/alert/` → Create new alert, use by analyst
- `GET /api/alert?voyage_id=...&severity=...&page=...&limit=...` → Get required alerts
- `GET /api/alert/:id` → Get specific alert
- `GET /api/alert/stats/summary` → Give summary of alerts
- `GET /api/alerts/:voyage_id/recent` → Provide recent alerts (last 10 days)

#### Socket events to notify captain
- Socket event: `new-alert` → Received by Captain
- Socket event: `update-location` → Update Captain location and check weather, trigger `new-alert` if weather is not favourable.
- Socket event: `join-room` → Make captain able to join the private room to get alerts

---

## 📡 Sample API Requests & Responses

- **[Authentication](./src/routes/auth.routes.ts)** For authenticating users
- **[Vessels](./src/routes/vessel.route.ts)** `CRUD` operations for vessels
- **[Voyages](./src/routes/voyage.routes.ts)** `CRUD` operations for voygaes
- **[Weather](./src/routes/weather.route.ts)** Get weather details
- **[Alerts](./src/routes/alert.routes.ts)** Operations for creating and fetching alerts

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: MySQL (with `mysql2`)
- **Cache**: Redis
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.IO
- **External API**: Stormglass (Weather Data)

---

## 📎 Useful Links

- [Stormglass Weather API](https://stormglass.io/)
- [Express.js Documentation](https://expressjs.com/)
- [Socket.IO Docs](https://socket.io/)
- [Redis Docs](https://redis.io/docs/)
- [MySQL Docs](https://dev.mysql.com/doc/)

---

## 👥 Authors

- **Akshay Sharma** – Backend Developer
