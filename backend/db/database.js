const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithirashoppy';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully');
    try {
      // Skip dropping the database to persist products and categories across restarts
      // await mongoose.connection.db.dropDatabase();
      // console.log('🗑️ Database dropped/cleared successfully');
      // Brief delay to let MongoDB finalize dropped collections and indices
      await seedAdmin();
      await seedStoreData();
      // Auto-migrate/sync approvalStatus for existing products to prevent mismatch
      await mongoose.model('Product').updateMany(
        { status: 'Active', $or: [{ approvalStatus: 'Pending' }, { approvalStatus: { $exists: false } }, { approvalStatus: null }] },
        { $set: { approvalStatus: 'Approved' } }
      );
      await mongoose.model('Product').updateMany(
        { status: 'Rejected', $or: [{ approvalStatus: 'Pending' }, { approvalStatus: { $exists: false } }, { approvalStatus: null }] },
        { $set: { approvalStatus: 'Rejected' } }
      );
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
    variant: { type: mongoose.Schema.Types.Mixed, default: {} },
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
  sku: { type: String, default: null },
  image: { type: String, default: null }
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
  description: { type: String, default: '' },
  brand: { type: String, default: '' },
  rating: { type: Number, default: 4.8 },
  reviews: { type: Number, default: 120 },
  discount: { type: Number, default: 0 },
  originalPrice: { type: Number, default: null },
  badge: { type: String, default: '' },
  isNewArrival: { type: Boolean, default: false },
  isOffer: { type: Boolean, default: false },
  attributes: {
    type: [{
      key: { type: String },
      value: { type: String }
    }],
    default: []
  },
  // Lucky Charm Fields
  includeInLuckyCharm: { type: Boolean, default: false },
  luckyStock: { type: Number, default: 0 },
  // Vendor Fields
  vendorId: { type: String, default: null, index: true, ref: 'Vendor' }, // null = platform product
  approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', index: true },
  approvedBy: { type: String, default: null, ref: 'User' },
  approvedAt: { type: Date, default: null },
  rejectReason: { type: String, default: '' } // Admin rejection note
});

// Auto-populate the images array with the main image if empty
ProductSchema.pre('save', function () {
  if (this.image && (!this.images || this.images.length === 0)) {
    this.images = [this.image];
  }
  if (this.stock <= this.lowStockThreshold) {
    this.isLowStock = true;
  } else {
    this.isLowStock = false;
  }

  // Synchronize status and approvalStatus
  if (this.isModified('status')) {
    if (this.status === 'Pending') {
      this.approvalStatus = 'Pending';
    } else if (this.status === 'Active') {
      this.approvalStatus = 'Approved';
    } else if (this.status === 'Rejected') {
      this.approvalStatus = 'Rejected';
    }
  } else if (this.isModified('approvalStatus')) {
    if (this.approvalStatus === 'Pending') {
      this.status = 'Pending';
    } else if (this.approvalStatus === 'Approved') {
      this.status = 'Active';
    } else if (this.approvalStatus === 'Rejected') {
      this.status = 'Rejected';
    }
  } else {
    // Sync status to approvalStatus by default (e.g. for new documents)
    if (this.status === 'Pending') {
      this.approvalStatus = 'Pending';
    } else if (this.status === 'Active') {
      this.approvalStatus = 'Approved';
    } else if (this.status === 'Rejected') {
      this.approvalStatus = 'Rejected';
    }
  }
});

ProductSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  if (update && update.$set) {
    const status = update.$set.status;
    const approvalStatus = update.$set.approvalStatus;

    if (status !== undefined) {
      if (status === 'Pending') {
        update.$set.approvalStatus = 'Pending';
      } else if (status === 'Active') {
        update.$set.approvalStatus = 'Approved';
      } else if (status === 'Rejected') {
        update.$set.approvalStatus = 'Rejected';
      }
    } else if (approvalStatus !== undefined) {
      if (approvalStatus === 'Pending') {
        update.$set.status = 'Pending';
      } else if (approvalStatus === 'Approved') {
        update.$set.status = 'Active';
      } else if (approvalStatus === 'Rejected') {
        update.$set.status = 'Rejected';
      }
    }
  }
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  parent: { type: String, default: '—' }, // Backwards compatibility
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null }, // Hierarchical unlimited subcategories
  count: { type: Number, default: 0 },
  status: { type: String, default: 'Active' },
  image: { type: String, default: '' }
});

