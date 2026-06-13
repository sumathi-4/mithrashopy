import React, { useState, useEffect } from 'react';
import { Heart, Star, ShoppingCart, Search, ArrowUpDown, Eye, X, Phone, ChevronDown } from 'lucide-react';
import pHairUpdated from '../assets/p_hair_updated.jpg';
import pRing from '../assets/p_ring.jpg';
import pNeck from '../assets/p_neck.jpg';
import celebCouple from '../assets/celeb_couple.jpg';
import celebKid from '../assets/celeb_kid.jpg';
import kids_tq_2 from '../assets/kids_tq_2.jpg';
import kids_tq_3 from '../assets/kids_tq_3.jpg';
import kids_tq_4 from '../assets/kids_tq_4.jpg';
import kids_tq_6 from '../assets/kids_tq_6.jpg';
import kids_tq_7 from '../assets/kids_tq_7.jpg';
import kids_tq_14 from '../assets/kids_tq_14.jpg';
import kids_tq_17 from '../assets/kids_tq_17.jpg';
import kids_tq_18 from '../assets/kids_tq_18.jpg';
import kids_tq_19 from '../assets/kids_tq_19.jpg';
import kids_tq_21 from '../assets/kids_tq_21.jpg';
import kids_tq_25 from '../assets/kids_tq_25.jpg';
import kids_tq_32 from '../assets/kids_tq_32.jpg';
import kids_tq_35 from '../assets/kids_tq_35.jpg';
import kids_tq_42 from '../assets/kids_tq_42.jpg';
import kids_tq_52 from '../assets/kids_tq_52.jpg';
import kids_tq_57 from '../assets/kids_tq_57.jpg';
import kids_tq_60 from '../assets/kids_tq_60.jpg';
import kids_tq_63 from '../assets/kids_tq_63.jpg';
import kids_tq_64 from '../assets/kids_tq_64.jpg';
import kids_tq_77 from '../assets/kids_tq_77.jpg';
import kids_tq_80 from '../assets/kids_tq_80.jpg';
import kids_tq_87 from '../assets/kids_tq_87.jpg';
import kids_tq_89 from '../assets/kids_tq_89.jpg';
import kids_tq_93 from '../assets/kids_tq_93.jpg';
import kids_tq_95 from '../assets/kids_tq_95.jpg';
import kids_tq_103 from '../assets/kids_tq_103.jpg';
import kids_tq_109 from '../assets/kids_tq_109.jpg';
import kids_tq_110 from '../assets/kids_tq_110.jpg';
import kids_tq_113 from '../assets/kids_tq_113.jpg';
import kids_tq_126 from '../assets/kids_tq_126.jpg';
import kids_tq_138 from '../assets/kids_tq_138.jpg';
import kids_tq_137 from '../assets/kids_tq_137.jpg';
import kids_tq_145 from '../assets/kids_tq_145.jpg';
import kids_tq_148 from '../assets/kids_tq_148.jpg';
import kids_tq_151 from '../assets/kids_tq_151.jpg';
import kids_tq_152 from '../assets/kids_tq_152.jpg';
import kids_tq_157 from '../assets/kids_tq_157.jpg';
import kids_tq_161 from '../assets/kids_tq_161.jpg';
import kids_tq_165 from '../assets/kids_tq_165.jpg';
import shopBannerRaw from '../assets/shop_banner_raw.jpg';
import imgClothing from '../assets/hero_clothing.jpg';
import imgStationery from '../assets/hero_stationery.jpg';
import imgGifts from '../assets/hero_gifts.jpg';
import imgAccessories from '../assets/hero_accessories.jpg';



const kidsImages = import.meta.glob('../assets/kids_tq_*.jpg', { eager: true });

const getProductImages = (modelNo, defaultImage) => {
  if (!modelNo) return [defaultImage];
  const modelKey = modelNo.toLowerCase().replace('-', '_');
  const matchedImages = [];
  
  const mainKey = `../assets/kids_${modelKey}.jpg`;
  if (kidsImages[mainKey]) {
    matchedImages.push(kidsImages[mainKey].default || kidsImages[mainKey]);
  } else {
    matchedImages.push(defaultImage);
  }
  
  for (let i = 1; i <= 10; i++) {
    const swatchKey = `../assets/kids_${modelKey}_g${i}.jpg`;
    if (kidsImages[swatchKey]) {
      matchedImages.push(kidsImages[swatchKey].default || kidsImages[swatchKey]);
    }
  }
  
  return matchedImages;
};

