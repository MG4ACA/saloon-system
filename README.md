# Salon POS System 🎨

A comprehensive Point-of-Sale system built for modern salons. Built with Vue.js 3, Express.js, and MySQL.

## Project Status
🚀 **Week 0: Project Setup** (In Progress)

## 📋 Quick Start

### Prerequisites
- Node.js 16+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd salon-system
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
cd ..
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

5. **Set up database**
```bash
npm run migrate
```

6. **Start backend server**
```bash
npm run dev
```

7. **Start frontend (in another terminal)**
```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:3000`
Backend API: `http://localhost:5000/api`

---

## 📁 Project Structure

```
salon-system/
├── frontend/                 # Vue.js 3 + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── stores/          # Pinia state management
│   │   ├── services/        # API client
│   │   ├── router/          # Vue Router
│   │   └── App.vue          # Root component
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                   # Express.js backend
│   ├── config/              # Configuration files
│   ├── routes/              # API routes
│   ├── controllers/          # Business logic
│   ├── middleware/           # Custom middleware
│   ├── models/              # Database models
│   ├── services/            # Reusable services
│   └── utils/               # Helper functions
│
├── database/                 # Database files
│   ├── schema.sql           # Database schema
│   └── migrate.js           # Migration runner
│
├── logs/                     # Application logs
├── .env                      # Environment variables (dev)
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── server.js                 # Server entry point
├── package.json              # Root dependencies
├── PROJECT_PLAN.md           # Detailed project plan
├── API_DOCUMENTATION.md      # API reference
└── README.md                 # This file
```

---

## 🎯 Project Phases

### Phase 1: Core Operations (4-5 weeks)
- ✅ User authentication & role management
- ✅ Service management
- ✅ Employee task management
- ✅ Commission calculations
- ✅ Basic reporting
- ✅ Security & audit logs

### Phase 2: POS & Inventory (3-4 weeks)
- [ ] Billing system
- [ ] Batch-wise inventory management
- [ ] Inventory reports
- [ ] Expense management

### Phase 3: Customer Management (2-3 weeks)
- [ ] Customer profiles
- [ ] Customer reports
- [ ] Multi-location foundation

---

## 🛠️ Technology Stack

### Frontend
- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Next-gen build tool
- **Pinia** - State management
- **PrimeVue** - UI component library
- **Prime Flex** - Responsive CSS utilities
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **jsPDF** - PDF export

### Backend
- **Express.js** - Web framework
- **Node.js** - JavaScript runtime
- **MySQL 8.0** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Joi** - Data validation

### DevOps
- **Docker** (optional)
- **PM2** - Process manager (production)
- **Git** - Version control

---

## 🔑 Key Features

### User Management
- Role-based access control (Admin, Employee)
- Secure JWT authentication
- User activity audit logs

### Service Management
- Service categories and pricing
- Commission rule configuration
- Service package bundles

### Task Management
- Employee self-entry for tasks
- Real-time task status tracking
- Performance metrics

### Commission System
- Automatic commission calculation
- Percentage and fixed commission support
- Monthly commission reports

### Reporting
- Sales reports (daily, monthly)
- Employee performance metrics
- Commission tracking
- Service popularity analysis

### Security
- JWT token-based authentication
- Soft delete implementation
- Audit logging
- Role-based access control
- Immutable past records

---

## 📊 Database

### Key Tables
- `users` - User accounts
- `employees` - Employee profiles
- `services` - Service offerings
- `tasks` - Employee tasks
- `customers` - Customer profiles
- `commissions` - Commission tracking
- `audit_logs` - System audit trail

For detailed schema, see `database/schema.sql`

---

## 🚀 Deployment

### Hostinger VPS Setup
```bash
# Install Node.js and MySQL on VPS
# Clone repository
# Configure .env with production values
# Run database migrations
npm run migrate

# Start server with PM2
pm2 start server.js --name salon-pos
```

### Database Backup
```bash
# Automatic daily backups
# Configure backup schedule in cron
```

---

## 📚 Documentation

- **Project Plan**: See `PROJECT_PLAN.md`
- **API Reference**: See `API_DOCUMENTATION.md`
- **Development Guide**: See `DEVELOPMENT.md` (coming soon)

---

## 🤝 Contributing

This is a solo project. For updates, follow the phase timeline in `PROJECT_PLAN.md`.

---

## 📝 License

Proprietary - Salon POS System

---

## 🆘 Support

For issues and questions, refer to:
- PROJECT_PLAN.md - Implementation details
- API_DOCUMENTATION.md - API reference
- Database schema comments - SQL documentation

---

**Last Updated**: 2025-03-28
**Version**: 1.0.0-alpha
**Status**: Active Development (Phase 1)
