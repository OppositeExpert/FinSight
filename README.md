# 📊 FinSight

**A comprehensive MERN-stack financial command center designed to track daily expenses, enforce budgets, and visualize long-term wealth growth.**

FinSight is a full-stack personal finance application built to bridge the gap between day-to-day cash-flow management and long-term investment tracking. It features a custom dark glassmorphism UI, real-time market data integration, and highly optimized database aggregation pipelines.

---

## ✨ Key Features

### 💰 Daily Cash-Flow & Budgeting
* **Smart Dashboard:** Log and categorize daily incomes and expenses with an intuitive interface.
* **Advanced Aggregation:** Utilizes MongoDB Aggregation Pipelines to crunch thousands of transactions into clean, month-over-month trend lines and a dynamic Daily Spend Heatmap.
* **Active Budgeting:** Set categorical spending limits. Progress bars dynamically shift to warning colors as expenditures approach user-defined thresholds.
* **Subscription Manager:** Track recurring monthly liabilities and billing cycles in an isolated view.

### 💎 Wealth & Investment Portfolio
* **Automated Data Integration:** Log purchases of assets like Bitcoin (BTC), Gold ETFs (GLD), and the Nifty 50 Index.
* **Live Market Sync:** Backend integrates directly with the `yahoo-finance2` API to pull real-time pricing and historical closing data.
* **Dynamic Currency Normalization:** Automatically fetches live `USDINR=X` exchange rates to mathematically normalize US-dollar assets into Indian Rupees (₹) on the fly.
* **Fault-Tolerant History Charts:** Features a robust "forward-fill" caching mechanism to guarantee smooth historical performance charts, preventing graphical drop-offs during weekends or market holidays.
* **Allocation Visuals:** Dynamic donut charts powered by Recharts that recalculate portfolio weightings instantly.

### 🔒 Security & Architecture
* **Tenant Isolation:** Fully protected RESTful API using custom JWT middleware. Users can only read and write data tied to their specific `ObjectId`.
* **Password Encryption:** Secure credential hashing using `bcryptjs`.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React.js (Vite for lightning-fast HMR)
* **Styling:** Custom CSS & Bootstrap (Dark Glassmorphism aesthetic)
* **Data Visualization:** Recharts (Interactive SVGs, Line Charts, Pie Charts)

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Market Data:** `yahoo-finance2`

### Database
* **Database:** MongoDB Atlas (NoSQL)
* **ODM:** Mongoose (Strict schema validation)

---

## 🚀 Installation & Local Setup

If you want to run FinSight locally, follow these steps:

### Prerequisites
* [Node.js](https://nodejs.org/) installed on your machine
* A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB instance)

### 1. Clone the Repository
```
git clone [https://github.com/YOUR_USERNAME/FinSight.git](https://github.com/YOUR_USERNAME/FinSight.git)
cd FinSight
```

###2. Backend Setup
```
cd backend
npm install
```
Create a .env file inside the backend directory with the following variables:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_super_secret_jwt_key
```
Start the backend server:
```
npm run dev
```

###3. Frontend Setup
Open a new terminal window/tab:
```
cd frontend
npm install
```
Start the Vite development server:
```
npm run dev
```
Navigate to http://localhost:5173 in your browser to view the app!

Developed as part of the Full Stack Web Development Tools Course, 6th Semester.