export default function ShopView() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);

  const [catalogue, setCatalogue] = useState('A');
  const [priceRange, setPriceRange] = useState(5000);
  const [showInStock, setShowInStock] = useState(true);
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  const [selectedRating, setSelectedRating] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter Collapse/Expand States (defaulting to true/open)
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(true);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(true);
  const [isRatingsOpen, setIsRatingsOpen] = useState(true);
  const [isGenderOpen, setIsGenderOpen] = useState(true);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, activeSubTab, searchQuery, catalogue, priceRange, showInStock, showOutOfStock, selectedRating]);

  // Reset active image index when product selection changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedProduct]);

  // Parse category filter from URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get('category');
    if (catParam) {
      setActiveTab(catParam.toUpperCase());
    }
    const subParam = params.get('subcategory');
    if (subParam) {
      setActiveSubTab(subParam.toUpperCase());
    }

    const handlePopState = () => {
      const updatedParams = new URLSearchParams(window.location.search);
      const updatedCat = updatedParams.get('category');
      if (updatedCat) {
        setActiveTab(updatedCat.toUpperCase());
      } else {
        setActiveTab('ALL');
      }
      const updatedSub = updatedParams.get('subcategory');
      if (updatedSub) {
        setActiveSubTab(updatedSub.toUpperCase());
      } else {
        setActiveSubTab('ALL');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const toggleCart = (id, title) => {
    if (cart.includes(id)) {
      setCart(cart.filter(item => item !== id));
      alert(`Removed ${title} from cart!`);
    } else {
      setCart([...cart, id]);
      alert(`Added ${title} to cart!`);
    }
  };

  const handleBackToHome = () => {
    window.history.pushState({}, '', '/#home');
    window.dispatchEvent(new Event('popstate'));
  };

  const allProducts = [
    {
      id: 'p1',
      title: "Royal Jasmine Hair Gajra Ornament",
      category: "ACCESSORIES",
      price: 450,
      rating: 5,
      reviews: 42,
      image: pHairUpdated,
      badge: "PREMIUM"
    },
    {
      id: 'p2',
      title: "Antique Ginkgo Leaf Premium Ring",
      category: "ACCESSORIES",
      price: 500,
      rating: 5,
      reviews: 29,
      image: pRing,
      badge: "PREMIUM"
    },
    {
      id: 'p3',
      title: "Exquisite Kundan Choker Necklace",
      category: "ACCESSORIES",
      price: 1500,
      rating: 5,
      reviews: 64,
      image: pNeck,
      badge: "PREMIUM"
    },
    {
      id: 't1',
      title: "Girls Anarkali Dress",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 1699,
      rating: 5,
      reviews: 128,
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
      badge: "BEST SELLER"
    },
    {
      id: 't2',
      title: "Premium Handbag",
      category: "ACCESSORIES",
      price: 2499,
      rating: 5,
      reviews: 96,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
      badge: "BEST SELLER"
    },
    {
      id: 't3',
      title: "Premium Stationery Set",
      category: "STATIONERY",
      price: 699,
      rating: 5,
      reviews: 210,
      image: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80",
      badge: "BEST SELLER"
    },
    {
      id: 't4',
      title: "Luxury Gift Hamper",
      category: "GIFTS",
      price: 1299,
      rating: 5,
      reviews: 176,
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
      badge: "BEST SELLER"
    },
    {
      id: 't5',
      title: "Gold Plated Necklace",
      category: "ACCESSORIES",
      price: 2199,
      rating: 5,
      reviews: 134,
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
      badge: "BEST SELLER"
    },
    {
      id: 't6',
      title: "Ladies Wrist Watch",
      category: "ACCESSORIES",
      price: 1599,
      rating: 5,
      reviews: 88,
      image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80",
      badge: "BEST SELLER"
    },
    {
      id: 'n1',
      title: "Floral Frock Dress",
      category: "CLOTHING",
      subCategory: "WOMEN",
      price: 1499,
      rating: 5,
      reviews: 42,
      image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW"
    },
    {
      id: 'n2',
      title: "Blue School Kit",
      category: "STATIONERY",
      price: 899,
      rating: 4,
      reviews: 18,
      image: "https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW"
    },
    {
      id: 'n3',
      title: "Birthday Gift Box",
      category: "GIFTS",
      price: 1099,
      rating: 5,
      reviews: 35,
      image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW"
    },
    {
      id: 'n4',
      title: "Traditional Jhumka",
      category: "ACCESSORIES",
      price: 1799,
      rating: 5,
      reviews: 58,
      image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW"
    },
    {
      id: 'n5',
      title: "Premium Notebook",
      category: "STATIONERY",
      price: 399,
      rating: 4,
      reviews: 14,
      image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW"
    },
    {
      id: 'n6',
      title: "Cotton Kurta Set",
      category: "CLOTHING",
      subCategory: "MEN",
      price: 1299,
      rating: 5,
      reviews: 64,
      image: "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=1000&q=80",
      badge: "NEW"
    },

    // TIKQ KIDSWEAR COLLECTION FROM PDF (39 PRODUCTS)
    {
      id: 'k_tq_2',
      title: "Misty Bow Set",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 69,
      rating: 5,
      reviews: 42,
      image: kids_tq_2,
      badge: "TIKQ KIDS",
      modelNo: "TQ-2",
      size: "4 yr",
      moq: "Per size 6 pcs",
      colours: "2 colours",
      fabric: "Looper",
      description: "Super soft matching set with floral detailing and a bow accent on top, designed for play and casual comfort."
    },
    {
      id: 'k_tq_3',
      title: "Kids Printed Set",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 163,
      rating: 5,
      reviews: 31,
      image: kids_tq_3,
      badge: "TIKQ KIDS",
      modelNo: "TQ-3",
      size: "2y, 4y, 6y",
      moq: "All size mix 3 pcs",
      colours: "5 colours",
      fabric: "Looper",
      description: "Comfortable nightwear set with soft elastic waistbands and all-over cartoon characters print."
    },
    {
      id: 'k_tq_4',
      title: "Kids Printed Set",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 194,
      rating: 5,
      reviews: 29,
      image: kids_tq_4,
      badge: "TIKQ KIDS",
      modelNo: "TQ-4",
      size: "8y, 10y, 12y",
      moq: "All size mix 3 pcs",
      colours: "5 colours",
      fabric: "Looper",
      description: "Warm long-sleeved nightwear set featuring cute screen printed chest graphics and cozy matching pants."
    },
    {
      id: 'k_tq_6',
      title: "Jacquard Classic T-Shirt",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 87,
      rating: 5,
      reviews: 54,
      image: kids_tq_6,
      badge: "TIKQ KIDS",
      modelNo: "TQ-6",
      size: "2y, 4y, 6y, 8y, 10y, 12y",
      moq: "Per size 10 pcs",
      colours: "10 colours",
      fabric: "Jacquard",
      description: "Aesthetic boys solid crew neck tee featuring textured jacquard breathable knits. Price varies by size (₹87 - ₹103)."
    },
    {
      id: 'k_tq_7',
      title: "Cozy Hat Design Tshirt",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 313,
      rating: 5,
      reviews: 18,
      image: kids_tq_7,
      badge: "TIKQ PREMIUM",
      modelNo: "TQ-7",
      size: "6yr, 8yr, 10yr",
      moq: "All size mix 3 pcs",
      colours: "5 colours",
      fabric: "Freelancer",
      description: "Trendy sweatshirt with a raised tactile hat patch and string decorations on chest."
    },
    {
      id: 'k_tq_14',
      title: "Boys Fullsleve Patchwork Set",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 136,
      rating: 5,
      reviews: 24,
      image: kids_tq_14,
      badge: "TIKQ KIDS",
      modelNo: "TQ-14",
      size: "2y, 4y, 6y",
      moq: "All size mix 3 pcs",
      colours: "4 colours",
      fabric: "Waffel",
      description: "Cozy waffel knit sweatshirt with adorable animal patches (dog, panda) paired with joggers."
    },
    {
      id: 'k_tq_17',
      title: "Summer Kids L/S",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 150,
      rating: 5,
      reviews: 35,
      image: kids_tq_17,
      badge: "TIKQ KIDS",
      modelNo: "TQ-17",
      size: "2y, 4y, 6y, 8y, 10y, 12y",
      moq: "All size mix 6 pcs",
      colours: "5 colours",
      fabric: "Waffel",
      description: "Breathable and light sleeveless vest and shorts lounge set, perfect for active summer play."
    },
    {
      id: 'k_tq_18',
      title: "BunnySprout Set",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 237,
      rating: 5,
      reviews: 21,
      image: kids_tq_18,
      badge: "TIKQ KIDS",
      modelNo: "TQ-18",
      size: "2yr, 4yr, 6yr",
      moq: "All size mix 3 pcs",
      colours: "5 colours",
      fabric: "freelancer & valentino",
      description: "Cute layered girls frock with long sleeves, charming bunny details, and decorative strings."
    },
    {
      id: 'k_tq_19',
      title: "Little Bunny Wear",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 118,
      rating: 5,
      reviews: 16,
      image: kids_tq_19,
      badge: "TIKQ KIDS",
      modelNo: "TQ-19",
      size: "2yr, 4yr, 6yr",
      moq: "All size mix 6 pcs",
      colours: "3 colours",
      fabric: "Interlock cotton",
      description: "Charming strap dress paired with a soft base tee, featuring a cute pocket bunny patch."
    },
    {
      id: 'k_tq_21',
      title: "Snowfall T-Shirt",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 88,
      rating: 5,
      reviews: 43,
      image: kids_tq_21,
      badge: "TIKQ KIDS",
      modelNo: "TQ-21",
      size: "4y, 6y, 8y",
      moq: "Per size 6 pcs",
      colours: "6 colours",
      fabric: "Snowfall",
      description: "Comfortable solid crew neck boys t-shirt in soft snowfall textured knit fabric."
    },
    {
      id: 'k_tq_25',
      title: "Tom and Jerry Tshirt",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 110,
      rating: 5,
      reviews: 32,
      image: kids_tq_25,
      badge: "TIKQ KIDS",
      modelNo: "TQ-25",
      size: "2yr, 4yr, 6yr",
      moq: "Per size 10pcs",
      colours: "5 colours",
      fabric: "waffel",
      description: "Playful half-color cartoon printed t-shirt made of high quality waffel knit fabric."
    },
    {
      id: 'k_tq_32',
      title: "Elegant Party Dress",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 94,
      rating: 5,
      reviews: 22,
      image: kids_tq_32,
      badge: "TIKQ KIDS",
      modelNo: "TQ-32",
      size: "2y, 4y, 6y",
      moq: "All size mix 6 pcs",
      colours: "1 colours",
      fabric: "Premium Polyester",
      description: "Chic shimmer party frock featuring stylish flutter sleeves and a waist bow belt."
    },
    {
      id: 'k_tq_35',
      title: "Butterfly Girls Frock",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 207,
      rating: 5,
      reviews: 37,
      image: kids_tq_35,
      badge: "TIKQ KIDS",
      modelNo: "TQ-35",
      size: "2y, 4y, 6y",
      moq: "6 pcs [per size]",
      colours: "6 colours",
      fabric: "100% Cotton Bio Wash",
      description: "Elegant short-sleeve casual frock with high-contrast colorful butterfly chest print."
    },
    {
      id: 'k_tq_42',
      title: "Softy T-Shirt",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 78,
      rating: 5,
      reviews: 49,
      image: kids_tq_42,
      badge: "TIKQ KIDS",
      modelNo: "TQ-42",
      size: "2y, 4y, 6y, 8y, 10y",
      moq: "Per size 10 pcs",
      colours: "8 colours",
      fabric: "Softy",
      description: "Sleek boys athletic activewear tee made of light, breathable, moisture-wicking softy fabric."
    },
    {
      id: 'k_tq_52',
      title: "Classic Comfort Tee",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 88,
      rating: 5,
      reviews: 14,
      image: kids_tq_52,
      badge: "TIKQ KIDS",
      modelNo: "TQ-52",
      size: "8y, 12y, 14Y",
      moq: "Per size 8 pcs",
      colours: "7 colours",
      fabric: "Polyster",
      description: "Trendy layered-sleeve graphic tee featuring an adorable sunglasses print on chest."
    },
    {
      id: 'k_tq_57',
      title: "Looper Printed Top",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 94,
      rating: 5,
      reviews: 26,
      image: kids_tq_57,
      badge: "TIKQ KIDS",
      modelNo: "TQ-57",
      size: "8yr, 10yr, 12yr",
      moq: "Per size 10 pcs",
      colours: "10 colours",
      fabric: "Spun Looper",
      description: "Cute girls relaxed summer tee featuring colorful cartoon chest prints and text highlights."
    },
    {
      id: 'k_tq_60',
      title: "Boys Looper Set",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 163,
      rating: 5,
      reviews: 30,
      image: kids_tq_60,
      badge: "TIKQ KIDS",
      modelNo: "TQ-60",
      size: "6y, 8y, 10y",
      moq: "Per size 3 pcs",
      colours: "6 colours",
      fabric: "Spun Looper",
      description: "Cozy boys long-sleeve sweatshirt and jogger pants set, featuring playful smile graphics."
    },
    {
      id: 'k_tq_63',
      title: "Advent Set",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 318,
      rating: 5,
      reviews: 17,
      image: kids_tq_63,
      badge: "TIKQ PREMIUM",
      modelNo: "TQ-63",
      size: "2yr, 4yr, 6yr",
      moq: "All size mix 3 pcs",
      colours: "5 colours",
      fabric: "Freelancer",
      description: "Super stylish boys formal-casual set featuring a buttoned shirt-jacket over a clean inner tee."
    },
    {
      id: 'k_tq_64',
      title: "Kids Jersey Set",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 120,
      rating: 5,
      reviews: 23,
      image: kids_tq_64,
      badge: "TIKQ KIDS",
      modelNo: "TQ-64",
      size: "2yr, 4yr, 6yr, 8 yr, 10yr, 12yr",
      moq: "Per size 6 pcs",
      colours: "6 colours",
      fabric: "softy",
      description: "Lightweight kids athletic jersey set featuring dynamic sports patterns, great for outdoor activities."
    },
    {
      id: 'k_tq_77',
      title: "Print & Playfull Set",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 238,
      rating: 5,
      reviews: 19,
      image: kids_tq_77,
      badge: "TIKQ KIDS",
      modelNo: "TQ-77",
      size: "8y, 10y, 12y",
      moq: "All size mix 3 pcs",
      colours: "9 colours",
      fabric: "Looper",
      description: "Dashing formal boys printed shirt paired with dark formal pants, ideal for kids parties."
    },
    {
      id: 'k_tq_80',
      title: "Anime F/S T-Shirt",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 100,
      rating: 5,
      reviews: 51,
      image: kids_tq_80,
      badge: "TIKQ KIDS",
      modelNo: "TQ-80",
      size: "2y, 4y, 6y, 8y, 10y, 12y, 14Y",
      moq: "Per size 10 pcs",
      colours: "7 colours",
      fabric: "Polyster",
      description: "Cool boys long-sleeve sweatshirt featuring high-quality premium Japanese anime character prints."
    },
    {
      id: 'k_tq_87',
      title: "Turbomax Outfit",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 138,
      rating: 5,
      reviews: 34,
      image: kids_tq_87,
      badge: "TIKQ KIDS",
      modelNo: "TQ-87",
      size: "10yr, 12yr, 14yr",
      moq: "Per size 5 pcs",
      colours: "5 colours",
      fabric: "DOTKNIT",
      description: "Durable dotknit sportswear set designed for soccer, running, and heavy physical training."
    },
    {
      id: 'k_tq_89',
      title: "Glowfit Tee",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 90,
      rating: 5,
      reviews: 20,
      image: kids_tq_89,
      badge: "TIKQ KIDS",
      modelNo: "TQ-89",
      size: "2Y, 4Y, 6Y, 8y, 10y, 12y",
      moq: "Per size 10 pcs",
      colours: "9 colours",
      fabric: "Catonic Fabric",
      description: "Lightweight summer tee in premium catonic fabric, offering great breathability and color retention."
    },
    {
      id: 'k_tq_93',
      title: "CosmoKid Co-Ord",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 163,
      rating: 5,
      reviews: 15,
      image: kids_tq_93,
      badge: "TIKQ KIDS",
      modelNo: "TQ-93",
      size: "2yr, 4yr, 6yr",
      moq: "All size mix 3 pcs",
      colours: "5 colours",
      fabric: "hungamma",
      description: "Lovely girls t-shirt and matching shorts co-ord set in a soft premium hungamma fabric."
    },
    {
      id: 'k_tq_95',
      title: "Catonic kids t-shirt",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 80,
      rating: 5,
      reviews: 28,
      image: kids_tq_95,
      badge: "TIKQ KIDS",
      modelNo: "TQ-95",
      size: "2y, 4y, 6y, 8y, 10y, 12y",
      moq: "Per size 10 pcs",
      colours: "5 colours",
      fabric: "CATHONIC",
      description: "Comfortable kids daily t-shirt in classic horizontal striped patterns."
    },
    {
      id: 'k_tq_103',
      title: "Kids Mickey Set",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 125,
      rating: 5,
      reviews: 41,
      image: kids_tq_103,
      badge: "TIKQ KIDS",
      modelNo: "TQ-103",
      size: "4y, 6y, 8y",
      moq: "All size mix 3pcs",
      colours: "1 colours",
      fabric: "SPUNLOOPER",
      description: "Cute polo collar t-shirt and shorts set, featuring a lovely Mickey Mouse chest character."
    },
    {
      id: 'k_tq_109',
      title: "Bright Blocks Outfit",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 225,
      rating: 5,
      reviews: 12,
      image: kids_tq_109,
      badge: "TIKQ KIDS",
      modelNo: "TQ-109",
      size: "10,12",
      moq: "Per size 3 pcs",
      colours: "5 colours",
      fabric: "POLYCOTTON",
      description: "Relaxed fit boys shirt and shorts set with eye-catching typography block prints."
    },
    {
      id: 'k_tq_110',
      title: "Kiddie Glow Set",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 144,
      rating: 5,
      reviews: 27,
      image: kids_tq_110,
      badge: "TIKQ KIDS",
      modelNo: "TQ-110",
      size: "2yr, 4yr, 6yr",
      moq: "Per size 6 pcs",
      colours: "5 colours",
      fabric: "PIKQ",
      description: "Premium cotton tee and shorts set with a lovely preschool theme print."
    },
    {
      id: 'k_tq_113',
      title: "Pixel Po Tee",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 113,
      rating: 5,
      reviews: 33,
      image: kids_tq_113,
      badge: "TIKQ KIDS",
      modelNo: "TQ-113",
      size: "2y, 4y, 6y, 8y, 10y, 12y",
      moq: "Per size 6 pcs",
      colours: "6 colours",
      fabric: "POLY COTTON",
      description: "Elegant boys tee featuring high quality modern pixelated design prints."
    },
    {
      id: 'k_tq_126',
      title: "Kidz Milange Shorts",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 61,
      rating: 5,
      reviews: 45,
      image: kids_tq_126,
      badge: "TIKQ KIDS",
      modelNo: "TQ-126",
      size: "24, 26, 28, 30, 32, 34",
      moq: "Per size 15 pcs",
      colours: "5 colours",
      fabric: "micro milange",
      description: "Soft micro milange shorts with elastic waistbands, great for running and active playing."
    },
    {
      id: 'k_tq_138',
      title: "Kids Lycra Pant",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 94,
      rating: 5,
      reviews: 39,
      image: kids_tq_138,
      badge: "TIKQ KIDS",
      modelNo: "TQ-138",
      size: "30, 32, 34, 36",
      moq: "Per size 6 pcs",
      colours: "5 colours",
      fabric: "LYCRARIB",
      description: "Premium kids track pants featuring sport lines and adjustable drawstrings."
    },
    {
      id: 'k_tq_137',
      title: "Chillout Cotton Outfit",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 213,
      rating: 5,
      reviews: 18,
      image: kids_tq_137,
      badge: "TIKQ KIDS",
      modelNo: "TQ-137",
      size: "6y",
      moq: "Per size 3 pcs",
      colours: "3 colours",
      fabric: "COTTON",
      description: "Soft organic cotton set with cute cycling bunny prints on top and matching bottom."
    },
    {
      id: 'k_tq_145',
      title: "Turbo Star Outfit",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 138,
      rating: 5,
      reviews: 22,
      image: kids_tq_145,
      badge: "TIKQ KIDS",
      modelNo: "TQ-145",
      size: "8Y, 10Y, 12Y, 14Y",
      moq: "Per size 5 pcs",
      colours: "5 colours",
      fabric: "DOTKNIT",
      description: "Aesthetic horizontal block colored dotknit shirt and shorts active set."
    },
    {
      id: 'k_tq_148',
      title: "Newborn Baby Rampers",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 188,
      rating: 5,
      reviews: 48,
      image: kids_tq_148,
      badge: "TIKQ BABY",
      modelNo: "TQ-148",
      size: "0-1M, 1-3M, 6-9M",
      moq: "Per size 4 pcs",
      colours: "4 colours",
      fabric: "INTERLOCK COTTON",
      description: "Ultra-soft baby rompers featuring striped patterns and quick diaper snap buttons."
    },
    {
      id: 'k_tq_151',
      title: "Newborn Baby Rampers Plain",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 150,
      rating: 5,
      reviews: 25,
      image: kids_tq_151,
      badge: "TIKQ BABY",
      modelNo: "TQ-151",
      size: "0-1M, 1-3M, 3-6M, 6-9M",
      moq: "Per size 3 pcs",
      colours: "3 colours",
      fabric: "100% COTTON",
      description: "Skin-friendly plain cotton rompers with cute cartoon chest animal patches."
    },
    {
      id: 'k_tq_152',
      title: "Smart Playtime Co-Ord",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 154,
      rating: 5,
      reviews: 29,
      image: kids_tq_152,
      badge: "TIKQ KIDS",
      modelNo: "TQ-152",
      size: "2Yr, 4Yr, 6Yr",
      moq: "Per size 5 pcs",
      colours: "5 colours",
      fabric: "LOOPER",
      description: "Fun all-over patterned casual tee and shorts play set in soft looper knit."
    },
    {
      id: 'k_tq_157',
      title: "Kids Cherged Co-Ord",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 169,
      rating: 5,
      reviews: 31,
      image: kids_tq_157,
      badge: "TIKQ KIDS",
      modelNo: "TQ-157",
      size: "2Yr, 4Yr, 6Yr",
      moq: "Per size 4 pcs",
      colours: "4 colours",
      fabric: "LOOPER",
      description: "Eye-catching pocket details and cute monster patch decoration on shorts and tee set."
    },
    {
      id: 'k_tq_161',
      title: "Girls Dreamy Comfort Wear",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 220,
      rating: 5,
      reviews: 19,
      image: kids_tq_161,
      badge: "TIKQ KIDS",
      modelNo: "TQ-161",
      size: "6Yr, 8Yr, 10Yr, 12Yr",
      moq: "Per size 4 pcs",
      colours: "4 colours",
      fabric: "T-SHIRT COTTONBIO WASH, PANT TESLA",
      description: "Premium wide-leg relaxed bottom set with a crop-cut floral t-shirt."
    },
    {
      id: 'k_tq_165',
      title: "Kids Casual Outfit",
      category: "CLOTHING",
      subCategory: "KIDS",
      price: 188,
      rating: 5,
      reviews: 38,
      image: kids_tq_165,
      badge: "TIKQ KIDS",
      modelNo: "TQ-165",
      size: "2Yr, 4Yr, 6Yr",
      moq: "Per size 5 pcs",
      colours: "5 colours",
      fabric: "COTTON 100% BIO WASH",
      description: "Stylish basket-ball print comfy daily tee and shorts set in premium bio-wash cotton."
    },

    // COUPLES
    {
      id: 'c1',
      title: "Royal Couple Silk Matching Set",
      category: "CLOTHING",
      subCategory: "COUPLES",
      price: 4500,
      rating: 5,
      reviews: 28,
      image: celebCouple,
      badge: "MATCHING"
    },
    {
      id: 'c2',
      title: "Linen Fusion Festive Couple Wear",
      category: "CLOTHING",
      subCategory: "COUPLES",
      price: 3800,
      rating: 5,
      reviews: 15,
      image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=600&q=80",
      badge: "MATCHING"
    }
  ].map(p => {
    if (p.modelNo) {
      return {
        ...p,
        images: getProductImages(p.modelNo, p.image)
      };
    }
    return p;
  });

  // Helper to determine if a product is in stock
  const isProductInStock = (p) => {
    return (p.title.length % 7 !== 0);
  };

  // Helper to get catalogue assignment
  const getProductCatalogue = (p) => {
    const code = p.id.charCodeAt(p.id.length - 1) + p.title.charCodeAt(0);
    return code % 2 === 0 ? 'A' : 'B';
  };

  // Filtering products
  let filteredProducts = activeTab === 'ALL'
    ? allProducts
    : allProducts.filter(p => p.category === activeTab);

  // Gender/Audience filter applies globally to any product that has a subCategory matching activeSubTab
  if (activeSubTab !== 'ALL') {
    filteredProducts = filteredProducts.filter(p => p.subCategory === activeSubTab);
  }

  // Catalogue filter
  filteredProducts = filteredProducts.filter(p => getProductCatalogue(p) === catalogue);

  // Search filter
  if (searchQuery.trim() !== '') {
    filteredProducts = filteredProducts.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  // Price filter
  filteredProducts = filteredProducts.filter(p => p.price <= priceRange);

  // Availability filter
  filteredProducts = filteredProducts.filter(p => {
    const inStock = isProductInStock(p);
    if (showInStock && showOutOfStock) return true;
    if (showInStock) return inStock;
    if (showOutOfStock) return !inStock;
    return false;
  });

  // Rating filter
  if (selectedRating !== null) {
    filteredProducts = filteredProducts.filter(p => p.rating === selectedRating);
  }

  // Sorting products
  if (sortBy === 'PRICE_LOW_HIGH') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'PRICE_HIGH_LOW') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'RATING') {
    filteredProducts.sort((a, b) => b.rating - a.rating);
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        size={13} 
        fill={i < rating ? "#d4af37" : "none"} 
        className={i < rating ? "star-filled" : "star-empty"}
        style={{ color: i < rating ? "#d4af37" : "#ccc" }}
      />
    ));
  };

  const getThemeClass = (prod) => {
    if (prod.category === 'CLOTHING' && prod.subCategory === 'KIDS') {
      return 'prod-theme-kids';
    }
    switch (prod.category) {
      case 'CLOTHING': return 'prod-theme-clothing';
      case 'GIFTS': return 'prod-theme-gifts';
      case 'STATIONERY': return 'prod-theme-stationery';
      case 'ACCESSORIES': return 'prod-theme-accessories';
      default: return '';
    }
  };

  const getBannerContent = () => {
    if (activeTab === 'CLOTHING') {
      switch (activeSubTab) {
        case 'KIDS':
          return {
            tagline: "TIKQ Kids",
            title: "Baby Boutique",
            subtitle: "Adorable, skin-friendly, and ultra-soft outfits designed for play and sweet comfort"
          };
        case 'COUPLES':
          return {
            tagline: "Festive Collection",
            title: "Couple Wear",
            subtitle: "Stunning matching ethnic ensembles designed for premium celebrations and couples"
          };
        case 'MEN':
          return {
            tagline: "Men's Style",
            title: "Men's Collection",
            subtitle: "Elegant shirts, casual wear, and traditional dhotis crafted for distinction"
          };
        case 'WOMEN':
          return {
            tagline: "Designer Style",
            title: "Women's Wardrobe",
            subtitle: "Premium sarees, luxury kurtis, and ethnic wear styled for elegance"
          };
        default:
          return {
            tagline: "Shop Our",
            title: "Clothing Collection",
            subtitle: "Trendy and traditional ethnic apparel selected for your entire family"
          };
      }
    } else if (activeTab === 'GIFTS') {
      return {
        tagline: "Handcrafted Favorites",
        title: "Gifts & Return Favors",
        subtitle: "Celebrate life's special moments with luxury hampers and custom return gifts"
      };
    } else if (activeTab === 'STATIONERY') {
      return {
        tagline: "Aesthetic Planners",
        title: "Stationery & Journals",
        subtitle: "Premium journals, gold-embellished pens, and desk accessories to inspire creativity"
      };
    } else if (activeTab === 'ACCESSORIES') {
      return {
        tagline: "Luxury Accents",
        title: "Fashion Accessories",
        subtitle: "Authentic jasmine gajras, rings, and handcrafted details to elevate your style"
      };
    }
    
    return {
      tagline: "Shop Our",
      title: "Exclusive Collection",
      subtitle: "Premium Quality • Unique Designs • Best Prices"
    };
  };

  const bannerContent = getBannerContent();

  const clothingCount = allProducts.filter(p => p.category === 'CLOTHING').length;
  const stationeryCount = allProducts.filter(p => p.category === 'STATIONERY').length;
  const giftsCount = allProducts.filter(p => p.category === 'GIFTS').length;
  const accessoriesCount = allProducts.filter(p => p.category === 'ACCESSORIES').length;

  const inStockCount = allProducts.filter(p => isProductInStock(p)).length;
  const outOfStockCount = allProducts.filter(p => !isProductInStock(p)).length;

  const getRatingCount = (r) => allProducts.filter(p => p.rating === r).length;

  const productsPerPage = 12;
  const totalProductsCount = filteredProducts.length;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(totalProductsCount / productsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="shop-view-page">
      
      {/* Premium Shop Header Banner */}
      <div className="shop-banner">
        {/* Background image on the right */}
        <img src={shopBannerRaw} className="shop-banner-bg-image" alt="Exclusive Collection" />
        
        {/* Left-to-right gradient overlay to blend image and provide solid text area */}
        <div className="shop-banner-overlay-gradient"></div>
        
        {/* Content positioned on the left */}
        <div className="shop-banner-content">
          <span className="shop-banner-tagline">{bannerContent.tagline}</span>
          <h1 className="shop-banner-title">{bannerContent.title}</h1>
          <p className="shop-banner-subtitle">{bannerContent.subtitle}</p>
          <div className="shop-banner-divider">
            <span className="shop-banner-divider-line"></span>
            <span className="shop-banner-divider-motif">✧ ❀ ✧</span>
            <span className="shop-banner-divider-line"></span>
          </div>
        </div>
      </div>

      <div className="shop-content-container">
        
        {/* Top Circular Category Navigation Tabs */}
        <div className="shop-category-circles-wrapper">
          {[
            { key: 'CLOTHING', label: 'Clothing', img: imgClothing, count: `${clothingCount} items` },
            { key: 'STATIONERY', label: 'Stationery', img: imgStationery, count: `${stationeryCount} items` },
            { key: 'GIFTS', label: 'Gifts', img: imgGifts, count: `${giftsCount} items` },
            { key: 'ACCESSORIES', label: 'Accessories', img: imgAccessories, count: `${accessoriesCount} items` }
          ].map((item) => (
            <div 
              key={item.key} 
              className={`shop-category-circle-card ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.key);
                setActiveSubTab('ALL');
                const newUrl = `/Shop?category=${item.key.toLowerCase()}`;
                window.history.pushState({}, '', newUrl);
              }}
            >
              <div className="shop-category-circle-img-container">
                <img src={item.img} className="shop-category-circle-img" alt={item.label} />
              </div>
              <span className="shop-category-circle-name">{item.label}</span>
              <span className="shop-category-circle-count">{item.count}</span>
            </div>
          ))}
        </div>

        {/* Two Column Layout: Left Sidebar + Right Products */}
        <div className="shop-main-layout">
          
          {/* Left Sidebar Filters */}
          <aside className="shop-sidebar-filters">
            
            {/* 1. Select Catalogue */}
            <div className={`shop-filter-group ${isCatalogueOpen ? 'active-glow' : ''}`}>
              <div className="shop-filter-header" onClick={() => setIsCatalogueOpen(!isCatalogueOpen)}>
                <h3 className="shop-filter-title">Select Catalogue</h3>
                <ChevronDown 
                  size={18} 
                  className={`shop-filter-chevron ${!isCatalogueOpen ? 'rotated' : ''}`} 
                />
              </div>
              <div className="shop-filter-shine"></div>
              <div className={`shop-filter-content-wrapper ${isCatalogueOpen ? 'open' : ''}`}>
                <div className="shop-catalogue-toggle">
                  <button 
                    className={`catalogue-btn ${catalogue === 'A' ? 'active' : ''}`}
                    onClick={() => setCatalogue('A')}
                  >
                    Catalogue A
                  </button>
                  <button 
                    className={`catalogue-btn ${catalogue === 'B' ? 'active' : ''}`}
                    onClick={() => setCatalogue('B')}
                  >
                    Catalogue B
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Categories List */}
            <div className={`shop-filter-group ${isCategoriesOpen ? 'active-glow' : ''}`}>
              <div className="shop-filter-header" onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}>
                <h3 className="shop-filter-title">Categories</h3>
                <ChevronDown 
                  size={18} 
                  className={`shop-filter-chevron ${!isCategoriesOpen ? 'rotated' : ''}`} 
                />
              </div>
              <div className="shop-filter-shine"></div>
              <div className={`shop-filter-content-wrapper ${isCategoriesOpen ? 'open' : ''}`}>
                <ul className="shop-sidebar-list">
                  <li 
                    className={activeTab === 'ALL' ? 'active' : ''}
                    onClick={() => {
                      setActiveTab('ALL');
                      setActiveSubTab('ALL');
                      window.history.pushState({}, '', '/Shop');
                    }}
                  >
                    <span>All Categories</span>
                    <span>({allProducts.length})</span>
                  </li>
                  {[
                    { key: 'CLOTHING', label: 'Clothing', count: clothingCount },
                    { key: 'STATIONERY', label: 'Stationery', count: stationeryCount },
                    { key: 'GIFTS', label: 'Gifts', count: giftsCount },
                    { key: 'ACCESSORIES', label: 'Accessories', count: accessoriesCount }
                  ].map((cat) => (
                    <li 
                      key={cat.key}
                      className={activeTab === cat.key ? 'active' : ''}
                      onClick={() => {
                        setActiveTab(cat.key);
                        // If we switch to a category that isn't clothing, reset subTab to ALL
                        if (cat.key !== 'CLOTHING') {
                          setActiveSubTab('ALL');
                          window.history.pushState({}, '', `/Shop?category=${cat.key.toLowerCase()}`);
                        } else {
                          // Keep activeSubTab if it was already selected
                          const newUrl = activeSubTab === 'ALL' 
                            ? `/Shop?category=clothing` 
                            : `/Shop?category=clothing&subcategory=${activeSubTab.toLowerCase()}`;
                          window.history.pushState({}, '', newUrl);
                        }
                      }}
                    >
                      <span>{cat.label}</span>
                      <span>({cat.count})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 3. Gender & Audience Filter */}
            <div className={`shop-filter-group ${isGenderOpen ? 'active-glow' : ''}`}>
              <div className="shop-filter-header" onClick={() => setIsGenderOpen(!isGenderOpen)}>
                <h3 className="shop-filter-title">Gender & Audience</h3>
                <ChevronDown 
                  size={18} 
                  className={`shop-filter-chevron ${!isGenderOpen ? 'rotated' : ''}`} 
                />
              </div>
              <div className="shop-filter-shine"></div>
              <div className={`shop-filter-content-wrapper ${isGenderOpen ? 'open' : ''}`}>
                <ul className="shop-sidebar-list">
                  <li 
                    className={activeSubTab === 'ALL' ? 'active' : ''}
                    onClick={() => {
                      setActiveSubTab('ALL');
                      const newUrl = activeTab === 'ALL' 
                        ? '/Shop' 
                        : `/Shop?category=${activeTab.toLowerCase()}`;
                      window.history.pushState({}, '', newUrl);
                    }}
                  >
                    <span>✨ All Collections</span>
                    <span>({allProducts.length})</span>
                  </li>
                  {[
                    { key: 'MEN', label: '👔 Male (Men)', count: allProducts.filter(p => p.subCategory === 'MEN').length },
                    { key: 'WOMEN', label: '💃 Female (Women)', count: allProducts.filter(p => p.subCategory === 'WOMEN').length },
                    { key: 'KIDS', label: '🧸 Kids (Children)', count: allProducts.filter(p => p.subCategory === 'KIDS').length },
                    { key: 'COUPLES', label: '👩‍❤️‍👨 Couples & Festive', count: allProducts.filter(p => p.subCategory === 'COUPLES').length }
                  ].map((item) => (
                    <li 
                      key={item.key}
                      className={activeSubTab === item.key ? 'active' : ''}
                      onClick={() => {
                        setActiveSubTab(item.key);
                        // Auto-switch to clothing category if current category does not support subCategory
                        let targetTab = activeTab;
                        if (activeTab !== 'CLOTHING' && activeTab !== 'ALL') {
                          targetTab = 'CLOTHING';
                          setActiveTab('CLOTHING');
                        }
                        const newUrl = `/Shop?category=${targetTab.toLowerCase()}&subcategory=${item.key.toLowerCase()}`;
                        window.history.pushState({}, '', newUrl);
                      }}
                    >
                      <span>{item.label}</span>
                      <span>({item.count})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 4. Price Range Slider */}
            <div className={`shop-filter-group ${isPriceOpen ? 'active-glow' : ''}`}>
              <div className="shop-filter-header" onClick={() => setIsPriceOpen(!isPriceOpen)}>
                <h3 className="shop-filter-title">Price Range</h3>
                <ChevronDown 
                  size={18} 
                  className={`shop-filter-chevron ${!isPriceOpen ? 'rotated' : ''}`} 
                />
              </div>
              <div className="shop-filter-shine"></div>
              <div className={`shop-filter-content-wrapper ${isPriceOpen ? 'open' : ''}`}>
                <div className="shop-price-slider-container">
                  <input 
                    type="range" 
                    min="100" 
                    max="5000" 
                    step="50"
                    value={priceRange} 
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="shop-price-slider"
                  />
                  <div className="shop-price-labels">
                    <span>₹100</span>
                    <span>₹{priceRange.toLocaleString()}{priceRange >= 5000 ? '+' : ''}</span>
                  </div>
                  <button 
                    className="shop-price-filter-btn"
                    onClick={() => alert(`Filtered price up to ₹${priceRange}`)}
                  >
                    FILTER
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Availability */}
            <div className={`shop-filter-group ${isAvailabilityOpen ? 'active-glow' : ''}`}>
              <div className="shop-filter-header" onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}>
                <h3 className="shop-filter-title">Availability</h3>
                <ChevronDown 
                  size={18} 
                  className={`shop-filter-chevron ${!isAvailabilityOpen ? 'rotated' : ''}`} 
                />
              </div>
              <div className="shop-filter-shine"></div>
              <div className={`shop-filter-content-wrapper ${isAvailabilityOpen ? 'open' : ''}`}>
                <ul className="shop-sidebar-checkbox-list">
                  <li>
                    <label className="checkbox-label">
                       <input 
                         type="checkbox" 
                         checked={showInStock}
                         onChange={(e) => setShowInStock(e.target.checked)}
                       />
                       <span>In Stock ({inStockCount})</span>
                     </label>
                  </li>
                  <li>
                    <label className="checkbox-label">
                       <input 
                         type="checkbox" 
                         checked={showOutOfStock}
                         onChange={(e) => setShowOutOfStock(e.target.checked)}
                       />
                       <span>Out of Stock ({outOfStockCount})</span>
                     </label>
                  </li>
                </ul>
              </div>
            </div>

            {/* 6. Ratings */}
            <div className={`shop-filter-group ${isRatingsOpen ? 'active-glow' : ''}`}>
              <div className="shop-filter-header" onClick={() => setIsRatingsOpen(!isRatingsOpen)}>
                <h3 className="shop-filter-title">Ratings</h3>
                <ChevronDown 
                  size={18} 
                  className={`shop-filter-chevron ${!isRatingsOpen ? 'rotated' : ''}`} 
                />
              </div>
              <div className="shop-filter-shine"></div>
              <div className={`shop-filter-content-wrapper ${isRatingsOpen ? 'open' : ''}`}>
                <ul className="shop-sidebar-ratings-list">
                  {[5, 4, 3, 2, 1].map((starsNum) => (
                    <li 
                      key={starsNum}
                      className={`rating-row ${selectedRating === starsNum ? 'active' : ''}`}
                      onClick={() => setSelectedRating(selectedRating === starsNum ? null : starsNum)}
                    >
                      <div className="rating-stars-preview">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < starsNum ? "#d4af37" : "none"} 
                            className={i < starsNum ? "star-filled" : "star-empty"}
                            style={{ color: i < starsNum ? "#d4af37" : "#ccc", marginRight: '2px' }}
                          />
                        ))}
                      </div>
                      <span className="rating-row-count">({getRatingCount(starsNum)})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </aside>

          {/* Right Product List Column */}
          <div className="shop-products-column">
            
            {/* Header controls (Showing results count + Sort box + Search Box) */}
            <div className="shop-products-header">
              <div className="shop-results-count">
                Showing {totalProductsCount > 0 ? indexOfFirstProduct + 1 : 0}–{Math.min(indexOfLastProduct, totalProductsCount)} of {totalProductsCount} results
              </div>
              
              <div className="shop-header-actions">
                <div className="shop-search-box">
                  <Search size={16} className="search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search products..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="shop-search-input"
                  />
                </div>

                <div className="shop-sort-box">
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="shop-sort-select"
                  >
                    <option value="DEFAULT">Sort by: Newest</option>
                    <option value="PRICE_LOW_HIGH">Price: Low to High</option>
                    <option value="PRICE_HIGH_LOW">Price: High to Low</option>
                    <option value="RATING">Rating: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Product Grid View */}
            {currentProducts.length > 0 ? (
              <>
                <div className="shop-products-grid animate-fade-in-up">
                  {currentProducts.map((prod) => (
                    <div 
                      key={prod.id} 
                      className={`product-card shop-prod-card ${getThemeClass(prod)} ${prod.subCategory === 'KIDS' ? 'kids-img-only-card' : ''}`}
                      onClick={() => setSelectedProduct(prod)}
                      style={{ cursor: 'pointer' }}
                    >
                      
                      <div className="prod-img-wrapper" style={{ aspectRatio: prod.subCategory === 'KIDS' ? '1 / 1.35' : '1 / 1.1' }}>
                        {prod.subCategory !== 'KIDS' && (
                          <>
                            <span className={`prod-badge ${prod.modelNo ? 'kids-glow-badge' : ''}`}>
                              {prod.subCategory === 'KIDS' ? '🧸 ' : ''}{prod.badge}
                            </span>
                            
                            <button 
                              className={`prod-wishlist-btn ${wishlist.includes(prod.id) ? 'active' : ''}`}
                              onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                              aria-label="Add to Wishlist"
                            >
                              <Heart size={18} fill={wishlist.includes(prod.id) ? "currentColor" : "none"} />
                            </button>
                          </>
                        )}
                        
                        <img src={prod.image} alt={prod.title} className="prod-img" />
                        
                        {prod.subCategory !== 'KIDS' && (
                          <div className="shop-card-hover-overlay">
                            <button 
                              className="shop-add-cart-btn"
                              onClick={(e) => { e.stopPropagation(); toggleCart(prod.id, prod.title); }}
                            >
                              <ShoppingCart size={16} style={{ marginRight: '6px' }} />
                              {cart.includes(prod.id) ? "In Cart" : "Add to Cart"}
                            </button>
                            <button 
                              className="shop-quick-btn"
                              onClick={(e) => { e.stopPropagation(); setSelectedProduct(prod); }}
                              style={{ 
                                marginTop: '10px',
                                backgroundColor: '#ffffff',
                                color: 'var(--text-dark)',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '10px 16px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                transition: 'var(--transition)'
                              }}
                            >
                              Quick View
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Details Footer - HIDE for kids section cards */}
                      {prod.subCategory !== 'KIDS' && (
                        <div className="prod-details">
                          <span className="prod-card-category">{prod.category} {prod.subCategory ? `| ${prod.subCategory}` : ''}</span>
                          <h4 className="prod-card-title">{prod.title}</h4>
                          
                          <div className="prod-card-rating">
                            <div className="stars-wrapper">{renderStars(prod.rating)}</div>
                            <span className="reviews-count">({prod.reviews})</span>
                          </div>

                          <div className="prod-card-price-row">
                            <span className="prod-card-price">₹{prod.price.toLocaleString()}</span>
                          </div>
                        </div>
                      )}

                      {/* Glowing animation shimmer element */}
                      <div className="celeb-shimmer-sweep"></div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="shop-pagination">
                    {pageNumbers.map(number => (
                      <button
                        key={number}
                        onClick={() => {
                          setCurrentPage(number);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        className={`pagination-number-btn ${currentPage === number ? 'active' : ''}`}
                      >
                        {number}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        if (currentPage < totalPages) {
                          setCurrentPage(prev => prev + 1);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }
                      }}
                      disabled={currentPage === totalPages}
                      className="pagination-next-btn"
                    >
                      Next &rarr;
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="shop-empty-state">
                <h3>No products found matching your criteria</h3>
                <p>Try checking your search query or selecting a different category filter</p>
              </div>
            )}

            {/* Back to homepage button */}
            <div className="shop-footer-actions">
              <button onClick={handleBackToHome} className="shop-back-home-btn">
                Back to Homepage
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Quick View Interactive Modal */}
      {selectedProduct && (
        <div className="modal-overlay animate-fade-in" onClick={() => setSelectedProduct(null)}>
          <div className="quickview-modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            
            {/* Close button */}
            <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>
              <X size={20} />
            </button>

            <div className="modal-layout">
              {/* Left Column: Image */}
              <div className="modal-image-side">
                <div className="modal-carousel-wrapper">
                  <img 
                    src={selectedProduct.images ? selectedProduct.images[activeImageIndex] : selectedProduct.image} 
                    alt={selectedProduct.title} 
                    className="modal-product-img" 
                  />
                  <div className="modal-image-shimmer"></div>

                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <>
                      <button 
                        className="carousel-arrow prev" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prevIndex) => 
                            prevIndex === 0 ? selectedProduct.images.length - 1 : prevIndex - 1
                          );
                        }}
                        aria-label="Previous Image"
                      >
                        &#10094;
                      </button>
                      <button 
                        className="carousel-arrow next" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prevIndex) => 
                            prevIndex === selectedProduct.images.length - 1 ? 0 : prevIndex + 1
                          );
                        }}
                        aria-label="Next Image"
                      >
                        &#10095;
                      </button>
                    </>
                  )}
                </div>

                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div className="modal-carousel-dots">
                    {selectedProduct.images.map((img, idx) => (
                      <button
                        key={idx}
                        className={`carousel-dot ${activeImageIndex === idx ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(idx);
                        }}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <div className="modal-carousel-thumbnails">
                    {selectedProduct.images.map((img, idx) => (
                      <div 
                        key={idx}
                        className={`modal-thumbnail-wrapper ${activeImageIndex === idx ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(idx);
                        }}
                      >
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="modal-thumbnail-img" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Info details */}
              <div className="modal-info-side">
                <span className="modal-category">{selectedProduct.category} {selectedProduct.subCategory ? `| ${selectedProduct.subCategory}` : ''}</span>
                <h2 className="modal-title">{selectedProduct.title}</h2>
                <span className="modal-price">₹{selectedProduct.price.toLocaleString()}</span>
                
                <p className="modal-desc">{selectedProduct.description || "Indulge in our handpicked selections crafted to match your cultural roots and premium choices."}</p>

                {/* Kids Custom Specs Grid from PDF */}
                {selectedProduct.modelNo && (
                  <div className="modal-kids-spec-box">
                    <strong style={{ color: 'var(--primary-rose-dark)', fontSize: '0.82rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🧸</span> TIKQ KIDSWEAR AUTHENTIC DETAILS:
                    </strong>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: '0.88rem', color: 'var(--text-dark)', marginTop: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🏷️</span>
                        <span><strong>Model No:</strong> {selectedProduct.modelNo}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🧵</span>
                        <span><strong>Fabric:</strong> {selectedProduct.fabric}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📏</span>
                        <span><strong>Sizes:</strong> {selectedProduct.size}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🎨</span>
                        <span><strong>Colours:</strong> {selectedProduct.colours}</span>
                      </span>
                      <span style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📦</span>
                        <span><strong>MOQ:</strong> {selectedProduct.moq}</span>
                      </span>
                    </div>
                  </div>
                )}

                <div className="modal-actions-row" style={{ marginTop: '25px' }}>
                  <button 
                    className="modal-add-cart-btn"
                    onClick={() => {
                      toggleCart(selectedProduct.id, selectedProduct.title);
                      setSelectedProduct(null);
                    }}
                  >
                    <ShoppingCart size={18} />
                    <span>{cart.includes(selectedProduct.id) ? "Remove from Cart" : "Add to Cart"}</span>
                  </button>
                  <button 
                    className={`modal-wish-btn ${wishlist.includes(selectedProduct.id) ? 'active' : ''}`}
                    onClick={() => toggleWishlist(selectedProduct.id)}
                  >
                    <Heart size={18} fill={wishlist.includes(selectedProduct.id) ? "var(--primary-rose)" : "none"} />
                  </button>
                </div>

                {/* WhatsApp Inquiry for TIKQ Products */}
                {selectedProduct.modelNo && (
                  <a 
                    href={`https://wa.me/916384438557?text=Hi, I am interested in TIKQ Kidswear product: ${selectedProduct.title} (Model: ${selectedProduct.modelNo}). Please provide details.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-whatsapp-btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      backgroundColor: '#25D366',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 0',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      marginTop: '15px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)',
                      transition: 'var(--transition)'
                    }}
                  >
                    <Phone size={16} />
                    <span>Inquire via WhatsApp (+91 6384438557)</span>
                  </a>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
