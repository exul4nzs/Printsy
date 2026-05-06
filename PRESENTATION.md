# 📸 Printsy: Final Project Presentation

## Project Overview
"Where some memories deserve more than a screen. Print them, feel them, and make them last."

Printsy is a specialized, responsive web platform for uploading, configuring, and ordering professional photo prints. It features a decoupled architecture using Next.js for a dynamic, modern frontend and Django REST Framework for a robust backend.

## 🧱 Architecture Decisions

We chose a decoupled **Client-Server Architecture** to ensure clean separation of concerns:
-   **Frontend (Next.js)**: Handles UI state (Zustand) and interactive elements (Fabric.js for print previews).
-   **Backend (Django)**: Acts strictly as an API Gateway and business logic processor.

### SOLID Principles Applied
-   **SRP**: We abstracted complex logic out of controllers into dedicated `OrderFactory` and `PaymentStrategy` classes.
-   **OCP**: Our `PaymentStrategy` interface allows adding new payment methods without altering existing checkout code.

## 🛠️ Pattern Implementation (Lab 17 Highlight)

To ensure high cohesion and loose coupling, we integrated the following GoF design patterns:

1.  **Strategy Pattern (`PaymentStrategy`)**: Dynamically resolves the payment flow (Stripe API vs Manual Processing) based on the context.
2.  **Factory Pattern (`OrderFactory`)**: Centralizes the complex calculation of cart totals, item iteration, and order instantiation.
3.  **Observer Pattern (Event-Driven Logging)**: Using Django Signals, the system observes `Order` status transitions and autonomously generates a tamper-evident `AuditLog`.

## ⭐ Standout Features

-   **Automated CI/CD Pipeline**: A GitHub Actions workflow runs our test suite and tests Next.js builds on every push, ensuring continuous integration.
-   **Feature Toggles**: An advanced architectural addition allowing admins to toggle features (e.g., Express Delivery) dynamically via the database without code redeployments.
-   **Dockerized Deployment**: Fully containerized with `docker-compose` for 1-click deployment parity across environments.

## 🚀 Future Improvements & Scalability
-   Implementing CQRS for heavy read/write operations (separating order writes from analytics reads).
-   Migrating from SQLite to PostgreSQL in production (already prepped in Docker).
-   Integrating a dedicated microservice for advanced image processing using AWS Lambda or Celery workers.
