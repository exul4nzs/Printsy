# 📸 Printsy

"Where some memories deserve more than a screen. Print them, feel them, and make them last 💕"

Printsy is a specialized photo printing platform built with Next.js and Django. It allows users to upload high-quality photos, select custom sizes, and order professional prints with ease.

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Django 5.x + Django REST Framework |
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| Database | SQLite (Dev) / PostgreSQL (Prod) |
| Payments | Stripe Checkout (GCash supported) |
| Image Processing | Pillow |

## 🚀 Key Features

- **Specialized Photo Editor**: Simplified upload and preview system for photo prints.
- **Dynamic Sizing**: Support for various dimensions (2x3, 4R, 5R, 8R, A4).
- **Premium Aesthetics**: Clean, modern UI with a focus on photography.
- **Secure Payments**: Integrated with Stripe for cards and local Philippine payment methods like GCash.

## 🛠️ Installation

### Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies: `pip install -r requirements.txt`.
3. Run migrations: `python manage.py migrate`.
4. Start the server: `python manage.py runserver`.

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.

## 🖼️ Managing Images

To add real images to your products (instead of placeholders):

### 1. Using the Django Admin (Recommended)
1. Create a superuser: `python manage.py createsuperuser` in the `backend` folder.
2. Go to `http://localhost:8000/admin`.
3. Select **Products** and click on a product (like "Mini Album Keychain").
4. Upload a **Thumbnail** and **Mockup Image**. These will automatically sync to the frontend gallery.

### 2. Replacing Placeholders
The "Explore Gallery" currently uses placeholders from the `frontend/public/` folder:
- `keychain.png` (Mini Album Keychain)
- `prints.png` (Standard Prints)
- `logo.png` (Default backup)

You can simply overwrite these files with your own `.png` images to update the landing page immediately!

## 📍 Contact
Based in Surigao City.
Facebook: Printsy
💕
