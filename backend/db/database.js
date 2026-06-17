const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithirashoppy';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully'))
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
  cart: { type: [String], default: [] },
  wishlist: { type: [String], default: [] },
  addresses: { type: [AddressSchema], default: [] },
  dob: { type: String, default: '15/08/1995' },
  gender: { type: String, default: 'Female' }
});

const ProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, default: 'Clothing > Kids' },
  catalogue: { type: String, default: 'Catalogue A' },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  status: { type: String, default: 'Active' },
  image: { type: String, default: 'Kids' }
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  parent: { type: String, default: '—' },
  count: { type: Number, default: 0 },
  status: { type: String, default: 'Active' }
});

const CatalogueSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subtitle: { type: String, required: true },
  count: { type: Number, default: 0 },
  status: { type: String, default: 'Active' },
  revenue: { type: String, default: '₹0' },
  image: { type: String, default: 'Kids' }
});

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String },
  customer: { type: String, required: true },
  product: { type: String, required: true },
  amount: { type: String, required: true },
  payment: { type: String, default: 'Razorpay' },
  status: { type: String, default: 'Pending' },
  date: { type: String, required: true }
});

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: String, required: true },
  type: { type: String, default: 'Percentage' },
  minCart: { type: String, default: '₹0' },
  expiry: { type: String, required: true },
  usage: { type: String, default: '0/500' },
  status: { type: String, default: 'Active' }
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
  reply: { type: String, default: '' }
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
  status: { type: String, default: 'Pending' }
});

