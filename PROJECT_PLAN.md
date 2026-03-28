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

#### 1.1 Project Setup ✅

- [x] Initialize Git repository with `.gitignore`
- [x] Frontend: Vue 3 + Vite + Pinia setup
- [x] Backend: Express.js + JWT auth middleware + CORS
- [x] Database: MySQL schema design & migrations (18 tables)
- [x] API structure: RESTful endpoints planning
- [x] Environment config (.env setup)
- [x] Development server setup & testing tools

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

#### 1.3 Authentication & Authorization ✅

**Backend:**

- [x] User registration (Admin only, Joi validation)
- [x] Login with JWT token generation (access 15m + refresh 7d)
- [x] Refresh token mechanism
- [x] Password hashing (bcryptjs)
- [x] Role-based middleware (`authenticateToken`, `requireAdmin`)
- [x] Logout functionality
- [x] Rate limiting (10 req / 15 min)
- [x] Input validation with Joi

**Frontend:**

- [x] Login page (responsive design, server error messages)
- [x] Token storage (localStorage, auth header auto-set on reload)
- [x] Protected routes & redirects
- [ ] Session timeout handling (deferred to Phase 1.9)
- [ ] "Remember me" (optional — deferred)

#### 1.4 User & Role Management ✅

**Admin Features:**

- [x] Dashboard overview with real stats + quick actions
- [x] Employee list (Create/Disable/Enable)
- [x] Role assignment (Admin/Employee)
- [x] View all system data access
- [ ] Settings panel (deferred to later)

**Backend:**

- [x] CRUD endpoints: `GET /api/users`, `GET /api/users/:id`, `PUT /api/users/:id`, `PATCH /api/users/:id/status`
- [x] Role-based access on all user endpoints
- [x] User status management (enable/disable)
- [x] Validation rules (Joi schemas)

**Frontend:**

- [x] Employee management table (name, email, role, status, last login)
- [x] Create employee modal (name, email, password, role)
- [x] Disable/Enable employee with confirmation dialog
- [x] Admin dashboard layout with real stats

#### 1.5 Service Management — ✅ Week 2 (COMPLETE)

**Architecture Decisions:**
- Commission rules stored in separate `commission_rules` table (one rule per service, linked by `service_id`)
- Service packages/combos included in Week 2 (not deferred)
- UI uses **PrimeVue v4** + **PrimeFlex v4** (upgraded from v3)

**Features:**

- [x] Create/edit/disable service categories (Hair, Makeup, Facial, etc.)
- [x] Add/Edit/Disable services with: name, category, duration, base price
- [x] Commission rule per service: type (% or fixed), value, apply-after-discount flag
- [x] Service packages/combos (bundle multiple services at a package price)

**Backend:**

- [x] CRUD: `GET/POST/PUT/PATCH /api/categories`
- [x] CRUD: `GET/POST/PUT/PATCH /api/services` (with commission rule upsert)
- [x] `GET/POST/PUT/PATCH /api/packages` (service packages/combos)
- [x] Validation & duplicate name checks (Joi)

**Frontend (PrimeVue v4 + PrimeFlex):**

- [x] Upgrade PrimeVue v3 → v4 + PrimeFlex v3 → v4 (`@primeuix/themes` Aura preset)
- [x] Service category management page (DataTable, Dialog, InputText, Tag)
- [x] Service CRUD page (DataTable with inline commission config)
- [x] Service package builder (MultiSelect of services, package pricing)


#### 1.6 Employee Task Management — ✅ Week 3 (COMPLETE)

**Architecture Decisions:**
- `tasks.employee_id` → FK to `users(id)` directly
- Auto-create `employees` row when user with `role=employee` is registered
- Customer lookup via phone number (type → lookup → create if not found)
- UI: Two pages — `/tasks/new` (create form) and `/tasks` (list + filters)
- **Critical fix:** `tasks` table had old FK to `employees(id)` — fixed via ALTER TABLE + idempotent check added to `migrate.js`

