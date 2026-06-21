const fs = require('fs');

const adminFilePath = 'C:\\Users\\ELCOT\\.gemini\\antigravity\\brain\\2d212596-f3cf-435c-ac88-5662fb002ce4\\.system_generated\\steps\\4772\\content.md';

if (fs.existsSync(adminFilePath)) {
  const content = fs.readFileSync(adminFilePath, 'utf8');
  
  // Find all string literals (in backticks or quotes) that contain common words
  const strings = [];
  const regex = /`([^`]{2,150})`/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    strings.push(match[1]);
  }
  
  // Filter for strings related to products, forms, headers, or features
  const keywords = [
    'product', 'price', 'stock', 'weight', 'volume', 'qty', 'quantity', 'category', 'status',
    'ghee', 'honey', 'spice', 'oil', 'organic', 'wellness', 'bilona', 'a2', 'bottle', 'jar',
    'ml', 'gm', 'kg', 'liter', 'variant', 'sku', 'image', 'upload', 'add', 'edit', 'delete',
    'save', 'cancel', 'description', 'title', 'name', 'brand', 'discount', 'rating', 'review',
    'tax', 'hsn', 'code', 'shipping', 'delivery', 'purity', 'lab', 'test', 'shelf', 'life'
  ];
  
  const filtered = strings.filter(str => {
    const s = str.toLowerCase();
    return keywords.some(k => s.includes(k)) && !s.includes('http') && s.length < 100;
  });
  
  // Remove duplicates
  const unique = [...new Set(filtered)];
  
  console.log("Found unique UI strings related to product details and features:");
  unique.sort().forEach((str, i) => {
    console.log(`- ${str}`);
  });
} else {
  console.log("Admin file not found");
}
