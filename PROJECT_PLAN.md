# Salon POS System - Project Plan

**Project Duration:** 1-3 months (ASAP)
**Team:** Solo Developer
**Tech Stack:** Vue.js 3 (Composition API) + Pinia | Express.js | MySQL (Hostinger VPS)
**Platform:** Web-only (Responsive)
**Target:** Single location (Multi-location ready architecture)

---

## 🎯 Project Overview

Develop a comprehensive Salon Point-of-Sale (POS) system built for daily salon operations including service management, employee task tracking, Commission calculations, inventory management, and financial reporting.

### Key Principles

- **Security First:** JWT authentication, audit logs, role-based access
- **Scalability:** Designed for single location now, multi-location support in Phase 3
- **Data Integrity:** Soft deletes, locked records, immutable audit trails
- **Solo Dev Optimization:** Clear architecture, minimal external APIs initially

---

## 📋 Phase Breakdown

### **PHASE 1: Core Operations MVP (4-5 weeks)**

**Goal:** Get the salon running with essential daily operations

#### 1.1 Project Setup (3-4 days)

- [ ] Initialize Git repository with `.gitignore`
- [ ] Frontend: Vue 3 + Vite + Pinia + PrimeVue setup
- [ ] Backend: Express.js + JWT auth middleware + CORS
- [ ] Database: MySQL schema design & migrations
- [ ] API structure: RESTful endpoints planning
- [ ] Environment config (.env setup)
- [ ] Development server setup & testing tools

#### 1.2 Database Design & Schema (3-4 days)

**Tables:**

- `users` (id, name, email, phone, password_hash, role, status, created_at)
- `roles` (id, role_name, permissions_json)
- `services` (id, name, category, duration, base_price, commission_type, commission_value)
- `employees` (id, user_id, salary_type, bank_details, status)
- `tasks` (id, employee_id, customer_id, service_id, start_time, end_time, status, notes, price, created_by)
- `task_products` (id, task_id, product_id, quantity_used)
- `customers` (id, phone, name, notes, preferred_employee_id, created_at)
- `commission_rules` (id, service_id, % commission, fixed_amount, after_discount)
- `audit_logs` (id, user_id, table_name, action, old_data, new_data, timestamp)
- `system_settings` (key, value, updated_by, updated_at)

#### 1.3 Authentication & Authorization (5-6 days)

**Backend:**

- [ ] User registration (Admin only)
- [ ] Login with JWT token generation
- [ ] Refresh token mechanism
- [ ] Password hashing (bcrypt)
- [ ] Role-based middleware
- [ ] Logout functionality

**Frontend:**

- [ ] Login page (responsive design)
- [ ] Token storage (localStorage with httpOnly cookies fallback)
- [ ] Protected routes & redirects
- [ ] Session timeout handling
- [ ] "Remember me" (optional)

#### 1.4 User & Role Management (4-5 days)

**Admin Features:**

- [ ] Dashboard overview
- [ ] Employee list (Create/Edit/Disable)
- [ ] Role assignment (Admin/Employee)
- [ ] View all system data access
- [ ] Settings panel for other configurations

**Backend:**

- [ ] CRUD endpoints: `/api/users` `/api/users/:id`
- [ ] Role assignment endpoint
- [ ] User status management
- [ ] Validation rules

**Frontend:**

- [ ] Employee management table
- [ ] Create/Edit employee modal
- [ ] Disable employee with confirmation
- [ ] Admin dashboard layout

#### 1.5 Service Management (4-5 days)

**Features:**

- [ ] Create service categories (Hair, Makeup, Facial, etc.)
- [ ] Add/Edit/Disable services
- [ ] Set: price, duration, commission rule
- [ ] Attach optional products to service
- [ ] Create service packages/combos

**Backend:**

- [ ] CRUD: `/api/services`, `/api/categories`
- [ ] Service packages endpoint
- [ ] Validation & duplicate checks

**Frontend:**

- [ ] Service category list & management
- [ ] Service CRUD interface
- [ ] Service package builder
- [ ] Pricing & duration configuration

#### 1.6 Employee Task Management (6-7 days)

**Employee Dashboard:**

- [ ] Add new task form
  - [ ] Select service
  - [ ] Select/add customer
  - [ ] Add notes, products used
  - [ ] Set start/end time
- [ ] Mark task: In Progress / Completed / Cancelled
- [ ] View today's tasks
- [ ] Task history with filters
- [ ] Performance summary (services completed, revenue generated)

**Admin Dashboard:**

