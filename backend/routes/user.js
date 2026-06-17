const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../db/database');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Profile Management ────────────────────────────────────────────────────────
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, dob, gender } = req.body;

    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const updated = await User.findOneAndUpdate(
      { id: req.user.id },
      {
        $set: {
          name: name !== undefined ? name.trim() : user.name,
          phone: phone !== undefined ? phone.trim() : user.phone,
          dob: dob !== undefined ? dob.trim() : user.dob,
          gender: gender !== undefined ? gender : user.gender
        }
      },
      { new: true }
    ).lean();

    const { password: _, ...safe } = updated;
    res.json({ success: true, message: 'Profile updated successfully!', user: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

router.put('/password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new passwords are required.' });
    }

    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const hashed = bcrypt.hashSync(newPassword, 12);
    await User.updateOne({ id: req.user.id }, { $set: { password: hashed } });

    res.json({ success: true, message: 'Password updated successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
});

// ─── Address Management ───────────────────────────────────────────────────────
router.get('/addresses', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id }).lean();
    res.json({ success: true, addresses: user.addresses || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch addresses.' });
  }
});

router.post('/addresses', authenticate, async (req, res) => {
  try {
    const { type, isDefault, name, phone, street, locality, city, pincode, state, country } = req.body;
    if (!type || !name || !phone || !street || !city || !pincode) {
      return res.status(400).json({ success: false, message: 'Required address details are missing.' });
    }

    const user = await User.findOne({ id: req.user.id });
    let addresses = user.addresses || [];

    if (isDefault) {
      addresses = addresses.map(addr => ({ ...addr, isDefault: false }));
    }

    const newAddress = {
      id: 'addr_' + Date.now(),
      type,
      isDefault: !!isDefault,
      name: name.trim(),
      phone: phone.trim(),
      street: street.trim(),
      locality: locality ? locality.trim() : '',
      city: city.trim(),
      pincode: pincode.trim(),
      state: state || 'Telangana',
      country: country || 'India'
    };

    addresses.push(newAddress);
    
    const updatedUser = await User.findOneAndUpdate(
      { id: req.user.id },
      { $set: { addresses } },
      { new: true }
    ).lean();

    res.status(201).json({ success: true, message: 'Address added successfully!', addresses: updatedUser.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add address.' });
  }
});

router.put('/addresses/:id', authenticate, async (req, res) => {
  try {
    const addressId = req.params.id;
    const { type, isDefault, name, phone, street, locality, city, pincode, state, country } = req.body;

    const user = await User.findOne({ id: req.user.id });
    let addresses = user.addresses || [];

    const address = addresses.find(addr => addr.id === addressId);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found.' });

    if (isDefault) {
      addresses = addresses.map(addr => ({ ...addr, isDefault: false }));
    }

    addresses = addresses.map(addr => {
      if (addr.id === addressId) {
        return {
          id: addressId,
          type: type !== undefined ? type : addr.type,
          isDefault: isDefault !== undefined ? !!isDefault : addr.isDefault,
          name: name !== undefined ? name.trim() : addr.name,
          phone: phone !== undefined ? phone.trim() : addr.phone,
          street: street !== undefined ? street.trim() : addr.street,
          locality: locality !== undefined ? locality.trim() : addr.locality,
          city: city !== undefined ? city.trim() : addr.city,
          pincode: pincode !== undefined ? pincode.trim() : addr.pincode,
          state: state !== undefined ? state : addr.state,
          country: country !== undefined ? country : addr.country
        };
      }
      return addr;
    });

    const updatedUser = await User.findOneAndUpdate(
      { id: req.user.id },
      { $set: { addresses } },
      { new: true }
    ).lean();

    res.json({ success: true, message: 'Address updated successfully!', addresses: updatedUser.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update address.' });
  }
});

router.delete('/addresses/:id', authenticate, async (req, res) => {
  try {
    const addressId = req.params.id;
    const user = await User.findOne({ id: req.user.id });
    let addresses = user.addresses || [];

    addresses = addresses.filter(addr => addr.id !== addressId);
    
    const updatedUser = await User.findOneAndUpdate(
      { id: req.user.id },
      { $set: { addresses } },
      { new: true }
    ).lean();

    res.json({ success: true, message: 'Address deleted successfully!', addresses: updatedUser.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete address.' });
  }
});

// ─── Cart Management ───────────────────────────────────────────────────────────
router.get('/cart', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id }).lean();
    res.json({ success: true, cart: user.cart || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch cart.' });
  }
});

router.post('/cart', authenticate, async (req, res) => {
  try {
    const { cart } = req.body;
    if (!Array.isArray(cart)) return res.status(400).json({ success: false, message: 'Cart list must be an array.' });

    await User.updateOne({ id: req.user.id }, { $set: { cart } });
    res.json({ success: true, message: 'Cart synchronized.', cart });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to sync cart.' });
  }
});

// ─── Wishlist Management ───────────────────────────────────────────────────────
router.get('/wishlist', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id }).lean();
    res.json({ success: true, wishlist: user.wishlist || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist.' });
  }
});

router.post('/wishlist', authenticate, async (req, res) => {
  try {
    const { wishlist } = req.body;
    if (!Array.isArray(wishlist)) return res.status(400).json({ success: false, message: 'Wishlist must be an array.' });

    await User.updateOne({ id: req.user.id }, { $set: { wishlist } });
    res.json({ success: true, message: 'Wishlist synchronized.', wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to sync wishlist.' });
  }
});

module.exports = router;
