const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mithirashoppy";
mongoose.connect(MONGODB_URI).then(async () => {
	console.log("✅ Connected to MongoDB successfully");
	try {
		// Skip dropping the database to persist products and categories across restarts
		// await mongoose.connection.db.dropDatabase();
		// console.log('🗑️ Database dropped/cleared successfully');
		// Brief delay to let MongoDB finalize dropped collections and indices
		await seedAdmin();
		await seedStoreData();
		// Auto-migrate/sync approvalStatus for existing products to prevent mismatch
		await mongoose.model("Product").updateMany({
			status: "Active",
			$or: [
				{ approvalStatus: "Pending" },
				{ approvalStatus: { $exists: false } },
				{ approvalStatus: null }
			]
		}, { $set: { approvalStatus: "Approved" } });
		await mongoose.model("Product").updateMany({
			status: "Rejected",
			$or: [
				{ approvalStatus: "Pending" },
				{ approvalStatus: { $exists: false } },
				{ approvalStatus: null }
			]
		}, { $set: { approvalStatus: "Rejected" } });
	} catch (dbErr) {
		console.error("❌ Error dropping database:", dbErr);
	}
}).catch((err) => console.error("❌ MongoDB connection error:", err));
// ─── Schemas & Models ────────────────────────────────────────────────────────
const AddressSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true
	},
	type: {
		type: String,
		default: "Home"
	},
	isDefault: {
		type: Boolean,
		default: false
	},
	name: {
		type: String,
		required: true
	},
	phone: {
		type: String,
		required: true
	},
	street: {
		type: String,
		required: true
	},
	locality: {
		type: String,
		default: ""
	},
	city: {
		type: String,
		required: true
	},
	pincode: {
		type: String,
		required: true
	},
	state: {
		type: String,
		default: "Telangana"
	},
	country: {
		type: String,
		default: "India"
	}
});
const UserSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	phone: {
		type: String,
		default: null
	},
	password: {
		type: String,
		required: true
	},
	role: {
		type: String,
		default: "user"
	},
	is_active: {
		type: Boolean,
		default: true
	},
	created_at: {
		type: Date,
		default: Date.now
	},
	cart: {
		type: [String],
		default: []
	},
	cartItems: [{
		productId: {
			type: Number,
			required: true
		},
		variant: {
			type: mongoose.Schema.Types.Mixed,
			default: {}
		},
		quantity: {
			type: Number,
			default: 1
		}
	}],
	wishlist: {
		type: [String],
		default: []
	},
	wishlistItems: [{ productId: {
		type: Number,
		required: true
	} }],
	addresses: {
		type: [AddressSchema],
		default: []
	},
	dob: {
		type: String,
		default: "15/08/1995"
	},
	gender: {
		type: String,
		default: "Female"
	},
	profileImage: {
		type: String,
		default: ""
	},
	orderIds: {
		type: [String],
		default: []
	}
});
const ProductVariantSchema = new mongoose.Schema({
	size: {
		type: String,
		default: null
	},
	color: {
		type: String,
		default: null
	},
	stock: {
		type: Number,
		default: 0
	},
	price: {
		type: Number,
		default: null
	},
	sku: {
		type: String,
		default: null
	},
	image: {
		type: String,
		default: null
	}
});
const ProductSchema = new mongoose.Schema({
	id: {
		type: Number,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	category: {
		type: String,
		default: "Clothing > Kids"
	},
	subCategory: {
		type: String,
		default: ""
	},
	catalogue: {
		type: String,
		default: "Catalogue A"
	},
	price: {
		type: Number,
		required: true
	},
	stock: {
		type: Number,
		default: 0
	},
	sales: {
		type: Number,
		default: 0
	},
	status: {
		type: String,
		default: "Active"
	},
	image: {
		type: String,
		default: "Kids"
	},
	images: {
		type: [String],
		default: []
	},
	variants: {
		type: [ProductVariantSchema],
		default: []
	},
	lowStockThreshold: {
		type: Number,
		default: 5
	},
	isLowStock: {
		type: Boolean,
		default: false
	},
	description: {
		type: String,
		default: ""
	},
	brand: {
		type: String,
		default: ""
	},
	rating: {
		type: Number,
		default: 4.8
	},
	reviews: {
		type: Number,
		default: 120
	},
	discount: {
		type: Number,
		default: 0
	},
	originalPrice: {
		type: Number,
		default: null
	},
	badge: {
		type: String,
		default: ""
	},
	isNewArrival: {
		type: Boolean,
		default: false
	},
	isOffer: {
		type: Boolean,
		default: false
	},
	attributes: {
		type: [{
			key: { type: String },
			value: { type: String }
		}],
		default: []
	},
	// Lucky Charm Fields
	includeInLuckyCharm: {
		type: Boolean,
		default: false
	},
	luckyStock: {
		type: Number,
		default: 0
	},
	// Vendor Fields
	vendorId: {
		type: String,
		default: null,
		index: true,
		ref: "Vendor"
	},
	approvalStatus: {
		type: String,
		enum: [
			"Pending",
			"Approved",
			"Rejected"
		],
		default: "Pending",
		index: true
	},
	approvedBy: {
		type: String,
		default: null,
		ref: "User"
	},
	approvedAt: {
		type: Date,
		default: null
	},
	rejectReason: {
		type: String,
		default: ""
	}
});
// Auto-populate the images array with the main image if empty
ProductSchema.pre("save", function() {
	if (this.image && (!this.images || this.images.length === 0)) {
		this.images = [this.image];
	}
	if (this.stock <= this.lowStockThreshold) {
		this.isLowStock = true;
	} else {
		this.isLowStock = false;
	}
	// Synchronize status and approvalStatus
	if (this.isModified("status")) {
		if (this.status === "Pending") {
			this.approvalStatus = "Pending";
		} else if (this.status === "Active") {
			this.approvalStatus = "Approved";
		} else if (this.status === "Rejected") {
			this.approvalStatus = "Rejected";
		}
	} else if (this.isModified("approvalStatus")) {
		if (this.approvalStatus === "Pending") {
			this.status = "Pending";
		} else if (this.approvalStatus === "Approved") {
			this.status = "Active";
		} else if (this.approvalStatus === "Rejected") {
			this.status = "Rejected";
		}
	} else {
		// Sync status to approvalStatus by default (e.g. for new documents)
		if (this.status === "Pending") {
			this.approvalStatus = "Pending";
		} else if (this.status === "Active") {
			this.approvalStatus = "Approved";
		} else if (this.status === "Rejected") {
			this.approvalStatus = "Rejected";
		}
	}
});
ProductSchema.pre("findOneAndUpdate", function() {
	const update = this.getUpdate();
	if (update && update.$set) {
		const status = update.$set.status;
		const approvalStatus = update.$set.approvalStatus;
		if (status !== undefined) {
			if (status === "Pending") {
				update.$set.approvalStatus = "Pending";
			} else if (status === "Active") {
				update.$set.approvalStatus = "Approved";
			} else if (status === "Rejected") {
				update.$set.approvalStatus = "Rejected";
			}
		} else if (approvalStatus !== undefined) {
			if (approvalStatus === "Pending") {
				update.$set.status = "Pending";
			} else if (approvalStatus === "Approved") {
				update.$set.status = "Active";
			} else if (approvalStatus === "Rejected") {
				update.$set.status = "Rejected";
			}
		}
	}
});
const CategorySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	parent: {
		type: String,
		default: "—"
	},
	parentId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Category",
		default: null
	},
	count: {
		type: Number,
		default: 0
	},
	status: {
		type: String,
		default: "Active"
	},
	image: {
		type: String,
		default: ""
	}
});
// Middleware to keep the 'parent' string synchronized with the parent's name
CategorySchema.pre("save", async function() {
	if (this.parentId) {
		try {
			const parentCategory = await mongoose.model("Category").findById(this.parentId);
			if (parentCategory) {
				this.parent = parentCategory.name;
			}
		} catch (err) {}
	} else if (this.parent === "—" || !this.parent) {
		this.parent = "—";
	}
});
const CatalogueSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	subtitle: {
		type: String,
		required: true
	},
	count: {
		type: Number,
		default: 0
	},
	status: {
		type: String,
		default: "Active"
	},
	revenue: {
		type: String,
		default: "₹0"
	},
	image: {
		type: String,
		default: "Kids"
	},
	visibility: {
		type: String,
		enum: ["Public", "Internal"],
		default: "Internal"
	}
});
const OrderItemSchema = new mongoose.Schema({
	productId: {
		type: Number,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	variant: {
		type: mongoose.Schema.Types.Mixed,
		default: {}
	},
	catalogue: {
		type: String,
		default: null
	},
	quantity: {
		type: Number,
		default: 1
	},
	price: {
		type: Number,
		required: true
	},
	vendorId: {
		type: String,
		default: null,
		index: true,
		ref: "Vendor"
	}
});
const OrderSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true,
		unique: true
	},
	userId: { type: String },
	customer: {
		type: String,
		required: true
	},
	product: {
		type: String,
		required: true
	},
	amount: {
		type: String,
		required: true
	},
	payment: {
		type: String,
		default: "Razorpay"
	},
	status: {
		type: String,
		default: "Pending",
		index: true
	},
	date: {
		type: String,
		required: true
	},
	items: {
		type: [OrderItemSchema],
		default: []
	},
	catalogueDetails: {
		type: Map,
		of: String
	},
	isLuckyCharmOrder: {
		type: Boolean,
		default: false
	},
	shippingAddress: {
		type: mongoose.Schema.Types.Mixed,
		default: {}
	},
	subtotal: { type: Number },
	gst: { type: Number },
	shipping: { type: Number },
	discount: { type: Number }
});
const CouponSchema = new mongoose.Schema({
	code: {
		type: String,
		required: true,
		unique: true
	},
	discount: {
		type: String,
		required: true
	},
	type: {
		type: String,
		default: "Percentage"
	},
	minCart: {
		type: String,
		default: "₹0"
	},
	expiry: {
		type: String,
		required: true
	},
	usage: {
		type: String,
		default: "0/500"
	},
	status: {
		type: String,
		default: "Active"
	},
	maxDiscount: {
		type: Number,
		default: null
	},
	usageCount: {
		type: Number,
		default: 0
	},
	userUsage: [{
		userId: {
			type: String,
			required: true
		},
		count: {
			type: Number,
			default: 1
		}
	}]
});
const ReviewSchema = new mongoose.Schema({
	id: {
		type: Number,
		required: true,
		unique: true
	},
	productName: {
		type: String,
		required: true
	},
	productImage: {
		type: String,
		default: "Kids"
	},
	customerName: {
		type: String,
		required: true
	},
	rating: {
		type: Number,
		required: true
	},
	comment: {
		type: String,
		required: true
	},
	date: {
		type: String,
		required: true
	},
	status: {
		type: String,
		default: "Pending"
	},
	reply: {
		type: String,
		default: ""
	},
	userId: {
		type: String,
		default: null
	},
	verifiedPurchase: {
		type: Boolean,
		default: false
	}
});
const BannerSchema = new mongoose.Schema({
	id: {
		type: Number,
		required: true,
		unique: true
	},
	title: {
		type: String,
		required: true
	},
	slot: {
		type: String,
		default: "Main Banner"
	},
	image: {
		type: String,
		default: "Clothing"
	},
	clickRate: {
		type: String,
		default: "0.0%"
	},
	status: {
		type: String,
		default: "Active"
	}
});
const AnnouncementSchema = new mongoose.Schema({
	id: {
		type: Number,
		required: true,
		unique: true
	},
	text: {
		type: String,
		required: true
	},
	placement: {
		type: String,
		default: "Top Header"
	},
	expiry: {
		type: String,
		required: true
	},
	status: {
		type: String,
		default: "Active"
	}
});
const ContactQuerySchema = new mongoose.Schema({
	id: {
		type: Number,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	message: {
		type: String,
		required: true
	},
	date: {
		type: String,
		required: true
	},
	status: {
		type: String,
		default: "Pending"
	},
	phone: {
		type: String,
		default: null
	},
	subject: {
		type: String,
		default: null
	}
});
const SettingsSchema = new mongoose.Schema({
	storeName: {
		type: String,
		default: "MithiraShoppy Official"
	},
	supportEmail: {
		type: String,
		default: "support@mithirashoppy.com"
	},
	taxPercentage: {
		type: Number,
		default: 18
	},
	defaultCurrency: {
		type: String,
		default: "INR"
	},
	shippingInfoLines: {
		type: [String],
		default: [
			"Free shipping on all orders above ₹999.",
			"Standard delivery takes 3–5 business days depending on location.",
			"Cash on Delivery (COD) is available on all eligible postal addresses.",
			"We offer easy 7-day hassle-free returns and exchanges."
		]
	},
	freeShippingAbove: {
		type: Number,
		default: 999
	},
	standardCharge: {
		type: Number,
		default: 0
	},
	expressCharge: {
		type: Number,
		default: 150
	},
	codCharges: {
		type: Number,
		default: 50
	},
	enableCod: {
		type: Boolean,
		default: true
	},
	enableExpress: {
		type: Boolean,
		default: true
	},
	enableInternational: {
		type: Boolean,
		default: false
	},
	senderName: {
		type: String,
		default: "Mithra Shopy"
	},
	senderEmail: {
		type: String,
		default: "info@mithrashopy.com"
	},
	smtpHost: {
		type: String,
		default: "smtp.gmail.com"
	},
	smtpPort: {
		type: Number,
		default: 587
	},
	smtpUsername: {
		type: String,
		default: "info@mithrashopy.com"
	},
	smtpPassword: {
		type: String,
		default: ""
	}
});
const FeatureSchema = new mongoose.Schema({
	id: {
		type: Number,
		required: true,
		unique: true
	},
	key: {
		type: String,
		required: true,
		unique: true
	},
	name: {
		type: String,
		required: true
	},
	title: {
		type: String,
		default: ""
	},
	subtitle: {
		type: String,
		default: ""
	},
	status: {
		type: String,
		default: "Active"
	},
	order: {
		type: Number,
		required: true
	}
});
// ─── Vendor Schemas ─────────────────────────────────────────────────────────
const VendorSchema = new mongoose.Schema({
	id: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	businessName: {
		type: String,
		required: true
	},
	ownerName: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		index: true,
		lowercase: true
	},
	password: {
		type: String,
		required: true
	},
	phone: {
		type: String,
		required: true
	},
	gstin: {
		type: String,
		default: ""
	},
	pan: {
		type: String,
		default: ""
	},
	businessCategory: {
		type: String,
		default: ""
	},
	businessDescription: {
		type: String,
		default: ""
	},
	logo: {
		type: String,
		default: ""
	},
	panDocument: {
		type: String,
		default: ""
	},
	cancelledCheque: {
		type: String,
		default: ""
	},
	status: {
		type: String,
		enum: [
			"Pending",
			"Approved",
			"Rejected",
			"Suspended"
		],
		default: "Pending",
		index: true
	},
	rejectReason: {
		type: String,
		default: ""
	},
	adminNotes: {
		type: String,
		default: ""
	},
	approvedBy: {
		type: String,
		default: null,
		ref: "User"
	},
	approvedAt: {
		type: Date,
		default: null
	},
	lastLoginAt: {
		type: Date,
		default: null
	},
	address: {
		street: {
			type: String,
			default: ""
		},
		city: {
			type: String,
			default: ""
		},
		state: {
			type: String,
			default: ""
		},
		pincode: {
			type: String,
			default: ""
		},
		country: {
			type: String,
			default: "India"
		}
	},
	bankDetails: {
		accountHolder: {
			type: String,
			default: ""
		},
		accountNumber: {
			type: String,
			default: ""
		},
		ifscCode: {
			type: String,
			default: ""
		},
		bankName: {
			type: String,
			default: ""
		}
	}
}, { timestamps: true });
const VendorNotificationSchema = new mongoose.Schema({
	vendorId: {
		type: String,
		required: true,
		index: true,
		ref: "Vendor"
	},
	type: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	message: {
		type: String,
		required: true
	},
	metadata: {
		type: mongoose.Schema.Types.Mixed,
		default: {}
	},
	isRead: {
		type: Boolean,
		default: false,
		index: true
	}
}, { timestamps: true });
// ─── Future-Ready Schemas ───────────────────────────────────────────────────
const NewsletterSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	subscribedAt: {
		type: Date,
		default: Date.now
	},
	active: {
		type: Boolean,
		default: true
	}
});
const CampaignSchema = new mongoose.Schema({
	name: { type: String },
	campaignName: {
		type: String,
		required: true
	},
	minOrderValue: {
		type: Number,
		default: 0
	},
	maxOrderValue: {
		type: Number,
		default: null
	},
	rewardBudget: {
		type: Number,
		required: true
	},
	wheelProductCount: {
		type: Number,
		default: 8
	},
	campaignUsageLimit: {
		type: Number,
		default: null
	},
	startDate: {
		type: Date,
		required: true
	},
	endDate: {
		type: Date,
		required: true
	},
	status: {
		type: String,
		enum: [
			"Active",
			"Inactive",
			"Completed"
		],
		default: "Active",
		index: true
	}
});
CampaignSchema.index({
	status: 1,
	startDate: 1,
	endDate: 1
});
const AnalyticsSchema = new mongoose.Schema({
	event: {
		type: String,
		required: true
	},
	userId: {
		type: String,
		default: null
	},
	metadata: {
		type: mongoose.Schema.Types.Mixed,
		default: {}
	},
	timestamp: {
		type: Date,
		default: Date.now
	}
});
const LuckySpinHistorySchema = new mongoose.Schema({
	userId: {
		type: String,
		default: null,
		index: true
	},
	user: {
		type: String,
		default: null
	},
	campaignId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Campaign",
		default: null,
		index: true
	},
	campaign: {
		type: String,
		default: null
	},
	orderId: {
		type: String,
		default: null
	},
	order: {
		type: String,
		default: null
	},
	productId: {
		type: Number,
		default: null
	},
	wonProduct: {
		type: String,
		default: null
	},
	spinTime: {
		type: Date,
		default: Date.now
	},
	claimStatus: {
		type: String,
		enum: ["Pending", "Claimed"],
		default: "Pending"
	},
	// Enhanced Analytics Fields
	sessionId: {
		type: String,
		default: null
	},
	cartTotal: {
		type: Number,
		default: 0
	},
	rewardBudget: {
		type: Number,
		default: 0
	},
	wonProductPrice: {
		type: Number,
		default: 0
	},
	luckyStockBefore: {
		type: Number,
		default: 0
	},
	luckyStockAfter: {
		type: Number,
		default: 0
	},
	spinDuration: {
		type: Number,
		default: 0
	}
});
LuckySpinHistorySchema.index({
	userId: 1,
	claimStatus: 1,
	orderId: 1
});
const User = mongoose.model("User", UserSchema);
const Product = mongoose.model("Product", ProductSchema);
const Category = mongoose.model("Category", CategorySchema);
const Catalogue = mongoose.model("Catalogue", CatalogueSchema);
const Order = mongoose.model("Order", OrderSchema);
const Coupon = mongoose.model("Coupon", CouponSchema);
const Review = mongoose.model("Review", ReviewSchema);
const Banner = mongoose.model("Banner", BannerSchema);
const Announcement = mongoose.model("Announcement", AnnouncementSchema);
const ContactQuery = mongoose.model("ContactQuery", ContactQuerySchema);
const Settings = mongoose.model("Settings", SettingsSchema);
const Feature = mongoose.model("Feature", FeatureSchema);
const Vendor = mongoose.model("Vendor", VendorSchema);
const VendorNotification = mongoose.model("VendorNotification", VendorNotificationSchema);
// ─── Seed Data ───────────────────────────────────────────────────────────────
async function seedStoreData() {
	try {
		const settingsDoc = await Settings.findOne();
		if (!settingsDoc) {
			await Settings.create({});
			console.log("✅ Default settings seeded successfully");
		}
		// Seed default coupons if not exist
		const existingL10 = await Coupon.findOne({ code: "LUCKY10" });
		if (!existingL10) {
			await Coupon.create({
				code: "LUCKY10",
				discount: "10",
				type: "Percentage",
				minCart: "₹0",
				expiry: "2027-12-31",
				usage: "0/1000",
				status: "Active"
			});
			console.log("✅ Coupon LUCKY10 seeded successfully");
		}
		const existingM100 = await Coupon.findOne({ code: "MITHRA100" });
		if (!existingM100) {
			await Coupon.create({
				code: "MITHRA100",
				discount: "100",
				type: "Flat",
				minCart: "₹500",
				expiry: "2027-12-31",
				usage: "0/1000",
				status: "Active"
			});
			console.log("✅ Coupon MITHRA100 seeded successfully");
		}
		const defaultFeatures = [
			{
				id: 1,
				key: "hero",
				name: "Hero Carousel",
				title: "Curated Elegance",
				subtitle: "Explore Mithira Shopy collections",
				status: "Active",
				order: 1
			},
			{
				id: 2,
				key: "trust_bar",
				name: "Trust Bar",
				title: "Why You Can Trust Us",
				subtitle: "Our commitments to you",
				status: "Active",
				order: 2
			},
			{
				id: 3,
				key: "categories",
				name: "Shop by Top Categories",
				title: "Shop by Top Categories",
				subtitle: "Explore our top categories and find your perfect style",
				status: "Active",
				order: 3
			},
			{
				id: 4,
				key: "video_showcase",
				name: "Video Showcase",
				title: "Video Tour",
				subtitle: "Take a virtual look inside our boutique",
				status: "Active",
				order: 4
			},
			{
				id: 5,
				key: "exclusive_products",
				name: "Exclusive Products",
				title: "Exclusive Collection",
				subtitle: "Handpicked premium fashion boutique items",
				status: "Active",
				order: 5
			},
			{
				id: 6,
				key: "celebrity_collection",
				name: "Celebrity Collection",
				title: "Celebrity Collections",
				subtitle: "Inspired by leading fashion influencers",
				status: "Active",
				order: 6
			},
			{
				id: 7,
				key: "why_choose_us",
				name: "Why Choose Us",
				title: "Why Choose Mithra Shopy",
				subtitle: "Direct-from-weaver premium quality items",
				status: "Active",
				order: 7
			}
		];
		for (const f of defaultFeatures) {
			const existingF = await Feature.findOne({ key: f.key });
			if (!existingF) {
				await Feature.create(f);
				console.log(`✅ Seeded feature functionality: ${f.name}`);
			}
		}
		const productCount = await Product.countDocuments();
		if (productCount === 0) {
			const existing = await Product.findOne({ id: 2 });
			if (!existing) {
			await Product.create({
				id: 2,
				name: "Women Kurti",
				category: "Clothing > Women",
				catalogue: "Catalogue A",
				price: 899,
				stock: 40,
				sales: 48,
				status: "Active",
				image: "Kids",
				description: "Relaxed fit women kurti."
			});
			console.log("✅ Women Kurti seeded successfully");
		}
		// Seed the 3 new premium products requested by user
		const existingPurpleNotebook = await Product.findOne({ id: 101 });
		if (!existingPurpleNotebook) {
			await Product.create({
				id: 101,
				name: "Purple Notebook",
				category: "Stationery > Book",
				subCategory: "book",
				catalogue: "Catalogue A",
				price: 399,
				stock: 50,
				sales: 15,
				status: "Active",
				image: "purple_notebook.jpg",
				images: ["purple_notebook.jpg"],
				description: "A premium soft-bound purple notebook with elegant embossed details, featuring gold-edged pages and a matching bookmark ribbon.",
				brand: "Mithira Luxe",
				rating: 4.9,
				reviews: 42,
				discount: 15,
				originalPrice: 469
			});
			console.log("✅ Purple Notebook (id: 101) seeded successfully");
		}
		const existingAnarkali = await Product.findOne({ id: 102 });
		if (!existingAnarkali) {
			await Product.create({
				id: 102,
				name: "Anarkali",
				category: "Clothing > Women > Kurti",
				subCategory: "kurti",
				catalogue: "Catalogue A",
				price: 2499,
				stock: 35,
				sales: 28,
				status: "Active",
				image: "green_anarkali.jpg",
				images: ["green_anarkali.jpg"],
				description: "An elegant green Anarkali dress featuring intricate golden embroidery, a flared silhouette, and full sleeves. Perfect for festive occasions.",
				brand: "Mithira Heritage",
				rating: 5,
				reviews: 88,
				discount: 20,
				originalPrice: 3125
			});
			console.log("✅ Anarkali (id: 102) seeded successfully");
		}
		const existingBlueSuit = await Product.findOne({ id: 103 });
		if (!existingBlueSuit) {
			await Product.create({
				id: 103,
				name: "Blue Formal Suit",
				category: "Clothing > Men > formal suites",
				subCategory: "formal suites",
				catalogue: "Catalogue A",
				price: 4999,
				stock: 20,
				sales: 12,
				status: "Active",
				image: "blue_suit.jpg",
				images: ["blue_suit.jpg"],
				description: "A slim-fit royal blue formal suit featuring a single-breasted blazer and matching trousers. Crafted from premium wool-blend fabric for a sophisticated look.",
				brand: "Aurelian Noir",
				rating: 4.8,
				reviews: 36,
				discount: 10,
				originalPrice: 5550
			});
			console.log("✅ Blue Formal Suit (id: 103) seeded successfully");
		}
		// Seed 5 new exclusive products requested by user (replace previous 3 on home page)
		const existingWhiteGown = await Product.findOne({ id: 104 });
		if (!existingWhiteGown) {
			await Product.create({
				id: 104,
				name: "White Lace Gown",
				category: "Clothing > Kids > Girls > Gowns",
				subCategory: "Gowns",
				catalogue: "Catalogue A",
				price: 1899,
				stock: 30,
				sales: 22,
				status: "Active",
				image: "white_gown.jpg",
				images: ["white_gown.jpg"],
				description: "An enchanting white lace gown for girls with a beautiful satin bow belt, layered tiered skirt, and delicate floral lace detailing. Perfect for parties and special occasions.",
				brand: "Mithira Kids",
				rating: 4.9,
				reviews: 64,
				discount: 15,
				originalPrice: 2235
			});
			console.log("✅ White Lace Gown (id: 104) seeded successfully");
		}
		const existingPremiumGiftSet = await Product.findOne({ id: 105 });
		if (!existingPremiumGiftSet) {
			await Product.create({
				id: 105,
				name: "Premium Gift Set",
				category: "Gifts",
				subCategory: "Gift Hamper",
				catalogue: "Catalogue A",
				price: 1499,
				stock: 45,
				sales: 38,
				status: "Active",
				image: "premium_gift_set.jpg",
				images: ["premium_gift_set.jpg"],
				description: "A luxurious premium gift set featuring beautifully wrapped green and ivory boxes tied with gold satin ribbons. Perfect for birthdays, anniversaries, and celebrations.",
				brand: "Mithira Gifting",
				rating: 4.8,
				reviews: 112,
				discount: 10,
				originalPrice: 1665
			});
			console.log("✅ Premium Gift Set (id: 105) seeded successfully");
		}
		const existingKidsFormalSuit = await Product.findOne({ id: 106 });
		if (!existingKidsFormalSuit) {
			await Product.create({
				id: 106,
				name: "Kids Formal Suit",
				category: "Clothing > Kids > Formal",
				subCategory: "Formal",
				catalogue: "Catalogue A",
				price: 2299,
				stock: 25,
				sales: 18,
				status: "Active",
				image: "kids_formal_suit.jpg",
				images: ["kids_formal_suit.jpg"],
				description: "A sharp charcoal grey formal vest suit with matching trousers and a navy blue bow tie for boys. Ideal for school events, weddings, and formal occasions.",
				brand: "Mithira Kids",
				rating: 4.7,
				reviews: 45,
				discount: 12,
				originalPrice: 2613
			});
			console.log("✅ Kids Formal Suit (id: 106) seeded successfully");
		}
		const existingGoldAnklets = await Product.findOne({ id: 107 });
		if (!existingGoldAnklets) {
			await Product.create({
				id: 107,
				name: "Gold Anklets",
				category: "Accessories > Jewellery > Anklets",
				subCategory: "Anklets",
				catalogue: "Catalogue A",
				price: 899,
				stock: 60,
				sales: 45,
				status: "Active",
				image: "gold_anklets.jpg",
				images: ["gold_anklets.jpg"],
				description: "Elegant traditional gold-plated anklets with delicate bell charms and intricate chain links. Adds a touch of grace and tradition to any outfit.",
				brand: "Mithira Jewels",
				rating: 5,
				reviews: 132,
				discount: 20,
				originalPrice: 1124
			});
			console.log("✅ Gold Anklets (id: 107) seeded successfully");
		}
		const existingDiamondRing = await Product.findOne({ id: 108 });
		if (!existingDiamondRing) {
			await Product.create({
				id: 108,
				name: "Diamond Ginkgo Ring",
				category: "Accessories > Jewellery > Ring",
				subCategory: "Ring",
				catalogue: "Catalogue A",
				price: 7499,
				stock: 15,
				sales: 8,
				status: "Active",
				image: "diamond_ring.jpg",
				images: ["diamond_ring.jpg"],
				description: "A breathtaking 18K gold ring inspired by the ginkgo leaf with diamond accents. Features hand-etched botanical detailing and brilliant-cut diamonds for an exquisite, nature-inspired look.",
				brand: "Aurelian Jewels",
				rating: 5,
				reviews: 28,
				discount: 5,
				originalPrice: 7894
			});
			console.log("✅ Diamond Ginkgo Ring (id: 108) seeded successfully");
		}
		// Seed 5 more new exclusive products (109-113) requested by user — DO NOT remove existing 104-108
		const existingHeavyJoker = await Product.findOne({ id: 109 });
		if (!existingHeavyJoker) {
			await Product.create({
				id: 109,
				name: "Heavy Worked Joker Necklace",
				category: "Accessories > Jewellery > Heavy Worked Joker",
				subCategory: "Heavy Worked Joker",
				catalogue: "Catalogue A",
				price: 12999,
				stock: 10,
				sales: 6,
				status: "Active",
				image: "heavy_joker_necklace.jpg",
				images: ["heavy_joker_necklace.jpg"],
				description: "A majestic diamond-studded gold joker necklace with intricate filigree work and a breathtaking pear-shaped pendant. The epitome of bridal luxury craftsmanship.",
				brand: "Aurelian Jewels",
				rating: 5,
				reviews: 19,
				discount: 8,
				originalPrice: 14130
			});
			console.log("✅ Heavy Worked Joker Necklace (id: 109) seeded successfully");
		}
		const existingSimpleChain = await Product.findOne({ id: 110 });
		if (!existingSimpleChain) {
			await Product.create({
				id: 110,
				name: "Simple Chain Jewellery Set",
				category: "Accessories > Jewellery > Simple Chain",
				subCategory: "Simple Chain",
				catalogue: "Catalogue A",
				price: 2499,
				stock: 40,
				sales: 55,
				status: "Active",
				image: "simple_chain_jewellery.jpg",
				images: ["simple_chain_jewellery.jpg"],
				description: "An elegant everyday jewellery set featuring layered gold chains, pearl drop earrings, diamond hoop bracelets, and delicate rings — all in premium gold plating on a soft silk backdrop.",
				brand: "Mithira Jewels",
				rating: 4.9,
				reviews: 87,
				discount: 18,
				originalPrice: 3048
			});
			console.log("✅ Simple Chain Jewellery Set (id: 110) seeded successfully");
		}
		const existingLuxeNotebook = await Product.findOne({ id: 111 });
		if (!existingLuxeNotebook) {
			await Product.create({
				id: 111,
				name: "Luxe Leather Notebook",
				category: "Stationery > Book",
				subCategory: "Book",
				catalogue: "Catalogue A",
				price: 749,
				stock: 60,
				sales: 34,
				status: "Active",
				image: "luxe_leather_notebook.jpg",
				images: ["luxe_leather_notebook.jpg"],
				description: "A premium purple vegan-leather hardbound notebook with gold-edged pages, Fleur-de-lis embossed detailing, satin bookmark ribbon, and a matching gold pen. Perfect for journaling and gifting.",
				brand: "Mithira Luxe",
				rating: 4.8,
				reviews: 61,
				discount: 12,
				originalPrice: 851
			});
			console.log("✅ Luxe Leather Notebook (id: 111) seeded successfully");
		}
		const existingAnarkali2 = await Product.findOne({ id: 112 });
		if (!existingAnarkali2) {
			await Product.create({
				id: 112,
				name: "Anarkali",
				category: "Clothing > Women > Kurti",
				subCategory: "Kurti",
				catalogue: "Catalogue A",
				price: 3299,
				stock: 28,
				sales: 41,
				status: "Active",
				image: "green_anarkali2.jpg",
				images: ["green_anarkali2.jpg"],
				description: "A stunning emerald green Anarkali gown with rich gold zari embroidery covering the full length of the flared skirt. Full sleeves with intricate floral motifs. The ultimate festive statement piece.",
				brand: "Mithira Heritage",
				rating: 5,
				reviews: 103,
				discount: 22,
				originalPrice: 4229
			});
			console.log("✅ Anarkali 2 (id: 112) seeded successfully");
		}
		const existingBlueFormalSuit2 = await Product.findOne({ id: 113 });
		if (!existingBlueFormalSuit2) {
			await Product.create({
				id: 113,
				name: "Blue Formal Suit",
				category: "Clothing > Men > Formal Suites",
				subCategory: "Formal Suites",
				catalogue: "Catalogue A",
				price: 5999,
				stock: 18,
				sales: 14,
				status: "Active",
				image: "blue_formal_suit2.jpg",
				images: ["blue_formal_suit2.jpg"],
				description: "A sharp, tailored royal blue single-breasted formal suit with gold-button detailing by Aurelian Noir. Crafted from premium Italian wool blend, this suit radiates power and elegance.",
				brand: "Aurelian Noir",
				rating: 4.9,
				reviews: 47,
				discount: 15,
				originalPrice: 7058
			});
			console.log("✅ Blue Formal Suit 2 (id: 113) seeded successfully");
		}
		// Seed 3 more exclusive products (114-116) — DO NOT remove existing 104-113
		const existingSchoolKit = await Product.findOne({ id: 114 });
		if (!existingSchoolKit) {
			await Product.create({
				id: 114,
				name: "School Stationery Kit",
				category: "Stationery",
				subCategory: "School Items",
				catalogue: "Catalogue A",
				price: 599,
				stock: 80,
				sales: 67,
				status: "Active",
				image: "school_stationery_kit.jpg",
				images: ["school_stationery_kit.jpg"],
				description: "A complete school stationery kit featuring spiral notebooks, color pencils, sketch pens, scissors, a sharpener, and a pencil holder. Everything a student needs in one vibrant set.",
				brand: "Mithira Stationery",
				rating: 4.8,
				reviews: 94,
				discount: 20,
				originalPrice: 749
			});
			console.log("✅ School Stationery Kit (id: 114) seeded successfully");
		}
		const existingBridalHair = await Product.findOne({ id: 115 });
		if (!existingBridalHair) {
			await Product.create({
				id: 115,
				name: "Bridal Floral Hair Accessory",
				category: "Accessories > Hair Accessories",
				subCategory: "Hair Accessories",
				catalogue: "Catalogue A",
				price: 1299,
				stock: 35,
				sales: 29,
				status: "Active",
				image: "bridal_hair_accessory.jpg",
				images: ["bridal_hair_accessory.jpg"],
				description: "An exquisite bridal hair accessory featuring a large silk lotus flower, cascading jasmine bud strings, gold chain draping, and delicate jhumka bells. Perfect for weddings and festive occasions.",
				brand: "Mithira Bridal",
				rating: 5,
				reviews: 58,
				discount: 15,
				originalPrice: 1529
			});
			console.log("✅ Bridal Floral Hair Accessory (id: 115) seeded successfully");
		}
		const existingTealFrock = await Product.findOne({ id: 116 });
		if (!existingTealFrock) {
			await Product.create({
				id: 116,
				name: "Teal Ruffle Frock",
				category: "Clothing > Kids > Girls > Frock",
				subCategory: "Frock",
				catalogue: "Catalogue A",
				price: 899,
				stock: 45,
				sales: 33,
				status: "Active",
				image: "teal_ruffle_frock.jpg",
				images: ["teal_ruffle_frock.jpg"],
				description: "A gorgeous teal organza frock for girls with golden sequin embroidery on the bodice, a flared tiered skirt with vibrant green ruffle hem detailing. Lightweight and perfect for parties.",
				brand: "Mithira Kids",
				rating: 4.9,
				reviews: 72,
				discount: 10,
				originalPrice: 999
			});
			console.log("✅ Teal Ruffle Frock (id: 116) seeded successfully");
		}
		// Seed 5 new arrivals products (117-121) requested by user
		const existingFrockNew = await Product.findOne({ id: 117 });
		if (!existingFrockNew) {
			await Product.create({
				id: 117,
				name: "Pink Gingham Cotton Frock",
				category: "Clothing > Kids > Girls > Frock",
				subCategory: "Frock",
				catalogue: "Catalogue A",
				price: 1299,
				stock: 25,
				sales: 0,
				status: "Active",
				image: "pink_gingham_frock.jpg",
				images: ["pink_gingham_frock.jpg"],
				description: "A lovely pink gingham checkered cotton frock for girls, featuring an elegant overlay daisy-patterned pink cardigan knit jacket. Extremely soft, breathable, and premium weave.",
				brand: "Mithira Kids",
				rating: 4.8,
				reviews: 42,
				discount: 31,
				originalPrice: 1899,
				badge: "NEW",
				isNewArrival: true,
				isOffer: false
			});
			console.log("✅ Pink Gingham Cotton Frock (id: 117) seeded successfully");
		}
		const existingBohoNeck = await Product.findOne({ id: 118 });
		if (!existingBohoNeck) {
			await Product.create({
				id: 118,
				name: "Turquoise Bead Layered Necklace",
				category: "Accessories > Jewellery > Necklace",
				subCategory: "Necklace",
				catalogue: "Catalogue A",
				price: 1899,
				stock: 15,
				sales: 0,
				status: "Active",
				image: "boho_necklace.jpg",
				images: ["boho_necklace.jpg"],
				description: "An exquisite multi-layered bohemian statement necklace featuring polished natural turquoise beads, vintage silver feather charms, wooden accents, and matching statement rings.",
				brand: "Mithira Luxe",
				rating: 4.9,
				reviews: 58,
				discount: 32,
				originalPrice: 2799,
				badge: "NEW",
				isNewArrival: true,
				isOffer: false
			});
			console.log("✅ Turquoise Bead Layered Necklace (id: 118) seeded successfully");
		}
		const existingStationerySet = await Product.findOne({ id: 119 });
		if (!existingStationerySet) {
			await Product.create({
				id: 119,
				name: "Pastel Study & Planner Set",
				category: "Stationery > Binders > Planner",
				subCategory: "Planner",
				catalogue: "Catalogue A",
				price: 999,
				stock: 30,
				sales: 0,
				status: "Active",
				image: "pastel_stationery.jpg",
				images: ["pastel_stationery.jpg"],
				description: "A premium organized study set including a pastel pink planner notebook, multi-colored highlighters, heart-topped decorative pencils, designer pens, clips, and matching pastel page flags.",
				brand: "Mithira Stationery",
				rating: 4.7,
				reviews: 24,
				discount: 33,
				originalPrice: 1499,
				badge: "NEW",
				isNewArrival: true,
				isOffer: false
			});
			console.log("✅ Pastel Study & Planner Set (id: 119) seeded successfully");
		}
		const existingFancyBands = await Product.findOne({ id: 120 });
		if (!existingFancyBands) {
			await Product.create({
				id: 120,
				name: "Scrunchie & Hair Band Set",
				category: "Accessories > fancy > bands",
				subCategory: "bands",
				catalogue: "Catalogue A",
				price: 399,
				stock: 50,
				sales: 0,
				status: "Active",
				image: "scrunchie_fancy_set.jpg",
				images: ["scrunchie_fancy_set.jpg"],
				description: "A fancy satin hair accessories bundle containing pastel pink and blue scrunchies, pearl-embellished bands, mini notebooks, gel pens, and an elegant storage tray gift box.",
				brand: "Mithira Accessories",
				rating: 4.6,
				reviews: 18,
				discount: 33,
				originalPrice: 599,
				badge: "NEW",
				isNewArrival: true,
				isOffer: false
			});
			console.log("✅ Scrunchie & Hair Band Set (id: 120) seeded successfully");
		}
		const existingCrochetBouquet = await Product.findOne({ id: 121 });
		if (!existingCrochetBouquet) {
			await Product.create({
				id: 121,
				name: "Crochet Handmade Flower Bouquet",
				category: "Gifts > Flowers > Bouquet",
				subCategory: "Bouquet",
				catalogue: "Catalogue A",
				price: 1499,
				stock: 20,
				sales: 0,
				status: "Active",
				image: "crochet_bouquet.jpg",
				images: ["crochet_bouquet.jpg"],
				description: "A gorgeous, forever-blooming hand-knitted crochet flower bouquet featuring a vibrant selection of handcrafted red, orange, and purple flowers. An exquisite artisanal gift.",
				brand: "Mithira Gifts",
				rating: 5,
				reviews: 65,
				discount: 31,
				originalPrice: 2199,
				badge: "NEW",
				isNewArrival: true,
				isOffer: false
			});
			console.log("✅ Crochet Handmade Flower Bouquet (id: 121) seeded successfully");
		}
		}
		const defaultCategories = [
			{
				name: "Clothing",
				parent: "—"
			},
			{
				name: "Stationery",
				parent: "—"
			},
			{
				name: "Gifts",
				parent: "—"
			},
			{
				name: "Accessories",
				parent: "—"
			},
			{
				name: "Women",
				parent: "Clothing"
			},
			{
				name: "Men",
				parent: "Clothing"
			},
			{
				name: "Kids",
				parent: "Clothing"
			},
			{
				name: "Boys",
				parent: "Clothing"
			},
			{
				name: "Girls",
				parent: "Clothing"
			},
			(
			// Binders and Planners for Stationery
			{
				name: "Binders",
				parent: "Stationery"
			}),
			{
				name: "Planner",
				parent: "Binders"
			},
			(
			// Fancy and bands for Accessories
			{
				name: "fancy",
				parent: "Accessories"
			}),
			{
				name: "bands",
				parent: "fancy"
			},
			(
			// Flowers and Bouquet for Gifts
			{
				name: "Flowers",
				parent: "Gifts"
			}),
			{
				name: "Bouquet",
				parent: "Flowers"
			},
			{
				name: "Kurti",
				parent: "Women"
			},
			{
				name: "Saree",
				parent: "Women"
			},
			{
				name: "duppata",
				parent: "Women"
			},
			{
				name: "shirts",
				parent: "Men"
			},
			{
				name: "floral kurti",
				parent: "Kurti"
			},
			{
				name: "Pens",
				parent: "Stationery"
			},
			{
				name: "Journals",
				parent: "Stationery"
			},
			{
				name: "Notebooks",
				parent: "Stationery"
			},
			{
				name: "School Items",
				parent: "Stationery"
			},
			{
				name: "note",
				parent: "School Items"
			},
			{
				name: "Birthday Gifts",
				parent: "Gifts"
			},
			{
				name: "Wedding Gifts",
				parent: "Gifts"
			},
			{
				name: "Anniversary Gifts",
				parent: "Gifts"
			},
			{
				name: "Return Gifts",
				parent: "Gifts"
			},
			{
				name: "Jewellery",
				parent: "Accessories"
			},
			{
				name: "Fancy Items",
				parent: "Accessories"
			},
			{
				name: "Hair Accessories",
				parent: "Accessories"
			},
			{
				name: "Fashion Accessories",
				parent: "Accessories"
			},
			(
			// Previously seeded categories
			{
				name: "book",
				parent: "Stationery"
			}),
			(
			// New categories for exclusive products (batch 1: IDs 104-108)
			{
				name: "Gowns",
				parent: "Girls"
			}),
			{
				name: "Formal",
				parent: "Kids"
			},
			{
				name: "Gift Hamper",
				parent: "Gifts"
			},
			{
				name: "Anklets",
				parent: "Jewellery"
			},
			{
				name: "Ring",
				parent: "Jewellery"
			},
			(
			// New categories for exclusive products (batch 2: IDs 109-113)
			{
				name: "Heavy Worked Joker",
				parent: "Jewellery"
			}),
			{
				name: "Simple Chain",
				parent: "Jewellery"
			},
			{
				name: "Formal Suites",
				parent: "Men"
			},
			(
			// New categories for exclusive products (batch 3: IDs 114-116)
			{
				name: "Frock",
				parent: "Girls"
			})
		];
		for (const cat of defaultCategories) {
			let doc = await Category.findOne({ name: cat.name });
			if (!doc) {
				let parentId = null;
				if (cat.parent !== "—") {
					const parentDoc = await Category.findOne({ name: cat.parent });
					if (parentDoc) {
						parentId = parentDoc._id;
					}
				}
				doc = await Category.create({
					name: cat.name,
					parent: cat.parent,
					parentId,
					status: "Active",
					count: 0
				});
				console.log(`✅ Category '${cat.name}' seeded successfully`);
			}
		}
	} catch (err) {
		console.error("Error seeding store products:", err);
	}
}
async function seedAdmin() {
	try {
		const adminEmail = (process.env.ADMIN_EMAIL || "adminmithrashoppy@gmail.com").toLowerCase();
		const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
		// Delete legacy admin if exists to ensure security
		await User.deleteOne({ email: "admin@mithira.com" });
		const existing = await User.findOne({
			email: adminEmail,
			role: "admin"
		});
		if (!existing) {
			const hashed = bcrypt.hashSync(adminPassword, 12);
			await User.create({
				id: uuidv4(),
				name: "Admin",
				email: adminEmail,
				phone: null,
				password: hashed,
				role: "admin",
				is_active: true,
				created_at: new Date()
			});
			console.log(`✅ Admin account seeded: ${adminEmail}`);
		}
	} catch (err) {
		console.error("Error seeding admin:", err);
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
	async createUser({ name, email, phone, password, role = "user" }) {
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
	sessionId: {
		type: String,
		required: true,
		unique: true
	},
	userId: {
		type: String,
		default: null,
		index: true
	},
	cartHash: {
		type: String,
		required: true
	},
	wheelProducts: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product"
	}],
	campaignId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Campaign",
		required: true,
		index: true
	},
	campaignSnapshot: {
		campaignName: { type: String },
		rewardBudget: { type: Number },
		wheelProductCount: { type: Number },
		minOrderValue: { type: Number },
		maxOrderValue: { type: Number }
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 3600
	},
	isUsed: {
		type: Boolean,
		default: false,
		index: true
	}
});
LuckyWheelSessionSchema.index({
	userId: 1,
	cartHash: 1,
	campaignId: 1,
	isUsed: 1
});
const Newsletter = mongoose.model("Newsletter", NewsletterSchema);
const Campaign = mongoose.model("Campaign", CampaignSchema);
const Analytics = mongoose.model("Analytics", AnalyticsSchema);
const LuckySpinHistory = mongoose.model("LuckySpinHistory", LuckySpinHistorySchema);
const LuckyWheelSession = mongoose.model("LuckyWheelSession", LuckyWheelSessionSchema);
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

