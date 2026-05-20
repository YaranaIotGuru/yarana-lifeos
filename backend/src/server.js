const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { startReminderJob } = require('./jobs/reminderJob');

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const taskRoutes = require('./routes/tasks');
const clientRoutes = require('./routes/clients');
const ledgerRoutes = require('./routes/ledger');
const noteRoutes = require('./routes/notes');

const app = express();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// CORS - Allow localhost (dev) + Vercel + custom domain (prod)
const allowedOrigins = [
  process.env.FRONTEND_URL,                    // e.g. https://yarana-lifeos.vercel.app
  process.env.CUSTOM_DOMAIN,                   // e.g. https://app.yourdomain.com
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow no-origin (curl/Postman), any localhost port, vercel.app domains, or configured URLs
    if (
      !origin ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin) ||
      allowedOrigins.includes(origin)
    ) {
      callback(null, true);
    } else {
      console.warn('CORS blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Yarana LifeOS API is running! 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/notes', noteRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 Yarana LifeOS API running at http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health\n`);
    startReminderJob();
  });
};

start();
