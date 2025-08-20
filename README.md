# ⚓ Maritime Weather Engine - Fullstack Project

This project is a **full-stack maritime weather engine** designed to assist fleet analysts and captains with real-time weather forecasts, voyage management, and critical alerts.  
It combines a modern **React (Vite + TypeScript)** frontend with a **Node.js (Express + TypeScript, MySQL, Redis, Socket.IO)** backend.

---

## 🚀 Tech Stack

### [Client](./client)

- **React** (with Vite)
- **TypeScript**
- **TailwindCSS** for styling
- **Redux Toolkit** for state management
- **Axios** for API communication
- **React Redux** for state management

### [Server](./server)

- **Node.js** with **Express**
- **TypeScript**
- **MySQL** for persistent storage
- **Redis** for caching weather data
- **Socket.IO** for real-time alerts
- **JWT Authentication** (Captain & Analyst roles)
- **Stormglass API** for weather data

---

## 📂 Project Structure
```

root
├── client # Frontend (React + Vite + TypeScript)
└── server # Backend (Node.js + ExpressJS + MySQL + Redis)

```

Each folder (`client/`, `server/`) has its own **README.md** with setup instructions and detailed architecture.

---

## 🛠️ Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/aks-1904/weather-engine
cd weather-engine
```

### 2. Install Dependencies

- **Client**

  ```bash
  cd client
  npm install
  ```

- **Server**

  ```bash
  cd server
  npm install
  ```

### 3. Environment Variables

- Client may need API base URLs.
- Server requires `.env` with database and API keys.

---

## 🌊 Features

- **Secure Authentication** (JWT, Captain vs Analyst roles)
- **Fleet Management** (Add vessels, assign captains, manage voyages)
- **Weather Forecasting** (real-time & 10-day forecast from Stormglass)
- **Redis Caching** for performance
- **Real-Time Alerts** with Socket.IO
- **Optimal Speed Calculation** for captains based on weather

---

## 📌 Navigation

- [Frontend - Client](./client) → React (Vite + TS) implementation details
- [Backend - Server](./server) → Express (TS), MySQL, Redis, Socket.IO, Weather Engine

---