- [ ] View all employee tasks
- [ ] Filter by: date, employee, service
- [ ] Task productivity reports
- [ ] Lock past records (24hr auto-lock)
- [ ] Edit task capability

**Backend:**

- [ ] POST `/api/tasks` (create)
- [ ] GET `/api/tasks` (list with filters)
- [ ] PATCH `/api/tasks/:id` (update status/details)
- [ ] GET `/api/tasks/:id/performance` (employee stats)
- [ ] Lock mechanism (immutable after 24hrs)

**Frontend:**

- [ ] Task creation form (multi-step)
- [ ] Task list with status badges
- [ ] Task history/filter view
- [ ] Employee dashboard widgets
- [ ] Admin task management panel

#### 1.7 Commission Management (4-5 days)

**Rules Engine:**

- [ ] Commission per service (% or fixed)
- [ ] After-discount toggle
- [ ] Auto-calculation on task completion

**Reporting:**

- [ ] Monthly commission report
- [ ] Employee earnings summary
- [ ] Commission breakdown by service

**Backend:**

- [ ] Commission calculation logic
- [ ] GET `/api/commissions/:employee_id/:month`
- [ ] Commission report generation

**Frontend:**

- [ ] Commission summary widget
- [ ] Monthly commission report
- [ ] Employee earnings view

#### 1.8 Reports & Analytics (5-6 days)

**Sales Reports:**

- [ ] Daily sales summary
- [ ] Monthly sales overview
- [ ] Payment method breakdown
- [ ] Tax report (if applicable)

**Employee Reports:**

- [ ] Services completed (individual & total)
- [ ] Revenue generated per employee
- [ ] Commission earned report

**Service Reports:**

- [ ] Most popular services
- [ ] Revenue by service
- [ ] Service duration analytics

**Backend:**

- [ ] GET `/api/reports/sales?date_range=...`
- [ ] GET `/api/reports/employees?month=...`
- [ ] GET `/api/reports/services?date_range=...`

**Frontend:**

- [ ] Reports dashboard
- [ ] Date range filters
- [ ] Export to PDF/CSV
- [ ] Chart visualizations (Chart.js or PrimeVue charts)

#### 1.9 Security & Controls (4-5 days)

