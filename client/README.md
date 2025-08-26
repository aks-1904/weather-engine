# ⚓ Maritime Weather Engine – Frontend

A **real-time maritime fleet management and weather alert interface** built with **React (Vite), TypeScript, TailwindCSS**.
This frontend provides an interactive dashboard for **Captains** and **Analysts** to monitor voyages, manage vessels, and receive **real-time weather alerts**.

---

## 📖 Project Overview

The **Maritime Weather Engine Frontend** enables:

* 🔐 **Authentication & Role-based UI** → Separate dashboards for Captains and Analysts.
* 🚢 **Fleet & Voyage Management** → Manage vessels, voyages, and captain assignments (Analyst only).
* 🌤️ **Weather Dashboard** → Real-time & forecasted weather visualization using interactive maps.
* ⚡ **Real-time Alerts** → Captains receive proactive weather alerts via **Socket.IO integration**.
* 🎨 **Modern UI** → Built with TailwindCSS, and responsive layouts.

---

## 📂 Folder Structure

```
client
├── public/            # Static assets
├── src/
│   ├── assets/        # Images, icons, etc.
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Helper libraries
│   ├── pages/         # Page-level components (Dashboard, Login, Alerts, etc.)
│   ├── protectedRoutes/ # Role-based route guards
│   ├── types/         # TypeScript interfaces & types
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Main app component
│   ├── main.tsx       # App entry point
│   └── vite-env.d.ts  # Vite environment definitions
├── .env               # Environment variables
├── index.html         # Root HTML
├── package.json       # Dependencies & scripts
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/aks-1904/weather-engine
cd client
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:8080
```

### 4️⃣ Run the Development Server

```bash
npm run dev
```

The app will be available at:
**[http://localhost:5173](http://localhost:5173)**

### 5️⃣ Build for Production

```bash
npm run build
npm run preview
```

---

## 🛠️ Key Features & Screens

### 1. Authentication & Role-based Access

* **Login/Register** using JWT from backend
* **Captain Dashboard** → Weather alerts & voyage status
* **Analyst Dashboard** → Manage vessels, voyages & captains

### 2. Real-time Weather Alerts

* Uses **Socket.IO** for live alert updates
* Alerts are categorized by severity: info, warning, critical, emergency

### 3. Fleet Management (Analyst only)

* Add/Edit/Delete vessels
* Assign captains to vessels
* Monitor voyage routes and weather risks

---

## 🚀 API Integration

This frontend communicates with the **Maritime Weather Engine Backend** via REST and WebSocket:

* **Auth:** `/api/auth/*`
* **Vessels:** `/api/vessels/*`
* **Voyages:** `/api/voyages/*`
* **Weather:** `/api/weather/*`
* **Alerts:** `/api/alerts/*`
* **Sockets:** `new-alert`, `update-location`, `join-room`

---

## 🛠️ Tech Stack

* **Framework:** React (Vite) + TypeScript
* **Styling:** TailwindCSS + ShadCN UI
* **State Management:** React Query / Context API (depending on your implementation)
* **Real-time:** Socket.IO Client
* **Routing:** React Router v6

---

## 📎 Useful Links

* [Vite Documentation](https://vitejs.dev/)
* [React Docs](https://react.dev/)
* [TailwindCSS](https://tailwindcss.com/)
* [Socket.IO Client](https://socket.io/docs/v4/client-api/)
