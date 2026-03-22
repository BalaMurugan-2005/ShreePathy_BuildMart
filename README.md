# 🏗️ BuildMart – Construction Materials Marketplace

> A full-stack marketplace web application for construction materials.  
> Customers order materials, suppliers list products, delivery agents track shipments, and admins manage the platform — all in one place.

![Tech Stack](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=flat-square&logo=react)
![Backend](https://img.shields.io/badge/Backend-Django%205%20%2B%20DRF-092E20?style=flat-square&logo=django)
![Auth](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens)
![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=flat-square&logo=tailwind-css)
![Deployment](https://img.shields.io/badge/Deployment-Render%20%2B%20Docker-46E3B7?style=flat-square&logo=render)

---

## ✨ Features

### 👤 Customer
- Browse and search construction materials
- Add items to cart and wishlist
- Checkout and place orders
- Track order status in real-time
- View notifications and manage profile

### 🏭 Supplier
- List and manage materials (CRUD)
- Accept, update, and track incoming orders
- View earnings analytics and inventory
- Message customers directly

### 🚚 Delivery Agent
- View assigned deliveries
- Update delivery status in real-time
- Delivery tracking dashboard

### 🛡️ Admin
- Full platform analytics and overview
- Manage users, suppliers, orders
- Approve/reject supplier registrations

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS + Framer Motion |
| **Backend** | Python + Django 5 + Django REST Framework |
| **Database** | SQLite (local dev) / PostgreSQL (production) |
| **Auth** | JWT (SimpleJWT) |
| **Deployment** | Docker + Nginx + Render |

---

## 📁 Project Structure

```
BuildMart/
├── backend/
│   ├── buildmart/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── api/
│   │   ├── models.py         # User, Material, Order, Review, Message, etc.
│   │   ├── serializers.py
│   │   ├── views.py          # All DRF API views
│   │   ├── urls.py           # API URL routes
│   │   └── admin.py
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, MaterialCard, Sidebar, Tracker, etc.
│   │   ├── pages/            # All 14 pages (see below)
│   │   ├── hooks/            # useAuth, useCart contexts
│   │   └── services/         # Axios API service layer
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

---

## ⚙️ Local Setup (Without Docker)

### Prerequisites
- Python 3.10+
- Node.js 18+

### 🔧 Backend Setup

```bash
cd BuildMart/backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
copy .env.example .env         # Windows
# cp .env.example .env         # Mac/Linux

# Run migrations
python manage.py migrate

# Create admin superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

✅ Backend will be live at: **http://127.0.0.1:8000**

### 🎨 Frontend Setup

```bash
cd BuildMart/frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

✅ Frontend will be live at: **http://localhost:5173**

---

## 🐳 Docker Setup (Full Stack)

```bash
# From the BuildMart/ directory
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000/api/ |
| Django Admin | http://localhost:8000/admin/ |

---

## 🔑 Environment Variables

**Backend** (`backend/.env`):
```env
SECRET_KEY=your-secret-key-here
DEBUG=True

# SQLite (default for local dev)
DB_ENGINE=django.db.backends.sqlite3

# PostgreSQL (for production)
# DB_ENGINE=django.db.backends.postgresql
# DB_NAME=buildmart_db
# DB_USER=postgres
# DB_PASSWORD=yourpassword
# DB_HOST=localhost
# DB_PORT=5432
```

**Frontend** (`frontend/.env`):
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

---

## 🐘 Switch to PostgreSQL

1. Install PostgreSQL and create a database:
   ```sql
   CREATE DATABASE buildmart_db;
   ```

2. Edit `backend/.env`:
   ```env
   DB_ENGINE=django.db.backends.postgresql
   DB_NAME=buildmart_db
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   DB_HOST=localhost
   DB_PORT=5432
   ```

3. Run migrations:
   ```bash
   python manage.py migrate
   ```

---

## 🌐 API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/register/` | Register new user | Public |
| POST | `/api/login/` | Login (get JWT tokens) | Public |
| GET | `/api/materials/` | List all materials | Public |
| GET | `/api/materials/:id/` | Material detail | Public |
| POST | `/api/materials/` | Create material | Supplier |
| GET | `/api/orders/` | Get orders | Customer/Supplier/Admin |
| POST | `/api/orders/` | Place order | Customer |
| PUT | `/api/orders/:id/status/` | Update order status | Supplier/Admin |
| GET | `/api/supplier/materials/` | Supplier's materials | Supplier |
| GET | `/api/supplier/orders/` | Supplier's orders | Supplier |
| GET | `/api/supplier/dashboard/` | Supplier analytics | Supplier |
| GET | `/api/supplier/customers/` | Customers who ordered | Supplier |
| GET | `/api/messages/` | Get conversations | Auth |
| POST | `/api/messages/` | Send message | Auth |
| GET | `/api/notifications/` | Get notifications | Auth |
| GET | `/api/admin/users/` | All users | Admin |
| GET | `/api/admin/orders/` | All orders | Admin |
| GET | `/api/admin/suppliers/` | All suppliers | Admin |

---

## 👥 User Roles

| Role | Capabilities |
|---|---|
| **Customer** | Browse, wishlist, cart, checkout, track orders, notifications, profile |
| **Supplier** | List materials, manage orders, view analytics, message customers |
| **Delivery Agent** | View assigned deliveries, update delivery status |
| **Admin** | View all users, orders, suppliers, analytics, platform management |

---

## 📱 Frontend Pages

| Route | Page | Description |
|---|---|---|
| `/` | **Home Page** | Hero, categories, features, animations |
| `/login` | **Login Page** | JWT-based authentication |
| `/register` | **Register Page** | Multi-role user registration |
| `/marketplace` | **Marketplace** | Search, filter, sort materials |
| `/materials/:id` | **Product Detail** | Material info, reviews, add to cart |
| `/cart` | **Cart Page** | Manage cart, quantity, totals |
| `/checkout` | **Checkout Page** | Address, payment, order placement |
| `/dashboard` | **Customer Dashboard** | Order history, tracking, status |
| `/wishlist` | **Wishlist Page** | Saved items |
| `/notifications` | **Notifications** | Platform alerts and updates |
| `/profile` | **Profile Page** | User info, settings |
| `/supplier` | **Supplier Dashboard** | Inventory, orders, earnings, messages |
| `/delivery` | **Delivery Dashboard** | Assigned deliveries, status updates |
| `/admin` | **Admin Dashboard** | Analytics, user & order management |

---

## 🚀 Deployment (Render)

### Backend
1. Create a new **Web Service** on Render
2. Set **Root Directory**: `backend`
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `gunicorn buildmart.wsgi:application`
5. Add all environment variables from `.env.example`

### Frontend
1. Create a new **Static Site** on Render
2. Set **Root Directory**: `frontend`
3. Set **Build Command**: `npm install && npm run build`
4. Set **Publish Directory**: `dist`
5. Add `VITE_API_BASE_URL` pointing to your backend Render URL

---

## 🎨 Design Theme

- **Primary**: Brand Yellow `#F5C518`
- **Background**: Brand Black `#1A1A1A`
- **Accent**: Brand Orange `#E07B00`
- **Font**: Inter (Google Fonts)
- Construction-themed with modern glassmorphism, scroll animations, and micro-interactions

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Built with ❤️ by <strong>ShreePathy</strong></p>
