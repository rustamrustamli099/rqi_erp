# 🚀 RQI ERP

**RQI ERP** is a next-generation Enterprise Resource Planning system designed for modern businesses. Built with a robust monolithic architecture, it delivers SAP-grade capabilities with the agility of a modern SaaS platform.

## 🌟 Key Features

### 🌍 Global Admin Panel (Platform Owner)
- **Multi-Tenancy**: Limitless tenant provisioning with isolated data scopes.
- **Billing & Subscriptions**: Integrated Stripe/PayPal gateways for SaaS monetization.
- **System Health**: Real-time metrics, audit logs, and security monitoring.

### 🏢 Tenant Workspace (Business Operations)
- **HR & Payroll (SuccessFactors Style)**:
  - Complex Organizational Charts.
  - Automated Payroll Engine with formula support.
  - Shift Planning & Attendance Tracking.
- **Finance (FICO)**:
  - General Ledger & Chart of Accounts.
  - Accounts Payable/Receivable automation.
- **Supply Chain (SCM)**:
  - Multi-warehouse inventory management.
  - Procurement workflows (RFQ -> PO -> GRN).

## 🛠️ Technology Stack

- **Backend**: NestJS, Prisma ORM, SQLite/PostgreSQL.
- **Frontend**: React (Vite), TailwindCSS, Shadcn UI.
- **Infrastructure**: Docker, GitHub Actions CI/CD.

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- npm v10+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rqi-org/rqi-erp.git
   ```

2. **Install Dependencies**
   ```bash
   # Server
   cd server
   npm install
   npx prisma generate
   
   # Client
   cd ../client
   npm install
   ```

3. **Database Setup**
   ```bash
   cd server
   npx prisma db push
   npx prisma db seed
   ```

4. **Run Development Mode**
   ```bash
   # Terminal 1 (Server)
   cd server
   npm run start:dev
   
   # Terminal 2 (Client)
   cd client
   npm run dev
   ```

## 📜 License
Private & Confidential.
