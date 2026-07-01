const express = require("express");
const { Settings } = require("../db/database");
const { authenticate, requireAdmin } = require("../middleware/authMiddleware");
const router = express.Router();


// GET /api/settings - Fetch general configuration settings
router.get("/", async (req, res) => {
	try {
		const settings = await Settings.findOne().lean();
		res.json({
			success: true,
			settings
		});
	} catch (err) {
		console.error("Fetch settings error:", err);
		res.status(500).json({
			success: false,
			message: "Failed to fetch settings."
		});
	}
});
// PUT /api/settings - Update general store settings (admin only)
router.put("/", authenticate, requireAdmin, async (req, res) => {
	try {
		const { storeName, supportEmail, taxPercentage, defaultCurrency, shippingInfoLines, freeShippingAbove, standardCharge, expressCharge, codCharges, enableCod, enableExpress, enableInternational, senderName, senderEmail, smtpHost, smtpPort, smtpUsername, smtpPassword } = req.body;
		const updateFields = {};
		if (storeName !== undefined) updateFields.storeName = storeName.trim();
		if (senderName !== undefined) updateFields.senderName = senderName.trim();
		if (senderEmail !== undefined) updateFields.senderEmail = senderEmail.trim();
		if (smtpHost !== undefined) updateFields.smtpHost = smtpHost.trim();
		if (smtpPort !== undefined) updateFields.smtpPort = parseInt(smtpPort, 10);
		if (smtpUsername !== undefined) updateFields.smtpUsername = smtpUsername.trim();
		if (smtpPassword !== undefined) updateFields.smtpPassword = smtpPassword;
		if (supportEmail !== undefined) updateFields.supportEmail = supportEmail.trim();
		if (taxPercentage !== undefined) updateFields.taxPercentage = parseInt(taxPercentage, 10);
		if (defaultCurrency !== undefined) updateFields.defaultCurrency = defaultCurrency;
		if (shippingInfoLines !== undefined) {
			if (Array.isArray(shippingInfoLines)) {
				updateFields.shippingInfoLines = shippingInfoLines.map((line) => line.trim()).filter((line) => line.length > 0);
			}
		}
		if (freeShippingAbove !== undefined) updateFields.freeShippingAbove = parseFloat(freeShippingAbove);
		if (standardCharge !== undefined) updateFields.standardCharge = parseFloat(standardCharge);
		if (expressCharge !== undefined) updateFields.expressCharge = parseFloat(expressCharge);
		if (codCharges !== undefined) updateFields.codCharges = parseFloat(codCharges);
		if (enableCod !== undefined) updateFields.enableCod = !!enableCod;
		if (enableExpress !== undefined) updateFields.enableExpress = !!enableExpress;
		if (enableInternational !== undefined) updateFields.enableInternational = !!enableInternational;
		const saved = await Settings.findOneAndUpdate({}, { $set: updateFields }, {
			new: true,
			upsert: true
		}).lean();
		res.json({
			success: true,
			message: "Settings saved successfully!",
			settings: saved
		});
	} catch (err) {
		console.error("Update settings error:", err);
		res.status(500).json({
			success: false,
			message: "Failed to save settings."
		});
	}
});
module.exports = router;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxVQUFVLFFBQVEsU0FBUztBQUNqQyxNQUFNLEVBQUUsYUFBYSxRQUFRLGdCQUFnQjtBQUM3QyxNQUFNLEVBQUUsY0FBYyxpQkFBaUIsUUFBUSw4QkFBOEI7QUFFN0UsTUFBTSxTQUFTLFFBQVEsT0FBTzs7QUFHOUIsT0FBTyxJQUFJLEtBQUssT0FBTyxLQUFLLFFBQVE7Q0FDbEMsSUFBSTtFQUNGLE1BQU0sV0FBVyxNQUFNLFNBQVMsUUFBUSxFQUFFLEtBQUs7RUFDL0MsSUFBSSxLQUFLO0dBQUUsU0FBUztHQUFNO0VBQVMsQ0FBQztDQUN0QyxTQUFTLEtBQUs7RUFDWixRQUFRLE1BQU0seUJBQXlCLEdBQUc7RUFDMUMsSUFBSSxPQUFPLEdBQUcsRUFBRSxLQUFLO0dBQUUsU0FBUztHQUFPLFNBQVM7RUFBNEIsQ0FBQztDQUMvRTtBQUNGLENBQUM7O0FBR0QsT0FBTyxJQUFJLEtBQUssY0FBYyxjQUFjLE9BQU8sS0FBSyxRQUFRO0NBQzlELElBQUk7RUFDRixNQUFNLEVBQ0osV0FDQSxjQUNBLGVBQ0EsaUJBQ0EsbUJBQ0EsbUJBQ0EsZ0JBQ0EsZUFDQSxZQUNBLFdBQ0EsZUFDQSxpQ0FDTTtFQUVSLE1BQU0sZUFBZSxDQUFDO0VBQ3RCLElBQUksY0FBYyxXQUFXLGFBQWEsWUFBWSxVQUFVLEtBQUs7RUFDckUsSUFBSSwwQkFBaUIsYUFBVyxhQUFhLFdBQWU7RUFDNUQsSUFBSSwyQkFBa0IsYUFBVyxjQUFhLFlBQWdCLEtBQVM7RUFDdkUsSUFBSSx3QkFBb0IsYUFBVyxXQUFhLGNBQWtCO0VBRWxFLElBQUksd0JBQXNCLGFBQVc7TUFDbkMsaUJBQWtCLHdCQUFvQjtNQUNwQyxpQkFBYSx3QkFBb0IsZUFBc0I7TUFDekQ7RUFDRjtFQUNBLElBQUksK0JBQXNCLGFBQVcsa0JBQWE7RUFDbEQsSUFBSSxzQkFBbUIsV0FBVztHQUNsQyxJQUFJLCtCQUE2QjtJQUNqQyxhQUFJLG9CQUEwQixrQkFBYSxLQUFhLFNBQVcsVUFBVTtHQUM3RTtFQUNBO0VBQ0EsSUFBSSxpQ0FBd0IsYUFBVyxvQkFBYSxXQUF3QjtFQUU1RSx1QkFBb0IsV0FBUyxhQUMxQixpQkFDTyxXQUNSO01BQUUsa0JBQUs7TUFBTSxlQUFRO0VBQUssSUFDMUIsY0FBSztFQUVQLElBQUksa0JBQUs7TUFBRSx3QkFBUztRQUFNLFFBQVM7R0FBZ0M7R0FBaUI7RUFDdEYsUUFBUztFQUNQLFNBQVE7R0FDUixTQUFJO0dBQW1CLFNBQVM7R0FBTyxVQUFTO0VBQTJCLENBQUM7Q0FDOUU7RUFDRDtFQUVELFdBQU8sS0FBVSIsIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsic2V0dGluZ3MuanMiXSwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcbmNvbnN0IHsgU2V0dGluZ3MgfSA9IHJlcXVpcmUoJy4uL2RiL2RhdGFiYXNlJyk7XG5jb25zdCB7IGF1dGhlbnRpY2F0ZSwgcmVxdWlyZUFkbWluIH0gPSByZXF1aXJlKCcuLi9taWRkbGV3YXJlL2F1dGhNaWRkbGV3YXJlJyk7XG5cbmNvbnN0IHJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XG5cbi8vIEdFVCAvYXBpL3NldHRpbmdzIC0gRmV0Y2ggZ2VuZXJhbCBjb25maWd1cmF0aW9uIHNldHRpbmdzXG5yb3V0ZXIuZ2V0KCcvJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2V0dGluZ3MgPSBhd2FpdCBTZXR0aW5ncy5maW5kT25lKCkubGVhbigpO1xuICAgIHJlcy5qc29uKHsgc3VjY2VzczogdHJ1ZSwgc2V0dGluZ3MgfSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0ZldGNoIHNldHRpbmdzIGVycm9yOicsIGVycik7XG4gICAgcmVzLnN0YXR1cyg1MDApLmpzb24oeyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogJ0ZhaWxlZCB0byBmZXRjaCBzZXR0aW5ncy4nIH0pO1xuICB9XG59KTtcblxuLy8gUFVUIC9hcGkvc2V0dGluZ3MgLSBVcGRhdGUgZ2VuZXJhbCBzdG9yZSBzZXR0aW5ncyAoYWRtaW4gb25seSlcbnJvdXRlci5wdXQoJy8nLCBhdXRoZW50aWNhdGUsIHJlcXVpcmVBZG1pbiwgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3Qge1xuICAgICAgc3RvcmVOYW1lLFxuICAgICAgc3VwcG9ydEVtYWlsLFxuICAgICAgdGF4UGVyY2VudGFnZSxcbiAgICAgIGRlZmF1bHRDdXJyZW5jeSxcbiAgICAgIHNoaXBwaW5nSW5mb0xpbmVzLFxuICAgICAgZnJlZVNoaXBwaW5nQWJvdmUsXG4gICAgICBzdGFuZGFyZENoYXJnZSxcbiAgICAgIGV4cHJlc3NDaGFyZ2UsXG4gICAgICBjb2RDaGFyZ2VzLFxuICAgICAgZW5hYmxlQ29kLFxuICAgICAgZW5hYmxlRXhwcmVzcyxcbiAgICAgIGVuYWJsZUludGVybmF0aW9uYWxcbiAgICB9ID0gcmVxLmJvZHk7XG5cbiAgICBjb25zdCB1cGRhdGVGaWVsZHMgPSB7fTtcbiAgICBpZiAoc3RvcmVOYW1lICE9PSB1bmRlZmluZWQpIHVwZGF0ZUZpZWxkcy5zdG9yZU5hbWUgPSBzdG9yZU5hbWUudHJpbSgpO1xuICAgIGlmIChzdXBwb3J0RW1haWwgIT09IHVuZGVmaW5lZCkgdXBkYXRlRmllbGRzLnN1cHBvcnRFbWFpbCA9IHN1cHBvcnRFbWFpbC50cmltKCk7XG4gICAgaWYgKHRheFBlcmNlbnRhZ2UgIT09IHVuZGVmaW5lZCkgdXBkYXRlRmllbGRzLnRheFBlcmNlbnRhZ2UgPSBwYXJzZUludCh0YXhQZXJjZW50YWdlLCAxMCk7XG4gICAgaWYgKGRlZmF1bHRDdXJyZW5jeSAhPT0gdW5kZWZpbmVkKSB1cGRhdGVGaWVsZHMuZGVmYXVsdEN1cnJlbmN5ID0gZGVmYXVsdEN1cnJlbmN5O1xuXG4gICAgaWYgKHNoaXBwaW5nSW5mb0xpbmVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHNoaXBwaW5nSW5mb0xpbmVzKSkge1xuICAgICAgICB1cGRhdGVGaWVsZHMuc2hpcHBpbmdJbmZvTGluZXMgPSBzaGlwcGluZ0luZm9MaW5lcy5tYXAobGluZSA9PiBsaW5lLnRyaW0oKSkuZmlsdGVyKGxpbmUgPT4gbGluZS5sZW5ndGggPiAwKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGZyZWVTaGlwcGluZ0Fib3ZlICE9PSB1bmRlZmluZWQpIHVwZGF0ZUZpZWxkcy5mcmVlU2hpcHBpbmdBYm92ZSA9IHBhcnNlRmxvYXQoZnJlZVNoaXBwaW5nQWJvdmUpO1xuICAgIGlmIChzdGFuZGFyZENoYXJnZSAhPT0gdW5kZWZpbmVkKSB1cGRhdGVGaWVsZHMuc3RhbmRhcmRDaGFyZ2UgPSBwYXJzZUZsb2F0KHN0YW5kYXJkQ2hhcmdlKTtcbiAgICBpZiAoZXhwcmVzc0NoYXJnZSAhPT0gdW5kZWZpbmVkKSB1cGRhdGVGaWVsZHMuZXhwcmVzc0NoYXJnZSA9IHBhcnNlRmxvYXQoZXhwcmVzc0NoYXJnZSk7XG4gICAgaWYgKGNvZENoYXJnZXMgIT09IHVuZGVmaW5lZCkgdXBkYXRlRmllbGRzLmNvZENoYXJnZXMgPSBwYXJzZUZsb2F0KGNvZENoYXJnZXMpO1xuICAgIGlmIChlbmFibGVDb2QgIT09IHVuZGVmaW5lZCkgdXBkYXRlRmllbGRzLmVuYWJsZUNvZCA9ICEhZW5hYmxlQ29kO1xuICAgIGlmIChlbmFibGVFeHByZXNzICE9PSB1bmRlZmluZWQpIHVwZGF0ZUZpZWxkcy5lbmFibGVFeHByZXNzID0gISFlbmFibGVFeHByZXNzO1xuICAgIGlmIChlbmFibGVJbnRlcm5hdGlvbmFsICE9PSB1bmRlZmluZWQpIHVwZGF0ZUZpZWxkcy5lbmFibGVJbnRlcm5hdGlvbmFsID0gISFlbmFibGVJbnRlcm5hdGlvbmFsO1xuXG4gICAgY29uc3Qgc2F2ZWQgPSBhd2FpdCBTZXR0aW5ncy5maW5kT25lQW5kVXBkYXRlKFxuICAgICAge30sXG4gICAgICB7ICRzZXQ6IHVwZGF0ZUZpZWxkcyB9LFxuICAgICAgeyBuZXc6IHRydWUsIHVwc2VydDogdHJ1ZSB9XG4gICAgKS5sZWFuKCk7XG5cbiAgICByZXMuanNvbih7IHN1Y2Nlc3M6IHRydWUsIG1lc3NhZ2U6ICdTZXR0aW5ncyBzYXZlZCBzdWNjZXNzZnVsbHkhJywgc2V0dGluZ3M6IHNhdmVkIH0pO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKCdVcGRhdGUgc2V0dGluZ3MgZXJyb3I6JywgZXJyKTtcbiAgICByZXMuc3RhdHVzKDUwMCkuanNvbih7IHN1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiAnRmFpbGVkIHRvIHNhdmUgc2V0dGluZ3MuJyB9KTtcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gcm91dGVyO1xuIl0sImZpbGUiOiJDOi9Vc2Vycy9FTENPVC9PbmVEcml2ZS9EZXNrdG9wL2pvYiB0YXNrcy9wcm9qZWN0Mi9iYWNrZW5kL3JvdXRlcy9zZXR0aW5ncy5qcyJ9