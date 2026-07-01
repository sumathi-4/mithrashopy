const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
// Scratch file path to persist sent emails for test verification
const SENT_EMAILS_FILE = path.join(__dirname, "../scratch/sent_emails.json");
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
			const fileData = fs.readFileSync(SENT_EMAILS_FILE, "utf8");
			if (fileData.trim()) {
				sentEmails = JSON.parse(fileData);
			}
		}
		sentEmails.push({
			...emailPayload,
			timestamp: new Date().toISOString()
		});
		fs.writeFileSync(SENT_EMAILS_FILE, JSON.stringify(sentEmails, null, 2), "utf8");
	} catch (err) {
		console.error("Failed to log sent email:", err);
	}
}
// ─── Nodemailer Transporter Setup ─────────────────────────────────────────────
const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || "smtp.gmail.com",
	port: parseInt(process.env.SMTP_PORT || "587", 10),
	secure: process.env.SMTP_PORT === "465",
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
	let host = process.env.SMTP_HOST || "smtp.gmail.com";
	let port = parseInt(process.env.SMTP_PORT || "587", 10);
	let user = process.env.SMTP_USER;
	let pass = process.env.SMTP_PASS;
	let senderName = "MithraShoppy";
	let senderEmail = user;

	try {
		const { Settings } = require("../db/database");
		const dbSettings = await Settings.findOne().lean();
		if (dbSettings) {
			if (dbSettings.smtpHost) host = dbSettings.smtpHost;
			if (dbSettings.smtpPort) port = parseInt(dbSettings.smtpPort, 10);
			if (dbSettings.smtpUsername) user = dbSettings.smtpUsername;
			if (dbSettings.smtpPassword) pass = dbSettings.smtpPassword;
			if (dbSettings.senderName) senderName = dbSettings.senderName;
			if (dbSettings.senderEmail) senderEmail = dbSettings.senderEmail;
		}
	} catch (dbErr) {
		console.error("Failed to load SMTP settings from DB, using env:", dbErr);
	}

	if (!user || !pass) {
		console.warn(`⚠️ SMTP credentials not set. Skipping real delivery to ${to}`);
		return;
	}
	// 3. Perform real SMTP delivery
	try {
		const dynamicTransporter = nodemailer.createTransport({
			host,
			port,
			secure: port === 465,
			auth: {
				user,
				pass
			}
		});
		const mailOptions = {
			from: process.env.SMTP_FROM || `"${senderName}" <${senderEmail || user}>`,
			to,
		subject,
			text
		};
		const info = await dynamicTransporter.sendMail(mailOptions);
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
	const itemsText = (order.items || []).map((item) => `- ${item.name} x ${item.quantity} (₹${item.price})`).join("\n");
	const body = `
Dear ${customerName},

Your order status has been updated.

Order ID: #${order.id}
Updated Status: ${order.status}
Order Date: ${order.date}
Total Amount: ${order.amount}

Items Ordered:
${itemsText || "None"}

Thank you for shopping with us!
MithraShoppy Team
  `.trim();
	await sendMailHelper({
		to: customerEmail,
		subject,
		text: body,
		extraMetadata: {
			type: "customer_order_status",
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
	const subject = "🎉 Your Vendor Application has been Approved!";
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
			type: "vendor_approval",
			businessName
		}
	});
}
/**
* Sends a vendor product approval/rejection update email.
*/
async function sendVendorProductApprovalEmail(vendorEmail, businessName, product, status, rejectReason = "") {
	if (!vendorEmail) return;
	const statusName = status === "Active" ? "APPROVED" : "REJECTED";
	const subject = `Product Status Update: "${product.name}" is ${statusName}`;
	let statusDetail = "";
	if (status === "Active") {
		statusDetail = `Your product "${product.name}" has been approved and is now live on our marketplace for customers to buy.`;
	} else {
		statusDetail = `Unfortunately, your product "${product.name}" was not approved.\nReason: ${rejectReason || "Not specified"}. Please review and update the product before resubmitting.`;
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
			type: "vendor_product_approval",
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
async function sendVendorRejectionEmail(vendorEmail, businessName, rejectReason = "") {
	if (!vendorEmail) return;
	const subject = "❌ Update on your Vendor Application";
	const body = `
Dear ${businessName},

Thank you for your interest in registering as a vendor on MithraShoppy.

We have processed the review of your application, and unfortunately, we are unable to approve your vendor account at this time.

Reason for rejection: ${rejectReason || "Not specified"}.

Please contact our onboarding support team if you have any questions or would like to submit additional information.

Best regards,
MithraShoppy Onboarding Team
  `.trim();
	await sendMailHelper({
		to: vendorEmail,
		subject,
		text: body,
		extraMetadata: {
			type: "vendor_rejection",
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

//# sourceMappingURL=data:application/json;base64,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c2lvbiI6Mywic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IG5vZGVtYWlsZXIgPSByZXF1aXJlKCdub2RlbWFpbGVyJyk7XG5cbi8vIFNjcmF0Y2ggZmlsZSBwYXRoIHRvIHBlcnNpc3Qgc2VudCBlbWFpbHMgZm9yIHRlc3QgdmVyaWZpY2F0aW9uXG5jb25zdCBTRU5UX0VNQUlMU19GSUxFID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3NjcmF0Y2gvc2VudF9lbWFpbHMuanNvbicpO1xuXG4vLyBFbnN1cmUgc2NyYXRjaCBkaXJlY3RvcnkgZXhpc3RzXG5jb25zdCBzY3JhdGNoRGlyID0gcGF0aC5kaXJuYW1lKFNFTlRfRU1BSUxTX0ZJTEUpO1xuaWYgKCFmcy5leGlzdHNTeW5jKHNjcmF0Y2hEaXIpKSB7XG4gIGZzLm1rZGlyU3luYyhzY3JhdGNoRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTtcbn1cblxuLyoqXG4gKiBIZWxwZXI6IFBlcnNpc3QgdGhlIFwic2VudFwiIGVtYWlsIHRvIHRoZSBsb2NhbCBKU09OIGxvZyBmaWxlLlxuICovXG5mdW5jdGlvbiBsb2dTZW50RW1haWwoZW1haWxQYXlsb2FkKSB7XG4gIHRyeSB7XG4gICAgbGV0IHNlbnRFbWFpbHMgPSBbXTtcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhTRU5UX0VNQUlMU19GSUxFKSkge1xuICAgICAgY29uc3QgZmlsZURhdGEgPSBmcy5yZWFkRmlsZVN5bmMoU0VOVF9FTUFJTFNfRklMRSwgJ3V0ZjgnKTtcbiAgICAgIGlmIChmaWxlRGF0YS50cmltKCkpIHtcbiAgICAgICAgc2VudEVtYWlscyA9IEpTT04ucGFyc2UoZmlsZURhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgICBzZW50RW1haWxzLnB1c2goe1xuICAgICAgLi4uZW1haWxQYXlsb2FkLFxuICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICB9KTtcbiAgICBmcy53cml0ZUZpbGVTeW5jKFNFTlRfRU1BSUxTX0ZJTEUsIEpTT04uc3RyaW5naWZ5KHNlbnRFbWFpbHMsIG51bGwsIDIpLCAndXRmOCcpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKCdGYWlsZWQgdG8gbG9nIHNlbnQgZW1haWw6JywgZXJyKTtcbiAgfVxufVxuXG4vLyDilIDilIDilIAgTm9kZW1haWxlciBUcmFuc3BvcnRlciBTZXR1cCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcblxuY29uc3QgdHJhbnNwb3J0ZXIgPSBub2RlbWFpbGVyLmNyZWF0ZVRyYW5zcG9ydCh7XG4gIGhvc3Q6IHByb2Nlc3MuZW52LlNNVFBfSE9TVCB8fCAnc210cC5nbWFpbC5jb20nLFxuICBwb3J0OiBwYXJzZUludChwcm9jZXNzLmVudi5TTVRQX1BPUlQgfHwgJzU4NycsIDEwKSxcbiAgc2VjdXJlOiBwcm9jZXNzLmVudi5TTVRQX1BPUlQgPT09ICc0NjUnLFxuICBhdXRoOiB7XG4gICAgdXNlcjogcHJvY2Vzcy5lbnYuU01UUF9VU0VSLFxuICAgIHBhc3M6IHByb2Nlc3MuZW52LlNNVFBfUEFTU1xuICB9XG59KTtcblxuLyoqXG4gKiBIZWxwZXI6IFNlbmQgZW1haWwgdmlhIFNNVFBcbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2VuZE1haWxIZWxwZXIoeyB0bywgc3ViamVjdCwgdGV4dCwgZXh0cmFNZXRhZGF0YSA9IHt9IH0pIHtcbiAgLy8gMS4gQWx3YXlzIGxvZyBsb2NhbGx5IGZpcnN0IGZvciB2ZXJpZmljYXRpb24gdGVzdHNcbiAgbG9nU2VudEVtYWlsKHtcbiAgICB0byxcbiAgICBzdWJqZWN0LFxuICAgIGJvZHk6IHRleHQsXG4gICAgLi4uZXh0cmFNZXRhZGF0YVxuICB9KTtcblxuICAvLyAyLiBDaGVjayBpZiBTTVRQIGNyZWRlbnRpYWxzIGFyZSBzZXRcbiAgaWYgKCFwcm9jZXNzLmVudi5TTVRQX1VTRVIgfHwgIXByb2Nlc3MuZW52LlNNVFBfUEFTUykge1xuICAgIGNvbnNvbGUud2Fybihg4pqg77iPIFNNVFAgY3JlZGVudGlhbHMgbm90IHNldCBpbiAuZW52LiBTa2lwcGluZyByZWFsIGRlbGl2ZXJ5IHRvICR7dG99YCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gMy4gUGVyZm9ybSByZWFsIFNNVFAgZGVsaXZlcnlcbiAgdHJ5IHtcbiAgICBjb25zdCBtYWlsT3B0aW9ucyA9IHtcbiAgICAgIGZyb206IHByb2Nlc3MuZW52LlNNVFBfRlJPTSB8fCBgXCJNaXRocmFTaG9wcHlcIiA8JHtwcm9jZXNzLmVudi5TTVRQX1VTRVJ9PmAsXG4gICAgICB0byxcbiAgICAgIHN1YmplY3QsXG4gICAgICB0ZXh0XG4gICAgfTtcbiAgICBjb25zdCBpbmZvID0gYXdhaXQgdHJhbnNwb3J0ZXIuc2VuZE1haWwobWFpbE9wdGlvbnMpO1xuICAgIGNvbnNvbGUubG9nKGDinInvuI8gUmVhbCBlbWFpbCBzZW50IHRvICR7dG99LiBNZXNzYWdlIElEOiAke2luZm8ubWVzc2FnZUlkfWApO1xuICAgIHJldHVybiBpbmZvO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKGDinYwgU01UUCBkZWxpdmVyeSBmYWlsZWQgdG8gJHt0b306YCwgZXJyLm1lc3NhZ2UpO1xuICB9XG59XG5cbi8vIOKUgOKUgOKUgCBDdXN0b21lciBFbWFpbCBGbG93IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG4vKipcbiAqIFNlbmRzIGFuIG9yZGVyIHN0YXR1cyB1cGRhdGUgZW1haWwgdG8gdGhlIGN1c3RvbWVyLlxuICovXG5hc3luYyBmdW5jdGlvbiBzZW5kT3JkZXJTdGF0dXNFbWFpbChjdXN0b21lckVtYWlsLCBjdXN0b21lck5hbWUsIG9yZGVyKSB7XG4gIGlmICghY3VzdG9tZXJFbWFpbCkgcmV0dXJuO1xuXG4gIGNvbnN0IHN1YmplY3QgPSBgT3JkZXIgU3RhdHVzIFVwZGF0ZWQ6ICMke29yZGVyLmlkfWA7XG4gIFxuICAvLyBGb3JtYXQgaXRlbSBkZXRhaWxzXG4gIGNvbnN0IGl0ZW1zVGV4dCA9IChvcmRlci5pdGVtcyB8fCBbXSlcbiAgICAubWFwKGl0ZW0gPT4gYC0gJHtpdGVtLm5hbWV9IHggJHtpdGVtLnF1YW50aXR5fSAo4oK5JHtpdGVtLnByaWNlfSlgKVxuICAgIC5qb2luKCdcXG4nKTtcblxuICBjb25zdCBib2R5ID0gYFxuRGVhciAke2N1c3RvbWVyTmFtZX0sXG5cbllvdXIgb3JkZXIgc3RhdHVzIGhhcyBiZWVuIHVwZGF0ZWQuXG5cbk9yZGVyIElEOiAjJHtvcmRlci5pZH1cblVwZGF0ZWQgU3RhdHVzOiAke29yZGVyLnN0YXR1c31cbk9yZGVyIERhdGU6ICR7b3JkZXIuZGF0ZX1cblRvdGFsIEFtb3VudDogJHtvcmRlci5hbW91bnR9XG5cbkl0ZW1zIE9yZGVyZWQ6XG4ke2l0ZW1zVGV4dCB8fCAnTm9uZSd9XG5cblRoYW5rIHlvdSBmb3Igc2hvcHBpbmcgd2l0aCB1cyFcbk1pdGhyYVNob3BweSBUZWFtXG4gIGAudHJpbSgpO1xuXG4gIGF3YWl0IHNlbmRNYWlsSGVscGVyKHtcbiAgICB0bzogY3VzdG9tZXJFbWFpbCxcbiAgICBzdWJqZWN0LFxuICAgIHRleHQ6IGJvZHksXG4gICAgZXh0cmFNZXRhZGF0YToge1xuICAgICAgdHlwZTogJ2N1c3RvbWVyX29yZGVyX3N0YXR1cycsXG4gICAgICBvcmRlcklkOiBvcmRlci5pZCxcbiAgICAgIHN0YXR1czogb3JkZXIuc3RhdHVzXG4gICAgfVxuICB9KTtcbn1cblxuLy8g4pSA4pSA4pSAIFZlbmRvciBFbWFpbCBGbG93IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuXG4vKipcbiAqIFNlbmRzIGEgdmVuZG9yIGFwcHJvdmFsIGNvbmZpcm1hdGlvbiBlbWFpbC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2VuZFZlbmRvckFwcHJvdmFsRW1haWwodmVuZG9yRW1haWwsIGJ1c2luZXNzTmFtZSkge1xuICBpZiAoIXZlbmRvckVtYWlsKSByZXR1cm47XG5cbiAgY29uc3Qgc3ViamVjdCA9ICfwn46JIFlvdXIgVmVuZG9yIEFwcGxpY2F0aW9uIGhhcyBiZWVuIEFwcHJvdmVkISc7XG4gIGNvbnN0IGJvZHkgPSBgXG5EZWFyICR7YnVzaW5lc3NOYW1lfSxcblxuV2UgYXJlIHRocmlsbGVkIHRvIGluZm9ybSB5b3UgdGhhdCB5b3VyIHZlbmRvciByZWdpc3RyYXRpb24gb24gTWl0aHJhU2hvcHB5IGhhcyBiZWVuIGFwcHJvdmVkIVxuXG5Zb3UgY2FuIG5vdyBsb2cgaW4gdG8gdGhlIFNlbGxlciBQb3J0YWwgd2l0aCB5b3VyIHJlZ2lzdGVyZWQgY3JlZGVudGlhbHMgYW5kIHN0YXJ0IGFkZGluZyBwcm9kdWN0cyB0byB5b3VyIGNhdGFsb2cuXG5cbldlbGNvbWUgYWJvYXJkIVxuTWl0aHJhU2hvcHB5IE9uYm9hcmRpbmcgVGVhbVxuICBgLnRyaW0oKTtcblxuICBhd2FpdCBzZW5kTWFpbEhlbHBlcih7XG4gICAgdG86IHZlbmRvckVtYWlsLFxuICAgIHN1YmplY3QsXG4gICAgdGV4dDogYm9keSxcbiAgICBleHRyYU1ldGFkYXRhOiB7XG4gICAgICB0eXBlOiAndmVuZG9yX2FwcHJvdmFsJyxcbiAgICAgIGJ1c2luZXNzTmFtZVxuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogU2VuZHMgYSB2ZW5kb3IgcHJvZHVjdCBhcHByb3ZhbC9yZWplY3Rpb24gdXBkYXRlIGVtYWlsLlxuICovXG5hc3luYyBmdW5jdGlvbiBzZW5kVmVuZG9yUHJvZHVjdEFwcHJvdmFsRW1haWwodmVuZG9yRW1haWwsIGJ1c2luZXNzTmFtZSwgcHJvZHVjdCwgc3RhdHVzLCByZWplY3RSZWFzb24gPSAnJykge1xuICBpZiAoIXZlbmRvckVtYWlsKSByZXR1cm47XG5cbiAgY29uc3Qgc3RhdHVzTmFtZSA9IHN0YXR1cyA9PT0gJ0FjdGl2ZScgPyAnQVBQUk9WRUQnIDogJ1JFSkVDVEVEJztcbiAgY29uc3Qgc3ViamVjdCA9IGBQcm9kdWN0IFN0YXR1cyBVcGRhdGU6IFwiJHtwcm9kdWN0Lm5hbWV9XCIgaXMgJHtzdGF0dXNOYW1lfWA7XG4gIFxuICBsZXQgc3RhdHVzRGV0YWlsID0gJyc7XG4gIGlmIChzdGF0dXMgPT09ICdBY3RpdmUnKSB7XG4gICAgc3RhdHVzRGV0YWlsID0gYFlvdXIgcHJvZHVjdCBcIiR7cHJvZHVjdC5uYW1lfVwiIGhhcyBiZWVuIGFwcHJvdmVkIGFuZCBpcyBub3cgbGl2ZSBvbiBvdXIgbWFya2V0cGxhY2UgZm9yIGN1c3RvbWVycyB0byBidXkuYDtcbiAgfSBlbHNlIHtcbiAgICBzdGF0dXNEZXRhaWwgPSBgVW5mb3J0dW5hdGVseSwgeW91ciBwcm9kdWN0IFwiJHtwcm9kdWN0Lm5hbWV9XCIgd2FzIG5vdCBhcHByb3ZlZC5cXG5SZWFzb246ICR7cmVqZWN0UmVhc29uIHx8ICdOb3Qgc3BlY2lmaWVkJ30uIFBsZWFzZSByZXZpZXcgYW5kIHVwZGF0ZSB0aGUgcHJvZHVjdCBiZWZvcmUgcmVzdWJtaXR0aW5nLmA7XG4gIH1cblxuICBjb25zdCBib2R5ID0gYFxuRGVhciAke2J1c2luZXNzTmFtZX0sXG5cbldlIGhhdmUgcHJvY2Vzc2VkIHRoZSByZXZpZXcgb2YgeW91ciBwcm9kdWN0LlxuXG5Qcm9kdWN0IElEOiAke3Byb2R1Y3QuaWR9XG5Qcm9kdWN0IE5hbWU6ICR7cHJvZHVjdC5uYW1lfVxuUmV2aWV3IERlY2lzaW9uOiAke3N0YXR1c05hbWV9XG5cbkRldGFpbHM6XG4ke3N0YXR1c0RldGFpbH1cblxuQmVzdCByZWdhcmRzLFxuTWl0aHJhU2hvcHB5IENhdGFsb2cgVGVhbVxuICBgLnRyaW0oKTtcblxuICBhd2FpdCBzZW5kTWFpbEhlbHBlcih7XG4gICAgdG86IHZlbmRvckVtYWlsLFxuICAgIHN1YmplY3QsXG4gICAgdGV4dDogYm9keSxcbiAgICBleHRyYU1ldGFkYXRhOiB7XG4gICAgICB0eXBlOiAndmVuZG9yX3Byb2R1Y3RfYXBwcm92YWwnLFxuICAgICAgcHJvZHVjdElkOiBwcm9kdWN0LmlkLFxuICAgICAgcHJvZHVjdE5hbWU6IHByb2R1Y3QubmFtZSxcbiAgICAgIHN0YXR1czogc3RhdHVzTmFtZSxcbiAgICAgIHJlamVjdFJlYXNvblxuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogU2VuZHMgYSB2ZW5kb3IgcmVqZWN0aW9uIGNvbmZpcm1hdGlvbiBlbWFpbC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2VuZFZlbmRvclJlamVjdGlvbkVtYWlsKHZlbmRvckVtYWlsLCBidXNpbmVzc05hbWUsIHJlamVjdFJlYXNvbiA9ICcnKSB7XG4gIGlmICghdmVuZG9yRW1haWwpIHJldHVybjtcblxuICBjb25zdCBzdWJqZWN0ID0gJ+KdjCBVcGRhdGUgb24geW91ciBWZW5kb3IgQXBwbGljYXRpb24nO1xuICBjb25zdCBib2R5ID0gYFxuRGVhciAke2J1c2luZXNzTmFtZX0sXG5cblRoYW5rIHlvdSBmb3IgeW91ciBpbnRlcmVzdCBpbiByZWdpc3RlcmluZyBhcyBhIHZlbmRvciBvbiBNaXRocmFTaG9wcHkuXG5cbldlIGhhdmUgcHJvY2Vzc2VkIHRoZSByZXZpZXcgb2YgeW91ciBhcHBsaWNhdGlvbiwgYW5kIHVuZm9ydHVuYXRlbHksIHdlIGFyZSB1bmFibGUgdG8gYXBwcm92ZSB5b3VyIHZlbmRvciBhY2NvdW50IGF0IHRoaXMgdGltZS5cblxuUmVhc29uIGZvciByZWplY3Rpb246ICR7cmVqZWN0UmVhc29uIHx8ICdOb3Qgc3BlY2lmaWVkJ30uXG5cblBsZWFzZSBjb250YWN0IG91ciBvbmJvYXJkaW5nIHN1cHBvcnQgdGVhbSBpZiB5b3UgaGF2ZSBhbnkgcXVlc3Rpb25zIG9yIHdvdWxkIGxpa2UgdG8gc3VibWl0IGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG5cbkJlc3QgcmVnYXJkcyxcbk1pdGhyYVNob3BweSBPbmJvYXJkaW5nIFRlYW1cbiAgYC50cmltKCk7XG5cbiAgYXdhaXQgc2VuZE1haWxIZWxwZXIoe1xuICAgIHRvOiB2ZW5kb3JFbWFpbCxcbiAgICBzdWJqZWN0LFxuICAgIHRleHQ6IGJvZHksXG4gICAgZXh0cmFNZXRhZGF0YToge1xuICAgICAgdHlwZTogJ3ZlbmRvcl9yZWplY3Rpb24nLFxuICAgICAgYnVzaW5lc3NOYW1lLFxuICAgICAgcmVqZWN0UmVhc29uXG4gICAgfVxuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNlbmRPcmRlclN0YXR1c0VtYWlsLFxuICBzZW5kVmVuZG9yQXBwcm92YWxFbWFpbCxcbiAgc2VuZFZlbmRvclJlamVjdGlvbkVtYWlsLFxuICBzZW5kVmVuZG9yUHJvZHVjdEFwcHJvdmFsRW1haWxcbn07XG4iXX0=