// Middleware to keep the 'parent' string synchronized with the parent's name
CategorySchema.pre('save', async function () {
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
  variant: { type: mongoose.Schema.Types.Mixed, default: {} },
  catalogue: { type: String, default: null },
  quantity: { type: Number, default: 1 },
  price: { type: Number, required: true },
  vendorId: { type: String, default: null, index: true, ref: 'Vendor' }
});

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String },
  customer: { type: String, required: true },
  product: { type: String, required: true }, // Backwards compatibility: Summary string of products
  amount: { type: String, required: true },
  payment: { type: String, default: 'Razorpay' },
  status: { type: String, default: 'Pending', index: true },
  date: { type: String, required: true },
  items: { type: [OrderItemSchema], default: [] }, // Detailed order items containing variants and catalogue details
  catalogueDetails: { type: Map, of: String }, // Key-value catalogue info for analytics
  isLuckyCharmOrder: { type: Boolean, default: false },
  shippingAddress: { type: mongoose.Schema.Types.Mixed, default: {} },
  subtotal: { type: Number },
  gst: { type: Number },
  shipping: { type: Number },
  discount: { type: Number }
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
  defaultCurrency: { type: String, default: 'INR' },
  shippingInfoLines: {
    type: [String],
    default: [
      "Free shipping on all orders above ₹999.",
      "Standard delivery takes 3–5 business days depending on location.",
      "Cash on Delivery (COD) is available on all eligible postal addresses.",
      "We offer easy 7-day hassle-free returns and exchanges."
    ]
  },
  freeShippingAbove: { type: Number, default: 999 },
  standardCharge: { type: Number, default: 0 },
  expressCharge: { type: Number, default: 150 },
  codCharges: { type: Number, default: 50 },
  enableCod: { type: Boolean, default: true },
  enableExpress: { type: Boolean, default: true },
  enableInternational: { type: Boolean, default: false }
});

const FeatureSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  status: { type: String, default: 'Active' },
  order: { type: Number, required: true }
});


// ─── Vendor Schemas ─────────────────────────────────────────────────────────
const VendorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  businessName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  gstin: { type: String, default: '' },
  pan: { type: String, default: '' },
  businessCategory: { type: String, default: '' },
  businessDescription: { type: String, default: '' },
  logo: { type: String, default: '' },
  panDocument: { type: String, default: '' },       // base64 / URL
  cancelledCheque: { type: String, default: '' },   // base64 / URL
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Suspended'], default: 'Pending', index: true },
  rejectReason: { type: String, default: '' },
  adminNotes: { type: String, default: '' },
  approvedBy: { type: String, default: null, ref: 'User' },
  approvedAt: { type: Date, default: null },
  lastLoginAt: { type: Date, default: null },
  address: {
    street: { type: String, default: '' },
    city:   { type: String, default: '' },
    state:  { type: String, default: '' },
    pincode:{ type: String, default: '' },
    country:{ type: String, default: 'India' }
  },
  bankDetails: {
    accountHolder: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    ifscCode:      { type: String, default: '' },
    bankName:      { type: String, default: '' }
  }
}, { timestamps: true });

const VendorNotificationSchema = new mongoose.Schema({
  vendorId:  { type: String, required: true, index: true, ref: 'Vendor' },
  type:      { type: String, required: true },  // 'vendor_approved'|'vendor_rejected'|'product_approved'|'product_rejected'|'new_order'|'low_stock'|'system'
  title:     { type: String, required: true },
  message:   { type: String, required: true },
  metadata:  { type: mongoose.Schema.Types.Mixed, default: {} },
  isRead:    { type: Boolean, default: false, index: true }
}, { timestamps: true });

// ─── Future-Ready Schemas ───────────────────────────────────────────────────
const NewsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

const CampaignSchema = new mongoose.Schema({
  name: { type: String }, // support backward compatibility
  campaignName: { type: String, required: true },
  minOrderValue: { type: Number, default: 0 },
  maxOrderValue: { type: Number, default: null },
  rewardBudget: { type: Number, required: true },
  wheelProductCount: { type: Number, default: 8 },
  campaignUsageLimit: { type: Number, default: null },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Inactive', 'Completed'], default: 'Active', index: true }
});
CampaignSchema.index({ status: 1, startDate: 1, endDate: 1 });

const AnalyticsSchema = new mongoose.Schema({
  event: { type: String, required: true }, // e.g., page_view, add_to_cart, checkout
  userId: { type: String, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now }
});



