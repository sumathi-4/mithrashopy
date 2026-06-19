require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { seedAdmin, seedStoreData } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet()); // Sets security headers
app.use(express.json({ limit: '50mb' })); // Body size limit
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── CORS Configuration ────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',  // Vite dev server
  'http://localhost:4173',  // Vite preview
  'http://localhost:3000',
  'http://localhost:5174',
  process.env.FRONTEND_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
// Global limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // relaxed for local developer dashboard fetching
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // max 50 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes.' }
});

app.use(globalLimiter);

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/catalogues', require('./routes/catalogues'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/marketing', require('./routes/marketing'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/user', require('./routes/user'));

const fs = require('fs');
const path = require('path');

// Create uploads folder if not exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use('/uploads', express.static(uploadsDir));

// POST /api/upload - Handle file upload as Base64 payload
app.post('/api/upload', (req, res) => {
  try {
    const { filename, base64Data } = req.body;
    if (!filename || !base64Data) {
      return res.status(400).json({ success: false, message: 'Filename and base64Data are required.' });
    }
    
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanBase64, 'base64');
    const uniqueFilename = `${Date.now()}-${filename.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadsDir, uniqueFilename);
    
    fs.writeFileSync(filePath, buffer);
    
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${uniqueFilename}`;
    res.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload image.' });
  }
});

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MithiraShoppy Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ─── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   MithiraShoppy Backend Server           ║');
  console.log(`║   Running on http://localhost:${PORT}        ║`);
  console.log('║   Environment: ' + (process.env.NODE_ENV || 'development') + '                  ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  // Seed data
  seedAdmin();
  // seedStoreData(); // disabled to keep database empty
});
