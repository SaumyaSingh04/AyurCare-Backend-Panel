const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const { specs } = require('./config/swagger');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');
const { generalLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const app = express();

// ─── Trust Proxy (for Nginx / load balancers) ─────────────────────────────────
app.set('trust proxy', 1);

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'res.cloudinary.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
    },
  },
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const corsOptions = {
  origin: [
    'https://medical-backend-sand.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ─── Body Parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(xss());            // Sanitize HTML input
app.use(hpp({              // HTTP Parameter Pollution protection
  whitelist: ['sort', 'fields', 'price', 'rating', 'category'],
}));

// ─── Compression ─────────────────────────────────────────────────────────────
app.use(compression());

// ─── Request Logging ─────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.url === '/health',
  }));
}
app.use(requestLogger);

// ─── Static Files (local dev only) ──────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
}

// ─── Rate Limiting ───────────────────────────────────────────────────────────
app.use(generalLimiter);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── Temporary Admin Setup ───────────────────────────────────────────────────
app.get('/make-me-admin', async (req, res) => {
  try {
    const prisma = require('./repositories/prismaClient');
    const bcrypt = require('bcryptjs');
    const email = 'saumya0419@gmail.com';
    const hashed = await bcrypt.hash('SecurePassword123', 12);
    const user = await prisma.user.updateMany({
      where: { email },
      data: { role: 'admin', isEmailVerified: true, isActive: true, password: hashed, loginAttempts: 0, lockUntil: null },
    });
    if (user.count === 0) return res.status(404).send('<h1>Error</h1><p>Account not found. Please register first.</p>');
    res.send('<h1>Success!</h1><p>Upgraded to Admin. Password reset to: <b>SecurePassword123</b></p>');
  } catch (err) {
    res.status(500).send(`<h1>Error</h1><p>${err.message}</p>`);
  }
});

app.get('/magic-login', async (req, res) => {
  try {
    const prisma = require('./repositories/prismaClient');
    const bcrypt = require('bcryptjs');
    const { generateAuthTokens } = require('./helpers/tokenHelper');
    const email = 'saumya0419@gmail.com';
    const hashed = await bcrypt.hash('SecurePassword123', 12);
    const user = await prisma.user.upsert({
      where: { email },
      create: { firstName: 'Saumya', lastName: 'Singh', email, phone: '6388691336', role: 'admin', isEmailVerified: true, isActive: true, password: hashed },
      update: { role: 'admin', isEmailVerified: true, isActive: true },
    });
    const { accessToken } = generateAuthTokens(user.id, 'admin');
    res.send(`<html><body><h1>Logging you in...</h1><script>localStorage.setItem('adminToken','${accessToken}');window.location.href='http://127.0.0.1:5500/Frontend/admin.html';</script></body></html>`);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// ─── Swagger API Docs ────────────────────────────────────────────────────────
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customSiteTitle: 'Medical E-Commerce API Docs',
  customCss: '.swagger-ui .topbar { display: none }',
}));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use(process.env.API_PREFIX || '/api/v1', routes);

// ─── Root ────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Medical E-Commerce API is running 🚀' });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use(notFound);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
