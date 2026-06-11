# Backend Documentation — Part 1: Overview, Tech Stack, Folder Structure

---

## 1. Project Overview

### Purpose
This is the backend for **Medical E-Commerce** — a production-grade e-commerce platform selling Ayurvedic wellness products. It is a RESTful API built with Node.js and Express, backed by MongoDB, Redis, and deployed via Docker/Vercel/PM2.

### Business Use Case
An Indian Ayurvedic brand selling physical products (herbal supplements, oils, skincare, teas, herb powders) online. Customers browse products, add to cart, apply coupons, pay via Razorpay or Stripe (or COD), and track orders in real time.

### Core Features
- User registration, login, OTP verification, password reset
- Product catalog with variants, categories, search, filters
- Shopping cart with coupon support
- Order placement, tracking, cancellation, returns
- Razorpay & Stripe payment processing with webhook handling
- COD with ₹100 confirmation charge
- PDF invoice generation (uploaded to Cloudinary)
- Admin dashboard: analytics, user/order/product management
- Real-time order updates via Socket.IO
- In-app notifications
- Redis caching layer
- Background jobs (Bull queues) for emails & invoices
- Role-based access: user, admin, vendor, super_admin
- Swagger API documentation at `/api/v1/docs`

### High-Level Architecture

```
Client (Browser/Mobile)
        │
        ▼
   Nginx (Reverse Proxy)
        │
        ▼
   Node.js / Express App  ←──── Socket.IO (real-time)
        │
   ┌────┴────────────────────────────────┐
   │  Middleware Pipeline                │
   │  (Helmet, CORS, Rate Limit,        │
   │   Validation, Auth, Cache)         │
   └────────────────────────────────────┘
        │
   Routes → Controllers → Services → Repositories
        │
   ┌────┴────────────┬──────────────────┐
   │                 │                  │
MongoDB           Redis            Cloudinary
(primary DB)    (cache+jobs)      (media storage)
                     │
                Bull Queues
            (email + invoice jobs)
                     │
              Nodemailer / Razorpay / Stripe
```

---

## 2. Technology Stack

| Technology | Version | Role | Why Used |
|---|---|---|---|
| **Node.js** | >=18.0.0 | Runtime | Non-blocking I/O, perfect for API servers |
| **Express.js** | ^4.19.2 | HTTP Framework | Minimal, flexible, huge ecosystem |
| **MongoDB** | via Mongoose | Primary Database | Flexible schema for product variants, addresses |
| **Mongoose** | ^8.4.0 | ODM | Schema validation, virtuals, middleware hooks |
| **JWT (jsonwebtoken)** | ^9.0.2 | Authentication | Stateless auth with access+refresh token pattern |
| **bcryptjs** | ^2.4.3 | Password Hashing | Secure bcrypt with configurable salt rounds |
| **Redis (ioredis)** | ^5.4.1 | Caching + Job Queue | Response caching, Bull queue backend |
| **Bull** | ^4.12.2 | Background Jobs | Async email + invoice generation queues |
| **Cloudinary** | ^2.10.0 | Media Storage | Product images, avatars, PDF invoices |
| **Multer** | ^1.4.5-lts.1 | File Uploads | Multipart form handling |
| **multer-storage-cloudinary** | ^4.0.0 | Cloudinary adapter | Streams uploads directly to Cloudinary |
| **Razorpay** | ^2.9.2 | Payment Gateway | Primary Indian payment gateway |
| **Stripe** | ^15.10.0 | Payment Gateway | International card payments |
| **Nodemailer** | ^6.10.1 | Email | Sends OTP, password reset, order confirmation |
| **Socket.IO** | ^4.7.5 | Real-time | Order status updates pushed to clients |
| **Joi** | ^17.13.1 | Validation | Schema-based request body validation |
| **Helmet** | ^7.1.0 | Security Headers | Sets HTTP security headers |
| **express-rate-limit** | ^7.3.1 | Rate Limiting | Prevents brute force and abuse |
| **express-mongo-sanitize** | ^2.2.0 | NoSQL Injection | Strips `$` operators from input |
| **xss-clean** | ^0.1.4 | XSS Prevention | Strips HTML from user input |
| **hpp** | ^0.2.3 | HTTP Param Pollution | Prevents duplicate query params attack |
| **compression** | ^1.7.4 | Response Compression | Gzip for all responses |
| **cors** | ^2.8.5 | CORS | Whitelists allowed origins |
| **cookie-parser** | ^1.4.6 | Cookie Handling | Reads signed cookies for refresh tokens |
| **morgan** | ^1.10.0 | HTTP Logging | Logs all HTTP requests |
| **winston** | ^3.13.0 | Application Logging | Structured logging with log levels |
| **winston-daily-rotate-file** | ^5.0.0 | Log Rotation | Rotates log files daily, 14-30 day retention |
| **slugify** | ^1.6.6 | URL Slugs | Auto-generates SEO slugs for products/categories |
| **pdfkit** | ^0.15.0 | PDF Generation | Generates A4 invoice PDFs |
| **swagger-jsdoc** | ^6.2.8 | API Docs | Parses JSDoc to build OpenAPI spec |
| **swagger-ui-express** | ^5.0.1 | API Docs UI | Serves Swagger UI at `/api/v1/docs` |
| **twilio** | ^5.2.0 | SMS (unused) | Dependency present but not wired in code |
| **uuid** | ^10.0.0 | Unique IDs | Utility for generating UUIDs |
| **dotenv** | ^16.4.5 | Environment | Loads `.env` variables into `process.env` |
| **PM2** | config only | Process Manager | Cluster mode, auto-restart, log management |
| **Docker** | compose file | Containerization | Orchestrates API + MongoDB + Redis + Nginx |
| **Nginx** | config only | Reverse Proxy | SSL termination, static files, load balancing |

