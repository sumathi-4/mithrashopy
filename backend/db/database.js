const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithirashoppy';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully');
    try {
      await mongoose.connection.db.dropDatabase();
      console.log('🗑️ Database dropped/cleared successfully');
      await seedAdmin();
      await seedStoreData();
    } catch (dbErr) {
      console.error('❌ Error dropping database:', dbErr);
    }
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ─── Schemas & Models ────────────────────────────────────────────────────────
const AddressSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, default: 'Home' },
  isDefault: { type: Boolean, default: false },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  locality: { type: String, default: '' },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  state: { type: String, default: 'Telangana' },
  country: { type: String, default: 'India' }
});

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: null },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  cart: { type: [String], default: [] }, // Backwards compatibility: array of product IDs
  cartItems: [{
    productId: { type: Number, required: true },
    variant: {
      size: { type: String, default: null },
      color: { type: String, default: null }
    },
    quantity: { type: Number, default: 1 }
  }],
  wishlist: { type: [String], default: [] }, // Backwards compatibility: array of product IDs
  wishlistItems: [{
    productId: { type: Number, required: true }
  }],
  addresses: { type: [AddressSchema], default: [] },
  dob: { type: String, default: '15/08/1995' },
  gender: { type: String, default: 'Female' },
  profileImage: { type: String, default: '' },
  orderIds: { type: [String], default: [] }
});

const ProductVariantSchema = new mongoose.Schema({
  size: { type: String, default: null },
  color: { type: String, default: null },
  stock: { type: Number, default: 0 },
  price: { type: Number, default: null }, // If null, fallback to product base price
  sku: { type: String, default: null }
});

const ProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, default: 'Clothing > Kids' },
  subCategory: { type: String, default: '' },
  catalogue: { type: String, default: 'Catalogue A' },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  status: { type: String, default: 'Active' },
  image: { type: String, default: 'Kids' }, // Backwards compatibility
  images: { type: [String], default: [] }, // Support multiple images
  variants: { type: [ProductVariantSchema], default: [] }, // Size, color, stock variants
  lowStockThreshold: { type: Number, default: 5 },
  isLowStock: { type: Boolean, default: false },
  description: { type: String, default: '' }
});

// Auto-populate the images array with the main image if empty
ProductSchema.pre('save', function (next) {
  if (this.image && (!this.images || this.images.length === 0)) {
    this.images = [this.image];
  }
  if (this.stock <= this.lowStockThreshold) {
    this.isLowStock = true;
  } else {
    this.isLowStock = false;
  }
  next();
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  parent: { type: String, default: '—' }, // Backwards compatibility
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, // Hierarchical unlimited subcategories
  count: { type: Number, default: 0 },
  status: { type: String, default: 'Active' }
});

// Middleware to keep the 'parent' string synchronized with the parent's name
CategorySchema.pre('save', async function (next) {
  if (this.parentId) {
    try {
      const parentCategory = await mongoose.model('Category').findById(this.parentId);
      if (parentCategory) {
        this.parent = parentCategory.name;
      }
    } catch (err) {
      // Fail silently or handle error
    }
  } else if (this.parent === '—' || !this.parent) {
    this.parent = '—';
  }
  next();
});

const CatalogueSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subtitle: { type: String, required: true },
  count: { type: Number, default: 0 },
  status: { type: String, default: 'Active' },
  revenue: { type: String, default: '₹0' },
  image: { type: String, default: 'Kids' },
  visibility: { type: String, enum: ['Public', 'Internal'], default: 'Internal' } // For hiding/tracking Catalogue A/B internally
});

const OrderItemSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  name: { type: String, required: true },
  variant: {
    size: { type: String, default: null },
    color: { type: String, default: null }
  },
  catalogue: { type: String, default: null },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true }
});

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String },
  customer: { type: String, required: true },
  product: { type: String, required: true }, // Backwards compatibility: Summary string of products
  amount: { type: String, required: true },
  payment: { type: String, default: 'Razorpay' },
  status: { type: String, default: 'Pending' },
  date: { type: String, required: true },
  items: { type: [OrderItemSchema], default: [] }, // Detailed order items containing variants and catalogue details
  catalogueDetails: { type: Map, of: String } // Key-value catalogue info for analytics
});

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: String, required: true },
  type: { type: String, default: 'Percentage' },
  minCart: { type: String, default: '₹0' },
  expiry: { type: String, required: true },
  usage: { type: String, default: '0/500' },
  status: { type: String, default: 'Active' },
  maxDiscount: { type: Number, default: null },
  usageCount: { type: Number, default: 0 },
  userUsage: [{
    userId: { type: String, required: true },
    count: { type: Number, default: 1 }
  }]
});

const ReviewSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  productName: { type: String, required: true },
  productImage: { type: String, default: 'Kids' },
  customerName: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  reply: { type: String, default: '' },
  userId: { type: String, default: null },
  verifiedPurchase: { type: Boolean, default: false }
});

const BannerSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  slot: { type: String, default: 'Main Banner' },
  image: { type: String, default: 'Clothing' },
  clickRate: { type: String, default: '0.0%' },
  status: { type: String, default: 'Active' }
});

const AnnouncementSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  text: { type: String, required: true },
  placement: { type: String, default: 'Top Header' },
  expiry: { type: String, required: true },
  status: { type: String, default: 'Active' }
});

const ContactQuerySchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  phone: { type: String, default: null },
  subject: { type: String, default: null }
});

const SettingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'MithiraShoppy Official' },
  supportEmail: { type: String, default: 'support@mithirashoppy.com' },
  taxPercentage: { type: Number, default: 18 },
  defaultCurrency: { type: String, default: 'INR' }
});

// ─── Future-Ready Schemas ───────────────────────────────────────────────────
const NewsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

const CampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'Email' }, // e.g., Email, PPC, Social
  status: { type: String, default: 'Active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null },
  budget: { type: Number, default: 0 },
  revenueGenerated: { type: Number, default: 0 }
});

const AnalyticsSchema = new mongoose.Schema({
  event: { type: String, required: true }, // e.g., page_view, add_to_cart, checkout
  userId: { type: String, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);
const Category = mongoose.model('Category', CategorySchema);
const Catalogue = mongoose.model('Catalogue', CatalogueSchema);
const Order = mongoose.model('Order', OrderSchema);
const Coupon = mongoose.model('Coupon', CouponSchema);
const Review = mongoose.model('Review', ReviewSchema);
const Banner = mongoose.model('Banner', BannerSchema);
const Announcement = mongoose.model('Announcement', AnnouncementSchema);
const ContactQuery = mongoose.model('ContactQuery', ContactQuerySchema);
const Settings = mongoose.model('Settings', SettingsSchema);

// ─── Seed Data ───────────────────────────────────────────────────────────────
async function seedStoreData() {
  try {
    const existing = await Product.findOne({ id: 2 });
    if (!existing) {
      await Product.create({
        id: 2,
        name: 'Women Kurti',
        category: 'Clothing > Women',
        catalogue: 'Catalogue A',
        price: 899,
        stock: 40,
        sales: 48,
        status: 'Active',
        image: 'Kids',
        description: 'Relaxed fit women kurti.'
      });
      console.log('✅ Women Kurti seeded successfully');
    }
  } catch (err) {
    console.error('Error seeding store products:', err);
  }
}

async function seedAdmin() {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@mithira.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existing = await User.findOne({ email: adminEmail, role: 'admin' });
    if (!existing) {
      const hashed = bcrypt.hashSync(adminPassword, 12);
      await User.create({
        id: uuidv4(),
        name: 'Admin',
        email: adminEmail,
        phone: null,
        password: hashed,
        role: 'admin',
        is_active: true,
        created_at: new Date()
      });
      console.log(`✅ Admin account seeded: ${adminEmail}`);
    }
  } catch (err) {
    console.error('Error seeding admin:', err);
  }
}

// ─── DB Helper Functions ─────────────────────────────────────────────────────
const dbHelpers = {
  async findUserByEmail(email) {
    return await User.findOne({ email: email.toLowerCase().trim() }).lean();
  },

  async findUserById(id) {
    const user = await User.findOne({ id }).lean();
    if (!user) return null;
    const { password, ...safe } = user;
    return safe;
  },

  async createUser({ name, email, phone, password, role = 'user' }) {
    const hashed = bcrypt.hashSync(password, 12);
    const newUser = await User.create({
      id: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || null,
      password: hashed,
      role,
      is_active: true,
      created_at: new Date(),
      cart: [],
      wishlist: [],
      addresses: []
    });
    const userObj = newUser.toObject();
    const { password: _, ...safe } = userObj;
    return safe;
  },

  async emailExists(email) {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    return !!user;
  }
};

const Newsletter = mongoose.model('Newsletter', NewsletterSchema);
const Campaign = mongoose.model('Campaign', CampaignSchema);
const Analytics = mongoose.model('Analytics', AnalyticsSchema);

module.exports = {
  dbHelpers,
  seedAdmin,
  seedStoreData,
  User,
  Product,
  Category,
  Catalogue,
  Order,
  Coupon,
  Review,
  Banner,
  Announcement,
  ContactQuery,
  Settings,
  Newsletter,
  Campaign,
  Analytics
};
