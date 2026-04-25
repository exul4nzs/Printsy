# 🎨 Custom Print Studio

A production-ready, mobile-first Custom Print Studio that allows customers to design and order custom-printed products. Built with extensibility in mind to easily add new product types.

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Django 5.x + Django REST Framework |
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| Database | PostgreSQL (dev: SQLite) |
| Payments | Stripe Checkout (with GCash for Philippines) |
| Storage | Local `media/` (S3 configurable) |
| Canvas Editor | Fabric.js |

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- pip
- npm

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment variables
cp .env.example .env

# Edit .env with your Stripe keys and settings

# Run migrations
python manage.py migrate

# Seed sample data
python manage.py seed_data

# Run server
python manage.py runserver
```

The Django backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The Next.js frontend will be available at `http://localhost:3000`

Set `NEXT_PUBLIC_API_URL=http://localhost:8000/api` in `frontend/.env.local` so product mockups resolve from the Django media URL correctly.

## 🖼️ Shirt editor (product page)

The clothing product page (`/product/[id]`) uses **`ShirtEditor`**: Fabric.js canvas, mockup image (API URL resolved automatically), print-area guide, add text/clipart, undo/redo (50 steps), clear user layers, transparent PNG export (×3), save/load via **`POST /api/designs/`** and **`GET /api/designs/<id>/`**.

**Quick test (Chrome):** open a product, confirm the shirt appears in the canvas, click **Add Text** and **Add Clipart**, use **Undo/Redo**, **Export PNG**, then **Save to server** (Django must be running). Copy the design id from the toast and use **Load** to restore it.

See **`FIXES.md`** in the repo root for what was wrong with the blank canvas and how it was fixed.

## 📁 Project Structure

```
custom-print-studio/
├── backend/                 # Django backend
│   ├── printstudio/         # Django project settings
│   ├── shop/                # Main app (models, views, admin)
│   │   ├── models.py        # Product, Order, Design models
│   │   ├── views.py         # API endpoints
│   │   ├── admin.py         # Django admin configuration
│   │   └── management/      # Custom commands (seed_data)
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                # Next.js frontend
    ├── app/                 # Next.js App Router
    │   ├── page.tsx         # Home page (product gallery)
    │   ├── product/
    │   │   └── [id]/
    │   │       └── page.tsx # Product detail with configurator
    │   ├── cart/
    │   │   └── page.tsx     # Cart page
    │   └── checkout/
    │       └── page.tsx     # Checkout page
    ├── components/
    │   ├── Header.tsx
    │   ├── ProductCard.tsx
    │   └── ShirtEditor.tsx  # Fabric.js shirt editor (Step 1)
    ├── lib/
    │   ├── api.ts           # API client (includes getDesign)
    │   ├── resolveMockupUrl.ts
    │   ├── store.ts         # Zustand cart store
    │   └── clipart.ts       # Clipart library
    └── types/
        └── index.ts         # TypeScript types
```

## 🔧 Configuration

### Environment Variables (Backend)

Create a `.env` file in the `backend/` directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite for dev, PostgreSQL for production)
DATABASE_URL=sqlite:///db.sqlite3

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# AWS S3 (optional - comment out to use local storage)
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
# AWS_STORAGE_BUCKET_NAME=your_bucket_name

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

### Stripe Webhook Setup (Local Development)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks:
   ```bash
   stripe listen --forward-to localhost:8000/api/webhooks/stripe/
   ```
4. Copy the webhook secret to your `.env` file

## 🎯 Features

### MVP Features (Clothing)

- **Product Gallery**: Browse clothing products with clean, modern UI
- **Design Studio**: Fabric.js-powered canvas editor with:
  - Text tool (add and style text)
  - Clipart library (10+ SVG shapes)
  - Image upload (PNG/JPG)
  - Undo/Redo
  - Color picker
  - Export design as PNG
- **Product Variants**: Size and color selection
- **Shopping Cart**: Add, remove, update quantities
- **Checkout**: Guest checkout with Stripe payment
- **Admin Panel**: Manage products, designs, and orders

### Extensibility

The system is designed to easily add new product types:

1. **Backend**: Add new product types via the `product_type` field
2. **Frontend**: Register new configurator components in the `configuratorMap`

See `EXTENSIBILITY.md` for detailed instructions.

## 📝 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/products/` | GET | List products (filter by `?type=clothing`) |
| `/api/products/<id>/` | GET | Product detail |
| `/api/products/<id>/variants/` | GET | Product variants |
| `/api/designs/` | POST | Save custom design |
| `/api/orders/` | POST | Create order |
| `/api/create-payment-intent/` | POST | Create Stripe payment intent |
| `/api/webhooks/stripe/` | POST | Stripe webhook handler |

## 🎨 Design System

- **Color Palette**: Neutral base (off-white, warm grays, soft beiges) with teal accent
- **Typography**: Inter font family
- **Components**: Card-based layout with subtle shadows and rounded corners
- **Mobile-First**: Responsive design with touch-friendly controls

## 🧪 Testing

### Backend Tests

```bash
cd backend
python manage.py test
```

### Stripe Test Cards

- **Visa**: `4242 4242 4242 4242`
- **Mastercard**: `5555 5555 5555 4444`
- Any future expiry date, any CVC, any ZIP

## 📚 Documentation

- `EXTENSIBILITY.md` - How to add new product types
- `DEPLOYMENT.md` - Production deployment guide (create as needed)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this for your own print-on-demand business!
