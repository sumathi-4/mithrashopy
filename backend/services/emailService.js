const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Scratch file path to persist sent emails for test verification
const SENT_EMAILS_FILE = path.join(__dirname, '../scratch/sent_emails.json');

// Ensure scratch directory exists
const scratchDir = path.dirname(SENT_EMAILS_FILE);
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

/**
 * Helper: Persist the "sent" email to the local JSON log file.
 */
function logSentEmail(emailPayload) {
  try {
    let sentEmails = [];
    if (fs.existsSync(SENT_EMAILS_FILE)) {
      const fileData = fs.readFileSync(SENT_EMAILS_FILE, 'utf8');
      if (fileData.trim()) {
        sentEmails = JSON.parse(fileData);
      }
    }
    sentEmails.push({
      ...emailPayload,
      timestamp: new Date().toISOString()
    });
    fs.writeFileSync(SENT_EMAILS_FILE, JSON.stringify(sentEmails, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to log sent email:', err);
  }
}

// ─── Nodemailer Transporter Setup ─────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Helper: Send email via SMTP
 */
async function sendMailHelper({ to, subject, text, extraMetadata = {} }) {
  // 1. Always log locally first for verification tests
  logSentEmail({
    to,
    subject,
    body: text,
    ...extraMetadata
  });

  // 2. Check if SMTP credentials are set
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`⚠️ SMTP credentials not set in .env. Skipping real delivery to ${to}`);
    return;
  }

  // 3. Perform real SMTP delivery
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || `"MithraShoppy" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Real email sent to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ SMTP delivery failed to ${to}:`, err.message);
  }
}

// ─── Customer Email Flow ───────────────────────────────────────────────────────

/**
 * Sends an order status update email to the customer.
 */
async function sendOrderStatusEmail(customerEmail, customerName, order) {
  if (!customerEmail) return;

  const subject = `Order Status Updated: #${order.id}`;
  
  // Format item details
  const itemsText = (order.items || [])
    .map(item => `- ${item.name} x ${item.quantity} (₹${item.price})`)
    .join('\n');

  const body = `
Dear ${customerName},

Your order status has been updated.

Order ID: #${order.id}
Updated Status: ${order.status}
Order Date: ${order.date}
Total Amount: ${order.amount}

Items Ordered:
${itemsText || 'None'}

Thank you for shopping with us!
MithraShoppy Team
  `.trim();

  await sendMailHelper({
    to: customerEmail,
    subject,
    text: body,
    extraMetadata: {
      type: 'customer_order_status',
      orderId: order.id,
      status: order.status
    }
  });
}

// ─── Vendor Email Flow ─────────────────────────────────────────────────────────

/**
 * Sends a vendor approval confirmation email.
 */
async function sendVendorApprovalEmail(vendorEmail, businessName) {
  if (!vendorEmail) return;

  const subject = '🎉 Your Vendor Application has been Approved!';
  const body = `
Dear ${businessName},

We are thrilled to inform you that your vendor registration on MithraShoppy has been approved!

You can now log in to the Seller Portal with your registered credentials and start adding products to your catalog.

Welcome aboard!
MithraShoppy Onboarding Team
  `.trim();

  await sendMailHelper({
    to: vendorEmail,
    subject,
    text: body,
    extraMetadata: {
      type: 'vendor_approval',
      businessName
    }
  });
}

/**
 * Sends a vendor product approval/rejection update email.
 */
async function sendVendorProductApprovalEmail(vendorEmail, businessName, product, status, rejectReason = '') {
  if (!vendorEmail) return;

  const statusName = status === 'Active' ? 'APPROVED' : 'REJECTED';
  const subject = `Product Status Update: "${product.name}" is ${statusName}`;
  
  let statusDetail = '';
  if (status === 'Active') {
    statusDetail = `Your product "${product.name}" has been approved and is now live on our marketplace for customers to buy.`;
  } else {
    statusDetail = `Unfortunately, your product "${product.name}" was not approved.\nReason: ${rejectReason || 'Not specified'}. Please review and update the product before resubmitting.`;
  }

  const body = `
Dear ${businessName},

We have processed the review of your product.

Product ID: ${product.id}
Product Name: ${product.name}
Review Decision: ${statusName}

Details:
${statusDetail}

Best regards,
MithraShoppy Catalog Team
  `.trim();

  await sendMailHelper({
    to: vendorEmail,
    subject,
    text: body,
    extraMetadata: {
      type: 'vendor_product_approval',
      productId: product.id,
      productName: product.name,
      status: statusName,
      rejectReason
    }
  });
}

/**
 * Sends a vendor rejection confirmation email.
 */
async function sendVendorRejectionEmail(vendorEmail, businessName, rejectReason = '') {
  if (!vendorEmail) return;

  const subject = '❌ Update on your Vendor Application';
  const body = `
Dear ${businessName},

Thank you for your interest in registering as a vendor on MithraShoppy.

We have processed the review of your application, and unfortunately, we are unable to approve your vendor account at this time.

Reason for rejection: ${rejectReason || 'Not specified'}.

Please contact our onboarding support team if you have any questions or would like to submit additional information.

Best regards,
MithraShoppy Onboarding Team
  `.trim();

  await sendMailHelper({
    to: vendorEmail,
    subject,
    text: body,
    extraMetadata: {
      type: 'vendor_rejection',
      businessName,
      rejectReason
    }
  });
}

module.exports = {
  sendOrderStatusEmail,
  sendVendorApprovalEmail,
  sendVendorRejectionEmail,
  sendVendorProductApprovalEmail
};
