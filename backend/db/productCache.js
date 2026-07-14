const { Product } = require('./database');

let cachedProducts = null;
let fetchPromise = null;

const getProductsFromDb = async () => {
  if (fetchPromise) return fetchPromise;
  
  fetchPromise = (async () => {
    try {
      console.log('Fetching products from database...');
      console.time('DB_Fetch_Products');
      const rawProducts = await Product.find({}).lean();
      console.timeEnd('DB_Fetch_Products');
      
      const mapped = rawProducts.map(p => {
        const obj = {};
        if (Array.isArray(p.attributes)) {
          p.attributes.forEach(attr => {
            if (attr && attr.key) {
              obj[attr.key] = attr.value;
            }
          });
        }
        return {
          ...p,
          attributes: obj
        };
      });
      cachedProducts = mapped;
      return mapped;
    } catch (err) {
      console.error('Error fetching products from DB:', err);
      throw err;
    } finally {
      fetchPromise = null;
    }
  })();
  
  return fetchPromise;
};

const getProductsList = async (isAdmin = false) => {
  if (cachedProducts) {
    if (isAdmin) return cachedProducts;
    return cachedProducts.filter(p => p.status === 'Active');
  }
  
  const products = await getProductsFromDb();
  if (isAdmin) return products;
  return products.filter(p => p.status === 'Active');
};

const clearProductsCache = () => {
  console.log('Clearing products cache...');
  cachedProducts = null;
  fetchPromise = null;
};

module.exports = {
  getProductsList,
  clearProductsCache
};