const SettingsSchema = new mongoose.Schema({
  storeName: { type: String, default: 'MithiraShoppy Official' },
  supportEmail: { type: String, default: 'support@mithirashoppy.com' },
  taxPercentage: { type: Number, default: 18 },
  defaultCurrency: { type: String, default: 'INR' }
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
    // 1. Categories
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      await Category.insertMany([
        { name: 'Clothing', parent: '—', count: 58, status: 'Active' },
        { name: 'Women', parent: 'Clothing', count: 18, status: 'Active' },
        { name: 'Kurti', parent: 'Women', count: 8, status: 'Active' },
        { name: 'Saree', parent: 'Women', count: 6, status: 'Active' },
        { name: 'Men', parent: 'Clothing', count: 15, status: 'Active' },
        { name: 'Kids', parent: 'Clothing', count: 12, status: 'Active' },
        { name: 'Stationery', parent: '—', count: 25, status: 'Active' },
        { name: 'Gifts', parent: '—', count: 20, status: 'Active' },
        { name: 'Accessories', parent: '—', count: 15, status: 'Active' }
      ]);
      console.log('✅ Seeded default categories to MongoDB');
    }

    // 2. Catalogues
    const catalogueCount = await Catalogue.countDocuments();
    if (catalogueCount === 0) {
      await Catalogue.insertMany([
        { name: 'Catalogue A', subtitle: 'Kids Collection', count: 45, status: 'Active', revenue: '₹85,000', image: 'Kids' },
        { name: 'Catalogue B', subtitle: 'Lifestyle Collection', count: 63, status: 'Active', revenue: '₹1,60,000', image: 'Lifestyle' }
      ]);
      console.log('✅ Seeded default catalogues to MongoDB');
    }

    // 3. Coupons
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      await Coupon.insertMany([
        { code: 'WELCOME10', discount: '10% OFF', type: 'Percentage', minCart: '₹499', expiry: 'Jun 30, 2025', usage: '120/500', status: 'Active' },
        { code: 'SUMMER30', discount: '20% OFF', type: 'Percentage', minCart: '₹999', expiry: 'Jul 15, 2025', usage: '85/300', status: 'Active' },
        { code: 'FESTIVE50', discount: '50% OFF', type: 'Percentage', minCart: '₹1499', expiry: 'Aug 10, 2025', usage: '25/200', status: 'Active' },
        { code: 'FREESHIP', discount: 'Free Shipping', type: 'Free Shipping', minCart: '₹0', expiry: 'Jun 30, 2025', usage: '230/500', status: 'Active' },
        { code: 'NEWUSERS', discount: '5% OFF', type: 'Percentage', minCart: '₹299', expiry: 'Jul 05, 2025', usage: '60/200', status: 'Inactive' }
      ]);
      console.log('✅ Seeded default coupons to MongoDB');
    }

    // 4. Settings
    const settingsCount = await Settings.countDocuments();
    if (settingsCount === 0) {
      await Settings.create({
        storeName: 'MithiraShoppy Official',
        supportEmail: 'support@mithirashoppy.com',
        taxPercentage: 18,
        defaultCurrency: 'INR'
      });
      console.log('✅ Seeded default settings to MongoDB');
    }

    // 5. Banners
    const bannerCount = await Banner.countDocuments();
    if (bannerCount === 0) {
      await Banner.insertMany([
        { id: 1, title: 'Festive Saree Sale', slot: 'Main Banner', image: 'Clothing', clickRate: '4.5%', status: 'Active' },
        { id: 2, title: 'Kids Summer Lookbook', slot: 'Sidebar Top', image: 'Kids', clickRate: '3.2%', status: 'Active' },
        { id: 3, title: 'Anklets Collection', slot: 'Footer Banner', image: 'Accessories', clickRate: '2.8%', status: 'Active' }
      ]);
      console.log('✅ Seeded default banners to MongoDB');
    }

    // 6. Announcements
    const announcementCount = await Announcement.countDocuments();
    if (announcementCount === 0) {
      await Announcement.insertMany([
        { id: 1, text: 'Free Shipping on orders above ₹999!', placement: 'Top Header', expiry: 'Jun 30, 2025', status: 'Active' },
        { id: 2, text: 'New Festive Collection Live! Use code FESTIVE50', placement: 'Cart Banner', expiry: 'Aug 10, 2025', status: 'Active' }
      ]);
      console.log('✅ Seeded default announcements to MongoDB');
    }

    // 7. Contact Queries
    const queryCount = await ContactQuery.countDocuments();
    if (queryCount === 0) {
      await ContactQuery.insertMany([
        { id: 1, name: 'Sumathi R', email: 'sumathi@gmail.com', message: 'Looking for customization options on kids party dresses.', date: 'Jun 28, 2025', status: 'Pending' },
        { id: 2, name: 'Arjun K', email: 'arjun@gmail.com', message: 'Do you offer international shipping?', date: 'Jun 27, 2025', status: 'Replied' },
        { id: 3, name: 'Nandhini S', email: 'nandhini@gmail.com', message: 'Issue with Razorpay gateway payment.', date: 'Jun 26, 2025', status: 'Pending' }
      ]);
      console.log('✅ Seeded default contact queries to MongoDB');
    }

    // 8. Reviews
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      await Review.insertMany([
        { id: 1, productName: 'Kids Party Dress', productImage: 'Kids', customerName: 'Sumathi R', rating: 5, comment: 'Excellent quality!', date: 'Jun 28, 2025', status: 'Approved', reply: '' },
        { id: 2, productName: 'Women Kurti', productImage: 'Kids', customerName: 'Priya M', rating: 4, comment: 'Good product', date: 'Jun 27, 2025', status: 'Approved', reply: '' },
        { id: 3, productName: 'Stylish Handbag', productImage: 'Accessories', customerName: 'Nandhini S', rating: 5, comment: 'Very nice handbag', date: 'Jun 26, 2025', status: 'Pending', reply: '' },
        { id: 4, productName: 'Premium Pen Set', productImage: 'Kids', customerName: 'Arjun K', rating: 3, comment: 'Average', date: 'Jun 24, 2025', status: 'Rejected', reply: '' }
      ]);
      console.log('✅ Seeded default reviews to MongoDB');
    }

    // 9. Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany([
        { id: 1, name: 'Kids Party Dress', category: 'Clothing > Kids', catalogue: 'Catalogue A', price: 1299, stock: 25, sales: 120, status: 'Active', image: 'Kids' },
        { id: 2, name: 'Women Kurti', category: 'Clothing > Women', catalogue: 'Catalogue A', price: 899, stock: 40, sales: 48, status: 'Active', image: 'Kids' },
        { id: 3, name: 'Premium Pen Set', category: 'Stationery', catalogue: 'Catalogue B', price: 299, stock: 100, sales: 32, status: 'Active', image: 'Kids' },
        { id: 4, name: 'Birthday Gift Box', category: 'Gifts', catalogue: 'Catalogue B', price: 509, stock: 30, sales: 95, status: 'Active', image: 'Lifestyle' },
        { id: 5, name: 'Stylish Handbag', category: 'Accessories', catalogue: 'Catalogue B', price: 1499, stock: 5, sales: 150, status: 'Low Stock', image: 'Accessories' },
        { id: 6, name: 'Baby Cotton Frock', category: 'Clothing > Kids', catalogue: 'Catalogue A', price: 799, stock: 15, sales: 40, status: 'Active', image: 'Kids' },
        { id: 7, name: 'Floral Print Kurta', category: 'Clothing > Women', catalogue: 'Catalogue A', price: 1199, stock: 18, sales: 55, status: 'Active', image: 'Kids' },
        { id: 8, name: 'Executive Gel Pens', category: 'Stationery', catalogue: 'Catalogue B', price: 199, stock: 250, sales: 85, status: 'Active', image: 'Kids' },
        { id: 9, name: 'Chocolate Hamper', category: 'Gifts', catalogue: 'Catalogue B', price: 899, stock: 50, sales: 60, status: 'Active', image: 'Lifestyle' },
        { id: 10, name: 'Leather Shoulder Bag', category: 'Accessories', catalogue: 'Catalogue B', price: 2499, stock: 8, sales: 75, status: 'Active', image: 'Accessories' }
      ]);
      console.log('✅ Seeded default products to MongoDB');
    }

    // 10. Orders
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.insertMany([
        { id: '#ORD1234', customer: 'Sumathi R', product: 'Gold Necklace Set', amount: '₹2,499', payment: 'Razorpay', status: 'Delivered', date: 'Jun 28, 2025' },
        { id: '#ORD1233', customer: 'Priya M', product: 'Kids Party Dress', amount: '₹1,299', payment: 'UPI', status: 'Shipped', date: 'Jun 27, 2025' },
        { id: '#ORD1232', customer: 'Arjun K', product: 'Surprise Balloon Box', amount: '₹899', payment: 'COD', status: 'Processing', date: 'Jun 27, 2025' },
        { id: '#ORD1231', customer: 'Nandhini S', product: 'Silk Anarkali Suit', amount: '₹3,199', payment: 'Razorpay', status: 'Pending', date: 'Jun 26, 2025' },
        { id: '#ORD1230', customer: 'Vijay P', product: 'Cotton Daily Wear Kurti', amount: '₹599', payment: 'UPI', status: 'Cancelled', date: 'Jun 26, 2025' }
      ]);
      console.log('✅ Seeded default orders to MongoDB');
    }
  } catch (err) {
    console.error('Error seeding store data:', err);
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
  Settings
};