const LuckySpinHistorySchema = new mongoose.Schema({
  userId: { type: String, default: null, index: true }, // Maps to User string ID
  user: { type: String, default: null }, // Storing User Name or User details as string
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null, index: true },
  campaign: { type: String, default: null }, // Storing Campaign Name
  orderId: { type: String, default: null }, // Storing Order ID string
  order: { type: String, default: null },
  productId: { type: Number, default: null }, // Storing Product ID number
  wonProduct: { type: String, default: null }, // Storing Won Product name
  spinTime: { type: Date, default: Date.now },
  claimStatus: { type: String, enum: ['Pending', 'Claimed'], default: 'Pending' },
  
  // Enhanced Analytics Fields
  sessionId: { type: String, default: null },
  cartTotal: { type: Number, default: 0 },
  rewardBudget: { type: Number, default: 0 },
  wonProductPrice: { type: Number, default: 0 },
  luckyStockBefore: { type: Number, default: 0 },
  luckyStockAfter: { type: Number, default: 0 },
  spinDuration: { type: Number, default: 0 }
});
LuckySpinHistorySchema.index({ userId: 1, claimStatus: 1, orderId: 1 });

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
const Feature = mongoose.model('Feature', FeatureSchema);
const Vendor = mongoose.model('Vendor', VendorSchema);
const VendorNotification = mongoose.model('VendorNotification', VendorNotificationSchema);

