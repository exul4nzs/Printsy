# Printsy MVP: Comprehensive Demo Guide 🚀

Follow this guide to demonstrate every feature of the Printsy MVP. This script ensures you show the most professional and polished parts of the system.

## Phase 1: Customer Shopping Experience 🛒

### 1. Gallery & Product Selection
- **Action**: Open `localhost:3000`.
- **Demo Point**: Show the modern, responsive landing page with the **Printsy** branding and high-quality product cards.
- **Action**: Click **"Order Print"** on any product (e.g., Premium Photo Print).

### 2. Photo Upload & Customization
- **Action**: Click **"Upload Photos"**.
- **Demo Point**: Show that you can select local images. Point out the **real-time thumbnail previews** in the cart/product page.
- **Action**: Click **"Add to Cart"**.

### 3. Cart Management
- **Action**: Click the **Shopping Bag** icon.
- **Demo Point**: Show the clean cart interface. Note that the **uploaded photos are attached** to the specific item.

---

## Phase 2: Professional Checkout & Privacy 💳

### 4. Masked GCash Payment
- **Action**: Click **"Checkout"**.
- **Action**: Fill in your name and a Telegram handle (e.g., `@YourHandle`).
- **Demo Point**: Show that the backend now accepts Telegram handles without crashing (it used to require a strict email).
- **Action**: Click **"Place Order"**.
- **Demo Point**: Look at the **GCash Instructions**. Point out that the Account Name is masked (**B*** T****) just like the real GCash app for privacy.

### 5. Order Confirmation (The "Pro" Flow)
- **Action**: Look at the two-step confirmation.
- **Action**: Click **"1. Copy Order Summary"**.
- **Demo Point**: Show the toast notification ("Order Summary Copied!"). Mention that this solves the Telegram link limitation for personal accounts.
- **Action**: Click **"2. Confirm on Telegram"**.
- **Demo Point**: Show that it opens a chat with **@Printsyy** instantly. You can now just **Paste** the formatted summary into the chat!

---

## Phase 3: Merchant Administration 🛠️

### 6. Transaction History
- **Action**: Open `localhost:8000/admin` and log in.
- **Action**: Click on **Orders**.
- **Demo Point**: Show the **Colored Status Badges**. (Pending is Orange, Paid is Green, etc.)
- **Action**: Click into the newest order.
- **Demo Point**: Show the **Transaction Table**. It looks like a real receipt with itemized lines and a grand total.
- **Demo Point**: Scroll down to **Customer Photos**. Show the styled thumbnails of what the customer uploaded.

### 7. Lifecycle Management
- **Action**: Select the order in the list view.
- **Action**: Use the "Actions" dropdown to **"Mark as Shipped"** or **"Mark as Delivered / Finished"**.
- **Demo Point**: Show how the badge color updates instantly to purple or dark green.

### 8. Telegram Bot Notifications (Optional but Impressive)
- **Setup**: Make sure you have searched for your bot on Telegram and clicked **"START"**.
- **Action**: Place a new order on the website.
- **Demo Point**: Show the notification arriving on your phone/desktop via the bot. It will say "🛒 New Order Received!" with the details.

---

## Technical Highlights for Submission 📝
- **Factory Pattern**: Centralized order creation logic.
- **Strategy Pattern**: Flexible payment methods (Stripe removed, Manual GCash implemented).
- **Observer Pattern**: Automatic Telegram alerts when orders are created.
- **Security**: Environment variable protection for all API keys and GCash info.
- **Compatibility**: Upgraded to **Django 6.0** to support **Python 3.14**.

**You're all set! This flow covers every architectural and functional requirement of the project.** 💕✨