//# sourceMappingURL=data:application/json;base64,eyJtYXBwaW5ncyI6IkFBQUEsTUFBTSxXQUFXLFFBQVEsVUFBVTtBQUNuQyxNQUFNLFNBQVMsUUFBUSxVQUFVO0FBQ2pDLE1BQU0sRUFBRSxJQUFJLFdBQVcsUUFBUSxNQUFNO0FBRXJDLE1BQU0sY0FBYyxRQUFRLElBQUksZUFBZTtBQUUvQyxTQUFTLFFBQVEsV0FBVyxFQUN6QixLQUFLLFlBQVk7Q0FDaEIsUUFBUSxJQUFJLHFDQUFxQztDQUNqRCxJQUFJOzs7OztFQUtGLE1BQU0sVUFBVTtFQUNoQixNQUFNLGNBQWM7O0VBRXBCLE1BQU0sU0FBUyxNQUFNLFNBQVMsRUFBRSxXQUM5QjtHQUFFLFFBQVE7R0FBVSxLQUFLO0lBQUMsRUFBRSxnQkFBZ0IsVUFBVTtJQUFHLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxNQUFNLEVBQUU7SUFBRyxFQUFFLGdCQUFnQixLQUFLO0dBQUM7RUFBRSxHQUMzSCxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsV0FBVyxFQUFFLENBQ3pDO0VBQ0EsTUFBTSxTQUFTLE1BQU0sU0FBUyxFQUFFLFdBQzlCO0dBQUUsUUFBUTtHQUFZLEtBQUs7SUFBQyxFQUFFLGdCQUFnQixVQUFVO0lBQUcsRUFBRSxnQkFBZ0IsRUFBRSxTQUFTLE1BQU0sRUFBRTtJQUFHLEVBQUUsZ0JBQWdCLEtBQUs7R0FBQztFQUFFLEdBQzdILEVBQUUsTUFBTSxFQUFFLGdCQUFnQixXQUFXLEVBQUUsQ0FDekM7Q0FDRixTQUFTLE9BQU87RUFDZCxRQUFRLE1BQU0sOEJBQThCLEtBQUs7Q0FDbkQ7QUFDRixDQUFDLEVBQ0EsT0FBTSxRQUFPLFFBQVEsTUFBTSwrQkFBK0IsR0FBRyxDQUFDOztBQUdqRSxNQUFNLGdCQUFnQixJQUFJLFNBQVMsT0FBTztDQUN4QyxJQUFJO0VBQUUsTUFBTTtFQUFRLFVBQVU7Q0FBSztDQUNuQyxNQUFNO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBTztDQUN0QyxXQUFXO0VBQUUsTUFBTTtFQUFTLFNBQVM7Q0FBTTtDQUMzQyxNQUFNO0VBQUUsTUFBTTtFQUFRLFVBQVU7Q0FBSztDQUNyQyxPQUFPO0VBQUUsTUFBTTtFQUFRLFVBQVU7Q0FBSztDQUN0QyxRQUFRO0VBQUUsTUFBTTtFQUFRLFVBQVU7Q0FBSztDQUN2QyxVQUFVO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBRztDQUN0QyxNQUFNO0VBQUUsTUFBTTtFQUFRLFVBQVU7Q0FBSztDQUNyQyxTQUFTO0VBQUUsTUFBTTtFQUFRLFVBQVU7Q0FBSztDQUN4QyxPQUFPO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBWTtDQUM1QyxTQUFTO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBUTtBQUM1QyxDQUFDO0FBRUQsTUFBTSxhQUFhLElBQUksU0FBUyxPQUFPO0NBQ3JDLElBQUk7RUFBRSxNQUFNO0VBQVEsVUFBVTtFQUFNLFFBQVE7Q0FBSztDQUNqRCxNQUFNO0VBQUUsTUFBTTtFQUFRLFVBQVU7Q0FBSztDQUNyQyxPQUFPO0VBQUUsTUFBTTtFQUFRLFVBQVU7RUFBTSxRQUFRO0NBQUs7Q0FDcEQsT0FBTztFQUFFLE1BQU07RUFBUSxTQUFTO0NBQUs7Q0FDckMsVUFBVTtFQUFFLE1BQU07RUFBUSxVQUFVO0NBQUs7Q0FDekMsTUFBTTtFQUFFLE1BQU07RUFBUSxTQUFTO0NBQU87Q0FDdEMsV0FBVztFQUFFLE1BQU07RUFBUyxTQUFTO0NBQUs7Q0FDMUMsWUFBWTtFQUFFLE1BQU07RUFBTSxTQUFTLEtBQUs7Q0FBSTtDQUM1QyxNQUFNO0VBQUUsTUFBTSxDQUFDLE1BQU07RUFBRyxTQUFTLENBQUM7Q0FBRTtDQUNwQyxXQUFXLENBQUM7RUFDVixXQUFXO0dBQUUsTUFBTTtHQUFRLFVBQVU7RUFBSztFQUMxQyxTQUFTO0dBQUUsTUFBTSxTQUFTLE9BQU8sTUFBTTtHQUFPLFNBQVMsQ0FBQztFQUFFO0VBQzFELFVBQVU7R0FBRSxNQUFNO0dBQVEsU0FBUztFQUFFO0NBQ3ZDLENBQUM7Q0FDRCxVQUFVO0VBQUUsTUFBTSxDQUFDLE1BQU07RUFBRyxTQUFTLENBQUM7Q0FBRTtDQUN4QyxlQUFlLENBQUMsRUFDZCxXQUFXO0VBQUUsTUFBTTtFQUFRLFVBQVU7Q0FBSyxFQUM1QyxDQUFDO0NBQ0QsV0FBVztFQUFFLE1BQU0sQ0FBQyxhQUFhO0VBQUcsU0FBUyxDQUFDO0NBQUU7Q0FDaEQsS0FBSztFQUFFLE1BQU07RUFBUSxTQUFTO0NBQWE7Q0FDM0MsUUFBUTtFQUFFLE1BQU07RUFBUSxTQUFTO0NBQVM7Q0FDMUMsY0FBYztFQUFFLE1BQU07RUFBUSxTQUFTO0NBQUc7Q0FDMUMsVUFBVTtFQUFFLE1BQU0sQ0FBQyxNQUFNO0VBQUcsU0FBUyxDQUFDO0NBQUU7QUFDMUMsQ0FBQztBQUVELE1BQU0sdUJBQXVCLElBQUksU0FBUyxPQUFPO0NBQy9DLE1BQU07RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFLO0NBQ3BDLE9BQU87RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFLO0NBQ3JDLE9BQU87RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFFO0NBQ2xDLE9BQU87RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFLO0NBQ3JDLEtBQUs7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFLO0NBQ25DLE9BQU87RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFLO0FBQ3ZDLENBQUM7QUFFRCxNQUFNLGdCQUFnQixJQUFJLFNBQVMsT0FBTztDQUN4QyxJQUFJO0VBQUUsTUFBTTtFQUFRLFVBQVU7RUFBTSxRQUFRO0NBQUs7Q0FDakQsTUFBTTtFQUFFLE1BQU07RUFBUSxVQUFVO0NBQUs7Q0FDckMsVUFBVTtFQUFFLE1BQU07RUFBUSxTQUFTO0NBQWtCO0NBQ3JELGFBQWE7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFHO0NBQ3pDLFdBQVc7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFjO0NBQ2xELE9BQU87RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQ3RDLE9BQU87RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFFO0NBQ2xDLE9BQU87RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFFO0NBQ2xDLFFBQVE7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFTO0NBQzFDLE9BQU87RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFPO0NBQ3ZDLFFBQVE7RUFBRSxNQUFNLENBQUMsTUFBTTtFQUFHLFNBQVMsQ0FBQztDQUFFO0NBQ3RDLFVBQVU7RUFBRSxNQUFNLENBQUMsb0JBQW9CO0VBQUcsU0FBUyxDQUFDO0NBQUU7Q0FDdEQsbUJBQW1CO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBRTtDQUM5QyxZQUFZO0VBQUUsTUFBTTtFQUFTLFNBQVM7Q0FBTTtDQUM1QyxhQUFhO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBRztDQUN6QyxPQUFPO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBRztDQUNuQyxRQUFRO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBSTtDQUNyQyxTQUFTO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBSTtDQUN0QyxVQUFVO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBRTtDQUNyQyxlQUFlO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBSztDQUM3QyxPQUFPO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBRztDQUNuQyxjQUFjO0VBQUUsTUFBTTtFQUFTLFNBQVM7Q0FBTTtDQUM5QyxTQUFTO0VBQUUsTUFBTTtFQUFTLFNBQVM7Q0FBTTtDQUN6QyxZQUFZO0VBQ1YsTUFBTSxDQUFDO0dBQ0wsS0FBSyxFQUFFLE1BQU0sT0FBTztHQUNwQixPQUFPLEVBQUUsTUFBTSxPQUFPO0VBQ3hCLENBQUM7RUFDRCxTQUFTLENBQUM7Q0FDWjs7Q0FFQSxxQkFBcUI7RUFBRSxNQUFNO0VBQVMsU0FBUztDQUFNO0NBQ3JELFlBQVk7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFFOztDQUV2QyxVQUFVO0VBQUUsTUFBTTtFQUFRLFNBQVM7RUFBTSxPQUFPO0VBQU0sS0FBSztDQUFTO0NBQ3BFLGdCQUFnQjtFQUFFLE1BQU07RUFBUSxNQUFNO0dBQUM7R0FBVztHQUFZO0VBQVU7RUFBRyxTQUFTO0VBQVcsT0FBTztDQUFLO0NBQzNHLFlBQVk7RUFBRSxNQUFNO0VBQVEsU0FBUztFQUFNLEtBQUs7Q0FBTztDQUN2RCxZQUFZO0VBQUUsTUFBTTtFQUFNLFNBQVM7Q0FBSztDQUN4QyxjQUFjO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBRztBQUM1QyxDQUFDOztBQUdELGNBQWMsSUFBSSxRQUFRLFdBQVk7Q0FDcEMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxLQUFLLFVBQVUsS0FBSyxPQUFPLFdBQVcsSUFBSTtFQUM1RCxLQUFLLFNBQVMsQ0FBQyxLQUFLLEtBQUs7Q0FDM0I7Q0FDQSxJQUFJLEtBQUssU0FBUyxLQUFLLG1CQUFtQjtFQUN4QyxLQUFLLGFBQWE7Q0FDcEIsT0FBTztFQUNMLEtBQUssYUFBYTtDQUNwQjs7Q0FHQSxJQUFJLEtBQUssV0FBVyxRQUFRLEdBQUc7RUFDN0IsSUFBSSxLQUFLLFdBQVcsV0FBVztHQUM3QixLQUFLLGlCQUFpQjtFQUN4QixPQUFPLElBQUksS0FBSyxXQUFXLFVBQVU7R0FDbkMsS0FBSyxpQkFBaUI7RUFDeEIsT0FBTyxJQUFJLEtBQUssV0FBVyxZQUFZO0dBQ3JDLEtBQUssaUJBQWlCO0VBQ3hCO0NBQ0YsT0FBTyxJQUFJLEtBQUssV0FBVyxnQkFBZ0IsR0FBRztFQUM1QyxJQUFJLEtBQUssbUJBQW1CLFdBQVc7R0FDckMsS0FBSyxTQUFTO0VBQ2hCLE9BQU8sSUFBSSxLQUFLLG1CQUFtQixZQUFZO0dBQzdDLEtBQUssU0FBUztFQUNoQixPQUFPLElBQUksS0FBSyxtQkFBbUIsWUFBWTtHQUM3QyxLQUFLLFNBQVM7RUFDaEI7Q0FDRixPQUFPOztFQUVMLElBQUksS0FBSyxXQUFXLFdBQVc7R0FDN0IsS0FBSyxpQkFBaUI7RUFDeEIsT0FBTyxJQUFJLEtBQUssV0FBVyxVQUFVO0dBQ25DLEtBQUssaUJBQWlCO0VBQ3hCLE9BQU8sSUFBSSxLQUFLLFdBQVcsWUFBWTtHQUNyQyxLQUFLLGlCQUFpQjtFQUN4QjtDQUNGO0FBQ0YsQ0FBQztBQUVELGNBQWMsSUFBSSxvQkFBb0IsV0FBWTtDQUNoRCxNQUFNLFNBQVMsS0FBSyxVQUFVO0NBQzlCLElBQUksVUFBVSxPQUFPLE1BQU07RUFDekIsTUFBTSxTQUFTLE9BQU8sS0FBSztFQUMzQixNQUFNLGlCQUFpQixPQUFPLEtBQUs7RUFFbkMsSUFBSSxXQUFXLFdBQVc7R0FDeEIsSUFBSSxXQUFXLFdBQVc7SUFDeEIsT0FBTyxLQUFLLGlCQUFpQjtHQUMvQixPQUFPLElBQUksV0FBVyxVQUFVO0lBQzlCLE9BQU8sS0FBSyxpQkFBaUI7R0FDL0IsT0FBTyxJQUFJLFdBQVcsWUFBWTtJQUNoQyxPQUFPLEtBQUssaUJBQWlCO0dBQy9CO0VBQ0YsT0FBTyxJQUFJLG1CQUFtQixXQUFXO0dBQ3ZDLElBQUksbUJBQW1CLFdBQVc7SUFDaEMsT0FBTyxLQUFLLFNBQVM7R0FDdkIsT0FBTyxJQUFJLG1CQUFtQixZQUFZO0lBQ3hDLE9BQU8sS0FBSyxTQUFTO0dBQ3ZCLE9BQU8sSUFBSSxtQkFBbUIsWUFBWTtJQUN4QyxPQUFPLEtBQUssU0FBUztHQUN2QjtFQUNGO0NBQ0Y7QUFDRixDQUFDO0FBRUQsTUFBTSxpQkFBaUIsSUFBSSxTQUFTLE9BQU87Q0FDekMsTUFBTTtFQUFFLE1BQU07RUFBUSxVQUFVO0VBQU0sUUFBUTtDQUFLO0NBQ25ELFFBQVE7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFJO0NBQ3JDLFVBQVU7RUFBRSxNQUFNLFNBQVMsT0FBTyxNQUFNO0VBQVUsS0FBSztFQUFZLFNBQVM7Q0FBSztDQUNqRixPQUFPO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBRTtDQUNsQyxRQUFRO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBUztDQUMxQyxPQUFPO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBRztBQUNyQyxDQUFDOztBQUdELGVBQWUsSUFBSSxRQUFRLGlCQUFrQjtDQUMzQyxJQUFJLEtBQUssVUFBVTtFQUNqQixJQUFJO0dBQ0YsTUFBTSxpQkFBaUIsTUFBTSxTQUFTLE1BQU0sVUFBVSxFQUFFLFNBQVMsS0FBSyxRQUFRO0dBQzlFLElBQUksZ0JBQWdCO0lBQ2xCLEtBQUssU0FBUyxlQUFlO0dBQy9CO0VBQ0YsU0FBUyxLQUFLLENBRWQ7Q0FDRixPQUFPLElBQUksS0FBSyxXQUFXLE9BQU8sQ0FBQyxLQUFLLFFBQVE7RUFDOUMsS0FBSyxTQUFTO0NBQ2hCO0FBQ0YsQ0FBQztBQUVELE1BQU0sa0JBQWtCLElBQUksU0FBUyxPQUFPO0NBQzFDLE1BQU07RUFBRSxNQUFNO0VBQVEsVUFBVTtFQUFNLFFBQVE7Q0FBSztDQUNuRCxVQUFVO0VBQUUsTUFBTTtFQUFRLFVBQVU7Q0FBSztDQUN6QyxPQUFPO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBRTtDQUNsQyxRQUFRO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBUztDQUMxQyxTQUFTO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBSztDQUN2QyxPQUFPO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBTztDQUN2QyxZQUFZO0VBQUUsTUFBTTtFQUFRLE1BQU0sQ0FBQyxVQUFVLFVBQVU7RUFBRyxTQUFTO0NBQVc7QUFDaEYsQ0FBQztBQUVELE1BQU0sa0JBQWtCLElBQUksU0FBUyxPQUFPO0NBQzFDLFdBQVc7RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQzFDLE1BQU07RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQ3JDLFNBQVM7RUFBRSxNQUFNLFNBQVMsT0FBTyxNQUFNO0VBQU8sU0FBUyxDQUFDO0NBQUU7Q0FDMUQsV0FBVztFQUFFLE1BQU07RUFBUSxTQUFTO0NBQUs7Q0FDekMsVUFBVTtFQUFFLE1BQU07RUFBUSxTQUFTO0NBQUU7Q0FDckMsT0FBTztFQUFFLE1BQU07RUFBUSxVQUFVO0NBQUs7Q0FDdEMsVUFBVTtFQUFFLE1BQU07RUFBUSxTQUFTO0VBQU0sT0FBTztFQUFNLEtBQUs7Q0FBUztBQUN0RSxDQUFDO0FBRUQsTUFBTSxjQUFjLElBQUksU0FBUyxPQUFPO0NBQ3RDLElBQUk7RUFBRSxNQUFNO0VBQVEsVUFBVTtFQUFNLFFBQVE7Q0FBSztDQUNqRCxRQUFRLEVBQUUsTUFBTSxPQUFPO0NBQ3ZCLFVBQVU7RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQ3pDLFNBQVM7RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQ3hDLFFBQVE7RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQ3ZDLFNBQVM7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFXO0NBQzdDLFFBQVE7RUFBRSxNQUFNO0VBQVEsU0FBUztFQUFXLE9BQU87Q0FBSztDQUN4RCxNQUFNO0VBQUUsTUFBTTtFQUFRLFVBQVU7Q0FBSztDQUNyQyxPQUFPO0VBQUUsTUFBTSxDQUFDLGVBQWU7RUFBRyxTQUFTLENBQUM7Q0FBRTtDQUM5QyxrQkFBa0I7RUFBRSxNQUFNO0VBQUssSUFBSTtDQUFPO0NBQzFDLG1CQUFtQjtFQUFFLE1BQU07RUFBUyxTQUFTO0NBQU07Q0FDbkQsaUJBQWlCO0VBQUUsTUFBTSxTQUFTLE9BQU8sTUFBTTtFQUFPLFNBQVMsQ0FBQztDQUFFO0NBQ2xFLFVBQVUsRUFBRSxNQUFNLE9BQU87Q0FDekIsS0FBSyxFQUFFLE1BQU0sT0FBTztDQUNwQixVQUFVLEVBQUUsTUFBTSxPQUFPO0NBQ3pCLFVBQVUsRUFBRSxNQUFNLE9BQU87QUFDM0IsQ0FBQztBQUVELE1BQU0sZUFBZSxJQUFJLFNBQVMsT0FBTztDQUN2QyxNQUFNO0VBQUUsTUFBTTtFQUFRLFVBQVU7RUFBTSxRQUFRO0NBQUs7Q0FDbkQsVUFBVTtFQUFFLE1BQU07RUFBUSxVQUFVO0NBQUs7Q0FDekMsTUFBTTtFQUFFLE1BQU07RUFBUSxTQUFTO0NBQWE7Q0FDNUMsU0FBUztFQUFFLE1BQU07RUFBUSxTQUFTO0NBQUs7Q0FDdkMsUUFBUTtFQUFFLE1BQU07RUFBUSxVQUFVO0NBQUs7Q0FDdkMsT0FBTztFQUFFLE1BQU07RUFBUSxTQUFTO0NBQVE7Q0FDeEMsUUFBUTtFQUFFLE1BQU07RUFBUSxTQUFTO0NBQVM7Q0FDMUMsYUFBYTtFQUFFLE1BQU07RUFBUSxTQUFTO0NBQUs7Q0FDM0MsWUFBWTtFQUFFLE1BQU07RUFBUSxTQUFTO0NBQUU7Q0FDdkMsV0FBVyxDQUFDO0VBQ1YsUUFBUTtHQUFFLE1BQU07R0FBUSxVQUFVO0VBQUs7RUFDdkMsT0FBTztHQUFFLE1BQU07R0FBUSxTQUFTO0VBQUU7Q0FDcEMsQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLGVBQWUsSUFBSSxTQUFTLE9BQU87Q0FDdkMsSUFBSTtFQUFFLE1BQU07RUFBUSxVQUFVO0VBQU0sUUFBUTtDQUFLO0NBQ2pELGFBQWE7RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQzVDLGNBQWM7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFPO0NBQzlDLGNBQWM7RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQzdDLFFBQVE7RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQ3ZDLFNBQVM7RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQ3hDLE1BQU07RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQ3JDLFFBQVE7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFVO0NBQzNDLE9BQU87RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFHO0NBQ25DLFFBQVE7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFLO0NBQ3RDLGtCQUFrQjtFQUFFLE1BQU07RUFBUyxTQUFTO0NBQU07QUFDcEQsQ0FBQztBQUVELE1BQU0sZUFBZSxJQUFJLFNBQVMsT0FBTztDQUN2QyxJQUFJO0VBQUUsTUFBTTtFQUFRLFVBQVU7RUFBTSxRQUFRO0NBQUs7Q0FDakQsT0FBTztFQUFFLE1BQU07RUFBUSxVQUFVO0NBQUs7Q0FDdEMsTUFBTTtFQUFFLE1BQU07RUFBUSxTQUFTO0NBQWM7Q0FDN0MsT0FBTztFQUFFLE1BQU07RUFBUSxTQUFTO0NBQVc7Q0FDM0MsV0FBVztFQUFFLE1BQU07RUFBUSxTQUFTO0NBQU87Q0FDM0MsUUFBUTtFQUFFLE1BQU07RUFBUSxTQUFTO0NBQVM7QUFDNUMsQ0FBQztBQUVELE1BQU0scUJBQXFCLElBQUksU0FBUyxPQUFPO0NBQzdDLElBQUk7RUFBRSxNQUFNO0VBQVEsVUFBVTtFQUFNLFFBQVE7Q0FBSztDQUNqRCxNQUFNO0VBQUUsTUFBTTtFQUFRLFVBQVU7Q0FBSztDQUNyQyxXQUFXO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBYTtDQUNqRCxRQUFRO0VBQUUsTUFBTTtFQUFRLFVBQVU7Q0FBSztDQUN2QyxRQUFRO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBUztBQUM1QyxDQUFDO0FBRUQsTUFBTSxxQkFBcUIsSUFBSSxTQUFTLE9BQU87Q0FDN0MsSUFBSTtFQUFFLE1BQU07RUFBUSxVQUFVO0VBQU0sUUFBUTtDQUFLO0NBQ2pELE1BQU07RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQ3JDLE9BQU87RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQ3RDLFNBQVM7RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQ3hDLE1BQU07RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQ3JDLFFBQVE7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFVO0NBQzNDLE9BQU87RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFLO0NBQ3JDLFNBQVM7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFLO0FBQ3pDLENBQUM7QUFFRCxNQUFNLGlCQUFpQixJQUFJLFNBQVMsT0FBTztDQUN6QyxXQUFXO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBeUI7Q0FDN0QsY0FBYztFQUFFLE1BQU07RUFBUSxTQUFTO0NBQTRCO0NBQ25FLGVBQWU7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFHO0NBQzNDLGlCQUFpQjtFQUFFLE1BQU07RUFBUSxTQUFTO0NBQU07Q0FDaEQsbUJBQW1CO0VBQ2pCLE1BQU0sQ0FBQyxNQUFNO0VBQ2IsU0FBUztHQUNQO0dBQ0E7R0FDQTtHQUNBO0VBQ0Y7Q0FDRjtDQUNBLG1CQUFtQjtFQUFFLE1BQU07RUFBUSxTQUFTO0NBQUk7Q0FDaEQsZ0JBQWdCO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBRTtDQUMzQyxlQUFlO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBSTtDQUM1QyxZQUFZO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBRztDQUN4QyxXQUFXO0VBQUUsTUFBTTtFQUFTLFNBQVM7Q0FBSztDQUMxQyxlQUFlO0VBQUUsTUFBTTtFQUFTLFNBQVM7Q0FBSztDQUM5QyxxQkFBcUI7RUFBRSxNQUFNO0VBQVMsU0FBUztDQUFNO0FBQ3ZELENBQUM7QUFFRCxNQUFNLGdCQUFnQixJQUFJLFNBQVMsT0FBTztDQUN4QyxJQUFJO0VBQUUsTUFBTTtFQUFRLFVBQVU7RUFBTSxRQUFRO0NBQUs7Q0FDakQsS0FBSztFQUFFLE1BQU07RUFBUSxVQUFVO0VBQU0sUUFBUTtDQUFLO0NBQ2xELE1BQU07RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQ3JDLE9BQU87RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFHO0NBQ25DLFVBQVU7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFHO0NBQ3RDLFFBQVE7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFTO0NBQzFDLE9BQU87RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0FBQ3hDLENBQUM7O0FBSUQsTUFBTSxlQUFlLElBQUksU0FBUyxPQUFPO0NBQ3ZDLElBQUk7RUFBRSxNQUFNO0VBQVEsVUFBVTtFQUFNLFFBQVE7RUFBTSxPQUFPO0NBQUs7Q0FDOUQsY0FBYztFQUFFLE1BQU07RUFBUSxVQUFVO0NBQUs7Q0FDN0MsV0FBVztFQUFFLE1BQU07RUFBUSxVQUFVO0NBQUs7Q0FDMUMsT0FBTztFQUFFLE1BQU07RUFBUSxVQUFVO0VBQU0sUUFBUTtFQUFNLE9BQU87RUFBTSxXQUFXO0NBQUs7Q0FDbEYsVUFBVTtFQUFFLE1BQU07RUFBUSxVQUFVO0NBQUs7Q0FDekMsT0FBTztFQUFFLE1BQU07RUFBUSxVQUFVO0NBQUs7Q0FDdEMsT0FBTztFQUFFLE1BQU07RUFBUSxTQUFTO0NBQUc7Q0FDbkMsS0FBSztFQUFFLE1BQU07RUFBUSxTQUFTO0NBQUc7Q0FDakMsa0JBQWtCO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBRztDQUM5QyxxQkFBcUI7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFHO0NBQ2pELE1BQU07RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFHO0NBQ2xDLGFBQWE7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFHO0NBQ3pDLGlCQUFpQjtFQUFFLE1BQU07RUFBUSxTQUFTO0NBQUc7Q0FDN0MsUUFBUTtFQUFFLE1BQU07RUFBUSxNQUFNO0dBQUM7R0FBVztHQUFZO0dBQVk7RUFBVztFQUFHLFNBQVM7RUFBVyxPQUFPO0NBQUs7Q0FDaEgsY0FBYztFQUFFLE1BQU07RUFBUSxTQUFTO0NBQUc7Q0FDMUMsWUFBWTtFQUFFLE1BQU07RUFBUSxTQUFTO0NBQUc7Q0FDeEMsWUFBWTtFQUFFLE1BQU07RUFBUSxTQUFTO0VBQU0sS0FBSztDQUFPO0NBQ3ZELFlBQVk7RUFBRSxNQUFNO0VBQU0sU0FBUztDQUFLO0NBQ3hDLGFBQWE7RUFBRSxNQUFNO0VBQU0sU0FBUztDQUFLO0NBQ3pDLFNBQVM7RUFDUCxRQUFRO0dBQUUsTUFBTTtHQUFRLFNBQVM7RUFBRztFQUNwQyxNQUFRO0dBQUUsTUFBTTtHQUFRLFNBQVM7RUFBRztFQUNwQyxPQUFRO0dBQUUsTUFBTTtHQUFRLFNBQVM7RUFBRztFQUNwQyxTQUFRO0dBQUUsTUFBTTtHQUFRLFNBQVM7RUFBRztFQUNwQyxTQUFRO0dBQUUsTUFBTTtHQUFRLFNBQVM7RUFBUTtDQUMzQztDQUNBLGFBQWE7RUFDWCxlQUFlO0dBQUUsTUFBTTtHQUFRLFNBQVM7RUFBRztFQUMzQyxlQUFlO0dBQUUsTUFBTTtHQUFRLFNBQVM7RUFBRztFQUMzQyxVQUFlO0dBQUUsTUFBTTtHQUFRLFNBQVM7RUFBRztFQUMzQyxVQUFlO0dBQUUsTUFBTTtHQUFRLFNBQVM7RUFBRztDQUM3QztBQUNGLEdBQUcsRUFBRSxZQUFZLEtBQUssQ0FBQztBQUV2QixNQUFNLDJCQUEyQixJQUFJLFNBQVMsT0FBTztDQUNuRCxVQUFXO0VBQUUsTUFBTTtFQUFRLFVBQVU7RUFBTSxPQUFPO0VBQU0sS0FBSztDQUFTO0NBQ3RFLE1BQVc7RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQzFDLE9BQVc7RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQzFDLFNBQVc7RUFBRSxNQUFNO0VBQVEsVUFBVTtDQUFLO0NBQzFDLFVBQVc7RUFBRSxNQUFNLFNBQVMsT0FBTyxNQUFNO0VBQU8sU0FBUyxDQUFDO0NBQUU7Q0FDNUQsUUFBVztFQUFFLE1BQU07RUFBUyxTQUFTO0VBQU8sT0FBTztDQUFLO0FBQzFELEdBQUcsRUFBRSxZQUFZLEtBQUssQ0FBQzs7QUFHdkIsTUFBTSxtQkFBbUIsSUFBSSxTQUFTLE9BQU87Q0FDM0MsT0FBTztFQUFFLE1BQU07RUFBUSxVQUFVO0VBQU0sUUFBUTtDQUFLO0NBQ3BELGNBQWM7RUFBRSxNQUFNO0VBQU0sU0FBUyxLQUFLO0NBQUk7Q0FDOUMsUUFBUTtFQUFFLE1BQU07RUFBUyxTQUFTO0NBQUs7QUFDekMsQ0FBQztBQUVELE1BQU0saUJBQWlCLElBQUksU0FBUyxPQUFPO0NBQ3pDLE1BQU0sRUFBRSxNQUFNLE9BQU87Q0FDckIsY0FBYztFQUFFLE1BQU07RUFBUSxVQUFVO0NBQUs7Q0FDN0MsZUFBZTtFQUFFLE1BQU07RUFBUSxTQUFTO0NBQUU7Q0FDMUMsZUFBZTtFQUFFLE1BQU07RUFBUSxTQUFTO0NBQUs7Q0FDN0MsY0FBYztFQUFFLE1BQU07RUFBUSxVQUFVO0NBQUs7Q0FDN0MsbUJBQW1CO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBRTtDQUM5QyxvQkFBb0I7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFLO0NBQ2xELFdBQVc7RUFBRSxNQUFNO0VBQU0sVUFBVTtDQUFLO0NBQ3hDLFNBQVM7RUFBRSxNQUFNO0VBQU0sVUFBVTtDQUFLO0NBQ3RDLFFBQVE7RUFBRSxNQUFNO0VBQVEsTUFBTTtHQUFDO0dBQVU7R0FBWTtFQUFXO0VBQUcsU0FBUztFQUFVLE9BQU87Q0FBSztBQUNwRyxDQUFDO0FBQ0QsZUFBZSxNQUFNO0NBQUUsUUFBUTtDQUFHLFdBQVc7Q0FBRyxTQUFTO0FBQUUsQ0FBQztBQUU1RCxNQUFNLGtCQUFrQixJQUFJLFNBQVMsT0FBTztDQUMxQyxPQUFPO0VBQUUsTUFBTTtFQUFRLFVBQVU7Q0FBSztDQUN0QyxRQUFRO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBSztDQUN0QyxVQUFVO0VBQUUsTUFBTSxTQUFTLE9BQU8sTUFBTTtFQUFPLFNBQVMsQ0FBQztDQUFFO0NBQzNELFdBQVc7RUFBRSxNQUFNO0VBQU0sU0FBUyxLQUFLO0NBQUk7QUFDN0MsQ0FBQztBQUlELE1BQU0seUJBQXlCLElBQUksU0FBUyxPQUFPO0NBQ2pELFFBQVE7RUFBRSxNQUFNO0VBQVEsU0FBUztFQUFNLE9BQU87Q0FBSztDQUNuRCxNQUFNO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBSztDQUNwQyxZQUFZO0VBQUUsTUFBTSxTQUFTLE9BQU8sTUFBTTtFQUFVLEtBQUs7RUFBWSxTQUFTO0VBQU0sT0FBTztDQUFLO0NBQ2hHLFVBQVU7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFLO0NBQ3hDLFNBQVM7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFLO0NBQ3ZDLE9BQU87RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFLO0NBQ3JDLFdBQVc7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFLO0NBQ3pDLFlBQVk7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFLO0NBQzFDLFVBQVU7RUFBRSxNQUFNO0VBQU0sU0FBUyxLQUFLO0NBQUk7Q0FDMUMsYUFBYTtFQUFFLE1BQU07RUFBUSxNQUFNLENBQUMsV0FBVyxTQUFTO0VBQUcsU0FBUztDQUFVOztDQUc5RSxXQUFXO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBSztDQUN6QyxXQUFXO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBRTtDQUN0QyxjQUFjO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBRTtDQUN6QyxpQkFBaUI7RUFBRSxNQUFNO0VBQVEsU0FBUztDQUFFO0NBQzVDLGtCQUFrQjtFQUFFLE1BQU07RUFBUSxTQUFTO0NBQUU7Q0FDN0MsaUJBQWlCO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBRTtDQUM1QyxjQUFjO0VBQUUsTUFBTTtFQUFRLFNBQVM7Q0FBRTtBQUMzQyxDQUFDO0FBQ0QsdUJBQXVCLE1BQU07Q0FBRSxRQUFRO0NBQUcsYUFBYTtDQUFHLFNBQVM7QUFBRSxDQUFDO0FBRXRFLE1BQU0sT0FBTyxTQUFTLE1BQU0sUUFBUSxVQUFVO0FBQzlDLE1BQU0sVUFBVSxTQUFTLE1BQU0sV0FBVyxhQUFhO0FBQ3ZELE1BQU0sV0FBVyxTQUFTLE1BQU0sWUFBWSxjQUFjO0FBQzFELE1BQU0sWUFBWSxTQUFTLE1BQU0sYUFBYSxlQUFlO0FBQzdELE1BQU0sUUFBUSxTQUFTLE1BQU0sU0FBUyxXQUFXO0FBQ2pELE1BQU0sU0FBUyxTQUFTLE1BQU0sVUFBVSxZQUFZO0FBQ3BELE1BQU0sU0FBUyxTQUFTLE1BQU0sVUFBVSxZQUFZO0FBQ3BELE1BQU0sU0FBUyxTQUFTLE1BQU0sVUFBVSxZQUFZO0FBQ3BELE1BQU0sZUFBZSxTQUFTLE1BQU0sZ0JBQWdCLGtCQUFrQjtBQUN0RSxNQUFNLGVBQWUsU0FBUyxNQUFNLGdCQUFnQixrQkFBa0I7QUFDdEUsTUFBTSxXQUFXLFNBQVMsTUFBTSxZQUFZLGNBQWM7QUFDMUQsTUFBTSxVQUFVLFNBQVMsTUFBTSxXQUFXLGFBQWE7QUFDdkQsTUFBTSxTQUFTLFNBQVMsTUFBTSxVQUFVLFlBQVk7QUFDcEQsTUFBTSxxQkFBcUIsU0FBUyxNQUFNLHNCQUFzQix3QkFBd0I7O0FBR3hGLGVBQWUsZ0JBQWdCO0NBQzdCLElBQUk7RUFDRixNQUFNLGNBQWMsTUFBTSxTQUFTLFFBQVE7RUFDM0MsSUFBSSxDQUFDLGFBQWE7R0FDaEIsTUFBTSxTQUFTLE9BQU8sQ0FBQyxDQUFDO0dBQ3hCLFFBQVEsSUFBSSx3Q0FBd0M7RUFDdEQ7O0VBR0EsTUFBTSxjQUFjLE1BQU0sT0FBTyxRQUFRLEVBQUUsTUFBTSxVQUFVLENBQUM7RUFDNUQsSUFBSSxDQUFDLGFBQWE7R0FDaEIsTUFBTSxPQUFPLE9BQU87SUFDbEIsTUFBTTtJQUNOLFVBQVU7SUFDVixNQUFNO0lBQ04sU0FBUztJQUNULFFBQVE7SUFDUixPQUFPO0lBQ1AsUUFBUTtHQUNWLENBQUM7R0FDRCxRQUFRLElBQUksc0NBQXNDO0VBQ3BEO0VBRUEsTUFBTSxlQUFlLE1BQU0sT0FBTyxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7RUFDL0QsSUFBSSxDQUFDLGNBQWM7R0FDakIsTUFBTSxPQUFPLE9BQU87SUFDbEIsTUFBTTtJQUNOLFVBQVU7SUFDVixNQUFNO0lBQ04sU0FBUztJQUNULFFBQVE7SUFDUixPQUFPO0lBQ1AsUUFBUTtHQUNWLENBQUM7R0FDRCxRQUFRLElBQUksd0NBQXdDO0VBQ3REO0VBSUEsTUFBTSxrQkFBa0I7R0FDdEI7SUFBRSxJQUFJO0lBQUcsS0FBSztJQUFRLE1BQU07SUFBaUIsT0FBTztJQUFvQixVQUFVO0lBQXFDLFFBQVE7SUFBVSxPQUFPO0dBQUU7R0FDbEo7SUFBRSxJQUFJO0lBQUcsS0FBSztJQUFhLE1BQU07SUFBYSxPQUFPO0lBQXdCLFVBQVU7SUFBMEIsUUFBUTtJQUFVLE9BQU87R0FBRTtHQUM1STtJQUFFLElBQUk7SUFBRyxLQUFLO0lBQWMsTUFBTTtJQUEwQixPQUFPO0lBQTBCLFVBQVU7SUFBMEQsUUFBUTtJQUFVLE9BQU87R0FBRTtHQUM1TDtJQUFFLElBQUk7SUFBRyxLQUFLO0lBQWtCLE1BQU07SUFBa0IsT0FBTztJQUFjLFVBQVU7SUFBMkMsUUFBUTtJQUFVLE9BQU87R0FBRTtHQUM3SjtJQUFFLElBQUk7SUFBRyxLQUFLO0lBQXNCLE1BQU07SUFBc0IsT0FBTztJQUF3QixVQUFVO0lBQTZDLFFBQVE7SUFBVSxPQUFPO0dBQUU7R0FDakw7SUFBRSxJQUFJO0lBQUcsS0FBSztJQUF3QixNQUFNO0lBQXdCLE9BQU87SUFBeUIsVUFBVTtJQUEyQyxRQUFRO0lBQVUsT0FBTztHQUFFO0dBQ3BMO0lBQUUsSUFBSTtJQUFHLEtBQUs7SUFBaUIsTUFBTTtJQUFpQixPQUFPO0lBQTJCLFVBQVU7SUFBNEMsUUFBUTtJQUFVLE9BQU87R0FBRTtFQUMzSztFQUVBLEtBQUssTUFBTSxLQUFLLGlCQUFpQjtHQUMvQixNQUFNLFlBQVksTUFBTSxRQUFRLFFBQVEsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDO0dBQ3RELElBQUksQ0FBQyxXQUFXO0lBQ2QsTUFBTSxRQUFRLE9BQU8sQ0FBQztJQUN0QixRQUFRLElBQUksbUNBQW1DLEVBQUUsTUFBTTtHQUN6RDtFQUNGO0VBRUEsTUFBTSxXQUFXLE1BQU0sUUFBUSxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUM7RUFDaEQsSUFBSSxDQUFDLFVBQVU7R0FDYixNQUFNLFFBQVEsT0FBTztJQUNuQixJQUFJO0lBQ0osTUFBTTtJQUNOLFVBQVU7SUFDVixXQUFXO0lBQ1gsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPO0lBQ1AsUUFBUTtJQUNSLE9BQU87SUFDUCxhQUFhO0dBQ2YsQ0FBQztHQUNELFFBQVEsSUFBSSxtQ0FBbUM7RUFDakQ7O0VBR0EsTUFBTSx5QkFBeUIsTUFBTSxRQUFRLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQztFQUNoRSxJQUFJLENBQUMsd0JBQXdCO0dBQzNCLE1BQU0sUUFBUSxPQUFPO0lBQ25CLElBQUk7SUFDSixNQUFNO0lBQ04sVUFBVTtJQUNWLGFBQWE7SUFDYixXQUFXO0lBQ1gsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPO0lBQ1AsUUFBUTtJQUNSLE9BQU87SUFDUCxRQUFRLENBQUMscUJBQXFCO0lBQzlCLGFBQWE7SUFDYixPQUFPO0lBQ1AsUUFBUTtJQUNSLFNBQVM7SUFDVCxVQUFVO0lBQ1YsZUFBZTtHQUNqQixDQUFDO0dBQ0QsUUFBUSxJQUFJLGlEQUFpRDtFQUMvRDtFQUVBLE1BQU0sbUJBQW1CLE1BQU0sUUFBUSxRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUM7RUFDMUQsSUFBSSxDQUFDLGtCQUFrQjtHQUNyQixNQUFNLFFBQVEsT0FBTztJQUNuQixJQUFJO0lBQ0osTUFBTTtJQUNOLFVBQVU7SUFDVixhQUFhO0lBQ2IsV0FBVztJQUNYLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTztJQUNQLFFBQVE7SUFDUixPQUFPO0lBQ1AsUUFBUSxDQUFDLG9CQUFvQjtJQUM3QixhQUFhO0lBQ2IsT0FBTztJQUNQLFFBQVE7SUFDUixTQUFTO0lBQ1QsVUFBVTtJQUNWLGVBQWU7R0FDakIsQ0FBQztHQUNELFFBQVEsSUFBSSwwQ0FBMEM7RUFDeEQ7RUFFQSxNQUFNLG1CQUFtQixNQUFNLFFBQVEsUUFBUSxFQUFFLElBQUksSUFBSSxDQUFDO0VBQzFELElBQUksQ0FBQyxrQkFBa0I7R0FDckIsTUFBTSxRQUFRLE9BQU87SUFDbkIsSUFBSTtJQUNKLE1BQU07SUFDTixVQUFVO0lBQ1YsYUFBYTtJQUNiLFdBQVc7SUFDWCxPQUFPO0lBQ1AsT0FBTztJQUNQLE9BQU87SUFDUCxRQUFRO0lBQ1IsT0FBTztJQUNQLFFBQVEsQ0FBQyxlQUFlO0lBQ3hCLGFBQWE7SUFDYixPQUFPO0lBQ1AsUUFBUTtJQUNSLFNBQVM7SUFDVCxVQUFVO0lBQ1YsZUFBZTtHQUNqQixDQUFDO0dBQ0QsUUFBUSxJQUFJLGtEQUFrRDtFQUNoRTs7RUFHQSxNQUFNLG9CQUFvQixNQUFNLFFBQVEsUUFBUSxFQUFFLElBQUksSUFBSSxDQUFDO0VBQzNELElBQUksQ0FBQyxtQkFBbUI7R0FDdEIsTUFBTSxRQUFRLE9BQU87SUFDbkIsSUFBSTtJQUNKLE1BQU07SUFDTixVQUFVO0lBQ1YsYUFBYTtJQUNiLFdBQVc7SUFDWCxPQUFPO0lBQ1AsT0FBTztJQUNQLE9BQU87SUFDUCxRQUFRO0lBQ1IsT0FBTztJQUNQLFFBQVEsQ0FBQyxnQkFBZ0I7SUFDekIsYUFBYTtJQUNiLE9BQU87SUFDUCxRQUFRO0lBQ1IsU0FBUztJQUNULFVBQVU7SUFDVixlQUFlO0dBQ2pCLENBQUM7R0FDRCxRQUFRLElBQUksaURBQWlEO0VBQy9EO0VBRUEsTUFBTSx5QkFBeUIsTUFBTSxRQUFRLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQztFQUNoRSxJQUFJLENBQUMsd0JBQXdCO0dBQzNCLE1BQU0sUUFBUSxPQUFPO0lBQ25CLElBQUk7SUFDSixNQUFNO0lBQ04sVUFBVTtJQUNWLGFBQWE7SUFDYixXQUFXO0lBQ1gsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPO0lBQ1AsUUFBUTtJQUNSLE9BQU87SUFDUCxRQUFRLENBQUMsc0JBQXNCO0lBQy9CLGFBQWE7SUFDYixPQUFPO0lBQ1AsUUFBUTtJQUNSLFNBQVM7SUFDVCxVQUFVO0lBQ1YsZUFBZTtHQUNqQixDQUFDO0dBQ0QsUUFBUSxJQUFJLGtEQUFrRDtFQUNoRTtFQUVBLE1BQU0seUJBQXlCLE1BQU0sUUFBUSxRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUM7RUFDaEUsSUFBSSxDQUFDLHdCQUF3QjtHQUMzQixNQUFNLFFBQVEsT0FBTztJQUNuQixJQUFJO0lBQ0osTUFBTTtJQUNOLFVBQVU7SUFDVixhQUFhO0lBQ2IsV0FBVztJQUNYLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTztJQUNQLFFBQVE7SUFDUixPQUFPO0lBQ1AsUUFBUSxDQUFDLHNCQUFzQjtJQUMvQixhQUFhO0lBQ2IsT0FBTztJQUNQLFFBQVE7SUFDUixTQUFTO0lBQ1QsVUFBVTtJQUNWLGVBQWU7R0FDakIsQ0FBQztHQUNELFFBQVEsSUFBSSxrREFBa0Q7RUFDaEU7RUFFQSxNQUFNLHNCQUFzQixNQUFNLFFBQVEsUUFBUSxFQUFFLElBQUksSUFBSSxDQUFDO0VBQzdELElBQUksQ0FBQyxxQkFBcUI7R0FDeEIsTUFBTSxRQUFRLE9BQU87SUFDbkIsSUFBSTtJQUNKLE1BQU07SUFDTixVQUFVO0lBQ1YsYUFBYTtJQUNiLFdBQVc7SUFDWCxPQUFPO0lBQ1AsT0FBTztJQUNQLE9BQU87SUFDUCxRQUFRO0lBQ1IsT0FBTztJQUNQLFFBQVEsQ0FBQyxrQkFBa0I7SUFDM0IsYUFBYTtJQUNiLE9BQU87SUFDUCxRQUFRO0lBQ1IsU0FBUztJQUNULFVBQVU7SUFDVixlQUFlO0dBQ2pCLENBQUM7R0FDRCxRQUFRLElBQUksOENBQThDO0VBQzVEO0VBRUEsTUFBTSxzQkFBc0IsTUFBTSxRQUFRLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQztFQUM3RCxJQUFJLENBQUMscUJBQXFCO0dBQ3hCLE1BQU0sUUFBUSxPQUFPO0lBQ25CLElBQUk7SUFDSixNQUFNO0lBQ04sVUFBVTtJQUNWLGFBQWE7SUFDYixXQUFXO0lBQ1gsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPO0lBQ1AsUUFBUTtJQUNSLE9BQU87SUFDUCxRQUFRLENBQUMsa0JBQWtCO0lBQzNCLGFBQWE7SUFDYixPQUFPO0lBQ1AsUUFBUTtJQUNSLFNBQVM7SUFDVCxVQUFVO0lBQ1YsZUFBZTtHQUNqQixDQUFDO0dBQ0QsUUFBUSxJQUFJLHFEQUFxRDtFQUNuRTs7RUFHQSxNQUFNLHFCQUFxQixNQUFNLFFBQVEsUUFBUSxFQUFFLElBQUksSUFBSSxDQUFDO0VBQzVELElBQUksQ0FBQyxvQkFBb0I7R0FDdkIsTUFBTSxRQUFRLE9BQU87SUFDbkIsSUFBSTtJQUNKLE1BQU07SUFDTixVQUFVO0lBQ1YsYUFBYTtJQUNiLFdBQVc7SUFDWCxPQUFPO0lBQ1AsT0FBTztJQUNQLE9BQU87SUFDUCxRQUFRO0lBQ1IsT0FBTztJQUNQLFFBQVEsQ0FBQywwQkFBMEI7SUFDbkMsYUFBYTtJQUNiLE9BQU87SUFDUCxRQUFRO0lBQ1IsU0FBUztJQUNULFVBQVU7SUFDVixlQUFlO0dBQ2pCLENBQUM7R0FDRCxRQUFRLElBQUksNkRBQTZEO0VBQzNFO0VBRUEsTUFBTSxzQkFBc0IsTUFBTSxRQUFRLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQztFQUM3RCxJQUFJLENBQUMscUJBQXFCO0dBQ3hCLE1BQU0sUUFBUSxPQUFPO0lBQ25CLElBQUk7SUFDSixNQUFNO0lBQ04sVUFBVTtJQUNWLGFBQWE7SUFDYixXQUFXO0lBQ1gsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPO0lBQ1AsUUFBUTtJQUNSLE9BQU87SUFDUCxRQUFRLENBQUMsNEJBQTRCO0lBQ3JDLGFBQWE7SUFDYixPQUFPO0lBQ1AsUUFBUTtJQUNSLFNBQVM7SUFDVCxVQUFVO0lBQ1YsZUFBZTtHQUNqQixDQUFDO0dBQ0QsUUFBUSxJQUFJLDREQUE0RDtFQUMxRTtFQUVBLE1BQU0sdUJBQXVCLE1BQU0sUUFBUSxRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUM7RUFDOUQsSUFBSSxDQUFDLHNCQUFzQjtHQUN6QixNQUFNLFFBQVEsT0FBTztJQUNuQixJQUFJO0lBQ0osTUFBTTtJQUNOLFVBQVU7SUFDVixhQUFhO0lBQ2IsV0FBVztJQUNYLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTztJQUNQLFFBQVE7SUFDUixPQUFPO0lBQ1AsUUFBUSxDQUFDLDJCQUEyQjtJQUNwQyxhQUFhO0lBQ2IsT0FBTztJQUNQLFFBQVE7SUFDUixTQUFTO0lBQ1QsVUFBVTtJQUNWLGVBQWU7R0FDakIsQ0FBQztHQUNELFFBQVEsSUFBSSx1REFBdUQ7RUFDckU7RUFFQSxNQUFNLG9CQUFvQixNQUFNLFFBQVEsUUFBUSxFQUFFLElBQUksSUFBSSxDQUFDO0VBQzNELElBQUksQ0FBQyxtQkFBbUI7R0FDdEIsTUFBTSxRQUFRLE9BQU87SUFDbkIsSUFBSTtJQUNKLE1BQU07SUFDTixVQUFVO0lBQ1YsYUFBYTtJQUNiLFdBQVc7SUFDWCxPQUFPO0lBQ1AsT0FBTztJQUNQLE9BQU87SUFDUCxRQUFRO0lBQ1IsT0FBTztJQUNQLFFBQVEsQ0FBQyxxQkFBcUI7SUFDOUIsYUFBYTtJQUNiLE9BQU87SUFDUCxRQUFRO0lBQ1IsU0FBUztJQUNULFVBQVU7SUFDVixlQUFlO0dBQ2pCLENBQUM7R0FDRCxRQUFRLElBQUksNENBQTRDO0VBQzFEO0VBRUEsTUFBTSwwQkFBMEIsTUFBTSxRQUFRLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQztFQUNqRSxJQUFJLENBQUMseUJBQXlCO0dBQzVCLE1BQU0sUUFBUSxPQUFPO0lBQ25CLElBQUk7SUFDSixNQUFNO0lBQ04sVUFBVTtJQUNWLGFBQWE7SUFDYixXQUFXO0lBQ1gsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPO0lBQ1AsUUFBUTtJQUNSLE9BQU87SUFDUCxRQUFRLENBQUMsdUJBQXVCO0lBQ2hDLGFBQWE7SUFDYixPQUFPO0lBQ1AsUUFBUTtJQUNSLFNBQVM7SUFDVCxVQUFVO0lBQ1YsZUFBZTtHQUNqQixDQUFDO0dBQ0QsUUFBUSxJQUFJLG9EQUFvRDtFQUNsRTs7RUFHQSxNQUFNLG9CQUFvQixNQUFNLFFBQVEsUUFBUSxFQUFFLElBQUksSUFBSSxDQUFDO0VBQzNELElBQUksQ0FBQyxtQkFBbUI7R0FDdEIsTUFBTSxRQUFRLE9BQU87SUFDbkIsSUFBSTtJQUNKLE1BQU07SUFDTixVQUFVO0lBQ1YsYUFBYTtJQUNiLFdBQVc7SUFDWCxPQUFPO0lBQ1AsT0FBTztJQUNQLE9BQU87SUFDUCxRQUFRO0lBQ1IsT0FBTztJQUNQLFFBQVEsQ0FBQywyQkFBMkI7SUFDcEMsYUFBYTtJQUNiLE9BQU87SUFDUCxRQUFRO0lBQ1IsU0FBUztJQUNULFVBQVU7SUFDVixlQUFlO0dBQ2pCLENBQUM7R0FDRCxRQUFRLElBQUksdURBQXVEO0VBQ3JFO0VBRUEsTUFBTSxxQkFBcUIsTUFBTSxRQUFRLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQztFQUM1RCxJQUFJLENBQUMsb0JBQW9CO0dBQ3ZCLE1BQU0sUUFBUSxPQUFPO0lBQ25CLElBQUk7SUFDSixNQUFNO0lBQ04sVUFBVTtJQUNWLGFBQWE7SUFDYixXQUFXO0lBQ1gsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPO0lBQ1AsUUFBUTtJQUNSLE9BQU87SUFDUCxRQUFRLENBQUMsMkJBQTJCO0lBQ3BDLGFBQWE7SUFDYixPQUFPO0lBQ1AsUUFBUTtJQUNSLFNBQVM7SUFDVCxVQUFVO0lBQ1YsZUFBZTtHQUNqQixDQUFDO0dBQ0QsUUFBUSxJQUFJLDhEQUE4RDtFQUM1RTtFQUVBLE1BQU0sb0JBQW9CLE1BQU0sUUFBUSxRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUM7RUFDM0QsSUFBSSxDQUFDLG1CQUFtQjtHQUN0QixNQUFNLFFBQVEsT0FBTztJQUNuQixJQUFJO0lBQ0osTUFBTTtJQUNOLFVBQVU7SUFDVixhQUFhO0lBQ2IsV0FBVztJQUNYLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTztJQUNQLFFBQVE7SUFDUixPQUFPO0lBQ1AsUUFBUSxDQUFDLHVCQUF1QjtJQUNoQyxhQUFhO0lBQ2IsT0FBTztJQUNQLFFBQVE7SUFDUixTQUFTO0lBQ1QsVUFBVTtJQUNWLGVBQWU7R0FDakIsQ0FBQztHQUNELFFBQVEsSUFBSSxtREFBbUQ7RUFDakU7O0VBR0EsTUFBTSxtQkFBbUIsTUFBTSxRQUFRLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQztFQUMxRCxJQUFJLENBQUMsa0JBQWtCO0dBQ3JCLE1BQU0sUUFBUSxPQUFPO0lBQ25CLElBQUk7SUFDSixNQUFNO0lBQ04sVUFBVTtJQUNWLGFBQWE7SUFDYixXQUFXO0lBQ1gsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPO0lBQ1AsUUFBUTtJQUNSLE9BQU87SUFDUCxRQUFRLENBQUMsd0JBQXdCO0lBQ2pDLGFBQWE7SUFDYixPQUFPO0lBQ1AsUUFBUTtJQUNSLFNBQVM7SUFDVCxVQUFVO0lBQ1YsZUFBZTtJQUNmLE9BQU87SUFDUCxjQUFjO0lBQ2QsU0FBUztHQUNYLENBQUM7R0FDRCxRQUFRLElBQUksMkRBQTJEO0VBQ3pFO0VBRUEsTUFBTSxtQkFBbUIsTUFBTSxRQUFRLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQztFQUMxRCxJQUFJLENBQUMsa0JBQWtCO0dBQ3JCLE1BQU0sUUFBUSxPQUFPO0lBQ25CLElBQUk7SUFDSixNQUFNO0lBQ04sVUFBVTtJQUNWLGFBQWE7SUFDYixXQUFXO0lBQ1gsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPO0lBQ1AsUUFBUTtJQUNSLE9BQU87SUFDUCxRQUFRLENBQUMsbUJBQW1CO0lBQzVCLGFBQWE7SUFDYixPQUFPO0lBQ1AsUUFBUTtJQUNSLFNBQVM7SUFDVCxVQUFVO0lBQ1YsZUFBZTtJQUNmLE9BQU87SUFDUCxjQUFjO0lBQ2QsU0FBUztHQUNYLENBQUM7R0FDRCxRQUFRLElBQUksaUVBQWlFO0VBQy9FO0VBRUEsTUFBTSx3QkFBd0IsTUFBTSxRQUFRLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQztFQUMvRCxJQUFJLENBQUMsdUJBQXVCO0dBQzFCLE1BQU0sUUFBUSxPQUFPO0lBQ25CLElBQUk7SUFDSixNQUFNO0lBQ04sVUFBVTtJQUNWLGFBQWE7SUFDYixXQUFXO0lBQ1gsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPO0lBQ1AsUUFBUTtJQUNSLE9BQU87SUFDUCxRQUFRLENBQUMsdUJBQXVCO0lBQ2hDLGFBQWE7SUFDYixPQUFPO0lBQ1AsUUFBUTtJQUNSLFNBQVM7SUFDVCxVQUFVO0lBQ1YsZUFBZTtJQUNmLE9BQU87SUFDUCxjQUFjO0lBQ2QsU0FBUztHQUNYLENBQUM7R0FDRCxRQUFRLElBQUksNERBQTREO0VBQzFFO0VBRUEsTUFBTSxxQkFBcUIsTUFBTSxRQUFRLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQztFQUM1RCxJQUFJLENBQUMsb0JBQW9CO0dBQ3ZCLE1BQU0sUUFBUSxPQUFPO0lBQ25CLElBQUk7SUFDSixNQUFNO0lBQ04sVUFBVTtJQUNWLGFBQWE7SUFDYixXQUFXO0lBQ1gsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPO0lBQ1AsUUFBUTtJQUNSLE9BQU87SUFDUCxRQUFRLENBQUMseUJBQXlCO0lBQ2xDLGFBQWE7SUFDYixPQUFPO0lBQ1AsUUFBUTtJQUNSLFNBQVM7SUFDVCxVQUFVO0lBQ1YsZUFBZTtJQUNmLE9BQU87SUFDUCxjQUFjO0lBQ2QsU0FBUztHQUNYLENBQUM7R0FDRCxRQUFRLElBQUksMkRBQTJEO0VBQ3pFO0VBRUEsTUFBTSx5QkFBeUIsTUFBTSxRQUFRLFFBQVEsRUFBRSxJQUFJLElBQUksQ0FBQztFQUNoRSxJQUFJLENBQUMsd0JBQXdCO0dBQzNCLE1BQU0sUUFBUSxPQUFPO0lBQ25CLElBQUk7SUFDSixNQUFNO0lBQ04sVUFBVTtJQUNWLGFBQWE7SUFDYixXQUFXO0lBQ1gsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPO0lBQ1AsUUFBUTtJQUNSLE9BQU87SUFDUCxRQUFRLENBQUMscUJBQXFCO0lBQzlCLGFBQWE7SUFDYixPQUFPO0lBQ1AsUUFBUTtJQUNSLFNBQVM7SUFDVCxVQUFVO0lBQ1YsZUFBZTtJQUNmLE9BQU87SUFDUCxjQUFjO0lBQ2QsU0FBUztHQUNYLENBQUM7R0FDRCxRQUFRLElBQUksaUVBQWlFO0VBQy9FO0VBRUEsTUFBTSxvQkFBb0I7R0FDeEI7SUFBRSxNQUFNO0lBQVksUUFBUTtHQUFJO0dBQ2hDO0lBQUUsTUFBTTtJQUFjLFFBQVE7R0FBSTtHQUNsQztJQUFFLE1BQU07SUFBUyxRQUFRO0dBQUk7R0FDN0I7SUFBRSxNQUFNO0lBQWUsUUFBUTtHQUFJO0dBRW5DO0lBQUUsTUFBTTtJQUFTLFFBQVE7R0FBVztHQUNwQztJQUFFLE1BQU07SUFBTyxRQUFRO0dBQVc7R0FDbEM7SUFBRSxNQUFNO0lBQVEsUUFBUTtHQUFXO0dBQ25DO0lBQUUsTUFBTTtJQUFRLFFBQVE7R0FBVztHQUNuQztJQUFFLE1BQU07SUFBUyxRQUFRO0dBQVc7OztHQUdwQztJQUFFLE1BQU07SUFBVyxRQUFRO0dBQWE7R0FDeEM7SUFBRSxNQUFNO0lBQVcsUUFBUTtHQUFVOzs7R0FHckM7SUFBRSxNQUFNO0lBQVMsUUFBUTtHQUFjO0dBQ3ZDO0lBQUUsTUFBTTtJQUFTLFFBQVE7R0FBUTs7O0dBR2pDO0lBQUUsTUFBTTtJQUFXLFFBQVE7R0FBUTtHQUNuQztJQUFFLE1BQU07SUFBVyxRQUFRO0dBQVU7R0FFckM7SUFBRSxNQUFNO0lBQVMsUUFBUTtHQUFRO0dBQ2pDO0lBQUUsTUFBTTtJQUFTLFFBQVE7R0FBUTtHQUNqQztJQUFFLE1BQU07SUFBVyxRQUFRO0dBQVE7R0FDbkM7SUFBRSxNQUFNO0lBQVUsUUFBUTtHQUFNO0dBQ2hDO0lBQUUsTUFBTTtJQUFnQixRQUFRO0dBQVE7R0FFeEM7SUFBRSxNQUFNO0lBQVEsUUFBUTtHQUFhO0dBQ3JDO0lBQUUsTUFBTTtJQUFZLFFBQVE7R0FBYTtHQUN6QztJQUFFLE1BQU07SUFBYSxRQUFRO0dBQWE7R0FDMUM7SUFBRSxNQUFNO0lBQWdCLFFBQVE7R0FBYTtHQUM3QztJQUFFLE1BQU07SUFBUSxRQUFRO0dBQWU7R0FFdkM7SUFBRSxNQUFNO0lBQWtCLFFBQVE7R0FBUTtHQUMxQztJQUFFLE1BQU07SUFBaUIsUUFBUTtHQUFRO0dBQ3pDO0lBQUUsTUFBTTtJQUFxQixRQUFRO0dBQVE7R0FDN0M7SUFBRSxNQUFNO0lBQWdCLFFBQVE7R0FBUTtHQUV4QztJQUFFLE1BQU07SUFBYSxRQUFRO0dBQWM7R0FDM0M7SUFBRSxNQUFNO0lBQWUsUUFBUTtHQUFjO0dBQzdDO0lBQUUsTUFBTTtJQUFvQixRQUFRO0dBQWM7R0FDbEQ7SUFBRSxNQUFNO0lBQXVCLFFBQVE7R0FBYzs7O0dBR3JEO0lBQUUsTUFBTTtJQUFRLFFBQVE7R0FBYTs7O0dBR3JDO0lBQUUsTUFBTTtJQUFTLFFBQVE7R0FBUTtHQUNqQztJQUFFLE1BQU07SUFBVSxRQUFRO0dBQU87R0FDakM7SUFBRSxNQUFNO0lBQWUsUUFBUTtHQUFRO0dBQ3ZDO0lBQUUsTUFBTTtJQUFXLFFBQVE7R0FBWTtHQUN2QztJQUFFLE1BQU07SUFBUSxRQUFRO0dBQVk7OztHQUdwQztJQUFFLE1BQU07SUFBc0IsUUFBUTtHQUFZO0dBQ2xEO0lBQUUsTUFBTTtJQUFnQixRQUFRO0dBQVk7R0FDNUM7SUFBRSxNQUFNO0lBQWlCLFFBQVE7R0FBTTs7O0dBR3ZDO0lBQUUsTUFBTTtJQUFTLFFBQVE7R0FBUTtFQUNuQztFQUVBLEtBQUssTUFBTSxPQUFPLG1CQUFtQjtHQUNuQyxJQUFJLE1BQU0sTUFBTSxTQUFTLFFBQVEsRUFBRSxNQUFNLElBQUksS0FBSyxDQUFDO0dBQ25ELElBQUksQ0FBQyxLQUFLO0lBQ1IsSUFBSSxXQUFXO0lBQ2YsSUFBSSxJQUFJLFdBQVcsS0FBSztLQUN0QixNQUFNLFlBQVksTUFBTSxTQUFTLFFBQVEsRUFBRSxNQUFNLElBQUksT0FBTyxDQUFDO0tBQzdELElBQUksV0FBVztNQUNiLFdBQVcsVUFBVTtLQUN2QjtJQUNGO0lBQ0EsTUFBTSxNQUFNLFNBQVMsT0FBTztLQUMxQixNQUFNLElBQUk7S0FDVixRQUFRLElBQUk7S0FDWjtLQUNBLFFBQVE7S0FDUixPQUFPO0lBQ1QsQ0FBQztJQUNELFFBQVEsSUFBSSxlQUFlLElBQUksS0FBSyxzQkFBc0I7R0FDNUQ7RUFDRjtDQUNGLFNBQVMsS0FBSztFQUNaLFFBQVEsTUFBTSxpQ0FBaUMsR0FBRztDQUNwRDtBQUNGO0FBRUEsZUFBZSxZQUFZO0NBQ3pCLElBQUk7RUFDRixNQUFNLGNBQWMsUUFBUSxJQUFJLGVBQWUsK0JBQStCLFlBQVk7RUFDMUYsTUFBTSxnQkFBZ0IsUUFBUSxJQUFJLGtCQUFrQjs7RUFHcEQsTUFBTSxLQUFLLFVBQVUsRUFBRSxPQUFPLG9CQUFvQixDQUFDO0VBRW5ELE1BQU0sV0FBVyxNQUFNLEtBQUssUUFBUTtHQUFFLE9BQU87R0FBWSxNQUFNO0VBQVEsQ0FBQztFQUN4RSxJQUFJLENBQUMsVUFBVTtHQUNiLE1BQU0sU0FBUyxPQUFPLFNBQVMsZUFBZSxFQUFFO0dBQ2hELE1BQU0sS0FBSyxPQUFPO0lBQ2hCLElBQUksT0FBTztJQUNYLE1BQU07SUFDTixPQUFPO0lBQ1AsT0FBTztJQUNQLFVBQVU7SUFDVixNQUFNO0lBQ04sV0FBVztJQUNYLFlBQVksSUFBSSxLQUFLO0dBQ3ZCLENBQUM7R0FDRCxRQUFRLElBQUksMkJBQTJCLFlBQVk7RUFDckQ7Q0FDRixTQUFTLEtBQUs7RUFDWixRQUFRLE1BQU0sd0JBQXdCLEdBQUc7Q0FDM0M7QUFDRjs7QUFHQSxNQUFNLFlBQVk7Q0FDaEIsTUFBTSxnQkFBZ0IsT0FBTztFQUMzQixPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUUsT0FBTyxNQUFNLFlBQVksRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUs7Q0FDeEU7Q0FFQSxNQUFNLGFBQWEsSUFBSTtFQUNyQixNQUFNLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFLO0VBQzdDLElBQUksQ0FBQyxNQUFNLE9BQU87RUFDbEIsTUFBTSxFQUFFLFVBQVUsR0FBRyxTQUFTO0VBQzlCLE9BQU87Q0FDVDtDQUVBLE1BQU0sV0FBVyxFQUFFLE1BQU0sT0FBTyxPQUFPLFVBQVUsT0FBTyxVQUFVO0VBQ2hFLE1BQU0sU0FBUyxPQUFPLFNBQVMsVUFBVSxFQUFFO0VBQzNDLE1BQU0sVUFBVSxNQUFNLEtBQUssT0FBTztHQUNoQyxJQUFJLE9BQU87R0FDWCxNQUFNLEtBQUssS0FBSztHQUNoQixPQUFPLE1BQU0sWUFBWSxFQUFFLEtBQUs7R0FDaEMsT0FBTyxTQUFTO0dBQ2hCLFVBQVU7R0FDVjtHQUNBLFdBQVc7R0FDWCxZQUFZLElBQUksS0FBSztHQUNyQixNQUFNLENBQUM7R0FDUCxVQUFVLENBQUM7R0FDWCxXQUFXLENBQUM7RUFDZCxDQUFDO0VBQ0QsTUFBTSxVQUFVLFFBQVEsU0FBUztFQUNqQyxNQUFNLEVBQUUsVUFBVSxHQUFHLEdBQUcsU0FBUztFQUNqQyxPQUFPO0NBQ1Q7Q0FFQSxNQUFNLFlBQVksT0FBTztFQUN2QixNQUFNLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRSxPQUFPLE1BQU0sWUFBWSxFQUFFLEtBQUssRUFBRSxDQUFDO0VBQ3JFLE9BQU8sQ0FBQyxDQUFDO0NBQ1g7QUFDRjtBQUVBLE1BQU0sMEJBQTBCLElBQUksU0FBUyxPQUFPO0NBQ2xELFdBQVc7RUFBRSxNQUFNO0VBQVEsVUFBVTtFQUFNLFFBQVE7Q0FBSztDQUN4RCxRQUFRO0VBQUUsTUFBTTtFQUFRLFNBQVM7RUFBTSxPQUFPO0NBQUs7Q0FDbkQsVUFBVTtFQUFFLE1BQU07RUFBUSxVQUFVO0NBQUs7Q0FDekMsZUFBZSxDQUFDO0VBQUUsTUFBTSxTQUFTLE9BQU8sTUFBTTtFQUFVLEtBQUs7Q0FBVSxDQUFDO0NBQ3hFLFlBQVk7RUFBRSxNQUFNLFNBQVMsT0FBTyxNQUFNO0VBQVUsS0FBSztFQUFZLFVBQVU7RUFBTSxPQUFPO0NBQUs7Q0FDakcsa0JBQWtCO0VBQ2hCLGNBQWMsRUFBRSxNQUFNLE9BQU87RUFDN0IsY0FBYyxFQUFFLE1BQU0sT0FBTztFQUM3QixtQkFBbUIsRUFBRSxNQUFNLE9BQU87RUFDbEMsZUFBZSxFQUFFLE1BQU0sT0FBTztFQUM5QixlQUFlLEVBQUUsTUFBTSxPQUFPO0NBQ2hDO0NBQ0EsV0FBVztFQUFFLE1BQU07RUFBTSxTQUFTLEtBQUs7RUFBSyxTQUFTO0NBQUs7Q0FDMUQsUUFBUTtFQUFFLE1BQU07RUFBUyxTQUFTO0VBQU8sT0FBTztDQUFLO0FBQ3ZELENBQUM7QUFDRCx3QkFBd0IsTUFBTTtDQUFFLFFBQVE7Q0FBRyxVQUFVO0NBQUcsWUFBWTtDQUFHLFFBQVE7QUFBRSxDQUFDO0FBRWxGLE1BQU0sYUFBYSxTQUFTLE1BQU0sY0FBYyxnQkFBZ0I7QUFDaEUsTUFBTSxXQUFXLFNBQVMsTUFBTSxZQUFZLGNBQWM7QUFDMUQsTUFBTSxZQUFZLFNBQVMsTUFBTSxhQUFhLGVBQWU7QUFDN0QsTUFBTSxtQkFBbUIsU0FBUyxNQUFNLG9CQUFvQixzQkFBc0I7QUFDbEYsTUFBTSxvQkFBb0IsU0FBUyxNQUFNLHFCQUFxQix1QkFBdUI7QUFFckYsT0FBTyxVQUFVO0NBQ2Y7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBO0NBQ0E7QUFDRiIsIm5hbWVzIjpbXSwic291cmNlcyI6WyJkYXRhYmFzZS5qcyJdLCJ2ZXJzaW9uIjozLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBtb25nb29zZSA9IHJlcXVpcmUoJ21vbmdvb3NlJyk7XG5jb25zdCBiY3J5cHQgPSByZXF1aXJlKCdiY3J5cHRqcycpO1xuY29uc3QgeyB2NDogdXVpZHY0IH0gPSByZXF1aXJlKCd1dWlkJyk7XG5cbmNvbnN0IE1PTkdPREJfVVJJID0gcHJvY2Vzcy5lbnYuTU9OR09EQl9VUkkgfHwgJ21vbmdvZGI6Ly9sb2NhbGhvc3Q6MjcwMTcvbWl0aGlyYXNob3BweSc7XG5cbm1vbmdvb3NlLmNvbm5lY3QoTU9OR09EQl9VUkkpXG4gIC50aGVuKGFzeW5jICgpID0+IHtcbiAgICBjb25zb2xlLmxvZygn4pyFIENvbm5lY3RlZCB0byBNb25nb0RCIHN1Y2Nlc3NmdWxseScpO1xuICAgIHRyeSB7XG4gICAgICAvLyBTa2lwIGRyb3BwaW5nIHRoZSBkYXRhYmFzZSB0byBwZXJzaXN0IHByb2R1Y3RzIGFuZCBjYXRlZ29yaWVzIGFjcm9zcyByZXN0YXJ0c1xuICAgICAgLy8gYXdhaXQgbW9uZ29vc2UuY29ubmVjdGlvbi5kYi5kcm9wRGF0YWJhc2UoKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKCfwn5eR77iPIERhdGFiYXNlIGRyb3BwZWQvY2xlYXJlZCBzdWNjZXNzZnVsbHknKTtcbiAgICAgIC8vIEJyaWVmIGRlbGF5IHRvIGxldCBNb25nb0RCIGZpbmFsaXplIGRyb3BwZWQgY29sbGVjdGlvbnMgYW5kIGluZGljZXNcbiAgICAgIGF3YWl0IHNlZWRBZG1pbigpO1xuICAgICAgYXdhaXQgc2VlZFN0b3JlRGF0YSgpO1xuICAgICAgLy8gQXV0by1taWdyYXRlL3N5bmMgYXBwcm92YWxTdGF0dXMgZm9yIGV4aXN0aW5nIHByb2R1Y3RzIHRvIHByZXZlbnQgbWlzbWF0Y2hcbiAgICAgIGF3YWl0IG1vbmdvb3NlLm1vZGVsKCdQcm9kdWN0JykudXBkYXRlTWFueShcbiAgICAgICAgeyBzdGF0dXM6ICdBY3RpdmUnLCAkb3I6IFt7IGFwcHJvdmFsU3RhdHVzOiAnUGVuZGluZycgfSwgeyBhcHByb3ZhbFN0YXR1czogeyAkZXhpc3RzOiBmYWxzZSB9IH0sIHsgYXBwcm92YWxTdGF0dXM6IG51bGwgfV0gfSxcbiAgICAgICAgeyAkc2V0OiB7IGFwcHJvdmFsU3RhdHVzOiAnQXBwcm92ZWQnIH0gfVxuICAgICAgKTtcbiAgICAgIGF3YWl0IG1vbmdvb3NlLm1vZGVsKCdQcm9kdWN0JykudXBkYXRlTWFueShcbiAgICAgICAgeyBzdGF0dXM6ICdSZWplY3RlZCcsICRvcjogW3sgYXBwcm92YWxTdGF0dXM6ICdQZW5kaW5nJyB9LCB7IGFwcHJvdmFsU3RhdHVzOiB7ICRleGlzdHM6IGZhbHNlIH0gfSwgeyBhcHByb3ZhbFN0YXR1czogbnVsbCB9XSB9LFxuICAgICAgICB7ICRzZXQ6IHsgYXBwcm92YWxTdGF0dXM6ICdSZWplY3RlZCcgfSB9XG4gICAgICApO1xuICAgIH0gY2F0Y2ggKGRiRXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCfinYwgRXJyb3IgZHJvcHBpbmcgZGF0YWJhc2U6JywgZGJFcnIpO1xuICAgIH1cbiAgfSlcbiAgLmNhdGNoKGVyciA9PiBjb25zb2xlLmVycm9yKCfinYwgTW9uZ29EQiBjb25uZWN0aW9uIGVycm9yOicsIGVycikpO1xuXG4vLyDilIDilIDilIAgU2NoZW1hcyAmIE1vZGVscyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbmNvbnN0IEFkZHJlc3NTY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKHtcbiAgaWQ6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICB0eXBlOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJ0hvbWUnIH0sXG4gIGlzRGVmYXVsdDogeyB0eXBlOiBCb29sZWFuLCBkZWZhdWx0OiBmYWxzZSB9LFxuICBuYW1lOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgcGhvbmU6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICBzdHJlZXQ6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICBsb2NhbGl0eTogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICcnIH0sXG4gIGNpdHk6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICBwaW5jb2RlOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgc3RhdGU6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnVGVsYW5nYW5hJyB9LFxuICBjb3VudHJ5OiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJ0luZGlhJyB9XG59KTtcblxuY29uc3QgVXNlclNjaGVtYSA9IG5ldyBtb25nb29zZS5TY2hlbWEoe1xuICBpZDogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlLCB1bmlxdWU6IHRydWUgfSxcbiAgbmFtZTogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gIGVtYWlsOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUsIHVuaXF1ZTogdHJ1ZSB9LFxuICBwaG9uZTogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6IG51bGwgfSxcbiAgcGFzc3dvcmQ6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICByb2xlOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJ3VzZXInIH0sXG4gIGlzX2FjdGl2ZTogeyB0eXBlOiBCb29sZWFuLCBkZWZhdWx0OiB0cnVlIH0sXG4gIGNyZWF0ZWRfYXQ6IHsgdHlwZTogRGF0ZSwgZGVmYXVsdDogRGF0ZS5ub3cgfSxcbiAgY2FydDogeyB0eXBlOiBbU3RyaW5nXSwgZGVmYXVsdDogW10gfSwgLy8gQmFja3dhcmRzIGNvbXBhdGliaWxpdHk6IGFycmF5IG9mIHByb2R1Y3QgSURzXG4gIGNhcnRJdGVtczogW3tcbiAgICBwcm9kdWN0SWQ6IHsgdHlwZTogTnVtYmVyLCByZXF1aXJlZDogdHJ1ZSB9LFxuICAgIHZhcmlhbnQ6IHsgdHlwZTogbW9uZ29vc2UuU2NoZW1hLlR5cGVzLk1peGVkLCBkZWZhdWx0OiB7fSB9LFxuICAgIHF1YW50aXR5OiB7IHR5cGU6IE51bWJlciwgZGVmYXVsdDogMSB9XG4gIH1dLFxuICB3aXNobGlzdDogeyB0eXBlOiBbU3RyaW5nXSwgZGVmYXVsdDogW10gfSwgLy8gQmFja3dhcmRzIGNvbXBhdGliaWxpdHk6IGFycmF5IG9mIHByb2R1Y3QgSURzXG4gIHdpc2hsaXN0SXRlbXM6IFt7XG4gICAgcHJvZHVjdElkOiB7IHR5cGU6IE51bWJlciwgcmVxdWlyZWQ6IHRydWUgfVxuICB9XSxcbiAgYWRkcmVzc2VzOiB7IHR5cGU6IFtBZGRyZXNzU2NoZW1hXSwgZGVmYXVsdDogW10gfSxcbiAgZG9iOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJzE1LzA4LzE5OTUnIH0sXG4gIGdlbmRlcjogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICdGZW1hbGUnIH0sXG4gIHByb2ZpbGVJbWFnZTogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICcnIH0sXG4gIG9yZGVySWRzOiB7IHR5cGU6IFtTdHJpbmddLCBkZWZhdWx0OiBbXSB9XG59KTtcblxuY29uc3QgUHJvZHVjdFZhcmlhbnRTY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKHtcbiAgc2l6ZTogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6IG51bGwgfSxcbiAgY29sb3I6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiBudWxsIH0sXG4gIHN0b2NrOiB7IHR5cGU6IE51bWJlciwgZGVmYXVsdDogMCB9LFxuICBwcmljZTogeyB0eXBlOiBOdW1iZXIsIGRlZmF1bHQ6IG51bGwgfSwgLy8gSWYgbnVsbCwgZmFsbGJhY2sgdG8gcHJvZHVjdCBiYXNlIHByaWNlXG4gIHNrdTogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6IG51bGwgfSxcbiAgaW1hZ2U6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiBudWxsIH1cbn0pO1xuXG5jb25zdCBQcm9kdWN0U2NoZW1hID0gbmV3IG1vbmdvb3NlLlNjaGVtYSh7XG4gIGlkOiB7IHR5cGU6IE51bWJlciwgcmVxdWlyZWQ6IHRydWUsIHVuaXF1ZTogdHJ1ZSB9LFxuICBuYW1lOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgY2F0ZWdvcnk6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnQ2xvdGhpbmcgPiBLaWRzJyB9LFxuICBzdWJDYXRlZ29yeTogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICcnIH0sXG4gIGNhdGFsb2d1ZTogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICdDYXRhbG9ndWUgQScgfSxcbiAgcHJpY2U6IHsgdHlwZTogTnVtYmVyLCByZXF1aXJlZDogdHJ1ZSB9LFxuICBzdG9jazogeyB0eXBlOiBOdW1iZXIsIGRlZmF1bHQ6IDAgfSxcbiAgc2FsZXM6IHsgdHlwZTogTnVtYmVyLCBkZWZhdWx0OiAwIH0sXG4gIHN0YXR1czogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICdBY3RpdmUnIH0sXG4gIGltYWdlOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJ0tpZHMnIH0sIC8vIEJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG4gIGltYWdlczogeyB0eXBlOiBbU3RyaW5nXSwgZGVmYXVsdDogW10gfSwgLy8gU3VwcG9ydCBtdWx0aXBsZSBpbWFnZXNcbiAgdmFyaWFudHM6IHsgdHlwZTogW1Byb2R1Y3RWYXJpYW50U2NoZW1hXSwgZGVmYXVsdDogW10gfSwgLy8gU2l6ZSwgY29sb3IsIHN0b2NrIHZhcmlhbnRzXG4gIGxvd1N0b2NrVGhyZXNob2xkOiB7IHR5cGU6IE51bWJlciwgZGVmYXVsdDogNSB9LFxuICBpc0xvd1N0b2NrOiB7IHR5cGU6IEJvb2xlYW4sIGRlZmF1bHQ6IGZhbHNlIH0sXG4gIGRlc2NyaXB0aW9uOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJycgfSxcbiAgYnJhbmQ6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnJyB9LFxuICByYXRpbmc6IHsgdHlwZTogTnVtYmVyLCBkZWZhdWx0OiA0LjggfSxcbiAgcmV2aWV3czogeyB0eXBlOiBOdW1iZXIsIGRlZmF1bHQ6IDEyMCB9LFxuICBkaXNjb3VudDogeyB0eXBlOiBOdW1iZXIsIGRlZmF1bHQ6IDAgfSxcbiAgb3JpZ2luYWxQcmljZTogeyB0eXBlOiBOdW1iZXIsIGRlZmF1bHQ6IG51bGwgfSxcbiAgYmFkZ2U6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnJyB9LFxuICBpc05ld0Fycml2YWw6IHsgdHlwZTogQm9vbGVhbiwgZGVmYXVsdDogZmFsc2UgfSxcbiAgaXNPZmZlcjogeyB0eXBlOiBCb29sZWFuLCBkZWZhdWx0OiBmYWxzZSB9LFxuICBhdHRyaWJ1dGVzOiB7XG4gICAgdHlwZTogW3tcbiAgICAgIGtleTogeyB0eXBlOiBTdHJpbmcgfSxcbiAgICAgIHZhbHVlOiB7IHR5cGU6IFN0cmluZyB9XG4gICAgfV0sXG4gICAgZGVmYXVsdDogW11cbiAgfSxcbiAgLy8gTHVja3kgQ2hhcm0gRmllbGRzXG4gIGluY2x1ZGVJbkx1Y2t5Q2hhcm06IHsgdHlwZTogQm9vbGVhbiwgZGVmYXVsdDogZmFsc2UgfSxcbiAgbHVja3lTdG9jazogeyB0eXBlOiBOdW1iZXIsIGRlZmF1bHQ6IDAgfSxcbiAgLy8gVmVuZG9yIEZpZWxkc1xuICB2ZW5kb3JJZDogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6IG51bGwsIGluZGV4OiB0cnVlLCByZWY6ICdWZW5kb3InIH0sIC8vIG51bGwgPSBwbGF0Zm9ybSBwcm9kdWN0XG4gIGFwcHJvdmFsU3RhdHVzOiB7IHR5cGU6IFN0cmluZywgZW51bTogWydQZW5kaW5nJywgJ0FwcHJvdmVkJywgJ1JlamVjdGVkJ10sIGRlZmF1bHQ6ICdQZW5kaW5nJywgaW5kZXg6IHRydWUgfSxcbiAgYXBwcm92ZWRCeTogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6IG51bGwsIHJlZjogJ1VzZXInIH0sXG4gIGFwcHJvdmVkQXQ6IHsgdHlwZTogRGF0ZSwgZGVmYXVsdDogbnVsbCB9LFxuICByZWplY3RSZWFzb246IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnJyB9IC8vIEFkbWluIHJlamVjdGlvbiBub3RlXG59KTtcblxuLy8gQXV0by1wb3B1bGF0ZSB0aGUgaW1hZ2VzIGFycmF5IHdpdGggdGhlIG1haW4gaW1hZ2UgaWYgZW1wdHlcblByb2R1Y3RTY2hlbWEucHJlKCdzYXZlJywgZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5pbWFnZSAmJiAoIXRoaXMuaW1hZ2VzIHx8IHRoaXMuaW1hZ2VzLmxlbmd0aCA9PT0gMCkpIHtcbiAgICB0aGlzLmltYWdlcyA9IFt0aGlzLmltYWdlXTtcbiAgfVxuICBpZiAodGhpcy5zdG9jayA8PSB0aGlzLmxvd1N0b2NrVGhyZXNob2xkKSB7XG4gICAgdGhpcy5pc0xvd1N0b2NrID0gdHJ1ZTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmlzTG93U3RvY2sgPSBmYWxzZTtcbiAgfVxuXG4gIC8vIFN5bmNocm9uaXplIHN0YXR1cyBhbmQgYXBwcm92YWxTdGF0dXNcbiAgaWYgKHRoaXMuaXNNb2RpZmllZCgnc3RhdHVzJykpIHtcbiAgICBpZiAodGhpcy5zdGF0dXMgPT09ICdQZW5kaW5nJykge1xuICAgICAgdGhpcy5hcHByb3ZhbFN0YXR1cyA9ICdQZW5kaW5nJztcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdHVzID09PSAnQWN0aXZlJykge1xuICAgICAgdGhpcy5hcHByb3ZhbFN0YXR1cyA9ICdBcHByb3ZlZCc7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXR1cyA9PT0gJ1JlamVjdGVkJykge1xuICAgICAgdGhpcy5hcHByb3ZhbFN0YXR1cyA9ICdSZWplY3RlZCc7XG4gICAgfVxuICB9IGVsc2UgaWYgKHRoaXMuaXNNb2RpZmllZCgnYXBwcm92YWxTdGF0dXMnKSkge1xuICAgIGlmICh0aGlzLmFwcHJvdmFsU3RhdHVzID09PSAnUGVuZGluZycpIHtcbiAgICAgIHRoaXMuc3RhdHVzID0gJ1BlbmRpbmcnO1xuICAgIH0gZWxzZSBpZiAodGhpcy5hcHByb3ZhbFN0YXR1cyA9PT0gJ0FwcHJvdmVkJykge1xuICAgICAgdGhpcy5zdGF0dXMgPSAnQWN0aXZlJztcbiAgICB9IGVsc2UgaWYgKHRoaXMuYXBwcm92YWxTdGF0dXMgPT09ICdSZWplY3RlZCcpIHtcbiAgICAgIHRoaXMuc3RhdHVzID0gJ1JlamVjdGVkJztcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gU3luYyBzdGF0dXMgdG8gYXBwcm92YWxTdGF0dXMgYnkgZGVmYXVsdCAoZS5nLiBmb3IgbmV3IGRvY3VtZW50cylcbiAgICBpZiAodGhpcy5zdGF0dXMgPT09ICdQZW5kaW5nJykge1xuICAgICAgdGhpcy5hcHByb3ZhbFN0YXR1cyA9ICdQZW5kaW5nJztcbiAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdHVzID09PSAnQWN0aXZlJykge1xuICAgICAgdGhpcy5hcHByb3ZhbFN0YXR1cyA9ICdBcHByb3ZlZCc7XG4gICAgfSBlbHNlIGlmICh0aGlzLnN0YXR1cyA9PT0gJ1JlamVjdGVkJykge1xuICAgICAgdGhpcy5hcHByb3ZhbFN0YXR1cyA9ICdSZWplY3RlZCc7XG4gICAgfVxuICB9XG59KTtcblxuUHJvZHVjdFNjaGVtYS5wcmUoJ2ZpbmRPbmVBbmRVcGRhdGUnLCBmdW5jdGlvbiAoKSB7XG4gIGNvbnN0IHVwZGF0ZSA9IHRoaXMuZ2V0VXBkYXRlKCk7XG4gIGlmICh1cGRhdGUgJiYgdXBkYXRlLiRzZXQpIHtcbiAgICBjb25zdCBzdGF0dXMgPSB1cGRhdGUuJHNldC5zdGF0dXM7XG4gICAgY29uc3QgYXBwcm92YWxTdGF0dXMgPSB1cGRhdGUuJHNldC5hcHByb3ZhbFN0YXR1cztcblxuICAgIGlmIChzdGF0dXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHN0YXR1cyA9PT0gJ1BlbmRpbmcnKSB7XG4gICAgICAgIHVwZGF0ZS4kc2V0LmFwcHJvdmFsU3RhdHVzID0gJ1BlbmRpbmcnO1xuICAgICAgfSBlbHNlIGlmIChzdGF0dXMgPT09ICdBY3RpdmUnKSB7XG4gICAgICAgIHVwZGF0ZS4kc2V0LmFwcHJvdmFsU3RhdHVzID0gJ0FwcHJvdmVkJztcbiAgICAgIH0gZWxzZSBpZiAoc3RhdHVzID09PSAnUmVqZWN0ZWQnKSB7XG4gICAgICAgIHVwZGF0ZS4kc2V0LmFwcHJvdmFsU3RhdHVzID0gJ1JlamVjdGVkJztcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGFwcHJvdmFsU3RhdHVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChhcHByb3ZhbFN0YXR1cyA9PT0gJ1BlbmRpbmcnKSB7XG4gICAgICAgIHVwZGF0ZS4kc2V0LnN0YXR1cyA9ICdQZW5kaW5nJztcbiAgICAgIH0gZWxzZSBpZiAoYXBwcm92YWxTdGF0dXMgPT09ICdBcHByb3ZlZCcpIHtcbiAgICAgICAgdXBkYXRlLiRzZXQuc3RhdHVzID0gJ0FjdGl2ZSc7XG4gICAgICB9IGVsc2UgaWYgKGFwcHJvdmFsU3RhdHVzID09PSAnUmVqZWN0ZWQnKSB7XG4gICAgICAgIHVwZGF0ZS4kc2V0LnN0YXR1cyA9ICdSZWplY3RlZCc7XG4gICAgICB9XG4gICAgfVxuICB9XG59KTtcblxuY29uc3QgQ2F0ZWdvcnlTY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKHtcbiAgbmFtZTogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlLCB1bmlxdWU6IHRydWUgfSxcbiAgcGFyZW50OiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJ+KAlCcgfSwgLy8gQmFja3dhcmRzIGNvbXBhdGliaWxpdHlcbiAgcGFyZW50SWQ6IHsgdHlwZTogbW9uZ29vc2UuU2NoZW1hLlR5cGVzLk9iamVjdElkLCByZWY6ICdDYXRlZ29yeScsIGRlZmF1bHQ6IG51bGwgfSwgLy8gSGllcmFyY2hpY2FsIHVubGltaXRlZCBzdWJjYXRlZ29yaWVzXG4gIGNvdW50OiB7IHR5cGU6IE51bWJlciwgZGVmYXVsdDogMCB9LFxuICBzdGF0dXM6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnQWN0aXZlJyB9LFxuICBpbWFnZTogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICcnIH1cbn0pO1xuXG4vLyBNaWRkbGV3YXJlIHRvIGtlZXAgdGhlICdwYXJlbnQnIHN0cmluZyBzeW5jaHJvbml6ZWQgd2l0aCB0aGUgcGFyZW50J3MgbmFtZVxuQ2F0ZWdvcnlTY2hlbWEucHJlKCdzYXZlJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICBpZiAodGhpcy5wYXJlbnRJZCkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXJlbnRDYXRlZ29yeSA9IGF3YWl0IG1vbmdvb3NlLm1vZGVsKCdDYXRlZ29yeScpLmZpbmRCeUlkKHRoaXMucGFyZW50SWQpO1xuICAgICAgaWYgKHBhcmVudENhdGVnb3J5KSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50Q2F0ZWdvcnkubmFtZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIEZhaWwgc2lsZW50bHkgb3IgaGFuZGxlIGVycm9yXG4gICAgfVxuICB9IGVsc2UgaWYgKHRoaXMucGFyZW50ID09PSAn4oCUJyB8fCAhdGhpcy5wYXJlbnQpIHtcbiAgICB0aGlzLnBhcmVudCA9ICfigJQnO1xuICB9XG59KTtcblxuY29uc3QgQ2F0YWxvZ3VlU2NoZW1hID0gbmV3IG1vbmdvb3NlLlNjaGVtYSh7XG4gIG5hbWU6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSwgdW5pcXVlOiB0cnVlIH0sXG4gIHN1YnRpdGxlOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgY291bnQ6IHsgdHlwZTogTnVtYmVyLCBkZWZhdWx0OiAwIH0sXG4gIHN0YXR1czogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICdBY3RpdmUnIH0sXG4gIHJldmVudWU6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAn4oK5MCcgfSxcbiAgaW1hZ2U6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnS2lkcycgfSxcbiAgdmlzaWJpbGl0eTogeyB0eXBlOiBTdHJpbmcsIGVudW06IFsnUHVibGljJywgJ0ludGVybmFsJ10sIGRlZmF1bHQ6ICdJbnRlcm5hbCcgfSAvLyBGb3IgaGlkaW5nL3RyYWNraW5nIENhdGFsb2d1ZSBBL0IgaW50ZXJuYWxseVxufSk7XG5cbmNvbnN0IE9yZGVySXRlbVNjaGVtYSA9IG5ldyBtb25nb29zZS5TY2hlbWEoe1xuICBwcm9kdWN0SWQ6IHsgdHlwZTogTnVtYmVyLCByZXF1aXJlZDogdHJ1ZSB9LFxuICBuYW1lOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgdmFyaWFudDogeyB0eXBlOiBtb25nb29zZS5TY2hlbWEuVHlwZXMuTWl4ZWQsIGRlZmF1bHQ6IHt9IH0sXG4gIGNhdGFsb2d1ZTogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6IG51bGwgfSxcbiAgcXVhbnRpdHk6IHsgdHlwZTogTnVtYmVyLCBkZWZhdWx0OiAxIH0sXG4gIHByaWNlOiB7IHR5cGU6IE51bWJlciwgcmVxdWlyZWQ6IHRydWUgfSxcbiAgdmVuZG9ySWQ6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiBudWxsLCBpbmRleDogdHJ1ZSwgcmVmOiAnVmVuZG9yJyB9XG59KTtcblxuY29uc3QgT3JkZXJTY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKHtcbiAgaWQ6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSwgdW5pcXVlOiB0cnVlIH0sXG4gIHVzZXJJZDogeyB0eXBlOiBTdHJpbmcgfSxcbiAgY3VzdG9tZXI6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICBwcm9kdWN0OiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSwgLy8gQmFja3dhcmRzIGNvbXBhdGliaWxpdHk6IFN1bW1hcnkgc3RyaW5nIG9mIHByb2R1Y3RzXG4gIGFtb3VudDogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gIHBheW1lbnQ6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnUmF6b3JwYXknIH0sXG4gIHN0YXR1czogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICdQZW5kaW5nJywgaW5kZXg6IHRydWUgfSxcbiAgZGF0ZTogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gIGl0ZW1zOiB7IHR5cGU6IFtPcmRlckl0ZW1TY2hlbWFdLCBkZWZhdWx0OiBbXSB9LCAvLyBEZXRhaWxlZCBvcmRlciBpdGVtcyBjb250YWluaW5nIHZhcmlhbnRzIGFuZCBjYXRhbG9ndWUgZGV0YWlsc1xuICBjYXRhbG9ndWVEZXRhaWxzOiB7IHR5cGU6IE1hcCwgb2Y6IFN0cmluZyB9LCAvLyBLZXktdmFsdWUgY2F0YWxvZ3VlIGluZm8gZm9yIGFuYWx5dGljc1xuICBpc0x1Y2t5Q2hhcm1PcmRlcjogeyB0eXBlOiBCb29sZWFuLCBkZWZhdWx0OiBmYWxzZSB9LFxuICBzaGlwcGluZ0FkZHJlc3M6IHsgdHlwZTogbW9uZ29vc2UuU2NoZW1hLlR5cGVzLk1peGVkLCBkZWZhdWx0OiB7fSB9LFxuICBzdWJ0b3RhbDogeyB0eXBlOiBOdW1iZXIgfSxcbiAgZ3N0OiB7IHR5cGU6IE51bWJlciB9LFxuICBzaGlwcGluZzogeyB0eXBlOiBOdW1iZXIgfSxcbiAgZGlzY291bnQ6IHsgdHlwZTogTnVtYmVyIH1cbn0pO1xuXG5jb25zdCBDb3Vwb25TY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKHtcbiAgY29kZTogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlLCB1bmlxdWU6IHRydWUgfSxcbiAgZGlzY291bnQ6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICB0eXBlOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJ1BlcmNlbnRhZ2UnIH0sXG4gIG1pbkNhcnQ6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAn4oK5MCcgfSxcbiAgZXhwaXJ5OiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgdXNhZ2U6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnMC81MDAnIH0sXG4gIHN0YXR1czogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICdBY3RpdmUnIH0sXG4gIG1heERpc2NvdW50OiB7IHR5cGU6IE51bWJlciwgZGVmYXVsdDogbnVsbCB9LFxuICB1c2FnZUNvdW50OiB7IHR5cGU6IE51bWJlciwgZGVmYXVsdDogMCB9LFxuICB1c2VyVXNhZ2U6IFt7XG4gICAgdXNlcklkOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgICBjb3VudDogeyB0eXBlOiBOdW1iZXIsIGRlZmF1bHQ6IDEgfVxuICB9XVxufSk7XG5cbmNvbnN0IFJldmlld1NjaGVtYSA9IG5ldyBtb25nb29zZS5TY2hlbWEoe1xuICBpZDogeyB0eXBlOiBOdW1iZXIsIHJlcXVpcmVkOiB0cnVlLCB1bmlxdWU6IHRydWUgfSxcbiAgcHJvZHVjdE5hbWU6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICBwcm9kdWN0SW1hZ2U6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnS2lkcycgfSxcbiAgY3VzdG9tZXJOYW1lOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgcmF0aW5nOiB7IHR5cGU6IE51bWJlciwgcmVxdWlyZWQ6IHRydWUgfSxcbiAgY29tbWVudDogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gIGRhdGU6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICBzdGF0dXM6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnUGVuZGluZycgfSxcbiAgcmVwbHk6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnJyB9LFxuICB1c2VySWQ6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiBudWxsIH0sXG4gIHZlcmlmaWVkUHVyY2hhc2U6IHsgdHlwZTogQm9vbGVhbiwgZGVmYXVsdDogZmFsc2UgfVxufSk7XG5cbmNvbnN0IEJhbm5lclNjaGVtYSA9IG5ldyBtb25nb29zZS5TY2hlbWEoe1xuICBpZDogeyB0eXBlOiBOdW1iZXIsIHJlcXVpcmVkOiB0cnVlLCB1bmlxdWU6IHRydWUgfSxcbiAgdGl0bGU6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICBzbG90OiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJ01haW4gQmFubmVyJyB9LFxuICBpbWFnZTogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICdDbG90aGluZycgfSxcbiAgY2xpY2tSYXRlOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJzAuMCUnIH0sXG4gIHN0YXR1czogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICdBY3RpdmUnIH1cbn0pO1xuXG5jb25zdCBBbm5vdW5jZW1lbnRTY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKHtcbiAgaWQ6IHsgdHlwZTogTnVtYmVyLCByZXF1aXJlZDogdHJ1ZSwgdW5pcXVlOiB0cnVlIH0sXG4gIHRleHQ6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICBwbGFjZW1lbnQ6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnVG9wIEhlYWRlcicgfSxcbiAgZXhwaXJ5OiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgc3RhdHVzOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJ0FjdGl2ZScgfVxufSk7XG5cbmNvbnN0IENvbnRhY3RRdWVyeVNjaGVtYSA9IG5ldyBtb25nb29zZS5TY2hlbWEoe1xuICBpZDogeyB0eXBlOiBOdW1iZXIsIHJlcXVpcmVkOiB0cnVlLCB1bmlxdWU6IHRydWUgfSxcbiAgbmFtZTogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gIGVtYWlsOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSxcbiAgbWVzc2FnZTogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gIGRhdGU6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICBzdGF0dXM6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnUGVuZGluZycgfSxcbiAgcGhvbmU6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiBudWxsIH0sXG4gIHN1YmplY3Q6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiBudWxsIH1cbn0pO1xuXG5jb25zdCBTZXR0aW5nc1NjaGVtYSA9IG5ldyBtb25nb29zZS5TY2hlbWEoe1xuICBzdG9yZU5hbWU6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnTWl0aGlyYVNob3BweSBPZmZpY2lhbCcgfSxcbiAgc3VwcG9ydEVtYWlsOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJ3N1cHBvcnRAbWl0aGlyYXNob3BweS5jb20nIH0sXG4gIHRheFBlcmNlbnRhZ2U6IHsgdHlwZTogTnVtYmVyLCBkZWZhdWx0OiAxOCB9LFxuICBkZWZhdWx0Q3VycmVuY3k6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnSU5SJyB9LFxuICBzaGlwcGluZ0luZm9MaW5lczoge1xuICAgIHR5cGU6IFtTdHJpbmddLFxuICAgIGRlZmF1bHQ6IFtcbiAgICAgIFwiRnJlZSBzaGlwcGluZyBvbiBhbGwgb3JkZXJzIGFib3ZlIOKCuTk5OS5cIixcbiAgICAgIFwiU3RhbmRhcmQgZGVsaXZlcnkgdGFrZXMgM+KAkzUgYnVzaW5lc3MgZGF5cyBkZXBlbmRpbmcgb24gbG9jYXRpb24uXCIsXG4gICAgICBcIkNhc2ggb24gRGVsaXZlcnkgKENPRCkgaXMgYXZhaWxhYmxlIG9uIGFsbCBlbGlnaWJsZSBwb3N0YWwgYWRkcmVzc2VzLlwiLFxuICAgICAgXCJXZSBvZmZlciBlYXN5IDctZGF5IGhhc3NsZS1mcmVlIHJldHVybnMgYW5kIGV4Y2hhbmdlcy5cIlxuICAgIF1cbiAgfSxcbiAgZnJlZVNoaXBwaW5nQWJvdmU6IHsgdHlwZTogTnVtYmVyLCBkZWZhdWx0OiA5OTkgfSxcbiAgc3RhbmRhcmRDaGFyZ2U6IHsgdHlwZTogTnVtYmVyLCBkZWZhdWx0OiAwIH0sXG4gIGV4cHJlc3NDaGFyZ2U6IHsgdHlwZTogTnVtYmVyLCBkZWZhdWx0OiAxNTAgfSxcbiAgY29kQ2hhcmdlczogeyB0eXBlOiBOdW1iZXIsIGRlZmF1bHQ6IDUwIH0sXG4gIGVuYWJsZUNvZDogeyB0eXBlOiBCb29sZWFuLCBkZWZhdWx0OiB0cnVlIH0sXG4gIGVuYWJsZUV4cHJlc3M6IHsgdHlwZTogQm9vbGVhbiwgZGVmYXVsdDogdHJ1ZSB9LFxuICBlbmFibGVJbnRlcm5hdGlvbmFsOiB7IHR5cGU6IEJvb2xlYW4sIGRlZmF1bHQ6IGZhbHNlIH1cbn0pO1xuXG5jb25zdCBGZWF0dXJlU2NoZW1hID0gbmV3IG1vbmdvb3NlLlNjaGVtYSh7XG4gIGlkOiB7IHR5cGU6IE51bWJlciwgcmVxdWlyZWQ6IHRydWUsIHVuaXF1ZTogdHJ1ZSB9LFxuICBrZXk6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSwgdW5pcXVlOiB0cnVlIH0sXG4gIG5hbWU6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICB0aXRsZTogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICcnIH0sXG4gIHN1YnRpdGxlOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJycgfSxcbiAgc3RhdHVzOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJ0FjdGl2ZScgfSxcbiAgb3JkZXI6IHsgdHlwZTogTnVtYmVyLCByZXF1aXJlZDogdHJ1ZSB9XG59KTtcblxuXG4vLyDilIDilIDilIAgVmVuZG9yIFNjaGVtYXMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5jb25zdCBWZW5kb3JTY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKHtcbiAgaWQ6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSwgdW5pcXVlOiB0cnVlLCBpbmRleDogdHJ1ZSB9LFxuICBidXNpbmVzc05hbWU6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICBvd25lck5hbWU6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICBlbWFpbDogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlLCB1bmlxdWU6IHRydWUsIGluZGV4OiB0cnVlLCBsb3dlcmNhc2U6IHRydWUgfSxcbiAgcGFzc3dvcmQ6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICBwaG9uZTogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gIGdzdGluOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJycgfSxcbiAgcGFuOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJycgfSxcbiAgYnVzaW5lc3NDYXRlZ29yeTogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICcnIH0sXG4gIGJ1c2luZXNzRGVzY3JpcHRpb246IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnJyB9LFxuICBsb2dvOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJycgfSxcbiAgcGFuRG9jdW1lbnQ6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnJyB9LCAgICAgICAvLyBiYXNlNjQgLyBVUkxcbiAgY2FuY2VsbGVkQ2hlcXVlOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJycgfSwgICAvLyBiYXNlNjQgLyBVUkxcbiAgc3RhdHVzOiB7IHR5cGU6IFN0cmluZywgZW51bTogWydQZW5kaW5nJywgJ0FwcHJvdmVkJywgJ1JlamVjdGVkJywgJ1N1c3BlbmRlZCddLCBkZWZhdWx0OiAnUGVuZGluZycsIGluZGV4OiB0cnVlIH0sXG4gIHJlamVjdFJlYXNvbjogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICcnIH0sXG4gIGFkbWluTm90ZXM6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnJyB9LFxuICBhcHByb3ZlZEJ5OiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogbnVsbCwgcmVmOiAnVXNlcicgfSxcbiAgYXBwcm92ZWRBdDogeyB0eXBlOiBEYXRlLCBkZWZhdWx0OiBudWxsIH0sXG4gIGxhc3RMb2dpbkF0OiB7IHR5cGU6IERhdGUsIGRlZmF1bHQ6IG51bGwgfSxcbiAgYWRkcmVzczoge1xuICAgIHN0cmVldDogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICcnIH0sXG4gICAgY2l0eTogICB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJycgfSxcbiAgICBzdGF0ZTogIHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiAnJyB9LFxuICAgIHBpbmNvZGU6eyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICcnIH0sXG4gICAgY291bnRyeTp7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogJ0luZGlhJyB9XG4gIH0sXG4gIGJhbmtEZXRhaWxzOiB7XG4gICAgYWNjb3VudEhvbGRlcjogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICcnIH0sXG4gICAgYWNjb3VudE51bWJlcjogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICcnIH0sXG4gICAgaWZzY0NvZGU6ICAgICAgeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICcnIH0sXG4gICAgYmFua05hbWU6ICAgICAgeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6ICcnIH1cbiAgfVxufSwgeyB0aW1lc3RhbXBzOiB0cnVlIH0pO1xuXG5jb25zdCBWZW5kb3JOb3RpZmljYXRpb25TY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKHtcbiAgdmVuZG9ySWQ6ICB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUsIGluZGV4OiB0cnVlLCByZWY6ICdWZW5kb3InIH0sXG4gIHR5cGU6ICAgICAgeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sICAvLyAndmVuZG9yX2FwcHJvdmVkJ3wndmVuZG9yX3JlamVjdGVkJ3wncHJvZHVjdF9hcHByb3ZlZCd8J3Byb2R1Y3RfcmVqZWN0ZWQnfCduZXdfb3JkZXInfCdsb3dfc3RvY2snfCdzeXN0ZW0nXG4gIHRpdGxlOiAgICAgeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gIG1lc3NhZ2U6ICAgeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gIG1ldGFkYXRhOiAgeyB0eXBlOiBtb25nb29zZS5TY2hlbWEuVHlwZXMuTWl4ZWQsIGRlZmF1bHQ6IHt9IH0sXG4gIGlzUmVhZDogICAgeyB0eXBlOiBCb29sZWFuLCBkZWZhdWx0OiBmYWxzZSwgaW5kZXg6IHRydWUgfVxufSwgeyB0aW1lc3RhbXBzOiB0cnVlIH0pO1xuXG4vLyDilIDilIDilIAgRnV0dXJlLVJlYWR5IFNjaGVtYXMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5jb25zdCBOZXdzbGV0dGVyU2NoZW1hID0gbmV3IG1vbmdvb3NlLlNjaGVtYSh7XG4gIGVtYWlsOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUsIHVuaXF1ZTogdHJ1ZSB9LFxuICBzdWJzY3JpYmVkQXQ6IHsgdHlwZTogRGF0ZSwgZGVmYXVsdDogRGF0ZS5ub3cgfSxcbiAgYWN0aXZlOiB7IHR5cGU6IEJvb2xlYW4sIGRlZmF1bHQ6IHRydWUgfVxufSk7XG5cbmNvbnN0IENhbXBhaWduU2NoZW1hID0gbmV3IG1vbmdvb3NlLlNjaGVtYSh7XG4gIG5hbWU6IHsgdHlwZTogU3RyaW5nIH0sIC8vIHN1cHBvcnQgYmFja3dhcmQgY29tcGF0aWJpbGl0eVxuICBjYW1wYWlnbk5hbWU6IHsgdHlwZTogU3RyaW5nLCByZXF1aXJlZDogdHJ1ZSB9LFxuICBtaW5PcmRlclZhbHVlOiB7IHR5cGU6IE51bWJlciwgZGVmYXVsdDogMCB9LFxuICBtYXhPcmRlclZhbHVlOiB7IHR5cGU6IE51bWJlciwgZGVmYXVsdDogbnVsbCB9LFxuICByZXdhcmRCdWRnZXQ6IHsgdHlwZTogTnVtYmVyLCByZXF1aXJlZDogdHJ1ZSB9LFxuICB3aGVlbFByb2R1Y3RDb3VudDogeyB0eXBlOiBOdW1iZXIsIGRlZmF1bHQ6IDggfSxcbiAgY2FtcGFpZ25Vc2FnZUxpbWl0OiB7IHR5cGU6IE51bWJlciwgZGVmYXVsdDogbnVsbCB9LFxuICBzdGFydERhdGU6IHsgdHlwZTogRGF0ZSwgcmVxdWlyZWQ6IHRydWUgfSxcbiAgZW5kRGF0ZTogeyB0eXBlOiBEYXRlLCByZXF1aXJlZDogdHJ1ZSB9LFxuICBzdGF0dXM6IHsgdHlwZTogU3RyaW5nLCBlbnVtOiBbJ0FjdGl2ZScsICdJbmFjdGl2ZScsICdDb21wbGV0ZWQnXSwgZGVmYXVsdDogJ0FjdGl2ZScsIGluZGV4OiB0cnVlIH1cbn0pO1xuQ2FtcGFpZ25TY2hlbWEuaW5kZXgoeyBzdGF0dXM6IDEsIHN0YXJ0RGF0ZTogMSwgZW5kRGF0ZTogMSB9KTtcblxuY29uc3QgQW5hbHl0aWNzU2NoZW1hID0gbmV3IG1vbmdvb3NlLlNjaGVtYSh7XG4gIGV2ZW50OiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUgfSwgLy8gZS5nLiwgcGFnZV92aWV3LCBhZGRfdG9fY2FydCwgY2hlY2tvdXRcbiAgdXNlcklkOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogbnVsbCB9LFxuICBtZXRhZGF0YTogeyB0eXBlOiBtb25nb29zZS5TY2hlbWEuVHlwZXMuTWl4ZWQsIGRlZmF1bHQ6IHt9IH0sXG4gIHRpbWVzdGFtcDogeyB0eXBlOiBEYXRlLCBkZWZhdWx0OiBEYXRlLm5vdyB9XG59KTtcblxuXG5cbmNvbnN0IEx1Y2t5U3Bpbkhpc3RvcnlTY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKHtcbiAgdXNlcklkOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogbnVsbCwgaW5kZXg6IHRydWUgfSwgLy8gTWFwcyB0byBVc2VyIHN0cmluZyBJRFxuICB1c2VyOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogbnVsbCB9LCAvLyBTdG9yaW5nIFVzZXIgTmFtZSBvciBVc2VyIGRldGFpbHMgYXMgc3RyaW5nXG4gIGNhbXBhaWduSWQ6IHsgdHlwZTogbW9uZ29vc2UuU2NoZW1hLlR5cGVzLk9iamVjdElkLCByZWY6ICdDYW1wYWlnbicsIGRlZmF1bHQ6IG51bGwsIGluZGV4OiB0cnVlIH0sXG4gIGNhbXBhaWduOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogbnVsbCB9LCAvLyBTdG9yaW5nIENhbXBhaWduIE5hbWVcbiAgb3JkZXJJZDogeyB0eXBlOiBTdHJpbmcsIGRlZmF1bHQ6IG51bGwgfSwgLy8gU3RvcmluZyBPcmRlciBJRCBzdHJpbmdcbiAgb3JkZXI6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiBudWxsIH0sXG4gIHByb2R1Y3RJZDogeyB0eXBlOiBOdW1iZXIsIGRlZmF1bHQ6IG51bGwgfSwgLy8gU3RvcmluZyBQcm9kdWN0IElEIG51bWJlclxuICB3b25Qcm9kdWN0OiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogbnVsbCB9LCAvLyBTdG9yaW5nIFdvbiBQcm9kdWN0IG5hbWVcbiAgc3BpblRpbWU6IHsgdHlwZTogRGF0ZSwgZGVmYXVsdDogRGF0ZS5ub3cgfSxcbiAgY2xhaW1TdGF0dXM6IHsgdHlwZTogU3RyaW5nLCBlbnVtOiBbJ1BlbmRpbmcnLCAnQ2xhaW1lZCddLCBkZWZhdWx0OiAnUGVuZGluZycgfSxcbiAgXG4gIC8vIEVuaGFuY2VkIEFuYWx5dGljcyBGaWVsZHNcbiAgc2Vzc2lvbklkOiB7IHR5cGU6IFN0cmluZywgZGVmYXVsdDogbnVsbCB9LFxuICBjYXJ0VG90YWw6IHsgdHlwZTogTnVtYmVyLCBkZWZhdWx0OiAwIH0sXG4gIHJld2FyZEJ1ZGdldDogeyB0eXBlOiBOdW1iZXIsIGRlZmF1bHQ6IDAgfSxcbiAgd29uUHJvZHVjdFByaWNlOiB7IHR5cGU6IE51bWJlciwgZGVmYXVsdDogMCB9LFxuICBsdWNreVN0b2NrQmVmb3JlOiB7IHR5cGU6IE51bWJlciwgZGVmYXVsdDogMCB9LFxuICBsdWNreVN0b2NrQWZ0ZXI6IHsgdHlwZTogTnVtYmVyLCBkZWZhdWx0OiAwIH0sXG4gIHNwaW5EdXJhdGlvbjogeyB0eXBlOiBOdW1iZXIsIGRlZmF1bHQ6IDAgfVxufSk7XG5MdWNreVNwaW5IaXN0b3J5U2NoZW1hLmluZGV4KHsgdXNlcklkOiAxLCBjbGFpbVN0YXR1czogMSwgb3JkZXJJZDogMSB9KTtcblxuY29uc3QgVXNlciA9IG1vbmdvb3NlLm1vZGVsKCdVc2VyJywgVXNlclNjaGVtYSk7XG5jb25zdCBQcm9kdWN0ID0gbW9uZ29vc2UubW9kZWwoJ1Byb2R1Y3QnLCBQcm9kdWN0U2NoZW1hKTtcbmNvbnN0IENhdGVnb3J5ID0gbW9uZ29vc2UubW9kZWwoJ0NhdGVnb3J5JywgQ2F0ZWdvcnlTY2hlbWEpO1xuY29uc3QgQ2F0YWxvZ3VlID0gbW9uZ29vc2UubW9kZWwoJ0NhdGFsb2d1ZScsIENhdGFsb2d1ZVNjaGVtYSk7XG5jb25zdCBPcmRlciA9IG1vbmdvb3NlLm1vZGVsKCdPcmRlcicsIE9yZGVyU2NoZW1hKTtcbmNvbnN0IENvdXBvbiA9IG1vbmdvb3NlLm1vZGVsKCdDb3Vwb24nLCBDb3Vwb25TY2hlbWEpO1xuY29uc3QgUmV2aWV3ID0gbW9uZ29vc2UubW9kZWwoJ1JldmlldycsIFJldmlld1NjaGVtYSk7XG5jb25zdCBCYW5uZXIgPSBtb25nb29zZS5tb2RlbCgnQmFubmVyJywgQmFubmVyU2NoZW1hKTtcbmNvbnN0IEFubm91bmNlbWVudCA9IG1vbmdvb3NlLm1vZGVsKCdBbm5vdW5jZW1lbnQnLCBBbm5vdW5jZW1lbnRTY2hlbWEpO1xuY29uc3QgQ29udGFjdFF1ZXJ5ID0gbW9uZ29vc2UubW9kZWwoJ0NvbnRhY3RRdWVyeScsIENvbnRhY3RRdWVyeVNjaGVtYSk7XG5jb25zdCBTZXR0aW5ncyA9IG1vbmdvb3NlLm1vZGVsKCdTZXR0aW5ncycsIFNldHRpbmdzU2NoZW1hKTtcbmNvbnN0IEZlYXR1cmUgPSBtb25nb29zZS5tb2RlbCgnRmVhdHVyZScsIEZlYXR1cmVTY2hlbWEpO1xuY29uc3QgVmVuZG9yID0gbW9uZ29vc2UubW9kZWwoJ1ZlbmRvcicsIFZlbmRvclNjaGVtYSk7XG5jb25zdCBWZW5kb3JOb3RpZmljYXRpb24gPSBtb25nb29zZS5tb2RlbCgnVmVuZG9yTm90aWZpY2F0aW9uJywgVmVuZG9yTm90aWZpY2F0aW9uU2NoZW1hKTtcblxuLy8g4pSA4pSA4pSAIFNlZWQgRGF0YSDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbmFzeW5jIGZ1bmN0aW9uIHNlZWRTdG9yZURhdGEoKSB7XG4gIHRyeSB7XG4gICAgY29uc3Qgc2V0dGluZ3NEb2MgPSBhd2FpdCBTZXR0aW5ncy5maW5kT25lKCk7XG4gICAgaWYgKCFzZXR0aW5nc0RvYykge1xuICAgICAgYXdhaXQgU2V0dGluZ3MuY3JlYXRlKHt9KTtcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgRGVmYXVsdCBzZXR0aW5ncyBzZWVkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgfVxuXG4gICAgLy8gU2VlZCBkZWZhdWx0IGNvdXBvbnMgaWYgbm90IGV4aXN0XG4gICAgY29uc3QgZXhpc3RpbmdMMTAgPSBhd2FpdCBDb3Vwb24uZmluZE9uZSh7IGNvZGU6ICdMVUNLWTEwJyB9KTtcbiAgICBpZiAoIWV4aXN0aW5nTDEwKSB7XG4gICAgICBhd2FpdCBDb3Vwb24uY3JlYXRlKHtcbiAgICAgICAgY29kZTogJ0xVQ0tZMTAnLFxuICAgICAgICBkaXNjb3VudDogJzEwJyxcbiAgICAgICAgdHlwZTogJ1BlcmNlbnRhZ2UnLFxuICAgICAgICBtaW5DYXJ0OiAn4oK5MCcsXG4gICAgICAgIGV4cGlyeTogJzIwMjctMTItMzEnLFxuICAgICAgICB1c2FnZTogJzAvMTAwMCcsXG4gICAgICAgIHN0YXR1czogJ0FjdGl2ZSdcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coJ+KchSBDb3Vwb24gTFVDS1kxMCBzZWVkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgfVxuXG4gICAgY29uc3QgZXhpc3RpbmdNMTAwID0gYXdhaXQgQ291cG9uLmZpbmRPbmUoeyBjb2RlOiAnTUlUSFJBMTAwJyB9KTtcbiAgICBpZiAoIWV4aXN0aW5nTTEwMCkge1xuICAgICAgYXdhaXQgQ291cG9uLmNyZWF0ZSh7XG4gICAgICAgIGNvZGU6ICdNSVRIUkExMDAnLFxuICAgICAgICBkaXNjb3VudDogJzEwMCcsXG4gICAgICAgIHR5cGU6ICdGbGF0JyxcbiAgICAgICAgbWluQ2FydDogJ+KCuTUwMCcsXG4gICAgICAgIGV4cGlyeTogJzIwMjctMTItMzEnLFxuICAgICAgICB1c2FnZTogJzAvMTAwMCcsXG4gICAgICAgIHN0YXR1czogJ0FjdGl2ZSdcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coJ+KchSBDb3Vwb24gTUlUSFJBMTAwIHNlZWRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICB9XG5cblxuXG4gICAgY29uc3QgZGVmYXVsdEZlYXR1cmVzID0gW1xuICAgICAgeyBpZDogMSwga2V5OiAnaGVybycsIG5hbWU6ICdIZXJvIENhcm91c2VsJywgdGl0bGU6ICdDdXJhdGVkIEVsZWdhbmNlJywgc3VidGl0bGU6ICdFeHBsb3JlIE1pdGhpcmEgU2hvcHkgY29sbGVjdGlvbnMnLCBzdGF0dXM6ICdBY3RpdmUnLCBvcmRlcjogMSB9LFxuICAgICAgeyBpZDogMiwga2V5OiAndHJ1c3RfYmFyJywgbmFtZTogJ1RydXN0IEJhcicsIHRpdGxlOiAnV2h5IFlvdSBDYW4gVHJ1c3QgVXMnLCBzdWJ0aXRsZTogJ091ciBjb21taXRtZW50cyB0byB5b3UnLCBzdGF0dXM6ICdBY3RpdmUnLCBvcmRlcjogMiB9LFxuICAgICAgeyBpZDogMywga2V5OiAnY2F0ZWdvcmllcycsIG5hbWU6ICdTaG9wIGJ5IFRvcCBDYXRlZ29yaWVzJywgdGl0bGU6ICdTaG9wIGJ5IFRvcCBDYXRlZ29yaWVzJywgc3VidGl0bGU6ICdFeHBsb3JlIG91ciB0b3AgY2F0ZWdvcmllcyBhbmQgZmluZCB5b3VyIHBlcmZlY3Qgc3R5bGUnLCBzdGF0dXM6ICdBY3RpdmUnLCBvcmRlcjogMyB9LFxuICAgICAgeyBpZDogNCwga2V5OiAndmlkZW9fc2hvd2Nhc2UnLCBuYW1lOiAnVmlkZW8gU2hvd2Nhc2UnLCB0aXRsZTogJ1ZpZGVvIFRvdXInLCBzdWJ0aXRsZTogJ1Rha2UgYSB2aXJ0dWFsIGxvb2sgaW5zaWRlIG91ciBib3V0aXF1ZScsIHN0YXR1czogJ0FjdGl2ZScsIG9yZGVyOiA0IH0sXG4gICAgICB7IGlkOiA1LCBrZXk6ICdleGNsdXNpdmVfcHJvZHVjdHMnLCBuYW1lOiAnRXhjbHVzaXZlIFByb2R1Y3RzJywgdGl0bGU6ICdFeGNsdXNpdmUgQ29sbGVjdGlvbicsIHN1YnRpdGxlOiAnSGFuZHBpY2tlZCBwcmVtaXVtIGZhc2hpb24gYm91dGlxdWUgaXRlbXMnLCBzdGF0dXM6ICdBY3RpdmUnLCBvcmRlcjogNSB9LFxuICAgICAgeyBpZDogNiwga2V5OiAnY2VsZWJyaXR5X2NvbGxlY3Rpb24nLCBuYW1lOiAnQ2VsZWJyaXR5IENvbGxlY3Rpb24nLCB0aXRsZTogJ0NlbGVicml0eSBDb2xsZWN0aW9ucycsIHN1YnRpdGxlOiAnSW5zcGlyZWQgYnkgbGVhZGluZyBmYXNoaW9uIGluZmx1ZW5jZXJzJywgc3RhdHVzOiAnQWN0aXZlJywgb3JkZXI6IDYgfSxcbiAgICAgIHsgaWQ6IDcsIGtleTogJ3doeV9jaG9vc2VfdXMnLCBuYW1lOiAnV2h5IENob29zZSBVcycsIHRpdGxlOiAnV2h5IENob29zZSBNaXRocmEgU2hvcHknLCBzdWJ0aXRsZTogJ0RpcmVjdC1mcm9tLXdlYXZlciBwcmVtaXVtIHF1YWxpdHkgaXRlbXMnLCBzdGF0dXM6ICdBY3RpdmUnLCBvcmRlcjogNyB9XG4gICAgXTtcblxuICAgIGZvciAoY29uc3QgZiBvZiBkZWZhdWx0RmVhdHVyZXMpIHtcbiAgICAgIGNvbnN0IGV4aXN0aW5nRiA9IGF3YWl0IEZlYXR1cmUuZmluZE9uZSh7IGtleTogZi5rZXkgfSk7XG4gICAgICBpZiAoIWV4aXN0aW5nRikge1xuICAgICAgICBhd2FpdCBGZWF0dXJlLmNyZWF0ZShmKTtcbiAgICAgICAgY29uc29sZS5sb2coYOKchSBTZWVkZWQgZmVhdHVyZSBmdW5jdGlvbmFsaXR5OiAke2YubmFtZX1gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IFByb2R1Y3QuZmluZE9uZSh7IGlkOiAyIH0pO1xuICAgIGlmICghZXhpc3RpbmcpIHtcbiAgICAgIGF3YWl0IFByb2R1Y3QuY3JlYXRlKHtcbiAgICAgICAgaWQ6IDIsXG4gICAgICAgIG5hbWU6ICdXb21lbiBLdXJ0aScsXG4gICAgICAgIGNhdGVnb3J5OiAnQ2xvdGhpbmcgPiBXb21lbicsXG4gICAgICAgIGNhdGFsb2d1ZTogJ0NhdGFsb2d1ZSBBJyxcbiAgICAgICAgcHJpY2U6IDg5OSxcbiAgICAgICAgc3RvY2s6IDQwLFxuICAgICAgICBzYWxlczogNDgsXG4gICAgICAgIHN0YXR1czogJ0FjdGl2ZScsXG4gICAgICAgIGltYWdlOiAnS2lkcycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmVsYXhlZCBmaXQgd29tZW4ga3VydGkuJ1xuICAgICAgfSk7XG4gICAgICBjb25zb2xlLmxvZygn4pyFIFdvbWVuIEt1cnRpIHNlZWRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICB9XG5cbiAgICAvLyBTZWVkIHRoZSAzIG5ldyBwcmVtaXVtIHByb2R1Y3RzIHJlcXVlc3RlZCBieSB1c2VyXG4gICAgY29uc3QgZXhpc3RpbmdQdXJwbGVOb3RlYm9vayA9IGF3YWl0IFByb2R1Y3QuZmluZE9uZSh7IGlkOiAxMDEgfSk7XG4gICAgaWYgKCFleGlzdGluZ1B1cnBsZU5vdGVib29rKSB7XG4gICAgICBhd2FpdCBQcm9kdWN0LmNyZWF0ZSh7XG4gICAgICAgIGlkOiAxMDEsXG4gICAgICAgIG5hbWU6ICdQdXJwbGUgTm90ZWJvb2snLFxuICAgICAgICBjYXRlZ29yeTogJ1N0YXRpb25lcnkgPiBCb29rJyxcbiAgICAgICAgc3ViQ2F0ZWdvcnk6ICdib29rJyxcbiAgICAgICAgY2F0YWxvZ3VlOiAnQ2F0YWxvZ3VlIEEnLFxuICAgICAgICBwcmljZTogMzk5LFxuICAgICAgICBzdG9jazogNTAsXG4gICAgICAgIHNhbGVzOiAxNSxcbiAgICAgICAgc3RhdHVzOiAnQWN0aXZlJyxcbiAgICAgICAgaW1hZ2U6ICdwdXJwbGVfbm90ZWJvb2suanBnJyxcbiAgICAgICAgaW1hZ2VzOiBbJ3B1cnBsZV9ub3RlYm9vay5qcGcnXSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBIHByZW1pdW0gc29mdC1ib3VuZCBwdXJwbGUgbm90ZWJvb2sgd2l0aCBlbGVnYW50IGVtYm9zc2VkIGRldGFpbHMsIGZlYXR1cmluZyBnb2xkLWVkZ2VkIHBhZ2VzIGFuZCBhIG1hdGNoaW5nIGJvb2ttYXJrIHJpYmJvbi4nLFxuICAgICAgICBicmFuZDogJ01pdGhpcmEgTHV4ZScsXG4gICAgICAgIHJhdGluZzogNC45LFxuICAgICAgICByZXZpZXdzOiA0MixcbiAgICAgICAgZGlzY291bnQ6IDE1LFxuICAgICAgICBvcmlnaW5hbFByaWNlOiA0NjlcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coJ+KchSBQdXJwbGUgTm90ZWJvb2sgKGlkOiAxMDEpIHNlZWRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICB9XG5cbiAgICBjb25zdCBleGlzdGluZ0FuYXJrYWxpID0gYXdhaXQgUHJvZHVjdC5maW5kT25lKHsgaWQ6IDEwMiB9KTtcbiAgICBpZiAoIWV4aXN0aW5nQW5hcmthbGkpIHtcbiAgICAgIGF3YWl0IFByb2R1Y3QuY3JlYXRlKHtcbiAgICAgICAgaWQ6IDEwMixcbiAgICAgICAgbmFtZTogJ0FuYXJrYWxpJyxcbiAgICAgICAgY2F0ZWdvcnk6ICdDbG90aGluZyA+IFdvbWVuID4gS3VydGknLFxuICAgICAgICBzdWJDYXRlZ29yeTogJ2t1cnRpJyxcbiAgICAgICAgY2F0YWxvZ3VlOiAnQ2F0YWxvZ3VlIEEnLFxuICAgICAgICBwcmljZTogMjQ5OSxcbiAgICAgICAgc3RvY2s6IDM1LFxuICAgICAgICBzYWxlczogMjgsXG4gICAgICAgIHN0YXR1czogJ0FjdGl2ZScsXG4gICAgICAgIGltYWdlOiAnZ3JlZW5fYW5hcmthbGkuanBnJyxcbiAgICAgICAgaW1hZ2VzOiBbJ2dyZWVuX2FuYXJrYWxpLmpwZyddLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0FuIGVsZWdhbnQgZ3JlZW4gQW5hcmthbGkgZHJlc3MgZmVhdHVyaW5nIGludHJpY2F0ZSBnb2xkZW4gZW1icm9pZGVyeSwgYSBmbGFyZWQgc2lsaG91ZXR0ZSwgYW5kIGZ1bGwgc2xlZXZlcy4gUGVyZmVjdCBmb3IgZmVzdGl2ZSBvY2Nhc2lvbnMuJyxcbiAgICAgICAgYnJhbmQ6ICdNaXRoaXJhIEhlcml0YWdlJyxcbiAgICAgICAgcmF0aW5nOiA1LjAsXG4gICAgICAgIHJldmlld3M6IDg4LFxuICAgICAgICBkaXNjb3VudDogMjAsXG4gICAgICAgIG9yaWdpbmFsUHJpY2U6IDMxMjVcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coJ+KchSBBbmFya2FsaSAoaWQ6IDEwMikgc2VlZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4aXN0aW5nQmx1ZVN1aXQgPSBhd2FpdCBQcm9kdWN0LmZpbmRPbmUoeyBpZDogMTAzIH0pO1xuICAgIGlmICghZXhpc3RpbmdCbHVlU3VpdCkge1xuICAgICAgYXdhaXQgUHJvZHVjdC5jcmVhdGUoe1xuICAgICAgICBpZDogMTAzLFxuICAgICAgICBuYW1lOiAnQmx1ZSBGb3JtYWwgU3VpdCcsXG4gICAgICAgIGNhdGVnb3J5OiAnQ2xvdGhpbmcgPiBNZW4gPiBmb3JtYWwgc3VpdGVzJyxcbiAgICAgICAgc3ViQ2F0ZWdvcnk6ICdmb3JtYWwgc3VpdGVzJyxcbiAgICAgICAgY2F0YWxvZ3VlOiAnQ2F0YWxvZ3VlIEEnLFxuICAgICAgICBwcmljZTogNDk5OSxcbiAgICAgICAgc3RvY2s6IDIwLFxuICAgICAgICBzYWxlczogMTIsXG4gICAgICAgIHN0YXR1czogJ0FjdGl2ZScsXG4gICAgICAgIGltYWdlOiAnYmx1ZV9zdWl0LmpwZycsXG4gICAgICAgIGltYWdlczogWydibHVlX3N1aXQuanBnJ10sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQSBzbGltLWZpdCByb3lhbCBibHVlIGZvcm1hbCBzdWl0IGZlYXR1cmluZyBhIHNpbmdsZS1icmVhc3RlZCBibGF6ZXIgYW5kIG1hdGNoaW5nIHRyb3VzZXJzLiBDcmFmdGVkIGZyb20gcHJlbWl1bSB3b29sLWJsZW5kIGZhYnJpYyBmb3IgYSBzb3BoaXN0aWNhdGVkIGxvb2suJyxcbiAgICAgICAgYnJhbmQ6ICdBdXJlbGlhbiBOb2lyJyxcbiAgICAgICAgcmF0aW5nOiA0LjgsXG4gICAgICAgIHJldmlld3M6IDM2LFxuICAgICAgICBkaXNjb3VudDogMTAsXG4gICAgICAgIG9yaWdpbmFsUHJpY2U6IDU1NTBcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coJ+KchSBCbHVlIEZvcm1hbCBTdWl0IChpZDogMTAzKSBzZWVkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgfVxuXG4gICAgLy8gU2VlZCA1IG5ldyBleGNsdXNpdmUgcHJvZHVjdHMgcmVxdWVzdGVkIGJ5IHVzZXIgKHJlcGxhY2UgcHJldmlvdXMgMyBvbiBob21lIHBhZ2UpXG4gICAgY29uc3QgZXhpc3RpbmdXaGl0ZUdvd24gPSBhd2FpdCBQcm9kdWN0LmZpbmRPbmUoeyBpZDogMTA0IH0pO1xuICAgIGlmICghZXhpc3RpbmdXaGl0ZUdvd24pIHtcbiAgICAgIGF3YWl0IFByb2R1Y3QuY3JlYXRlKHtcbiAgICAgICAgaWQ6IDEwNCxcbiAgICAgICAgbmFtZTogJ1doaXRlIExhY2UgR293bicsXG4gICAgICAgIGNhdGVnb3J5OiAnQ2xvdGhpbmcgPiBLaWRzID4gR2lybHMgPiBHb3ducycsXG4gICAgICAgIHN1YkNhdGVnb3J5OiAnR293bnMnLFxuICAgICAgICBjYXRhbG9ndWU6ICdDYXRhbG9ndWUgQScsXG4gICAgICAgIHByaWNlOiAxODk5LFxuICAgICAgICBzdG9jazogMzAsXG4gICAgICAgIHNhbGVzOiAyMixcbiAgICAgICAgc3RhdHVzOiAnQWN0aXZlJyxcbiAgICAgICAgaW1hZ2U6ICd3aGl0ZV9nb3duLmpwZycsXG4gICAgICAgIGltYWdlczogWyd3aGl0ZV9nb3duLmpwZyddLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0FuIGVuY2hhbnRpbmcgd2hpdGUgbGFjZSBnb3duIGZvciBnaXJscyB3aXRoIGEgYmVhdXRpZnVsIHNhdGluIGJvdyBiZWx0LCBsYXllcmVkIHRpZXJlZCBza2lydCwgYW5kIGRlbGljYXRlIGZsb3JhbCBsYWNlIGRldGFpbGluZy4gUGVyZmVjdCBmb3IgcGFydGllcyBhbmQgc3BlY2lhbCBvY2Nhc2lvbnMuJyxcbiAgICAgICAgYnJhbmQ6ICdNaXRoaXJhIEtpZHMnLFxuICAgICAgICByYXRpbmc6IDQuOSxcbiAgICAgICAgcmV2aWV3czogNjQsXG4gICAgICAgIGRpc2NvdW50OiAxNSxcbiAgICAgICAgb3JpZ2luYWxQcmljZTogMjIzNVxuICAgICAgfSk7XG4gICAgICBjb25zb2xlLmxvZygn4pyFIFdoaXRlIExhY2UgR293biAoaWQ6IDEwNCkgc2VlZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4aXN0aW5nUHJlbWl1bUdpZnRTZXQgPSBhd2FpdCBQcm9kdWN0LmZpbmRPbmUoeyBpZDogMTA1IH0pO1xuICAgIGlmICghZXhpc3RpbmdQcmVtaXVtR2lmdFNldCkge1xuICAgICAgYXdhaXQgUHJvZHVjdC5jcmVhdGUoe1xuICAgICAgICBpZDogMTA1LFxuICAgICAgICBuYW1lOiAnUHJlbWl1bSBHaWZ0IFNldCcsXG4gICAgICAgIGNhdGVnb3J5OiAnR2lmdHMnLFxuICAgICAgICBzdWJDYXRlZ29yeTogJ0dpZnQgSGFtcGVyJyxcbiAgICAgICAgY2F0YWxvZ3VlOiAnQ2F0YWxvZ3VlIEEnLFxuICAgICAgICBwcmljZTogMTQ5OSxcbiAgICAgICAgc3RvY2s6IDQ1LFxuICAgICAgICBzYWxlczogMzgsXG4gICAgICAgIHN0YXR1czogJ0FjdGl2ZScsXG4gICAgICAgIGltYWdlOiAncHJlbWl1bV9naWZ0X3NldC5qcGcnLFxuICAgICAgICBpbWFnZXM6IFsncHJlbWl1bV9naWZ0X3NldC5qcGcnXSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBIGx1eHVyaW91cyBwcmVtaXVtIGdpZnQgc2V0IGZlYXR1cmluZyBiZWF1dGlmdWxseSB3cmFwcGVkIGdyZWVuIGFuZCBpdm9yeSBib3hlcyB0aWVkIHdpdGggZ29sZCBzYXRpbiByaWJib25zLiBQZXJmZWN0IGZvciBiaXJ0aGRheXMsIGFubml2ZXJzYXJpZXMsIGFuZCBjZWxlYnJhdGlvbnMuJyxcbiAgICAgICAgYnJhbmQ6ICdNaXRoaXJhIEdpZnRpbmcnLFxuICAgICAgICByYXRpbmc6IDQuOCxcbiAgICAgICAgcmV2aWV3czogMTEyLFxuICAgICAgICBkaXNjb3VudDogMTAsXG4gICAgICAgIG9yaWdpbmFsUHJpY2U6IDE2NjVcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coJ+KchSBQcmVtaXVtIEdpZnQgU2V0IChpZDogMTA1KSBzZWVkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgfVxuXG4gICAgY29uc3QgZXhpc3RpbmdLaWRzRm9ybWFsU3VpdCA9IGF3YWl0IFByb2R1Y3QuZmluZE9uZSh7IGlkOiAxMDYgfSk7XG4gICAgaWYgKCFleGlzdGluZ0tpZHNGb3JtYWxTdWl0KSB7XG4gICAgICBhd2FpdCBQcm9kdWN0LmNyZWF0ZSh7XG4gICAgICAgIGlkOiAxMDYsXG4gICAgICAgIG5hbWU6ICdLaWRzIEZvcm1hbCBTdWl0JyxcbiAgICAgICAgY2F0ZWdvcnk6ICdDbG90aGluZyA+IEtpZHMgPiBGb3JtYWwnLFxuICAgICAgICBzdWJDYXRlZ29yeTogJ0Zvcm1hbCcsXG4gICAgICAgIGNhdGFsb2d1ZTogJ0NhdGFsb2d1ZSBBJyxcbiAgICAgICAgcHJpY2U6IDIyOTksXG4gICAgICAgIHN0b2NrOiAyNSxcbiAgICAgICAgc2FsZXM6IDE4LFxuICAgICAgICBzdGF0dXM6ICdBY3RpdmUnLFxuICAgICAgICBpbWFnZTogJ2tpZHNfZm9ybWFsX3N1aXQuanBnJyxcbiAgICAgICAgaW1hZ2VzOiBbJ2tpZHNfZm9ybWFsX3N1aXQuanBnJ10sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQSBzaGFycCBjaGFyY29hbCBncmV5IGZvcm1hbCB2ZXN0IHN1aXQgd2l0aCBtYXRjaGluZyB0cm91c2VycyBhbmQgYSBuYXZ5IGJsdWUgYm93IHRpZSBmb3IgYm95cy4gSWRlYWwgZm9yIHNjaG9vbCBldmVudHMsIHdlZGRpbmdzLCBhbmQgZm9ybWFsIG9jY2FzaW9ucy4nLFxuICAgICAgICBicmFuZDogJ01pdGhpcmEgS2lkcycsXG4gICAgICAgIHJhdGluZzogNC43LFxuICAgICAgICByZXZpZXdzOiA0NSxcbiAgICAgICAgZGlzY291bnQ6IDEyLFxuICAgICAgICBvcmlnaW5hbFByaWNlOiAyNjEzXG4gICAgICB9KTtcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgS2lkcyBGb3JtYWwgU3VpdCAoaWQ6IDEwNikgc2VlZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4aXN0aW5nR29sZEFua2xldHMgPSBhd2FpdCBQcm9kdWN0LmZpbmRPbmUoeyBpZDogMTA3IH0pO1xuICAgIGlmICghZXhpc3RpbmdHb2xkQW5rbGV0cykge1xuICAgICAgYXdhaXQgUHJvZHVjdC5jcmVhdGUoe1xuICAgICAgICBpZDogMTA3LFxuICAgICAgICBuYW1lOiAnR29sZCBBbmtsZXRzJyxcbiAgICAgICAgY2F0ZWdvcnk6ICdBY2Nlc3NvcmllcyA+IEpld2VsbGVyeSA+IEFua2xldHMnLFxuICAgICAgICBzdWJDYXRlZ29yeTogJ0Fua2xldHMnLFxuICAgICAgICBjYXRhbG9ndWU6ICdDYXRhbG9ndWUgQScsXG4gICAgICAgIHByaWNlOiA4OTksXG4gICAgICAgIHN0b2NrOiA2MCxcbiAgICAgICAgc2FsZXM6IDQ1LFxuICAgICAgICBzdGF0dXM6ICdBY3RpdmUnLFxuICAgICAgICBpbWFnZTogJ2dvbGRfYW5rbGV0cy5qcGcnLFxuICAgICAgICBpbWFnZXM6IFsnZ29sZF9hbmtsZXRzLmpwZyddLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0VsZWdhbnQgdHJhZGl0aW9uYWwgZ29sZC1wbGF0ZWQgYW5rbGV0cyB3aXRoIGRlbGljYXRlIGJlbGwgY2hhcm1zIGFuZCBpbnRyaWNhdGUgY2hhaW4gbGlua3MuIEFkZHMgYSB0b3VjaCBvZiBncmFjZSBhbmQgdHJhZGl0aW9uIHRvIGFueSBvdXRmaXQuJyxcbiAgICAgICAgYnJhbmQ6ICdNaXRoaXJhIEpld2VscycsXG4gICAgICAgIHJhdGluZzogNS4wLFxuICAgICAgICByZXZpZXdzOiAxMzIsXG4gICAgICAgIGRpc2NvdW50OiAyMCxcbiAgICAgICAgb3JpZ2luYWxQcmljZTogMTEyNFxuICAgICAgfSk7XG4gICAgICBjb25zb2xlLmxvZygn4pyFIEdvbGQgQW5rbGV0cyAoaWQ6IDEwNykgc2VlZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4aXN0aW5nRGlhbW9uZFJpbmcgPSBhd2FpdCBQcm9kdWN0LmZpbmRPbmUoeyBpZDogMTA4IH0pO1xuICAgIGlmICghZXhpc3RpbmdEaWFtb25kUmluZykge1xuICAgICAgYXdhaXQgUHJvZHVjdC5jcmVhdGUoe1xuICAgICAgICBpZDogMTA4LFxuICAgICAgICBuYW1lOiAnRGlhbW9uZCBHaW5rZ28gUmluZycsXG4gICAgICAgIGNhdGVnb3J5OiAnQWNjZXNzb3JpZXMgPiBKZXdlbGxlcnkgPiBSaW5nJyxcbiAgICAgICAgc3ViQ2F0ZWdvcnk6ICdSaW5nJyxcbiAgICAgICAgY2F0YWxvZ3VlOiAnQ2F0YWxvZ3VlIEEnLFxuICAgICAgICBwcmljZTogNzQ5OSxcbiAgICAgICAgc3RvY2s6IDE1LFxuICAgICAgICBzYWxlczogOCxcbiAgICAgICAgc3RhdHVzOiAnQWN0aXZlJyxcbiAgICAgICAgaW1hZ2U6ICdkaWFtb25kX3JpbmcuanBnJyxcbiAgICAgICAgaW1hZ2VzOiBbJ2RpYW1vbmRfcmluZy5qcGcnXSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBIGJyZWF0aHRha2luZyAxOEsgZ29sZCByaW5nIGluc3BpcmVkIGJ5IHRoZSBnaW5rZ28gbGVhZiB3aXRoIGRpYW1vbmQgYWNjZW50cy4gRmVhdHVyZXMgaGFuZC1ldGNoZWQgYm90YW5pY2FsIGRldGFpbGluZyBhbmQgYnJpbGxpYW50LWN1dCBkaWFtb25kcyBmb3IgYW4gZXhxdWlzaXRlLCBuYXR1cmUtaW5zcGlyZWQgbG9vay4nLFxuICAgICAgICBicmFuZDogJ0F1cmVsaWFuIEpld2VscycsXG4gICAgICAgIHJhdGluZzogNS4wLFxuICAgICAgICByZXZpZXdzOiAyOCxcbiAgICAgICAgZGlzY291bnQ6IDUsXG4gICAgICAgIG9yaWdpbmFsUHJpY2U6IDc4OTRcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coJ+KchSBEaWFtb25kIEdpbmtnbyBSaW5nIChpZDogMTA4KSBzZWVkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgfVxuXG4gICAgLy8gU2VlZCA1IG1vcmUgbmV3IGV4Y2x1c2l2ZSBwcm9kdWN0cyAoMTA5LTExMykgcmVxdWVzdGVkIGJ5IHVzZXIg4oCUIERPIE5PVCByZW1vdmUgZXhpc3RpbmcgMTA0LTEwOFxuICAgIGNvbnN0IGV4aXN0aW5nSGVhdnlKb2tlciA9IGF3YWl0IFByb2R1Y3QuZmluZE9uZSh7IGlkOiAxMDkgfSk7XG4gICAgaWYgKCFleGlzdGluZ0hlYXZ5Sm9rZXIpIHtcbiAgICAgIGF3YWl0IFByb2R1Y3QuY3JlYXRlKHtcbiAgICAgICAgaWQ6IDEwOSxcbiAgICAgICAgbmFtZTogJ0hlYXZ5IFdvcmtlZCBKb2tlciBOZWNrbGFjZScsXG4gICAgICAgIGNhdGVnb3J5OiAnQWNjZXNzb3JpZXMgPiBKZXdlbGxlcnkgPiBIZWF2eSBXb3JrZWQgSm9rZXInLFxuICAgICAgICBzdWJDYXRlZ29yeTogJ0hlYXZ5IFdvcmtlZCBKb2tlcicsXG4gICAgICAgIGNhdGFsb2d1ZTogJ0NhdGFsb2d1ZSBBJyxcbiAgICAgICAgcHJpY2U6IDEyOTk5LFxuICAgICAgICBzdG9jazogMTAsXG4gICAgICAgIHNhbGVzOiA2LFxuICAgICAgICBzdGF0dXM6ICdBY3RpdmUnLFxuICAgICAgICBpbWFnZTogJ2hlYXZ5X2pva2VyX25lY2tsYWNlLmpwZycsXG4gICAgICAgIGltYWdlczogWydoZWF2eV9qb2tlcl9uZWNrbGFjZS5qcGcnXSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBIG1hamVzdGljIGRpYW1vbmQtc3R1ZGRlZCBnb2xkIGpva2VyIG5lY2tsYWNlIHdpdGggaW50cmljYXRlIGZpbGlncmVlIHdvcmsgYW5kIGEgYnJlYXRodGFraW5nIHBlYXItc2hhcGVkIHBlbmRhbnQuIFRoZSBlcGl0b21lIG9mIGJyaWRhbCBsdXh1cnkgY3JhZnRzbWFuc2hpcC4nLFxuICAgICAgICBicmFuZDogJ0F1cmVsaWFuIEpld2VscycsXG4gICAgICAgIHJhdGluZzogNS4wLFxuICAgICAgICByZXZpZXdzOiAxOSxcbiAgICAgICAgZGlzY291bnQ6IDgsXG4gICAgICAgIG9yaWdpbmFsUHJpY2U6IDE0MTMwXG4gICAgICB9KTtcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgSGVhdnkgV29ya2VkIEpva2VyIE5lY2tsYWNlIChpZDogMTA5KSBzZWVkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgfVxuXG4gICAgY29uc3QgZXhpc3RpbmdTaW1wbGVDaGFpbiA9IGF3YWl0IFByb2R1Y3QuZmluZE9uZSh7IGlkOiAxMTAgfSk7XG4gICAgaWYgKCFleGlzdGluZ1NpbXBsZUNoYWluKSB7XG4gICAgICBhd2FpdCBQcm9kdWN0LmNyZWF0ZSh7XG4gICAgICAgIGlkOiAxMTAsXG4gICAgICAgIG5hbWU6ICdTaW1wbGUgQ2hhaW4gSmV3ZWxsZXJ5IFNldCcsXG4gICAgICAgIGNhdGVnb3J5OiAnQWNjZXNzb3JpZXMgPiBKZXdlbGxlcnkgPiBTaW1wbGUgQ2hhaW4nLFxuICAgICAgICBzdWJDYXRlZ29yeTogJ1NpbXBsZSBDaGFpbicsXG4gICAgICAgIGNhdGFsb2d1ZTogJ0NhdGFsb2d1ZSBBJyxcbiAgICAgICAgcHJpY2U6IDI0OTksXG4gICAgICAgIHN0b2NrOiA0MCxcbiAgICAgICAgc2FsZXM6IDU1LFxuICAgICAgICBzdGF0dXM6ICdBY3RpdmUnLFxuICAgICAgICBpbWFnZTogJ3NpbXBsZV9jaGFpbl9qZXdlbGxlcnkuanBnJyxcbiAgICAgICAgaW1hZ2VzOiBbJ3NpbXBsZV9jaGFpbl9qZXdlbGxlcnkuanBnJ10sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQW4gZWxlZ2FudCBldmVyeWRheSBqZXdlbGxlcnkgc2V0IGZlYXR1cmluZyBsYXllcmVkIGdvbGQgY2hhaW5zLCBwZWFybCBkcm9wIGVhcnJpbmdzLCBkaWFtb25kIGhvb3AgYnJhY2VsZXRzLCBhbmQgZGVsaWNhdGUgcmluZ3Mg4oCUIGFsbCBpbiBwcmVtaXVtIGdvbGQgcGxhdGluZyBvbiBhIHNvZnQgc2lsayBiYWNrZHJvcC4nLFxuICAgICAgICBicmFuZDogJ01pdGhpcmEgSmV3ZWxzJyxcbiAgICAgICAgcmF0aW5nOiA0LjksXG4gICAgICAgIHJldmlld3M6IDg3LFxuICAgICAgICBkaXNjb3VudDogMTgsXG4gICAgICAgIG9yaWdpbmFsUHJpY2U6IDMwNDhcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coJ+KchSBTaW1wbGUgQ2hhaW4gSmV3ZWxsZXJ5IFNldCAoaWQ6IDExMCkgc2VlZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4aXN0aW5nTHV4ZU5vdGVib29rID0gYXdhaXQgUHJvZHVjdC5maW5kT25lKHsgaWQ6IDExMSB9KTtcbiAgICBpZiAoIWV4aXN0aW5nTHV4ZU5vdGVib29rKSB7XG4gICAgICBhd2FpdCBQcm9kdWN0LmNyZWF0ZSh7XG4gICAgICAgIGlkOiAxMTEsXG4gICAgICAgIG5hbWU6ICdMdXhlIExlYXRoZXIgTm90ZWJvb2snLFxuICAgICAgICBjYXRlZ29yeTogJ1N0YXRpb25lcnkgPiBCb29rJyxcbiAgICAgICAgc3ViQ2F0ZWdvcnk6ICdCb29rJyxcbiAgICAgICAgY2F0YWxvZ3VlOiAnQ2F0YWxvZ3VlIEEnLFxuICAgICAgICBwcmljZTogNzQ5LFxuICAgICAgICBzdG9jazogNjAsXG4gICAgICAgIHNhbGVzOiAzNCxcbiAgICAgICAgc3RhdHVzOiAnQWN0aXZlJyxcbiAgICAgICAgaW1hZ2U6ICdsdXhlX2xlYXRoZXJfbm90ZWJvb2suanBnJyxcbiAgICAgICAgaW1hZ2VzOiBbJ2x1eGVfbGVhdGhlcl9ub3RlYm9vay5qcGcnXSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBIHByZW1pdW0gcHVycGxlIHZlZ2FuLWxlYXRoZXIgaGFyZGJvdW5kIG5vdGVib29rIHdpdGggZ29sZC1lZGdlZCBwYWdlcywgRmxldXItZGUtbGlzIGVtYm9zc2VkIGRldGFpbGluZywgc2F0aW4gYm9va21hcmsgcmliYm9uLCBhbmQgYSBtYXRjaGluZyBnb2xkIHBlbi4gUGVyZmVjdCBmb3Igam91cm5hbGluZyBhbmQgZ2lmdGluZy4nLFxuICAgICAgICBicmFuZDogJ01pdGhpcmEgTHV4ZScsXG4gICAgICAgIHJhdGluZzogNC44LFxuICAgICAgICByZXZpZXdzOiA2MSxcbiAgICAgICAgZGlzY291bnQ6IDEyLFxuICAgICAgICBvcmlnaW5hbFByaWNlOiA4NTFcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coJ+KchSBMdXhlIExlYXRoZXIgTm90ZWJvb2sgKGlkOiAxMTEpIHNlZWRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICB9XG5cbiAgICBjb25zdCBleGlzdGluZ0FuYXJrYWxpMiA9IGF3YWl0IFByb2R1Y3QuZmluZE9uZSh7IGlkOiAxMTIgfSk7XG4gICAgaWYgKCFleGlzdGluZ0FuYXJrYWxpMikge1xuICAgICAgYXdhaXQgUHJvZHVjdC5jcmVhdGUoe1xuICAgICAgICBpZDogMTEyLFxuICAgICAgICBuYW1lOiAnQW5hcmthbGknLFxuICAgICAgICBjYXRlZ29yeTogJ0Nsb3RoaW5nID4gV29tZW4gPiBLdXJ0aScsXG4gICAgICAgIHN1YkNhdGVnb3J5OiAnS3VydGknLFxuICAgICAgICBjYXRhbG9ndWU6ICdDYXRhbG9ndWUgQScsXG4gICAgICAgIHByaWNlOiAzMjk5LFxuICAgICAgICBzdG9jazogMjgsXG4gICAgICAgIHNhbGVzOiA0MSxcbiAgICAgICAgc3RhdHVzOiAnQWN0aXZlJyxcbiAgICAgICAgaW1hZ2U6ICdncmVlbl9hbmFya2FsaTIuanBnJyxcbiAgICAgICAgaW1hZ2VzOiBbJ2dyZWVuX2FuYXJrYWxpMi5qcGcnXSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBIHN0dW5uaW5nIGVtZXJhbGQgZ3JlZW4gQW5hcmthbGkgZ293biB3aXRoIHJpY2ggZ29sZCB6YXJpIGVtYnJvaWRlcnkgY292ZXJpbmcgdGhlIGZ1bGwgbGVuZ3RoIG9mIHRoZSBmbGFyZWQgc2tpcnQuIEZ1bGwgc2xlZXZlcyB3aXRoIGludHJpY2F0ZSBmbG9yYWwgbW90aWZzLiBUaGUgdWx0aW1hdGUgZmVzdGl2ZSBzdGF0ZW1lbnQgcGllY2UuJyxcbiAgICAgICAgYnJhbmQ6ICdNaXRoaXJhIEhlcml0YWdlJyxcbiAgICAgICAgcmF0aW5nOiA1LjAsXG4gICAgICAgIHJldmlld3M6IDEwMyxcbiAgICAgICAgZGlzY291bnQ6IDIyLFxuICAgICAgICBvcmlnaW5hbFByaWNlOiA0MjI5XG4gICAgICB9KTtcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgQW5hcmthbGkgMiAoaWQ6IDExMikgc2VlZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4aXN0aW5nQmx1ZUZvcm1hbFN1aXQyID0gYXdhaXQgUHJvZHVjdC5maW5kT25lKHsgaWQ6IDExMyB9KTtcbiAgICBpZiAoIWV4aXN0aW5nQmx1ZUZvcm1hbFN1aXQyKSB7XG4gICAgICBhd2FpdCBQcm9kdWN0LmNyZWF0ZSh7XG4gICAgICAgIGlkOiAxMTMsXG4gICAgICAgIG5hbWU6ICdCbHVlIEZvcm1hbCBTdWl0JyxcbiAgICAgICAgY2F0ZWdvcnk6ICdDbG90aGluZyA+IE1lbiA+IEZvcm1hbCBTdWl0ZXMnLFxuICAgICAgICBzdWJDYXRlZ29yeTogJ0Zvcm1hbCBTdWl0ZXMnLFxuICAgICAgICBjYXRhbG9ndWU6ICdDYXRhbG9ndWUgQScsXG4gICAgICAgIHByaWNlOiA1OTk5LFxuICAgICAgICBzdG9jazogMTgsXG4gICAgICAgIHNhbGVzOiAxNCxcbiAgICAgICAgc3RhdHVzOiAnQWN0aXZlJyxcbiAgICAgICAgaW1hZ2U6ICdibHVlX2Zvcm1hbF9zdWl0Mi5qcGcnLFxuICAgICAgICBpbWFnZXM6IFsnYmx1ZV9mb3JtYWxfc3VpdDIuanBnJ10sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQSBzaGFycCwgdGFpbG9yZWQgcm95YWwgYmx1ZSBzaW5nbGUtYnJlYXN0ZWQgZm9ybWFsIHN1aXQgd2l0aCBnb2xkLWJ1dHRvbiBkZXRhaWxpbmcgYnkgQXVyZWxpYW4gTm9pci4gQ3JhZnRlZCBmcm9tIHByZW1pdW0gSXRhbGlhbiB3b29sIGJsZW5kLCB0aGlzIHN1aXQgcmFkaWF0ZXMgcG93ZXIgYW5kIGVsZWdhbmNlLicsXG4gICAgICAgIGJyYW5kOiAnQXVyZWxpYW4gTm9pcicsXG4gICAgICAgIHJhdGluZzogNC45LFxuICAgICAgICByZXZpZXdzOiA0NyxcbiAgICAgICAgZGlzY291bnQ6IDE1LFxuICAgICAgICBvcmlnaW5hbFByaWNlOiA3MDU4XG4gICAgICB9KTtcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgQmx1ZSBGb3JtYWwgU3VpdCAyIChpZDogMTEzKSBzZWVkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgfVxuXG4gICAgLy8gU2VlZCAzIG1vcmUgZXhjbHVzaXZlIHByb2R1Y3RzICgxMTQtMTE2KSDigJQgRE8gTk9UIHJlbW92ZSBleGlzdGluZyAxMDQtMTEzXG4gICAgY29uc3QgZXhpc3RpbmdTY2hvb2xLaXQgPSBhd2FpdCBQcm9kdWN0LmZpbmRPbmUoeyBpZDogMTE0IH0pO1xuICAgIGlmICghZXhpc3RpbmdTY2hvb2xLaXQpIHtcbiAgICAgIGF3YWl0IFByb2R1Y3QuY3JlYXRlKHtcbiAgICAgICAgaWQ6IDExNCxcbiAgICAgICAgbmFtZTogJ1NjaG9vbCBTdGF0aW9uZXJ5IEtpdCcsXG4gICAgICAgIGNhdGVnb3J5OiAnU3RhdGlvbmVyeScsXG4gICAgICAgIHN1YkNhdGVnb3J5OiAnU2Nob29sIEl0ZW1zJyxcbiAgICAgICAgY2F0YWxvZ3VlOiAnQ2F0YWxvZ3VlIEEnLFxuICAgICAgICBwcmljZTogNTk5LFxuICAgICAgICBzdG9jazogODAsXG4gICAgICAgIHNhbGVzOiA2NyxcbiAgICAgICAgc3RhdHVzOiAnQWN0aXZlJyxcbiAgICAgICAgaW1hZ2U6ICdzY2hvb2xfc3RhdGlvbmVyeV9raXQuanBnJyxcbiAgICAgICAgaW1hZ2VzOiBbJ3NjaG9vbF9zdGF0aW9uZXJ5X2tpdC5qcGcnXSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBIGNvbXBsZXRlIHNjaG9vbCBzdGF0aW9uZXJ5IGtpdCBmZWF0dXJpbmcgc3BpcmFsIG5vdGVib29rcywgY29sb3IgcGVuY2lscywgc2tldGNoIHBlbnMsIHNjaXNzb3JzLCBhIHNoYXJwZW5lciwgYW5kIGEgcGVuY2lsIGhvbGRlci4gRXZlcnl0aGluZyBhIHN0dWRlbnQgbmVlZHMgaW4gb25lIHZpYnJhbnQgc2V0LicsXG4gICAgICAgIGJyYW5kOiAnTWl0aGlyYSBTdGF0aW9uZXJ5JyxcbiAgICAgICAgcmF0aW5nOiA0LjgsXG4gICAgICAgIHJldmlld3M6IDk0LFxuICAgICAgICBkaXNjb3VudDogMjAsXG4gICAgICAgIG9yaWdpbmFsUHJpY2U6IDc0OVxuICAgICAgfSk7XG4gICAgICBjb25zb2xlLmxvZygn4pyFIFNjaG9vbCBTdGF0aW9uZXJ5IEtpdCAoaWQ6IDExNCkgc2VlZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4aXN0aW5nQnJpZGFsSGFpciA9IGF3YWl0IFByb2R1Y3QuZmluZE9uZSh7IGlkOiAxMTUgfSk7XG4gICAgaWYgKCFleGlzdGluZ0JyaWRhbEhhaXIpIHtcbiAgICAgIGF3YWl0IFByb2R1Y3QuY3JlYXRlKHtcbiAgICAgICAgaWQ6IDExNSxcbiAgICAgICAgbmFtZTogJ0JyaWRhbCBGbG9yYWwgSGFpciBBY2Nlc3NvcnknLFxuICAgICAgICBjYXRlZ29yeTogJ0FjY2Vzc29yaWVzID4gSGFpciBBY2Nlc3NvcmllcycsXG4gICAgICAgIHN1YkNhdGVnb3J5OiAnSGFpciBBY2Nlc3NvcmllcycsXG4gICAgICAgIGNhdGFsb2d1ZTogJ0NhdGFsb2d1ZSBBJyxcbiAgICAgICAgcHJpY2U6IDEyOTksXG4gICAgICAgIHN0b2NrOiAzNSxcbiAgICAgICAgc2FsZXM6IDI5LFxuICAgICAgICBzdGF0dXM6ICdBY3RpdmUnLFxuICAgICAgICBpbWFnZTogJ2JyaWRhbF9oYWlyX2FjY2Vzc29yeS5qcGcnLFxuICAgICAgICBpbWFnZXM6IFsnYnJpZGFsX2hhaXJfYWNjZXNzb3J5LmpwZyddLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0FuIGV4cXVpc2l0ZSBicmlkYWwgaGFpciBhY2Nlc3NvcnkgZmVhdHVyaW5nIGEgbGFyZ2Ugc2lsayBsb3R1cyBmbG93ZXIsIGNhc2NhZGluZyBqYXNtaW5lIGJ1ZCBzdHJpbmdzLCBnb2xkIGNoYWluIGRyYXBpbmcsIGFuZCBkZWxpY2F0ZSBqaHVta2EgYmVsbHMuIFBlcmZlY3QgZm9yIHdlZGRpbmdzIGFuZCBmZXN0aXZlIG9jY2FzaW9ucy4nLFxuICAgICAgICBicmFuZDogJ01pdGhpcmEgQnJpZGFsJyxcbiAgICAgICAgcmF0aW5nOiA1LjAsXG4gICAgICAgIHJldmlld3M6IDU4LFxuICAgICAgICBkaXNjb3VudDogMTUsXG4gICAgICAgIG9yaWdpbmFsUHJpY2U6IDE1MjlcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coJ+KchSBCcmlkYWwgRmxvcmFsIEhhaXIgQWNjZXNzb3J5IChpZDogMTE1KSBzZWVkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgfVxuXG4gICAgY29uc3QgZXhpc3RpbmdUZWFsRnJvY2sgPSBhd2FpdCBQcm9kdWN0LmZpbmRPbmUoeyBpZDogMTE2IH0pO1xuICAgIGlmICghZXhpc3RpbmdUZWFsRnJvY2spIHtcbiAgICAgIGF3YWl0IFByb2R1Y3QuY3JlYXRlKHtcbiAgICAgICAgaWQ6IDExNixcbiAgICAgICAgbmFtZTogJ1RlYWwgUnVmZmxlIEZyb2NrJyxcbiAgICAgICAgY2F0ZWdvcnk6ICdDbG90aGluZyA+IEtpZHMgPiBHaXJscyA+IEZyb2NrJyxcbiAgICAgICAgc3ViQ2F0ZWdvcnk6ICdGcm9jaycsXG4gICAgICAgIGNhdGFsb2d1ZTogJ0NhdGFsb2d1ZSBBJyxcbiAgICAgICAgcHJpY2U6IDg5OSxcbiAgICAgICAgc3RvY2s6IDQ1LFxuICAgICAgICBzYWxlczogMzMsXG4gICAgICAgIHN0YXR1czogJ0FjdGl2ZScsXG4gICAgICAgIGltYWdlOiAndGVhbF9ydWZmbGVfZnJvY2suanBnJyxcbiAgICAgICAgaW1hZ2VzOiBbJ3RlYWxfcnVmZmxlX2Zyb2NrLmpwZyddLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0EgZ29yZ2VvdXMgdGVhbCBvcmdhbnphIGZyb2NrIGZvciBnaXJscyB3aXRoIGdvbGRlbiBzZXF1aW4gZW1icm9pZGVyeSBvbiB0aGUgYm9kaWNlLCBhIGZsYXJlZCB0aWVyZWQgc2tpcnQgd2l0aCB2aWJyYW50IGdyZWVuIHJ1ZmZsZSBoZW0gZGV0YWlsaW5nLiBMaWdodHdlaWdodCBhbmQgcGVyZmVjdCBmb3IgcGFydGllcy4nLFxuICAgICAgICBicmFuZDogJ01pdGhpcmEgS2lkcycsXG4gICAgICAgIHJhdGluZzogNC45LFxuICAgICAgICByZXZpZXdzOiA3MixcbiAgICAgICAgZGlzY291bnQ6IDEwLFxuICAgICAgICBvcmlnaW5hbFByaWNlOiA5OTlcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coJ+KchSBUZWFsIFJ1ZmZsZSBGcm9jayAoaWQ6IDExNikgc2VlZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgIH1cblxuICAgIC8vIFNlZWQgNSBuZXcgYXJyaXZhbHMgcHJvZHVjdHMgKDExNy0xMjEpIHJlcXVlc3RlZCBieSB1c2VyXG4gICAgY29uc3QgZXhpc3RpbmdGcm9ja05ldyA9IGF3YWl0IFByb2R1Y3QuZmluZE9uZSh7IGlkOiAxMTcgfSk7XG4gICAgaWYgKCFleGlzdGluZ0Zyb2NrTmV3KSB7XG4gICAgICBhd2FpdCBQcm9kdWN0LmNyZWF0ZSh7XG4gICAgICAgIGlkOiAxMTcsXG4gICAgICAgIG5hbWU6ICdQaW5rIEdpbmdoYW0gQ290dG9uIEZyb2NrJyxcbiAgICAgICAgY2F0ZWdvcnk6ICdDbG90aGluZyA+IEtpZHMgPiBHaXJscyA+IEZyb2NrJyxcbiAgICAgICAgc3ViQ2F0ZWdvcnk6ICdGcm9jaycsXG4gICAgICAgIGNhdGFsb2d1ZTogJ0NhdGFsb2d1ZSBBJyxcbiAgICAgICAgcHJpY2U6IDEyOTksXG4gICAgICAgIHN0b2NrOiAyNSxcbiAgICAgICAgc2FsZXM6IDAsXG4gICAgICAgIHN0YXR1czogJ0FjdGl2ZScsXG4gICAgICAgIGltYWdlOiAncGlua19naW5naGFtX2Zyb2NrLmpwZycsXG4gICAgICAgIGltYWdlczogWydwaW5rX2dpbmdoYW1fZnJvY2suanBnJ10sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQSBsb3ZlbHkgcGluayBnaW5naGFtIGNoZWNrZXJlZCBjb3R0b24gZnJvY2sgZm9yIGdpcmxzLCBmZWF0dXJpbmcgYW4gZWxlZ2FudCBvdmVybGF5IGRhaXN5LXBhdHRlcm5lZCBwaW5rIGNhcmRpZ2FuIGtuaXQgamFja2V0LiBFeHRyZW1lbHkgc29mdCwgYnJlYXRoYWJsZSwgYW5kIHByZW1pdW0gd2VhdmUuJyxcbiAgICAgICAgYnJhbmQ6ICdNaXRoaXJhIEtpZHMnLFxuICAgICAgICByYXRpbmc6IDQuOCxcbiAgICAgICAgcmV2aWV3czogNDIsXG4gICAgICAgIGRpc2NvdW50OiAzMSxcbiAgICAgICAgb3JpZ2luYWxQcmljZTogMTg5OSxcbiAgICAgICAgYmFkZ2U6ICdORVcnLFxuICAgICAgICBpc05ld0Fycml2YWw6IHRydWUsXG4gICAgICAgIGlzT2ZmZXI6IGZhbHNlXG4gICAgICB9KTtcbiAgICAgIGNvbnNvbGUubG9nKCfinIUgUGluayBHaW5naGFtIENvdHRvbiBGcm9jayAoaWQ6IDExNykgc2VlZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4aXN0aW5nQm9ob05lY2sgPSBhd2FpdCBQcm9kdWN0LmZpbmRPbmUoeyBpZDogMTE4IH0pO1xuICAgIGlmICghZXhpc3RpbmdCb2hvTmVjaykge1xuICAgICAgYXdhaXQgUHJvZHVjdC5jcmVhdGUoe1xuICAgICAgICBpZDogMTE4LFxuICAgICAgICBuYW1lOiAnVHVycXVvaXNlIEJlYWQgTGF5ZXJlZCBOZWNrbGFjZScsXG4gICAgICAgIGNhdGVnb3J5OiAnQWNjZXNzb3JpZXMgPiBKZXdlbGxlcnkgPiBOZWNrbGFjZScsXG4gICAgICAgIHN1YkNhdGVnb3J5OiAnTmVja2xhY2UnLFxuICAgICAgICBjYXRhbG9ndWU6ICdDYXRhbG9ndWUgQScsXG4gICAgICAgIHByaWNlOiAxODk5LFxuICAgICAgICBzdG9jazogMTUsXG4gICAgICAgIHNhbGVzOiAwLFxuICAgICAgICBzdGF0dXM6ICdBY3RpdmUnLFxuICAgICAgICBpbWFnZTogJ2JvaG9fbmVja2xhY2UuanBnJyxcbiAgICAgICAgaW1hZ2VzOiBbJ2JvaG9fbmVja2xhY2UuanBnJ10sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQW4gZXhxdWlzaXRlIG11bHRpLWxheWVyZWQgYm9oZW1pYW4gc3RhdGVtZW50IG5lY2tsYWNlIGZlYXR1cmluZyBwb2xpc2hlZCBuYXR1cmFsIHR1cnF1b2lzZSBiZWFkcywgdmludGFnZSBzaWx2ZXIgZmVhdGhlciBjaGFybXMsIHdvb2RlbiBhY2NlbnRzLCBhbmQgbWF0Y2hpbmcgc3RhdGVtZW50IHJpbmdzLicsXG4gICAgICAgIGJyYW5kOiAnTWl0aGlyYSBMdXhlJyxcbiAgICAgICAgcmF0aW5nOiA0LjksXG4gICAgICAgIHJldmlld3M6IDU4LFxuICAgICAgICBkaXNjb3VudDogMzIsXG4gICAgICAgIG9yaWdpbmFsUHJpY2U6IDI3OTksXG4gICAgICAgIGJhZGdlOiAnTkVXJyxcbiAgICAgICAgaXNOZXdBcnJpdmFsOiB0cnVlLFxuICAgICAgICBpc09mZmVyOiBmYWxzZVxuICAgICAgfSk7XG4gICAgICBjb25zb2xlLmxvZygn4pyFIFR1cnF1b2lzZSBCZWFkIExheWVyZWQgTmVja2xhY2UgKGlkOiAxMTgpIHNlZWRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICB9XG5cbiAgICBjb25zdCBleGlzdGluZ1N0YXRpb25lcnlTZXQgPSBhd2FpdCBQcm9kdWN0LmZpbmRPbmUoeyBpZDogMTE5IH0pO1xuICAgIGlmICghZXhpc3RpbmdTdGF0aW9uZXJ5U2V0KSB7XG4gICAgICBhd2FpdCBQcm9kdWN0LmNyZWF0ZSh7XG4gICAgICAgIGlkOiAxMTksXG4gICAgICAgIG5hbWU6ICdQYXN0ZWwgU3R1ZHkgJiBQbGFubmVyIFNldCcsXG4gICAgICAgIGNhdGVnb3J5OiAnU3RhdGlvbmVyeSA+IEJpbmRlcnMgPiBQbGFubmVyJyxcbiAgICAgICAgc3ViQ2F0ZWdvcnk6ICdQbGFubmVyJyxcbiAgICAgICAgY2F0YWxvZ3VlOiAnQ2F0YWxvZ3VlIEEnLFxuICAgICAgICBwcmljZTogOTk5LFxuICAgICAgICBzdG9jazogMzAsXG4gICAgICAgIHNhbGVzOiAwLFxuICAgICAgICBzdGF0dXM6ICdBY3RpdmUnLFxuICAgICAgICBpbWFnZTogJ3Bhc3RlbF9zdGF0aW9uZXJ5LmpwZycsXG4gICAgICAgIGltYWdlczogWydwYXN0ZWxfc3RhdGlvbmVyeS5qcGcnXSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBIHByZW1pdW0gb3JnYW5pemVkIHN0dWR5IHNldCBpbmNsdWRpbmcgYSBwYXN0ZWwgcGluayBwbGFubmVyIG5vdGVib29rLCBtdWx0aS1jb2xvcmVkIGhpZ2hsaWdodGVycywgaGVhcnQtdG9wcGVkIGRlY29yYXRpdmUgcGVuY2lscywgZGVzaWduZXIgcGVucywgY2xpcHMsIGFuZCBtYXRjaGluZyBwYXN0ZWwgcGFnZSBmbGFncy4nLFxuICAgICAgICBicmFuZDogJ01pdGhpcmEgU3RhdGlvbmVyeScsXG4gICAgICAgIHJhdGluZzogNC43LFxuICAgICAgICByZXZpZXdzOiAyNCxcbiAgICAgICAgZGlzY291bnQ6IDMzLFxuICAgICAgICBvcmlnaW5hbFByaWNlOiAxNDk5LFxuICAgICAgICBiYWRnZTogJ05FVycsXG4gICAgICAgIGlzTmV3QXJyaXZhbDogdHJ1ZSxcbiAgICAgICAgaXNPZmZlcjogZmFsc2VcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coJ+KchSBQYXN0ZWwgU3R1ZHkgJiBQbGFubmVyIFNldCAoaWQ6IDExOSkgc2VlZGVkIHN1Y2Nlc3NmdWxseScpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4aXN0aW5nRmFuY3lCYW5kcyA9IGF3YWl0IFByb2R1Y3QuZmluZE9uZSh7IGlkOiAxMjAgfSk7XG4gICAgaWYgKCFleGlzdGluZ0ZhbmN5QmFuZHMpIHtcbiAgICAgIGF3YWl0IFByb2R1Y3QuY3JlYXRlKHtcbiAgICAgICAgaWQ6IDEyMCxcbiAgICAgICAgbmFtZTogJ1NjcnVuY2hpZSAmIEhhaXIgQmFuZCBTZXQnLFxuICAgICAgICBjYXRlZ29yeTogJ0FjY2Vzc29yaWVzID4gZmFuY3kgPiBiYW5kcycsXG4gICAgICAgIHN1YkNhdGVnb3J5OiAnYmFuZHMnLFxuICAgICAgICBjYXRhbG9ndWU6ICdDYXRhbG9ndWUgQScsXG4gICAgICAgIHByaWNlOiAzOTksXG4gICAgICAgIHN0b2NrOiA1MCxcbiAgICAgICAgc2FsZXM6IDAsXG4gICAgICAgIHN0YXR1czogJ0FjdGl2ZScsXG4gICAgICAgIGltYWdlOiAnc2NydW5jaGllX2ZhbmN5X3NldC5qcGcnLFxuICAgICAgICBpbWFnZXM6IFsnc2NydW5jaGllX2ZhbmN5X3NldC5qcGcnXSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBIGZhbmN5IHNhdGluIGhhaXIgYWNjZXNzb3JpZXMgYnVuZGxlIGNvbnRhaW5pbmcgcGFzdGVsIHBpbmsgYW5kIGJsdWUgc2NydW5jaGllcywgcGVhcmwtZW1iZWxsaXNoZWQgYmFuZHMsIG1pbmkgbm90ZWJvb2tzLCBnZWwgcGVucywgYW5kIGFuIGVsZWdhbnQgc3RvcmFnZSB0cmF5IGdpZnQgYm94LicsXG4gICAgICAgIGJyYW5kOiAnTWl0aGlyYSBBY2Nlc3NvcmllcycsXG4gICAgICAgIHJhdGluZzogNC42LFxuICAgICAgICByZXZpZXdzOiAxOCxcbiAgICAgICAgZGlzY291bnQ6IDMzLFxuICAgICAgICBvcmlnaW5hbFByaWNlOiA1OTksXG4gICAgICAgIGJhZGdlOiAnTkVXJyxcbiAgICAgICAgaXNOZXdBcnJpdmFsOiB0cnVlLFxuICAgICAgICBpc09mZmVyOiBmYWxzZVxuICAgICAgfSk7XG4gICAgICBjb25zb2xlLmxvZygn4pyFIFNjcnVuY2hpZSAmIEhhaXIgQmFuZCBTZXQgKGlkOiAxMjApIHNlZWRlZCBzdWNjZXNzZnVsbHknKTtcbiAgICB9XG5cbiAgICBjb25zdCBleGlzdGluZ0Nyb2NoZXRCb3VxdWV0ID0gYXdhaXQgUHJvZHVjdC5maW5kT25lKHsgaWQ6IDEyMSB9KTtcbiAgICBpZiAoIWV4aXN0aW5nQ3JvY2hldEJvdXF1ZXQpIHtcbiAgICAgIGF3YWl0IFByb2R1Y3QuY3JlYXRlKHtcbiAgICAgICAgaWQ6IDEyMSxcbiAgICAgICAgbmFtZTogJ0Nyb2NoZXQgSGFuZG1hZGUgRmxvd2VyIEJvdXF1ZXQnLFxuICAgICAgICBjYXRlZ29yeTogJ0dpZnRzID4gRmxvd2VycyA+IEJvdXF1ZXQnLFxuICAgICAgICBzdWJDYXRlZ29yeTogJ0JvdXF1ZXQnLFxuICAgICAgICBjYXRhbG9ndWU6ICdDYXRhbG9ndWUgQScsXG4gICAgICAgIHByaWNlOiAxNDk5LFxuICAgICAgICBzdG9jazogMjAsXG4gICAgICAgIHNhbGVzOiAwLFxuICAgICAgICBzdGF0dXM6ICdBY3RpdmUnLFxuICAgICAgICBpbWFnZTogJ2Nyb2NoZXRfYm91cXVldC5qcGcnLFxuICAgICAgICBpbWFnZXM6IFsnY3JvY2hldF9ib3VxdWV0LmpwZyddLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0EgZ29yZ2VvdXMsIGZvcmV2ZXItYmxvb21pbmcgaGFuZC1rbml0dGVkIGNyb2NoZXQgZmxvd2VyIGJvdXF1ZXQgZmVhdHVyaW5nIGEgdmlicmFudCBzZWxlY3Rpb24gb2YgaGFuZGNyYWZ0ZWQgcmVkLCBvcmFuZ2UsIGFuZCBwdXJwbGUgZmxvd2Vycy4gQW4gZXhxdWlzaXRlIGFydGlzYW5hbCBnaWZ0LicsXG4gICAgICAgIGJyYW5kOiAnTWl0aGlyYSBHaWZ0cycsXG4gICAgICAgIHJhdGluZzogNS4wLFxuICAgICAgICByZXZpZXdzOiA2NSxcbiAgICAgICAgZGlzY291bnQ6IDMxLFxuICAgICAgICBvcmlnaW5hbFByaWNlOiAyMTk5LFxuICAgICAgICBiYWRnZTogJ05FVycsXG4gICAgICAgIGlzTmV3QXJyaXZhbDogdHJ1ZSxcbiAgICAgICAgaXNPZmZlcjogZmFsc2VcbiAgICAgIH0pO1xuICAgICAgY29uc29sZS5sb2coJ+KchSBDcm9jaGV0IEhhbmRtYWRlIEZsb3dlciBCb3VxdWV0IChpZDogMTIxKSBzZWVkZWQgc3VjY2Vzc2Z1bGx5Jyk7XG4gICAgfVxuXG4gICAgY29uc3QgZGVmYXVsdENhdGVnb3JpZXMgPSBbXG4gICAgICB7IG5hbWU6ICdDbG90aGluZycsIHBhcmVudDogJ+KAlCcgfSxcbiAgICAgIHsgbmFtZTogJ1N0YXRpb25lcnknLCBwYXJlbnQ6ICfigJQnIH0sXG4gICAgICB7IG5hbWU6ICdHaWZ0cycsIHBhcmVudDogJ+KAlCcgfSxcbiAgICAgIHsgbmFtZTogJ0FjY2Vzc29yaWVzJywgcGFyZW50OiAn4oCUJyB9LFxuICAgICAgXG4gICAgICB7IG5hbWU6ICdXb21lbicsIHBhcmVudDogJ0Nsb3RoaW5nJyB9LFxuICAgICAgeyBuYW1lOiAnTWVuJywgcGFyZW50OiAnQ2xvdGhpbmcnIH0sXG4gICAgICB7IG5hbWU6ICdLaWRzJywgcGFyZW50OiAnQ2xvdGhpbmcnIH0sXG4gICAgICB7IG5hbWU6ICdCb3lzJywgcGFyZW50OiAnQ2xvdGhpbmcnIH0sXG4gICAgICB7IG5hbWU6ICdHaXJscycsIHBhcmVudDogJ0Nsb3RoaW5nJyB9LFxuXG4gICAgICAvLyBCaW5kZXJzIGFuZCBQbGFubmVycyBmb3IgU3RhdGlvbmVyeVxuICAgICAgeyBuYW1lOiAnQmluZGVycycsIHBhcmVudDogJ1N0YXRpb25lcnknIH0sXG4gICAgICB7IG5hbWU6ICdQbGFubmVyJywgcGFyZW50OiAnQmluZGVycycgfSxcbiAgICAgIFxuICAgICAgLy8gRmFuY3kgYW5kIGJhbmRzIGZvciBBY2Nlc3Nvcmllc1xuICAgICAgeyBuYW1lOiAnZmFuY3knLCBwYXJlbnQ6ICdBY2Nlc3NvcmllcycgfSxcbiAgICAgIHsgbmFtZTogJ2JhbmRzJywgcGFyZW50OiAnZmFuY3knIH0sXG5cbiAgICAgIC8vIEZsb3dlcnMgYW5kIEJvdXF1ZXQgZm9yIEdpZnRzXG4gICAgICB7IG5hbWU6ICdGbG93ZXJzJywgcGFyZW50OiAnR2lmdHMnIH0sXG4gICAgICB7IG5hbWU6ICdCb3VxdWV0JywgcGFyZW50OiAnRmxvd2VycycgfSxcbiAgICAgIFxuICAgICAgeyBuYW1lOiAnS3VydGknLCBwYXJlbnQ6ICdXb21lbicgfSxcbiAgICAgIHsgbmFtZTogJ1NhcmVlJywgcGFyZW50OiAnV29tZW4nIH0sXG4gICAgICB7IG5hbWU6ICdkdXBwYXRhJywgcGFyZW50OiAnV29tZW4nIH0sXG4gICAgICB7IG5hbWU6ICdzaGlydHMnLCBwYXJlbnQ6ICdNZW4nIH0sXG4gICAgICB7IG5hbWU6ICdmbG9yYWwga3VydGknLCBwYXJlbnQ6ICdLdXJ0aScgfSxcbiAgICAgIFxuICAgICAgeyBuYW1lOiAnUGVucycsIHBhcmVudDogJ1N0YXRpb25lcnknIH0sXG4gICAgICB7IG5hbWU6ICdKb3VybmFscycsIHBhcmVudDogJ1N0YXRpb25lcnknIH0sXG4gICAgICB7IG5hbWU6ICdOb3RlYm9va3MnLCBwYXJlbnQ6ICdTdGF0aW9uZXJ5JyB9LFxuICAgICAgeyBuYW1lOiAnU2Nob29sIEl0ZW1zJywgcGFyZW50OiAnU3RhdGlvbmVyeScgfSxcbiAgICAgIHsgbmFtZTogJ25vdGUnLCBwYXJlbnQ6ICdTY2hvb2wgSXRlbXMnIH0sXG4gICAgICBcbiAgICAgIHsgbmFtZTogJ0JpcnRoZGF5IEdpZnRzJywgcGFyZW50OiAnR2lmdHMnIH0sXG4gICAgICB7IG5hbWU6ICdXZWRkaW5nIEdpZnRzJywgcGFyZW50OiAnR2lmdHMnIH0sXG4gICAgICB7IG5hbWU6ICdBbm5pdmVyc2FyeSBHaWZ0cycsIHBhcmVudDogJ0dpZnRzJyB9LFxuICAgICAgeyBuYW1lOiAnUmV0dXJuIEdpZnRzJywgcGFyZW50OiAnR2lmdHMnIH0sXG4gICAgICBcbiAgICAgIHsgbmFtZTogJ0pld2VsbGVyeScsIHBhcmVudDogJ0FjY2Vzc29yaWVzJyB9LFxuICAgICAgeyBuYW1lOiAnRmFuY3kgSXRlbXMnLCBwYXJlbnQ6ICdBY2Nlc3NvcmllcycgfSxcbiAgICAgIHsgbmFtZTogJ0hhaXIgQWNjZXNzb3JpZXMnLCBwYXJlbnQ6ICdBY2Nlc3NvcmllcycgfSxcbiAgICAgIHsgbmFtZTogJ0Zhc2hpb24gQWNjZXNzb3JpZXMnLCBwYXJlbnQ6ICdBY2Nlc3NvcmllcycgfSxcblxuICAgICAgLy8gUHJldmlvdXNseSBzZWVkZWQgY2F0ZWdvcmllc1xuICAgICAgeyBuYW1lOiAnYm9vaycsIHBhcmVudDogJ1N0YXRpb25lcnknIH0sXG5cbiAgICAgIC8vIE5ldyBjYXRlZ29yaWVzIGZvciBleGNsdXNpdmUgcHJvZHVjdHMgKGJhdGNoIDE6IElEcyAxMDQtMTA4KVxuICAgICAgeyBuYW1lOiAnR293bnMnLCBwYXJlbnQ6ICdHaXJscycgfSxcbiAgICAgIHsgbmFtZTogJ0Zvcm1hbCcsIHBhcmVudDogJ0tpZHMnIH0sXG4gICAgICB7IG5hbWU6ICdHaWZ0IEhhbXBlcicsIHBhcmVudDogJ0dpZnRzJyB9LFxuICAgICAgeyBuYW1lOiAnQW5rbGV0cycsIHBhcmVudDogJ0pld2VsbGVyeScgfSxcbiAgICAgIHsgbmFtZTogJ1JpbmcnLCBwYXJlbnQ6ICdKZXdlbGxlcnknIH0sXG5cbiAgICAgIC8vIE5ldyBjYXRlZ29yaWVzIGZvciBleGNsdXNpdmUgcHJvZHVjdHMgKGJhdGNoIDI6IElEcyAxMDktMTEzKVxuICAgICAgeyBuYW1lOiAnSGVhdnkgV29ya2VkIEpva2VyJywgcGFyZW50OiAnSmV3ZWxsZXJ5JyB9LFxuICAgICAgeyBuYW1lOiAnU2ltcGxlIENoYWluJywgcGFyZW50OiAnSmV3ZWxsZXJ5JyB9LFxuICAgICAgeyBuYW1lOiAnRm9ybWFsIFN1aXRlcycsIHBhcmVudDogJ01lbicgfSxcblxuICAgICAgLy8gTmV3IGNhdGVnb3JpZXMgZm9yIGV4Y2x1c2l2ZSBwcm9kdWN0cyAoYmF0Y2ggMzogSURzIDExNC0xMTYpXG4gICAgICB7IG5hbWU6ICdGcm9jaycsIHBhcmVudDogJ0dpcmxzJyB9XG4gICAgXTtcblxuICAgIGZvciAoY29uc3QgY2F0IG9mIGRlZmF1bHRDYXRlZ29yaWVzKSB7XG4gICAgICBsZXQgZG9jID0gYXdhaXQgQ2F0ZWdvcnkuZmluZE9uZSh7IG5hbWU6IGNhdC5uYW1lIH0pO1xuICAgICAgaWYgKCFkb2MpIHtcbiAgICAgICAgbGV0IHBhcmVudElkID0gbnVsbDtcbiAgICAgICAgaWYgKGNhdC5wYXJlbnQgIT09ICfigJQnKSB7XG4gICAgICAgICAgY29uc3QgcGFyZW50RG9jID0gYXdhaXQgQ2F0ZWdvcnkuZmluZE9uZSh7IG5hbWU6IGNhdC5wYXJlbnQgfSk7XG4gICAgICAgICAgaWYgKHBhcmVudERvYykge1xuICAgICAgICAgICAgcGFyZW50SWQgPSBwYXJlbnREb2MuX2lkO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkb2MgPSBhd2FpdCBDYXRlZ29yeS5jcmVhdGUoe1xuICAgICAgICAgIG5hbWU6IGNhdC5uYW1lLFxuICAgICAgICAgIHBhcmVudDogY2F0LnBhcmVudCxcbiAgICAgICAgICBwYXJlbnRJZCxcbiAgICAgICAgICBzdGF0dXM6ICdBY3RpdmUnLFxuICAgICAgICAgIGNvdW50OiAwXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zb2xlLmxvZyhg4pyFIENhdGVnb3J5ICcke2NhdC5uYW1lfScgc2VlZGVkIHN1Y2Nlc3NmdWxseWApO1xuICAgICAgfVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3Igc2VlZGluZyBzdG9yZSBwcm9kdWN0czonLCBlcnIpO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNlZWRBZG1pbigpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBhZG1pbkVtYWlsID0gKHByb2Nlc3MuZW52LkFETUlOX0VNQUlMIHx8ICdhZG1pbm1pdGhyYXNob3BweUBnbWFpbC5jb20nKS50b0xvd2VyQ2FzZSgpO1xuICAgIGNvbnN0IGFkbWluUGFzc3dvcmQgPSBwcm9jZXNzLmVudi5BRE1JTl9QQVNTV09SRCB8fCAnYWRtaW4xMjMnO1xuXG4gICAgLy8gRGVsZXRlIGxlZ2FjeSBhZG1pbiBpZiBleGlzdHMgdG8gZW5zdXJlIHNlY3VyaXR5XG4gICAgYXdhaXQgVXNlci5kZWxldGVPbmUoeyBlbWFpbDogJ2FkbWluQG1pdGhpcmEuY29tJyB9KTtcblxuICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgVXNlci5maW5kT25lKHsgZW1haWw6IGFkbWluRW1haWwsIHJvbGU6ICdhZG1pbicgfSk7XG4gICAgaWYgKCFleGlzdGluZykge1xuICAgICAgY29uc3QgaGFzaGVkID0gYmNyeXB0Lmhhc2hTeW5jKGFkbWluUGFzc3dvcmQsIDEyKTtcbiAgICAgIGF3YWl0IFVzZXIuY3JlYXRlKHtcbiAgICAgICAgaWQ6IHV1aWR2NCgpLFxuICAgICAgICBuYW1lOiAnQWRtaW4nLFxuICAgICAgICBlbWFpbDogYWRtaW5FbWFpbCxcbiAgICAgICAgcGhvbmU6IG51bGwsXG4gICAgICAgIHBhc3N3b3JkOiBoYXNoZWQsXG4gICAgICAgIHJvbGU6ICdhZG1pbicsXG4gICAgICAgIGlzX2FjdGl2ZTogdHJ1ZSxcbiAgICAgICAgY3JlYXRlZF9hdDogbmV3IERhdGUoKVxuICAgICAgfSk7XG4gICAgICBjb25zb2xlLmxvZyhg4pyFIEFkbWluIGFjY291bnQgc2VlZGVkOiAke2FkbWluRW1haWx9YCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciBzZWVkaW5nIGFkbWluOicsIGVycik7XG4gIH1cbn1cblxuLy8g4pSA4pSA4pSAIERCIEhlbHBlciBGdW5jdGlvbnMg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5jb25zdCBkYkhlbHBlcnMgPSB7XG4gIGFzeW5jIGZpbmRVc2VyQnlFbWFpbChlbWFpbCkge1xuICAgIHJldHVybiBhd2FpdCBVc2VyLmZpbmRPbmUoeyBlbWFpbDogZW1haWwudG9Mb3dlckNhc2UoKS50cmltKCkgfSkubGVhbigpO1xuICB9LFxuXG4gIGFzeW5jIGZpbmRVc2VyQnlJZChpZCkge1xuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBVc2VyLmZpbmRPbmUoeyBpZCB9KS5sZWFuKCk7XG4gICAgaWYgKCF1c2VyKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCB7IHBhc3N3b3JkLCAuLi5zYWZlIH0gPSB1c2VyO1xuICAgIHJldHVybiBzYWZlO1xuICB9LFxuXG4gIGFzeW5jIGNyZWF0ZVVzZXIoeyBuYW1lLCBlbWFpbCwgcGhvbmUsIHBhc3N3b3JkLCByb2xlID0gJ3VzZXInIH0pIHtcbiAgICBjb25zdCBoYXNoZWQgPSBiY3J5cHQuaGFzaFN5bmMocGFzc3dvcmQsIDEyKTtcbiAgICBjb25zdCBuZXdVc2VyID0gYXdhaXQgVXNlci5jcmVhdGUoe1xuICAgICAgaWQ6IHV1aWR2NCgpLFxuICAgICAgbmFtZTogbmFtZS50cmltKCksXG4gICAgICBlbWFpbDogZW1haWwudG9Mb3dlckNhc2UoKS50cmltKCksXG4gICAgICBwaG9uZTogcGhvbmUgfHwgbnVsbCxcbiAgICAgIHBhc3N3b3JkOiBoYXNoZWQsXG4gICAgICByb2xlLFxuICAgICAgaXNfYWN0aXZlOiB0cnVlLFxuICAgICAgY3JlYXRlZF9hdDogbmV3IERhdGUoKSxcbiAgICAgIGNhcnQ6IFtdLFxuICAgICAgd2lzaGxpc3Q6IFtdLFxuICAgICAgYWRkcmVzc2VzOiBbXVxuICAgIH0pO1xuICAgIGNvbnN0IHVzZXJPYmogPSBuZXdVc2VyLnRvT2JqZWN0KCk7XG4gICAgY29uc3QgeyBwYXNzd29yZDogXywgLi4uc2FmZSB9ID0gdXNlck9iajtcbiAgICByZXR1cm4gc2FmZTtcbiAgfSxcblxuICBhc3luYyBlbWFpbEV4aXN0cyhlbWFpbCkge1xuICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBVc2VyLmZpbmRPbmUoeyBlbWFpbDogZW1haWwudG9Mb3dlckNhc2UoKS50cmltKCkgfSk7XG4gICAgcmV0dXJuICEhdXNlcjtcbiAgfVxufTtcblxuY29uc3QgTHVja3lXaGVlbFNlc3Npb25TY2hlbWEgPSBuZXcgbW9uZ29vc2UuU2NoZW1hKHtcbiAgc2Vzc2lvbklkOiB7IHR5cGU6IFN0cmluZywgcmVxdWlyZWQ6IHRydWUsIHVuaXF1ZTogdHJ1ZSB9LFxuICB1c2VySWQ6IHsgdHlwZTogU3RyaW5nLCBkZWZhdWx0OiBudWxsLCBpbmRleDogdHJ1ZSB9LFxuICBjYXJ0SGFzaDogeyB0eXBlOiBTdHJpbmcsIHJlcXVpcmVkOiB0cnVlIH0sXG4gIHdoZWVsUHJvZHVjdHM6IFt7IHR5cGU6IG1vbmdvb3NlLlNjaGVtYS5UeXBlcy5PYmplY3RJZCwgcmVmOiAnUHJvZHVjdCcgfV0sXG4gIGNhbXBhaWduSWQ6IHsgdHlwZTogbW9uZ29vc2UuU2NoZW1hLlR5cGVzLk9iamVjdElkLCByZWY6ICdDYW1wYWlnbicsIHJlcXVpcmVkOiB0cnVlLCBpbmRleDogdHJ1ZSB9LFxuICBjYW1wYWlnblNuYXBzaG90OiB7XG4gICAgY2FtcGFpZ25OYW1lOiB7IHR5cGU6IFN0cmluZyB9LFxuICAgIHJld2FyZEJ1ZGdldDogeyB0eXBlOiBOdW1iZXIgfSxcbiAgICB3aGVlbFByb2R1Y3RDb3VudDogeyB0eXBlOiBOdW1iZXIgfSxcbiAgICBtaW5PcmRlclZhbHVlOiB7IHR5cGU6IE51bWJlciB9LFxuICAgIG1heE9yZGVyVmFsdWU6IHsgdHlwZTogTnVtYmVyIH1cbiAgfSxcbiAgY3JlYXRlZEF0OiB7IHR5cGU6IERhdGUsIGRlZmF1bHQ6IERhdGUubm93LCBleHBpcmVzOiAzNjAwIH0sXG4gIGlzVXNlZDogeyB0eXBlOiBCb29sZWFuLCBkZWZhdWx0OiBmYWxzZSwgaW5kZXg6IHRydWUgfVxufSk7XG5MdWNreVdoZWVsU2Vzc2lvblNjaGVtYS5pbmRleCh7IHVzZXJJZDogMSwgY2FydEhhc2g6IDEsIGNhbXBhaWduSWQ6IDEsIGlzVXNlZDogMSB9KTtcblxuY29uc3QgTmV3c2xldHRlciA9IG1vbmdvb3NlLm1vZGVsKCdOZXdzbGV0dGVyJywgTmV3c2xldHRlclNjaGVtYSk7XG5jb25zdCBDYW1wYWlnbiA9IG1vbmdvb3NlLm1vZGVsKCdDYW1wYWlnbicsIENhbXBhaWduU2NoZW1hKTtcbmNvbnN0IEFuYWx5dGljcyA9IG1vbmdvb3NlLm1vZGVsKCdBbmFseXRpY3MnLCBBbmFseXRpY3NTY2hlbWEpO1xuY29uc3QgTHVja3lTcGluSGlzdG9yeSA9IG1vbmdvb3NlLm1vZGVsKCdMdWNreVNwaW5IaXN0b3J5JywgTHVja3lTcGluSGlzdG9yeVNjaGVtYSk7XG5jb25zdCBMdWNreVdoZWVsU2Vzc2lvbiA9IG1vbmdvb3NlLm1vZGVsKCdMdWNreVdoZWVsU2Vzc2lvbicsIEx1Y2t5V2hlZWxTZXNzaW9uU2NoZW1hKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGRiSGVscGVycyxcbiAgc2VlZEFkbWluLFxuICBzZWVkU3RvcmVEYXRhLFxuICBVc2VyLFxuICBQcm9kdWN0LFxuICBDYXRlZ29yeSxcbiAgQ2F0YWxvZ3VlLFxuICBPcmRlcixcbiAgQ291cG9uLFxuICBSZXZpZXcsXG4gIEJhbm5lcixcbiAgQW5ub3VuY2VtZW50LFxuICBDb250YWN0UXVlcnksXG4gIFNldHRpbmdzLFxuICBGZWF0dXJlLFxuICBOZXdzbGV0dGVyLFxuICBDYW1wYWlnbixcbiAgQW5hbHl0aWNzLFxuICBMdWNreVNwaW5IaXN0b3J5LFxuICBMdWNreVdoZWVsU2Vzc2lvbixcbiAgVmVuZG9yLFxuICBWZW5kb3JOb3RpZmljYXRpb25cbn07XG5cbiJdfQ==