---

## 3. Folder Structure Analysis

```
Ecommerce-Backend-main/
├── api/
│   └── index.js                  ← Vercel serverless entry point
├── nginx/
│   └── nginx.conf                ← Nginx reverse proxy config
├── src/
│   ├── config/
│   │   ├── cloudinary.js         ← Cloudinary SDK setup + storage factory
│   │   ├── database.js           ← MongoDB connection with retry logic
│   │   ├── mailer.js             ← Nodemailer SMTP transporter (singleton)
│   │   ├── payment.js            ← Razorpay + Stripe lazy initialization
│   │   ├── redis.js              ← ioredis client with graceful fallback
│   │   └── swagger.js            ← OpenAPI 3.0 spec configuration
│   ├── constants/
│   │   └── index.js              ← All app-wide enums/constants (roles, statuses, messages)
│   ├── controllers/
│   │   ├── adminController.js    ← Admin dashboard, user/order/product management
│   │   ├── authController.js     ← Register, login, logout, OTP, password reset
│   │   ├── cartController.js     ← Cart CRUD, coupon application
│   │   ├── categoryController.js ← Category CRUD
│   │   ├── couponController.js   ← Coupon CRUD + validation
│   │   ├── notificationController.js ← Notification read/delete
│   │   ├── orderController.js    ← Place order, cancel, return, invoice
│   │   ├── paymentController.js  ← Razorpay/Stripe init, verify, webhook, refund
│   │   ├── productController.js  ← Product CRUD, search, featured
│   │   ├── reviewController.js   ← Review CRUD, helpful votes
│   │   └── userController.js     ← Profile, address, wishlist management
│   ├── helpers/
│   │   ├── ApiError.js           ← Custom Error class with factory methods
│   │   ├── ApiResponse.js        ← Standardized JSON response helpers
│   │   ├── paginate.js           ← Pagination parsing, sort/projection builders
│   │   └── tokenHelper.js        ← JWT generation + verification per token type
│   ├── jobs/
│   │   └── index.js              ← Bull queue setup (email + invoice queues)
│   ├── middleware/
│   │   ├── auth.js               ← JWT authenticate + optionalAuth
│   │   ├── authorize.js          ← Role-based access control factory
│   │   ├── cache.js              ← Redis response cache middleware
│   │   ├── errorHandler.js       ← Global error handler + 404 handler
│   │   ├── rateLimiter.js        ← 4 rate limiters (general, auth, OTP, payment)
│   │   ├── requestLogger.js      ← Per-request duration + status logger
│   │   ├── upload.js             ← Multer with Cloudinary/local fallback
│   │   └── validate.js           ← Joi schema validation middleware factory
│   ├── models/
│   │   ├── Cart.js               ← Cart + CartItem subdocuments
│   │   ├── Category.js           ← Hierarchical category with ancestors
│   │   ├── Coupon.js             ← Discount coupon with usage tracking
│   │   ├── Notification.js       ← User notification with 30-day TTL
│   │   ├── Order.js              ← Order with items, tracking, status history
│   │   ├── Payment.js            ← Payment record (Razorpay/Stripe/COD)
│   │   ├── Product.js            ← Product with variants, SEO, inventory
│   │   ├── Review.js             ← Review with auto product rating update
│   │   ├── User.js               ← User with addresses, wishlist, refresh tokens
│   │   └── Wishlist.js           ← Standalone wishlist model
│   ├── repositories/
│   │   ├── baseRepo.js           ← Generic CRUD class all repos extend
│   │   ├── index.js              ← Inline repos for Category, Cart, Payment, Review, Coupon, Notification
│   │   ├── orderRepo.js          ← Order-specific queries + aggregations
│   │   ├── productRepo.js        ← Product search, filter builder, stock increment/decrement
│   │   └── userRepo.js           ← User-specific queries, refresh token management
│   ├── routes/
│   │   ├── index.js              ← Root router — mounts all sub-routers at /api/v1/*
│   │   ├── adminRoutes.js        ← /admin/* (admin + super_admin only)
│   │   ├── authRoutes.js         ← /auth/*
│   │   ├── cartRoutes.js         ← /cart/* (authenticated)
│   │   ├── categoryRoutes.js     ← /categories/*
│   │   ├── couponRoutes.js       ← /coupons/*
│   │   ├── notificationRoutes.js ← /notifications/* (authenticated)
│   │   ├── orderRoutes.js        ← /orders/* (authenticated)
│   │   ├── paymentRoutes.js      ← /payments/* (webhook is public)
│   │   ├── productRoutes.js      ← /products/* (reads public, writes admin)
│   │   ├── reviewRoutes.js       ← /reviews/*
│   │   └── userRoutes.js         ← /users/* (authenticated)
│   ├── services/
│   │   ├── adminService.js       ← Dashboard stats, sales report, user/product/order management
│   │   ├── authService.js        ← All auth business logic
│   │   ├── cacheService.js       ← Redis get/set/del/invalidate/remember
│   │   ├── cartService.js        ← Cart state management, coupon application
│   │   ├── categoryService.js    ← Category tree, CRUD, cache invalidation
│   │   ├── couponService.js      ← Coupon validation, CRUD
│   │   ├── notificationService.js← Create/read/mark-read notifications
│   │   ├── orderService.js       ← Order placement, cancellation, COD, invoice
│   │   ├── paymentService.js     ← Razorpay/Stripe payment flows, webhooks, refunds
│   │   ├── productService.js     ← Product CRUD, search, image management, caching
│   │   ├── reviewService.js      ← Review CRUD, verified purchase check, helpful votes
│   │   └── userService.js        ← Profile, address, wishlist, avatar management
│   ├── sockets/
│   │   ├── index.js              ← Socket.IO server init, JWT auth middleware
│   │   └── orderSocket.js        ← order:subscribe/unsubscribe events
│   ├── utils/
│   │   ├── asyncHandler.js       ← Wraps async controllers to auto-catch errors
│   │   ├── cryptoUtils.js        ← Razorpay signature verify, secure token gen, HMAC
│   │   ├── logger.js             ← Winston logger with console + optional file transports
│   │   ├── mailer.js             ← sendEmail() with inline HTML template engine
│   │   ├── otpUtils.js           ← Generate, hash, and compare OTPs
│   │   ├── pdfGenerator.js       ← PDFKit invoice generation
│   │   └── seed.js               ← Database seeder
│   ├── validations/
│   │   ├── authValidation.js     ← Joi schemas for auth routes
│   │   ├── cartValidation.js     ← Joi schemas for cart routes
│   │   ├── orderValidation.js    ← Joi schemas for order routes
│   │   ├── productValidation.js  ← Joi schemas for product routes
│   │   └── userValidation.js     ← Joi schemas for user routes
│   └── app.js                    ← Express app: middleware stack + route mounting
├── tests/
│   ├── helpers/testHelpers.js
│   ├── integration/auth.test.js
│   └── unit/
│       ├── adminService.test.js
│       └── authService.test.js
├── server.js                     ← Entry point: DB, Redis, jobs, sockets, HTTP server
├── docker-compose.yml            ← API + MongoDB + Redis + Nginx containers
├── Dockerfile                    ← Multi-stage Node.js Docker build
├── pm2.config.js                 ← PM2 cluster mode config
├── vercel.json                   ← Vercel serverless deployment config
├── api/index.js                  ← Vercel serverless adapter
└── package.json
```

### Folder Interaction Map

```
routes/
  └── calls → controllers/
                └── calls → services/
                              ├── calls → repositories/
                              │             └── calls → models/ → MongoDB
                              ├── calls → config/ (cloudinary, payment)
                              ├── calls → utils/ (mailer, pdfGenerator, cryptoUtils)
                              └── calls → helpers/ (ApiError, paginate)

middleware/
  ├── auth.js       → helpers/tokenHelper + repositories/userRepo
  ├── cache.js      → services/cacheService → config/redis
  ├── validate.js   → validations/
  └── upload.js     → config/cloudinary

jobs/
  └── uses → utils/mailer + services/orderService

sockets/
  └── uses → helpers/tokenHelper
```
