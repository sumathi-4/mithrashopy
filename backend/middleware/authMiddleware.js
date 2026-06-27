const jwt = require('jsonwebtoken');
const { Vendor } = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware: Verify JWT from Authorization header or cookie.
 * Attaches decoded user payload to req.user.
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided. Please log in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
}

/**
 * Middleware: Require admin role.
 * Must be used AFTER authenticate middleware.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
}

/**
 * Middleware: Verify Vendor JWT and confirm vendor is Approved.
 * Attaches full vendor document to req.vendor.
 */
async function authenticateVendor(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided. Please log in.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'vendor') {
      return res.status(403).json({ success: false, message: 'Vendor access required.' });
    }

    const vendor = await Vendor.findOne({ id: decoded.id }).lean();
    if (!vendor) {
      return res.status(401).json({ success: false, message: 'Vendor account not found.' });
    }
    if (vendor.status !== 'Approved') {
      let msg = 'Your account is not approved yet.';
      if (vendor.status === 'Pending') {
        msg = 'Your application is pending admin approval. We will notify you via email once reviewed.';
      } else if (vendor.status === 'Rejected') {
        msg = `Your application has been rejected. Reason: ${vendor.rejectReason || 'Not specified'}. Please contact support.`;
      } else if (vendor.status === 'Suspended') {
        msg = 'Your vendor account has been suspended. Please contact support.';
      }
      return res.status(403).json({ success: false, status: vendor.status, message: msg });
    }

    req.vendor = vendor;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
}

module.exports = { authenticate, requireAdmin, authenticateVendor };