// ─── Seed Data ───────────────────────────────────────────────────────────────
async function seedStoreData() {
  try {
    const settingsDoc = await Settings.findOne();
    if (!settingsDoc) {
      await Settings.create({});
      console.log('✅ Default settings seeded successfully');
    }

    // Seed default coupons if not exist
    const existingL10 = await Coupon.findOne({ code: 'LUCKY10' });
    if (!existingL10) {
      await Coupon.create({
        code: 'LUCKY10',
        discount: '10',
        type: 'Percentage',
        minCart: '₹0',
        expiry: '2027-12-31',
        usage: '0/1000',
        status: 'Active'
      });
      console.log('✅ Coupon LUCKY10 seeded successfully');
    }

    const existingM100 = await Coupon.findOne({ code: 'MITHRA100' });
    if (!existingM100) {
      await Coupon.create({
        code: 'MITHRA100',
        discount: '100',
        type: 'Flat',
        minCart: '₹500',
        expiry: '2027-12-31',
        usage: '0/1000',
        status: 'Active'
      });
      console.log('✅ Coupon MITHRA100 seeded successfully');
    }



    const defaultFeatures = [
      { id: 1, key: 'hero', name: 'Hero Carousel', title: 'Curated Elegance', subtitle: 'Explore Mithira Shopy collections', status: 'Active', order: 1 },
      { id: 2, key: 'trust_bar', name: 'Trust Bar', title: 'Why You Can Trust Us', subtitle: 'Our commitments to you', status: 'Active', order: 2 },
      { id: 3, key: 'categories', name: 'Shop by Top Categories', title: 'Shop by Top Categories', subtitle: 'Explore our top categories and find your perfect style', status: 'Active', order: 3 },
      { id: 4, key: 'video_showcase', name: 'Video Showcase', title: 'Video Tour', subtitle: 'Take a virtual look inside our boutique', status: 'Active', order: 4 },
      { id: 5, key: 'exclusive_products', name: 'Exclusive Products', title: 'Exclusive Collection', subtitle: 'Handpicked premium fashion boutique items', status: 'Active', order: 5 },
      { id: 6, key: 'celebrity_collection', name: 'Celebrity Collection', title: 'Celebrity Collections', subtitle: 'Inspired by leading fashion influencers', status: 'Active', order: 6 },
      { id: 7, key: 'why_choose_us', name: 'Why Choose Us', title: 'Why Choose Mithra Shopy', subtitle: 'Direct-from-weaver premium quality items', status: 'Active', order: 7 }
    ];

    for (const f of defaultFeatures) {
      const existingF = await Feature.findOne({ key: f.key });
      if (!existingF) {
        await Feature.create(f);
        console.log(`✅ Seeded feature functionality: ${f.name}`);
      }
    }

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

    // Seed the 3 new premium products requested by user
    const existingPurpleNotebook = await Product.findOne({ id: 101 });
    if (!existingPurpleNotebook) {
      await Product.create({
        id: 101,
        name: 'Purple Notebook',
        category: 'Stationery > Book',
        subCategory: 'book',
        catalogue: 'Catalogue A',
        price: 399,
        stock: 50,
        sales: 15,
        status: 'Active',
        image: 'purple_notebook.jpg',
        images: ['purple_notebook.jpg'],
        description: 'A premium soft-bound purple notebook with elegant embossed details, featuring gold-edged pages and a matching bookmark ribbon.',
        brand: 'Mithira Luxe',
        rating: 4.9,
        reviews: 42,
        discount: 15,
        originalPrice: 469
      });
      console.log('✅ Purple Notebook (id: 101) seeded successfully');
    }

    const existingAnarkali = await Product.findOne({ id: 102 });
    if (!existingAnarkali) {
      await Product.create({
        id: 102,
        name: 'Anarkali',
        category: 'Clothing > Women > Kurti',
        subCategory: 'kurti',
        catalogue: 'Catalogue A',
        price: 2499,
        stock: 35,
        sales: 28,
        status: 'Active',
        image: 'green_anarkali.jpg',
        images: ['green_anarkali.jpg'],
        description: 'An elegant green Anarkali dress featuring intricate golden embroidery, a flared silhouette, and full sleeves. Perfect for festive occasions.',
        brand: 'Mithira Heritage',
        rating: 5.0,
        reviews: 88,
        discount: 20,
        originalPrice: 3125
      });
      console.log('✅ Anarkali (id: 102) seeded successfully');
    }

    const existingBlueSuit = await Product.findOne({ id: 103 });
    if (!existingBlueSuit) {
      await Product.create({
        id: 103,
        name: 'Blue Formal Suit',
        category: 'Clothing > Men > formal suites',
        subCategory: 'formal suites',
        catalogue: 'Catalogue A',
        price: 4999,
        stock: 20,
        sales: 12,
        status: 'Active',
        image: 'blue_suit.jpg',
        images: ['blue_suit.jpg'],
        description: 'A slim-fit royal blue formal suit featuring a single-breasted blazer and matching trousers. Crafted from premium wool-blend fabric for a sophisticated look.',
        brand: 'Aurelian Noir',
        rating: 4.8,
        reviews: 36,
        discount: 10,
        originalPrice: 5550
      });
      console.log('✅ Blue Formal Suit (id: 103) seeded successfully');
    }

    // Seed 5 new exclusive products requested by user (replace previous 3 on home page)
    const existingWhiteGown = await Product.findOne({ id: 104 });
    if (!existingWhiteGown) {
      await Product.create({
        id: 104,
        name: 'White Lace Gown',
        category: 'Clothing > Kids > Girls > Gowns',
        subCategory: 'Gowns',
        catalogue: 'Catalogue A',
        price: 1899,
        stock: 30,
        sales: 22,
        status: 'Active',
        image: 'white_gown.jpg',
        images: ['white_gown.jpg'],
        description: 'An enchanting white lace gown for girls with a beautiful satin bow belt, layered tiered skirt, and delicate floral lace detailing. Perfect for parties and special occasions.',
        brand: 'Mithira Kids',
        rating: 4.9,
        reviews: 64,
        discount: 15,
        originalPrice: 2235
      });
      console.log('✅ White Lace Gown (id: 104) seeded successfully');
    }

    const existingPremiumGiftSet = await Product.findOne({ id: 105 });
    if (!existingPremiumGiftSet) {
      await Product.create({
        id: 105,
        name: 'Premium Gift Set',
        category: 'Gifts',
        subCategory: 'Gift Hamper',
        catalogue: 'Catalogue A',
        price: 1499,
        stock: 45,
        sales: 38,
        status: 'Active',
        image: 'premium_gift_set.jpg',
        images: ['premium_gift_set.jpg'],
        description: 'A luxurious premium gift set featuring beautifully wrapped green and ivory boxes tied with gold satin ribbons. Perfect for birthdays, anniversaries, and celebrations.',
        brand: 'Mithira Gifting',
        rating: 4.8,
        reviews: 112,
        discount: 10,
        originalPrice: 1665
      });
      console.log('✅ Premium Gift Set (id: 105) seeded successfully');
    }

    const existingKidsFormalSuit = await Product.findOne({ id: 106 });
    if (!existingKidsFormalSuit) {
      await Product.create({
        id: 106,
        name: 'Kids Formal Suit',
        category: 'Clothing > Kids > Formal',
        subCategory: 'Formal',
        catalogue: 'Catalogue A',
        price: 2299,
        stock: 25,
        sales: 18,
        status: 'Active',
        image: 'kids_formal_suit.jpg',
        images: ['kids_formal_suit.jpg'],
        description: 'A sharp charcoal grey formal vest suit with matching trousers and a navy blue bow tie for boys. Ideal for school events, weddings, and formal occasions.',
        brand: 'Mithira Kids',
        rating: 4.7,
        reviews: 45,
        discount: 12,
        originalPrice: 2613
      });
      console.log('✅ Kids Formal Suit (id: 106) seeded successfully');
    }

    const existingGoldAnklets = await Product.findOne({ id: 107 });
    if (!existingGoldAnklets) {
      await Product.create({
        id: 107,
        name: 'Gold Anklets',
        category: 'Accessories > Jewellery > Anklets',
        subCategory: 'Anklets',
        catalogue: 'Catalogue A',
        price: 899,
        stock: 60,
        sales: 45,
        status: 'Active',
        image: 'gold_anklets.jpg',
        images: ['gold_anklets.jpg'],
        description: 'Elegant traditional gold-plated anklets with delicate bell charms and intricate chain links. Adds a touch of grace and tradition to any outfit.',
        brand: 'Mithira Jewels',
        rating: 5.0,
        reviews: 132,
        discount: 20,
        originalPrice: 1124
      });
      console.log('✅ Gold Anklets (id: 107) seeded successfully');
    }

    const existingDiamondRing = await Product.findOne({ id: 108 });
    if (!existingDiamondRing) {
      await Product.create({
        id: 108,
        name: 'Diamond Ginkgo Ring',
        category: 'Accessories > Jewellery > Ring',
        subCategory: 'Ring',
        catalogue: 'Catalogue A',
        price: 7499,
        stock: 15,
        sales: 8,
        status: 'Active',
        image: 'diamond_ring.jpg',
        images: ['diamond_ring.jpg'],
        description: 'A breathtaking 18K gold ring inspired by the ginkgo leaf with diamond accents. Features hand-etched botanical detailing and brilliant-cut diamonds for an exquisite, nature-inspired look.',
        brand: 'Aurelian Jewels',
        rating: 5.0,
        reviews: 28,
        discount: 5,
        originalPrice: 7894
      });
      console.log('✅ Diamond Ginkgo Ring (id: 108) seeded successfully');
    }

    // Seed 5 more new exclusive products (109-113) requested by user — DO NOT remove existing 104-108
    const existingHeavyJoker = await Product.findOne({ id: 109 });
    if (!existingHeavyJoker) {
      await Product.create({
        id: 109,
        name: 'Heavy Worked Joker Necklace',
        category: 'Accessories > Jewellery > Heavy Worked Joker',
        subCategory: 'Heavy Worked Joker',
        catalogue: 'Catalogue A',
        price: 12999,
        stock: 10,
        sales: 6,
        status: 'Active',
        image: 'heavy_joker_necklace.jpg',
        images: ['heavy_joker_necklace.jpg'],
        description: 'A majestic diamond-studded gold joker necklace with intricate filigree work and a breathtaking pear-shaped pendant. The epitome of bridal luxury craftsmanship.',
        brand: 'Aurelian Jewels',
        rating: 5.0,
        reviews: 19,
        discount: 8,
        originalPrice: 14130
      });
      console.log('✅ Heavy Worked Joker Necklace (id: 109) seeded successfully');
    }

    const existingSimpleChain = await Product.findOne({ id: 110 });
    if (!existingSimpleChain) {
      await Product.create({
        id: 110,
        name: 'Simple Chain Jewellery Set',
        category: 'Accessories > Jewellery > Simple Chain',
        subCategory: 'Simple Chain',
        catalogue: 'Catalogue A',
        price: 2499,
        stock: 40,
        sales: 55,
        status: 'Active',
        image: 'simple_chain_jewellery.jpg',
        images: ['simple_chain_jewellery.jpg'],
        description: 'An elegant everyday jewellery set featuring layered gold chains, pearl drop earrings, diamond hoop bracelets, and delicate rings — all in premium gold plating on a soft silk backdrop.',
        brand: 'Mithira Jewels',
        rating: 4.9,
        reviews: 87,
        discount: 18,
        originalPrice: 3048
      });
      console.log('✅ Simple Chain Jewellery Set (id: 110) seeded successfully');
    }

    const existingLuxeNotebook = await Product.findOne({ id: 111 });
    if (!existingLuxeNotebook) {
      await Product.create({
        id: 111,
        name: 'Luxe Leather Notebook',
        category: 'Stationery > Book',
        subCategory: 'Book',
        catalogue: 'Catalogue A',
        price: 749,
        stock: 60,
        sales: 34,
        status: 'Active',
        image: 'luxe_leather_notebook.jpg',
        images: ['luxe_leather_notebook.jpg'],
        description: 'A premium purple vegan-leather hardbound notebook with gold-edged pages, Fleur-de-lis embossed detailing, satin bookmark ribbon, and a matching gold pen. Perfect for journaling and gifting.',
        brand: 'Mithira Luxe',
        rating: 4.8,
        reviews: 61,
        discount: 12,
        originalPrice: 851
      });
      console.log('✅ Luxe Leather Notebook (id: 111) seeded successfully');
    }

    const existingAnarkali2 = await Product.findOne({ id: 112 });
    if (!existingAnarkali2) {
      await Product.create({
        id: 112,
        name: 'Anarkali',
        category: 'Clothing > Women > Kurti',
        subCategory: 'Kurti',
        catalogue: 'Catalogue A',
        price: 3299,
        stock: 28,
        sales: 41,
        status: 'Active',
        image: 'green_anarkali2.jpg',
        images: ['green_anarkali2.jpg'],
        description: 'A stunning emerald green Anarkali gown with rich gold zari embroidery covering the full length of the flared skirt. Full sleeves with intricate floral motifs. The ultimate festive statement piece.',
        brand: 'Mithira Heritage',
        rating: 5.0,
        reviews: 103,
        discount: 22,
        originalPrice: 4229
      });
      console.log('✅ Anarkali 2 (id: 112) seeded successfully');
    }

    const existingBlueFormalSuit2 = await Product.findOne({ id: 113 });
    if (!existingBlueFormalSuit2) {
      await Product.create({
        id: 113,
        name: 'Blue Formal Suit',
        category: 'Clothing > Men > Formal Suites',
        subCategory: 'Formal Suites',
        catalogue: 'Catalogue A',
        price: 5999,
        stock: 18,
        sales: 14,
        status: 'Active',
        image: 'blue_formal_suit2.jpg',
        images: ['blue_formal_suit2.jpg'],
        description: 'A sharp, tailored royal blue single-breasted formal suit with gold-button detailing by Aurelian Noir. Crafted from premium Italian wool blend, this suit radiates power and elegance.',
        brand: 'Aurelian Noir',
        rating: 4.9,
        reviews: 47,
        discount: 15,
        originalPrice: 7058
      });
      console.log('✅ Blue Formal Suit 2 (id: 113) seeded successfully');
    }

    // Seed 3 more exclusive products (114-116) — DO NOT remove existing 104-113
    const existingSchoolKit = await Product.findOne({ id: 114 });
    if (!existingSchoolKit) {
      await Product.create({
        id: 114,
        name: 'School Stationery Kit',
        category: 'Stationery',
        subCategory: 'School Items',
        catalogue: 'Catalogue A',
        price: 599,
        stock: 80,
        sales: 67,
        status: 'Active',
        image: 'school_stationery_kit.jpg',
        images: ['school_stationery_kit.jpg'],
        description: 'A complete school stationery kit featuring spiral notebooks, color pencils, sketch pens, scissors, a sharpener, and a pencil holder. Everything a student needs in one vibrant set.',
        brand: 'Mithira Stationery',
        rating: 4.8,
        reviews: 94,
        discount: 20,
        originalPrice: 749
      });
      console.log('✅ School Stationery Kit (id: 114) seeded successfully');
    }

    const existingBridalHair = await Product.findOne({ id: 115 });
    if (!existingBridalHair) {
      await Product.create({
        id: 115,
        name: 'Bridal Floral Hair Accessory',
        category: 'Accessories > Hair Accessories',
        subCategory: 'Hair Accessories',
        catalogue: 'Catalogue A',
        price: 1299,
        stock: 35,
        sales: 29,
        status: 'Active',
        image: 'bridal_hair_accessory.jpg',
        images: ['bridal_hair_accessory.jpg'],
        description: 'An exquisite bridal hair accessory featuring a large silk lotus flower, cascading jasmine bud strings, gold chain draping, and delicate jhumka bells. Perfect for weddings and festive occasions.',
        brand: 'Mithira Bridal',
        rating: 5.0,
        reviews: 58,
        discount: 15,
        originalPrice: 1529
      });
      console.log('✅ Bridal Floral Hair Accessory (id: 115) seeded successfully');
    }

    const existingTealFrock = await Product.findOne({ id: 116 });
    if (!existingTealFrock) {
      await Product.create({
        id: 116,
        name: 'Teal Ruffle Frock',
        category: 'Clothing > Kids > Girls > Frock',
        subCategory: 'Frock',
        catalogue: 'Catalogue A',
        price: 899,
        stock: 45,
        sales: 33,
        status: 'Active',
        image: 'teal_ruffle_frock.jpg',
        images: ['teal_ruffle_frock.jpg'],
        description: 'A gorgeous teal organza frock for girls with golden sequin embroidery on the bodice, a flared tiered skirt with vibrant green ruffle hem detailing. Lightweight and perfect for parties.',
        brand: 'Mithira Kids',
        rating: 4.9,
        reviews: 72,
        discount: 10,
        originalPrice: 999
      });
      console.log('✅ Teal Ruffle Frock (id: 116) seeded successfully');
    }

    // Seed 5 new arrivals products (117-121) requested by user
    const existingFrockNew = await Product.findOne({ id: 117 });
    if (!existingFrockNew) {
      await Product.create({
        id: 117,
        name: 'Pink Gingham Cotton Frock',
        category: 'Clothing > Kids > Girls > Frock',
        subCategory: 'Frock',
        catalogue: 'Catalogue A',
        price: 1299,
        stock: 25,
        sales: 0,
        status: 'Active',
        image: 'pink_gingham_frock.jpg',
        images: ['pink_gingham_frock.jpg'],
        description: 'A lovely pink gingham checkered cotton frock for girls, featuring an elegant overlay daisy-patterned pink cardigan knit jacket. Extremely soft, breathable, and premium weave.',
        brand: 'Mithira Kids',
        rating: 4.8,
        reviews: 42,
        discount: 31,
        originalPrice: 1899,
        badge: 'NEW',
        isNewArrival: true,
        isOffer: false
      });
      console.log('✅ Pink Gingham Cotton Frock (id: 117) seeded successfully');
    }

    const existingBohoNeck = await Product.findOne({ id: 118 });
    if (!existingBohoNeck) {
      await Product.create({
        id: 118,
        name: 'Turquoise Bead Layered Necklace',
        category: 'Accessories > Jewellery > Necklace',
        subCategory: 'Necklace',
        catalogue: 'Catalogue A',
        price: 1899,
        stock: 15,
        sales: 0,
        status: 'Active',
        image: 'boho_necklace.jpg',
        images: ['boho_necklace.jpg'],
        description: 'An exquisite multi-layered bohemian statement necklace featuring polished natural turquoise beads, vintage silver feather charms, wooden accents, and matching statement rings.',
        brand: 'Mithira Luxe',
        rating: 4.9,
        reviews: 58,
        discount: 32,
        originalPrice: 2799,
        badge: 'NEW',
        isNewArrival: true,
        isOffer: false
      });
      console.log('✅ Turquoise Bead Layered Necklace (id: 118) seeded successfully');
    }

    const existingStationerySet = await Product.findOne({ id: 119 });
    if (!existingStationerySet) {
      await Product.create({
        id: 119,
        name: 'Pastel Study & Planner Set',
        category: 'Stationery > Binders > Planner',
        subCategory: 'Planner',
        catalogue: 'Catalogue A',
        price: 999,
        stock: 30,
        sales: 0,
        status: 'Active',
        image: 'pastel_stationery.jpg',
        images: ['pastel_stationery.jpg'],
        description: 'A premium organized study set including a pastel pink planner notebook, multi-colored highlighters, heart-topped decorative pencils, designer pens, clips, and matching pastel page flags.',
        brand: 'Mithira Stationery',
        rating: 4.7,
        reviews: 24,
        discount: 33,
        originalPrice: 1499,
        badge: 'NEW',
        isNewArrival: true,
        isOffer: false
      });
      console.log('✅ Pastel Study & Planner Set (id: 119) seeded successfully');
    }

    const existingFancyBands = await Product.findOne({ id: 120 });
    if (!existingFancyBands) {
      await Product.create({
        id: 120,
        name: 'Scrunchie & Hair Band Set',
        category: 'Accessories > fancy > bands',
        subCategory: 'bands',
        catalogue: 'Catalogue A',
        price: 399,
        stock: 50,
        sales: 0,
        status: 'Active',
        image: 'scrunchie_fancy_set.jpg',
        images: ['scrunchie_fancy_set.jpg'],
        description: 'A fancy satin hair accessories bundle containing pastel pink and blue scrunchies, pearl-embellished bands, mini notebooks, gel pens, and an elegant storage tray gift box.',
        brand: 'Mithira Accessories',
        rating: 4.6,
        reviews: 18,
        discount: 33,
        originalPrice: 599,
        badge: 'NEW',
        isNewArrival: true,
        isOffer: false
      });
      console.log('✅ Scrunchie & Hair Band Set (id: 120) seeded successfully');
    }

    const existingCrochetBouquet = await Product.findOne({ id: 121 });
    if (!existingCrochetBouquet) {
      await Product.create({
        id: 121,
        name: 'Crochet Handmade Flower Bouquet',
        category: 'Gifts > Flowers > Bouquet',
        subCategory: 'Bouquet',
        catalogue: 'Catalogue A',
        price: 1499,
        stock: 20,
        sales: 0,
        status: 'Active',
        image: 'crochet_bouquet.jpg',
        images: ['crochet_bouquet.jpg'],
        description: 'A gorgeous, forever-blooming hand-knitted crochet flower bouquet featuring a vibrant selection of handcrafted red, orange, and purple flowers. An exquisite artisanal gift.',
        brand: 'Mithira Gifts',
        rating: 5.0,
        reviews: 65,
        discount: 31,
        originalPrice: 2199,
        badge: 'NEW',
        isNewArrival: true,
        isOffer: false
      });
      console.log('✅ Crochet Handmade Flower Bouquet (id: 121) seeded successfully');
    }

    const defaultCategories = [
      { name: 'Clothing', parent: '—' },
      { name: 'Stationery', parent: '—' },
      { name: 'Gifts', parent: '—' },
      { name: 'Accessories', parent: '—' },
      
      { name: 'Women', parent: 'Clothing' },
      { name: 'Men', parent: 'Clothing' },
      { name: 'Kids', parent: 'Clothing' },
      { name: 'Boys', parent: 'Clothing' },
      { name: 'Girls', parent: 'Clothing' },

      // Binders and Planners for Stationery
      { name: 'Binders', parent: 'Stationery' },
      { name: 'Planner', parent: 'Binders' },
      
      // Fancy and bands for Accessories
      { name: 'fancy', parent: 'Accessories' },
      { name: 'bands', parent: 'fancy' },

      // Flowers and Bouquet for Gifts
      { name: 'Flowers', parent: 'Gifts' },
      { name: 'Bouquet', parent: 'Flowers' },
      
      { name: 'Kurti', parent: 'Women' },
      { name: 'Saree', parent: 'Women' },
      { name: 'duppata', parent: 'Women' },
      { name: 'shirts', parent: 'Men' },
      { name: 'floral kurti', parent: 'Kurti' },
      
      { name: 'Pens', parent: 'Stationery' },
      { name: 'Journals', parent: 'Stationery' },
      { name: 'Notebooks', parent: 'Stationery' },
      { name: 'School Items', parent: 'Stationery' },
      { name: 'note', parent: 'School Items' },
      
      { name: 'Birthday Gifts', parent: 'Gifts' },
      { name: 'Wedding Gifts', parent: 'Gifts' },
      { name: 'Anniversary Gifts', parent: 'Gifts' },
      { name: 'Return Gifts', parent: 'Gifts' },
      
      { name: 'Jewellery', parent: 'Accessories' },
      { name: 'Fancy Items', parent: 'Accessories' },
      { name: 'Hair Accessories', parent: 'Accessories' },
      { name: 'Fashion Accessories', parent: 'Accessories' },

      // Previously seeded categories
      { name: 'book', parent: 'Stationery' },

      // New categories for exclusive products (batch 1: IDs 104-108)
      { name: 'Gowns', parent: 'Girls' },
      { name: 'Formal', parent: 'Kids' },
      { name: 'Gift Hamper', parent: 'Gifts' },
      { name: 'Anklets', parent: 'Jewellery' },
      { name: 'Ring', parent: 'Jewellery' },

      // New categories for exclusive products (batch 2: IDs 109-113)
      { name: 'Heavy Worked Joker', parent: 'Jewellery' },
      { name: 'Simple Chain', parent: 'Jewellery' },
      { name: 'Formal Suites', parent: 'Men' },

      // New categories for exclusive products (batch 3: IDs 114-116)
      { name: 'Frock', parent: 'Girls' }
    ];

    for (const cat of defaultCategories) {
      let doc = await Category.findOne({ name: cat.name });
      if (!doc) {
        let parentId = null;
        if (cat.parent !== '—') {
          const parentDoc = await Category.findOne({ name: cat.parent });
          if (parentDoc) {
            parentId = parentDoc._id;
          }
        }
        doc = await Category.create({
          name: cat.name,
          parent: cat.parent,
          parentId,
          status: 'Active',
          count: 0
        });
        console.log(`✅ Category '${cat.name}' seeded successfully`);
      }
    }
  } catch (err) {
    console.error('Error seeding store products:', err);
  }
}

