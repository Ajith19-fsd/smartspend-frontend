# 💰 SmartSpend – Frontend (ReactJS)

SmartSpend Frontend is a modern React application for managing daily expenses with authentication, budgeting alerts, charts, and downloadable reports. It communicates with a Spring Boot backend using REST APIs.

---

## 🎯 Features

### 🔐 Authentication
- Signup & Login using JWT  
- **OTP Verification only in Production (Netlify Deployment)**  
- **OTP is NOT needed when the project is running on localhost**  
- Password Reset using Email OTP

### 💸 Expense Management
- Create, Edit, Delete & Filter Transactions  
- Category-Based Budgets  
- Budget Exceed Alerts  

### 📊 Dashboard & Reports
- Graph Analytics (Recharts)  
- Downloadable Reports:
  - 📄 PDF Report  
  - 📊 Excel Report  

### 🔔 Real-Time Notifications
- Budget Alerts via WebSocket  

---

## 🖥️ Run Locally (Development Mode)

### 📦 Install Dependencies
```bash
npm install
