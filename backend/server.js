require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { seedAdmin, seedStoreData } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Sets security headers allowing cross-origin image requests
app.use(express.json({ limit: '50mb' })); // Body size limit
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── CORS Configuration ────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',  // Vite dev server
  'http://localhost:4173',  // Vite preview
  'http://localhost:3000',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.FRONTEND_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow matching origins in allowedOrigins list or any localhost/127.0.0.1 ports
    if (allowedOrigins.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
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
app.use('/api/features', require('./routes/features'));
app.use('/api/lucky-charms', require('./routes/luckyCharm'));

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
const http      = require('http');
const { execSync } = require('child_process');

// Kill any existing process holding our port before we start
function freePort(port) {
  try {
    // Works on Windows (PowerShell available)
    const result = execSync(
      `netstat -ano | findstr :${port}`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    const lines = result.split('\n').filter(l => l.includes('LISTENING'));
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0') {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          console.log(`🗑️  Freed port ${port} (killed PID ${pid})`);
        } catch (_) { /* already gone */ }
      }
    });
  } catch (_) {
    // No process on port — that's fine
  }
}

freePort(PORT);

const server = http.createServer(app);

// ─── Handle any remaining port errors ─────────────────────────────────────────
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is still in use after cleanup.`);
    console.error(`   Run this command manually and try again:`);
    console.error(`   netstat -ano | findstr :${PORT}   →  then  taskkill /PID <PID> /F\n`);
    process.exit(1);          // exit once — no retry loop
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

// ─── Graceful Shutdown (Ctrl+C / kill signal) ──────────────────────────────────
function shutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('✅ Server closed. Port released.');
    process.exit(0);
  });
  setTimeout(() => process.exit(0), 5000).unref();
}

process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// ─── Start Listening ────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   MithiraShoppy Backend Server           ║');
  console.log(`║   Running on http://localhost:${PORT}        ║`);
  console.log('║   Environment: ' + (process.env.NODE_ENV || 'development') + '                  ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');

  seedAdmin();
  seedStoreData();
});
