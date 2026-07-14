const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const ATLAS_URI = 'mongodb://sumathi:Renaldofeb5@ac-qf7i2co-shard-00-00.noj9u3c.mongodb.net:27017,ac-qf7i2co-shard-00-01.noj9u3c.mongodb.net:27017,ac-qf7i2co-shard-00-02.noj9u3c.mongodb.net:27017/mithirashoppy?ssl=true&replicaSet=atlas-jwu398-shard-0&authSource=admin&retryWrites=true&w=majority';

function saveBase64Image(base64Str, prefix) {
  if (!base64Str || typeof base64Str !== 'string' || !base64Str.startsWith('data:image/')) {
    return base64Str; // not a base64 string, keep it as is
  }
  
  const match = base64Str.match(/^data:image\/(\w+);base64,/);
  if (!match) return base64Str;
  
  const ext = match[1]; // e.g. jpeg, png, webp
  const data = base64Str.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(data, 'base64');
  
  const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
  const dir = path.join(__dirname, 'uploads', 'products');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(dir, filename), buffer);
  console.log(`Saved base64 image: ${filename}`);
  return `/uploads/products/${filename}`;
}

async function migrate() {
  const client = await MongoClient.connect(ATLAS_URI);
  const db = client.db();
  console.log('Connected to MongoDB Atlas...');
  
  const products = await db.collection('products').find({}).toArray();
  console.log(`Found ${products.length} products to migrate.`);
  
  for (const product of products) {
    const id = product.id;
    console.log(`Processing product ID: ${id}, Name: ${product.name}`);
    
    // 1. Process main image
    const newMainImage = saveBase64Image(product.image, `product_${id}_main`);
    
    // 2. Process gallery images
    let newGalleryImages = [];
    if (Array.isArray(product.images)) {
      newGalleryImages = product.images.map((img, idx) => saveBase64Image(img, `product_${id}_gallery_${idx}`));
    }
    
    // 3. Process variant images
    let newVariants = [];
    if (Array.isArray(product.variants)) {
      newVariants = product.variants.map((variant, idx) => {
        const newVarImage = saveBase64Image(variant.image, `product_${id}_var_${idx}`);
        return {
          ...variant,
          image: newVarImage
        };
      });
    }
    
    // Update product in database
    await db.collection('products').updateOne(
      { _id: product._id },
      {
        $set: {
          image: newMainImage,
          images: newGalleryImages,
          variants: newVariants
        }
      }
    );
    console.log(`Successfully migrated product ID: ${id}`);
  }
  
  console.log('Migration finished successfully!');
  await client.close();
}

migrate().catch(console.error);