- [x] `/tasks/new` — Select service (auto-fills price/duration), phone → customer lookup/create, price, discount, time, notes
- [x] `/tasks` — Task list, mark In Progress / Complete / Cancel, 🔒 lock indicator
- [x] Dashboard stat cards: today's completed count + revenue (real data)
- [x] Schema: `tasks.employee_id` FK → `users(id)`
- [x] Auto-create `employees` row on register (role=employee)
- [x] `POST /api/tasks`, `GET /api/tasks`, `GET /api/tasks/summary`, `PATCH /api/tasks/:id/status`
- [x] `GET /api/customers?phone=...`, `POST /api/customers`
- [x] 24-hour auto-lock mechanism
- [x] `NewTask.vue`, `Tasks.vue`, `taskService.js`

#### 1.7 Commission Management — ✅ Week 4 (COMPLETE)

- [x] `commissions` table (UNIQUE on task_id, idempotent upserts)
- [x] `Commission.js` model: `calculate()` (%, fixed, LKR 0 if no rule), `upsert()`, `getMonthly()`, `getMonthlySummary()`
- [x] Auto-calc commission when task status → `completed` (non-fatal, never blocks task)
- [x] `GET /api/commissions/summary` (employee: own month), `GET /api/commissions` (admin: any employee/month)
- [x] `Commissions.vue` — month/year filter, 3 summary cards, per-service DataTable, admin employee selector
- [x] Dashboard "This Month's Commission" card wired to real data
- [x] Navbar Commissions link (all authenticated users)

#### 1.8 Reports & Analytics — ✅ Week 5 (COMPLETE)

- [x] `Report.js` model: `getSalesSummary()`, `getEmployeeReport()`, `getServiceReport()` (completed tasks only)
- [x] `GET /api/reports/sales?from=&to=` — daily breakdown + totals
- [x] `GET /api/reports/employees?from=&to=` — per-employee tasks, revenue, commission
- [x] `GET /api/reports/services?from=&to=` — service popularity ranked by task count
- [x] All report routes admin-only via `requireAdmin` middleware
- [x] `Reports.vue` — 3 tabs (Sales with bar chart, Employees DataTable, Services DataTable + horizontal bar)
- [x] Date range DatePicker (default: current month), `reportService.js`
- [ ] PDF/CSV export — deferred to later sprint

#### 1.9 Security & Controls — ✅ Week 6 (COMPLETE)

- [x] RBAC enforcement — `authenticateToken` + `requireAdmin` on all protected routes
- [x] Rate limiting — `authLimiter` on `/api/auth`
- [x] Input validation & XSS protection — Joi schemas on all mutating endpoints
- [x] SQL injection prevention — parameterized queries throughout
- [x] Auto-lock past data — 24-hour lock on tasks
- [x] Audit logging middleware — writes to `audit_logs` table (fire-and-forget)
- [x] Soft-delete enforcement — all controllers use `setActive` (no hard DELETEs)
- [x] Manual backup script — `npm run backup` → timestamped SQL dump in `backups/`

#### 1.10 UI/UX & Polish — 🔵 Week 7 (IN PROGRESS)

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
- **UI:** PrimeVue v4 + PrimeFlex v4 (`@primevue/themes` Aura preset — upgraded from v3 in Week 2)
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

1. **Week 0 (Preparation):** ✅ DONE
   - [x] Set up Git repository
   - [x] Finalize database schema (18 tables)
   - [x] Create API endpoint documentation
   - [x] Set up frontend project structure
   - [ ] Configure VPS/MySQL hosting (planned for Phase 1 end)

2. **Week 1 (Foundation):** ✅ DONE
   - [x] Complete authentication system
   - [x] User & employee management (CRUD + frontend)
   - [x] Core API structure with validation and rate limiting
   - [x] Dashboard with real stats + Employee management page

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

**Document Version:** 1.1
**Last Updated:** 2026-03-28
**Status:** 🟢 In Development — Phase 1 (Week 2: Service Management next)