- [ ] Role-based access control (RBAC) enforcement
- [ ] Audit logging middleware (who, what, when, why)
- [ ] Auto-lock past data (can't edit after 24 hours)
- [ ] Soft delete implementation (is_deleted flag)
- [ ] Manual backup scripts
- [ ] Input validation & XSS protection
- [ ] SQL injection prevention (parameterized queries)
- [ ] Rate limiting on login/API endpoints

#### 1.10 UI/UX & Polish (3-4 days)

- [ ] Responsive design across devices
- [ ] Loading states & error messages
- [ ] Toast notifications
- [ ] Confirmation modals for critical actions
- [ ] Mobile-friendly navigation
- [ ] Accessibility (ARIA labels, keyboard nav)

**Phase 1 Estimated Timeline:** 4-5 weeks (42-35 days)

---

### **PHASE 2: POS & Inventory Management (3-4 weeks)**

**Goal:** Add billing system and inventory tracking

#### 2.1 POS & Billing System (5-6 days)

**Invoice Management:**

- [ ] Invoice creation interface
- [ ] Add services & retail products to invoice
- [ ] Discount handling (flat / percentage)
- [ ] GST/Tax calculation
- [ ] Auto invoice numbering
- [ ] Print invoice
- [ ] Download invoice (PDF)
- [ ] Refund/Return management
- [ ] Void invoice (with reason logging)
- [ ] Daily closing summary

**Backend:**

- [ ] POST `/api/invoices` (create)
- [ ] GET `/api/invoices` (list & filter)
- [ ] PATCH `/api/invoices/:id/void`
- [ ] POST `/api/invoices/:id/refund`
- [ ] GET `/api/invoices/daily-summary`
- [ ] Invoice number generation algorithm

**Frontend:**

- [ ] Invoice builder interface
- [ ] Item search & quick-add
- [ ] Real-time total calculations
- [ ] Print preview
- [ ] Payment method selector
- [ ] Invoice history/repeat orders

#### 2.2 Batch-Wise Inventory Management (6-7 days)

**Product Setup:**

- [ ] Add product
- [ ] Product categories
- [ ] Unit types (ml, gm, pcs)
- [ ] Supplier management

**Batch Entry & Tracking:**

- [ ] Batch number
- [ ] Purchase date & expiry date
- [ ] Cost price & selling price
- [ ] Quantity
- [ ] FIFO auto-deduction logic

**Inventory Operations:**

- [ ] Purchase entry
- [ ] Auto-deduct on service completion
- [ ] Auto-deduct on retail sale
- [ ] Wastage entry
- [ ] Stock adjustment
- [ ] Low stock alerts
- [ ] Expiry alerts

**Backend:**

- [ ] CRUD: `/api/products`, `/api/batches`
- [ ] POST `/api/inventory/purchase`
- [ ] PATCH `/api/inventory/:batch_id/deduct` (FIFO logic)
- [ ] GET `/api/inventory/alerts` (low stock, expiry)
- [ ] Inventory movement history

**Frontend:**

- [ ] Product & batch management
- [ ] Stock level dashboard
- [ ] Alert notifications
- [ ] Quick inventory adjustments
- [ ] Purchase entry form

#### 2.3 Inventory Reports (3-4 days)

- [ ] Stock report (current levels by batch)
- [ ] Batch report (all batches with details)
- [ ] Expiry report (upcoming expirations)
- [ ] Purchase report
- [ ] Stock usage report (daily/monthly)

**Backend:**

- [ ] GET `/api/reports/inventory/stock`
- [ ] GET `/api/reports/inventory/batch-details`
- [ ] GET `/api/reports/inventory/expiry-alerts`
- [ ] GET `/api/reports/inventory/usage?date_range=...`

**Frontend:**

- [ ] Dedicated inventory reports section
- [ ] Export functionality

#### 2.4 Expense Management (4-5 days)

**Features:**

- [ ] Add expense
- [ ] Expense categories
- [ ] Attach bill/receipt
- [ ] Daily/monthly expense reports
- [ ] Profit calculation (Revenue - Expense)

**Backend:**

- [ ] CRUD: `/api/expenses`
- [ ] POST `/api/expenses` (with file upload)
- [ ] GET `/api/reports/expenses?date_range=...`
- [ ] GET `/api/dashboard/profit-summary`

**Frontend:**

- [ ] Expense entry form
- [ ] Receipt upload
- [ ] Expense list with category filter
- [ ] Profit & loss widget

**Phase 2 Estimated Timeline:** 3-4 weeks (21-28 days)

---

### **PHASE 3: Customer Management & Multi-Location (2-3 weeks)**

**Goal:** Customer relationship management and multi-location foundation

#### 3.1 Customer Management (5-6 days)

- [ ] Add/Edit customer
- [ ] Phone number validation
- [ ] Visit history
- [ ] Services history
- [ ] Total spending tracking
- [ ] Notes & preferences
- [ ] Preferred employee
- [ ] Basic customer reports

**Backend:**

- [ ] CRUD: `/api/customers`
- [ ] GET `/api/customers/:id/history`
- [ ] GET `/api/reports/customers?sort_by=spending`

**Frontend:**

- [ ] Customer form with validation
- [ ] Customer profile view
- [ ] Quick customer search
- [ ] Loyalty tracking dashboard

#### 3.2 Customer Reports & Analytics (3-4 days)

- [ ] Top customers by spending
- [ ] Repeat customer rate
- [ ] Customer lifetime value
- [ ] Service preferences

#### 3.3 Multi-Location Architecture Prep (3-4 days)

**Backend Refactoring:**

- [ ] Add `location_id` to relevant tables
- [ ] Branch/location table structure
- [ ] Data isolation strategies
- [ ] API versioning consideration

**Frontend:**

- [ ] Location selector in header
- [ ] Location-scoped data fetching
- [ ] Prepare for location-based filters

**Phase 3 Estimated Timeline:** 2-3 weeks (14-21 days)

---

## 📅 Project Timeline Summary

| Phase              | Duration    | Key Deliverables                         |
| ------------------ | ----------- | ---------------------------------------- |
| **Phase 1**        | 4-5 weeks   | Auth, Services, Tasks, Reports, Security |
| **Phase 2**        | 3-4 weeks   | POS, Inventory, Expenses                 |
| **Phase 3**        | 2-3 weeks   | Customers, Multi-location prep           |
| **Buffer/Testing** | 1 week      | QA, bug fixes, deployment prep           |
| **TOTAL**          | 10-13 weeks | Full production-ready system             |

---

## 🏗️ Architecture Overview

### Frontend (Vue.js)

```
src/
├── components/        # Reusable UI components
├── pages/            # Page components (Dashboard, Tasks, Reports, etc.)
├── stores/           # Pinia state management
├── services/         # API client functions
├── utils/            # Helper functions
├── composables/      # Vue Composition API reusables
└── App.vue          # Root component
```

### Backend (Express.js)

```
server/
├── routes/          # API endpoints
├── controllers/      # Business logic
├── middleware/       # Auth, validation, error handling
├── models/          # Database models
├── services/        # Reusable services (commission calc, etc.)
├── utils/           # Helpers
├── config/          # Configuration
└── app.js          # Main server file
```

### Database (MySQL)

- Normalized schema with proper indexes
- Foreign key relationships
- Soft deletes for audit trail
- Timestamps on all tables

---

## 🚀 Deployment Plan

### Development → Staging → Production

1. **Local Development:**
   - MySQL local or Docker
   - Express dev server with hot reload
   - Vue dev server with HMR

2. **Staging (VPS - Hostinger):**
   - MySQL database on VPS
   - Express server (PM2 for process management)
   - Environment variables for database connection
   - HTTPS with SSL certificate

3. **Production:**
   - Same as staging with backups enabled
   - Nightly automated backups
   - Database replication (optional future)

---

## 📝 Key Development Decisions

### Authentication

- **JWT with refresh tokens** (better for solo dev, stateless)
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- Tokens stored in httpOnly cookies (security best practice)

### Data Integrity

- **Soft deletes** instead of hard deletes (audit trail)
- **Audit logs** for all sensitive operations
- **Immutable records** after 24 hours (configurable)
- **Commission locked** after invoice finalization

### Scalability Prep

- Location field in core tables (Phase 3 implementation)
- Multi-tenancy ready API structure
- No hardcoded paths/IDs

---

## 🔧 Tools & Libraries

### Frontend

- **Framework:** Vue 3 + Vite
- **State:** Pinia
- **UI:** PrimeVue + Prime Flex
- **HTTP:** Axios
- **Charts:** Chart.js (or PrimeVue charts)
- **PDF Export:** jsPDF or similar
- **Testing:** Vitest (optional for Phase 2/3)

### Backend

- **Framework:** Express.js
- **Auth:** jsonwebtoken + bcryptjs
- **Database:** mysql2/promise
- **Validation:** joi or express-validator
- **File Upload:** multer
- **Logging:** winston or similar
- **Environment:** dotenv

### DevOps

- **Version Control:** Git
- **Database Migrations:** Liquibase or Knex.js
- **Process Manager:** PM2 (production)
- **Hosting:** Hostinger VPS (MySQL + Node.js)

---

## 📊 Success Metrics

By end of Phase 1:

- ✅ Employees can log tasks daily
- ✅ Admin can view all operations
- ✅ Commission calculated automatically
- ✅ Daily reports generated
- ✅ System is secure and stable

By end of Phase 2:

- ✅ Complete billing workflow
- ✅ Inventory tracked with FIFO
- ✅ Expenses recorded & profit calculated
- ✅ Stock alerts working

By end of Phase 3:

- ✅ Customer profiles functioning
- ✅ Multi-location architecture ready
- ✅ Loyalty point foundation (optional)
- ✅ Production deployment complete

---

## ⚠️ Risk Mitigation

| Risk                   | Mitigation                                            |
| ---------------------- | ----------------------------------------------------- |
| Solo dev burnout       | Clear phases, MVP focus, manageable scope             |
| Scope creep            | Stick to feature list, defer nice-to-haves to Phase 3 |
| Performance issues     | Database indexing early, API optimization             |
| Data loss              | Backup strategy, soft deletes, audit logs             |
| Security breaches      | JWT auth, input validation, RBAC, rate limiting       |
| Database schema issues | Plan schema thoroughly before Phase 1 coding          |

---

## 📋 Next Steps

1. **Week 0 (Preparation):**
   - [ ] Set up Git repository
   - [ ] Finalize database schema
   - [ ] Create API endpoint documentation
   - [ ] Set up frontend project structure
   - [ ] Configure VPS/MySQL hosting

2. **Week 1 (Foundation):**
   - [ ] Complete authentication system
   - [ ] Set up core API structure
   - [ ] Basic dashboard layout

3. **Week 2-5 (Phase 1 Development):**
   - [ ] Implement all Phase 1 features
   - [ ] Daily testing on local environment
   - [ ] Security review before Phase 2

4. **Deployment:**
   - [ ] Deploy Phase 1 MVP to VPS for testing
   - [ ] Gather user feedback
   - [ ] Bug fixes & optimizations
   - [ ] Phase 2 development begins

---

**Document Version:** 1.0
**Last Updated:** 2025-03-28
**Status:** Ready for Development