async function seedAdmin() {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'adminmithrashoppy@gmail.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Delete legacy admin if exists to ensure security
    await User.deleteOne({ email: 'admin@mithira.com' });

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

const LuckyWheelSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, default: null, index: true },
  cartHash: { type: String, required: true },
  wheelProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
  campaignSnapshot: {
    campaignName: { type: String },
    rewardBudget: { type: Number },
    wheelProductCount: { type: Number },
    minOrderValue: { type: Number },
    maxOrderValue: { type: Number }
  },
  createdAt: { type: Date, default: Date.now, expires: 3600 },
  isUsed: { type: Boolean, default: false, index: true }
});
LuckyWheelSessionSchema.index({ userId: 1, cartHash: 1, campaignId: 1, isUsed: 1 });

const Newsletter = mongoose.model('Newsletter', NewsletterSchema);
const Campaign = mongoose.model('Campaign', CampaignSchema);
const Analytics = mongoose.model('Analytics', AnalyticsSchema);
const LuckySpinHistory = mongoose.model('LuckySpinHistory', LuckySpinHistorySchema);
const LuckyWheelSession = mongoose.model('LuckyWheelSession', LuckyWheelSessionSchema);

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
  Feature,
  Newsletter,
  Campaign,
  Analytics,
  LuckySpinHistory,
  LuckyWheelSession,
  Vendor,
  VendorNotification
};

