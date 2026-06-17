const express = require('express');
const { Banner, Announcement, ContactQuery } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Banners ──────────────────────────────────────────────────────────────────
router.get('/banners', async (req, res) => {
  try {
    const banners = await Banner.find().lean();
    res.json({ success: true, banners });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch banners.' });
  }
});

router.post('/banners', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, slot, image, status } = req.body;
    if (!title || !slot) {
      return res.status(400).json({ success: false, message: 'Title and placement slot are required.' });
    }

    const maxBanner = await Banner.findOne().sort({ id: -1 });
    const id = maxBanner ? maxBanner.id + 1 : 1;

    const newBanner = await Banner.create({
      id,
      title: title.trim(),
      slot: slot,
      image: image || 'Kids',
      clickRate: '0.0%',
      status: status || 'Active'
    });
    res.status(201).json({ success: true, message: 'Banner added successfully!', banner: newBanner });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add banner.' });
  }
});

router.put('/banners/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid banner ID.' });

    const { status } = req.body;
    const banner = await Banner.findOne({ id });
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }

    const targetStatus = status || (banner.status === 'Active' ? 'Inactive' : 'Active');
    const updated = await Banner.findOneAndUpdate(
      { id },
      { $set: { status: targetStatus } },
      { new: true }
    ).lean();

    res.json({ success: true, message: 'Banner status toggled!', banner: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update banner.' });
  }
});

router.delete('/banners/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid banner ID.' });

    const result = await Banner.deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Banner not found.' });
    }
    res.json({ success: true, message: 'Banner deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete banner.' });
  }
});

// ─── Announcements ────────────────────────────────────────────────────────────
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find().lean();
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch announcements.' });
  }
});

router.post('/announcements', authenticate, requireAdmin, async (req, res) => {
  try {
    const { text, placement, expiry, status } = req.body;
    if (!text || !expiry) {
      return res.status(400).json({ success: false, message: 'Text and expiry date are required.' });
    }

    const maxAnn = await Announcement.findOne().sort({ id: -1 });
    const id = maxAnn ? maxAnn.id + 1 : 1;

    const newAnn = await Announcement.create({
      id,
      text: text.trim(),
      placement: placement || 'Top Header',
      expiry: expiry,
      status: status || 'Active'
    });
    res.status(201).json({ success: true, message: 'Announcement created!', announcement: newAnn });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create announcement.' });
  }
});

router.put('/announcements/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid announcement ID.' });

    const { status } = req.body;
    const ann = await Announcement.findOne({ id });
    if (!ann) return res.status(404).json({ success: false, message: 'Announcement not found.' });

    const targetStatus = status || (ann.status === 'Active' ? 'Inactive' : 'Active');
    const updated = await Announcement.findOneAndUpdate(
      { id },
      { $set: { status: targetStatus } },
      { new: true }
    ).lean();

    res.json({ success: true, message: 'Announcement status toggled!', announcement: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update announcement.' });
  }
});

router.delete('/announcements/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid announcement ID.' });

    const result = await Announcement.deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete announcement.' });
  }
});

// ─── Contact Queries ──────────────────────────────────────────────────────────
router.get('/queries', authenticate, requireAdmin, async (req, res) => {
  try {
    const queries = await ContactQuery.find().lean();
    res.json({ success: true, queries });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch contact queries.' });
  }
});

router.post('/queries', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message text are required.' });
    }

    const maxQuery = await ContactQuery.findOne().sort({ id: -1 });
    const id = maxQuery ? maxQuery.id + 1 : 1;

    const newQuery = await ContactQuery.create({
      id,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      message: message.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Pending'
    });
    res.status(201).json({ success: true, message: 'Query received successfully. We will email you back!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to submit inquiry.' });
  }
});

router.put('/queries/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid query ID.' });

    const { replyText } = req.body;
    if (!replyText) {
      return res.status(400).json({ success: false, message: 'Reply text is required.' });
    }

    const query = await ContactQuery.findOne({ id });
    if (!query) return res.status(404).json({ success: false, message: 'Inquiry not found.' });

    await ContactQuery.updateOne({ id }, { $set: { status: 'Replied' } });
    res.json({ success: true, message: 'Inquiry response posted!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reply inquiry.' });
  }
});

router.delete('/queries/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'Invalid query ID.' });

    const result = await ContactQuery.deleteOne({ id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }
    res.json({ success: true, message: 'Inquiry ticket deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete inquiry.' });
  }
});

module.exports = router;
