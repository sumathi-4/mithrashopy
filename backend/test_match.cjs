const mongoose = require('mongoose');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mithirashoppy';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    const Product = mongoose.connection.model('Product', new mongoose.Schema({}, { strict: false }), 'products');
    const Category = mongoose.connection.model('Category', new mongoose.Schema({}, { strict: false }), 'categories');
    
    const rawProducts = await Product.find().lean();
    const categoriesList = await Category.find().lean();

    // Map raw products as done in ShopView.jsx useEffect
    const allProducts = rawProducts.map((p, idx) => {
      let catUpper = (p.category || 'CLOTHING').toUpperCase();
      let cleanCategory = 'CLOTHING';
      let extractedSub = p.subCategory || '';

      if (p.category && p.category.includes('>')) {
        const parts = p.category.split('>').map(x => x.trim());
        const rootCat = parts[0].toUpperCase();
        if (rootCat.includes('CLOTHING')) cleanCategory = 'CLOTHING';
        else if (rootCat.includes('STATIONERY')) cleanCategory = 'STATIONERY';
        else if (rootCat.includes('GIFT')) cleanCategory = 'GIFTS';
        else if (rootCat.includes('ACCESSORIES')) cleanCategory = 'ACCESSORIES';
        else cleanCategory = rootCat;

        extractedSub = parts[parts.length - 1];
      } else {
        if (catUpper.includes('CLOTHING')) cleanCategory = 'CLOTHING';
        else if (catUpper.includes('STATIONERY')) cleanCategory = 'STATIONERY';
        else if (catUpper.includes('GIFT')) cleanCategory = 'GIFTS';
        else if (catUpper.includes('ACCESSORIES')) cleanCategory = 'ACCESSORIES';
        else cleanCategory = catUpper;
      }
      return {
        ...p,
        title: p.name || p.title || 'Product',
        category: cleanCategory,
        subCategory: extractedSub
      };
    });

    const getUnifiedCategories = () => {
      const defaultGroups = [
        { name: 'Clothing', key: 'CLOTHING' },
        { name: 'Stationery', key: 'STATIONERY' },
        { name: 'Gifts', key: 'GIFTS' },
        { name: 'Accessories', key: 'ACCESSORIES' }
      ];

      const buildTree = (parentName, parentKey) => {
        if (!categoriesList || categoriesList.length === 0) return [];
        const dbChildren = categoriesList.filter(cat => cat.parent && cat.parent.toLowerCase() === parentName.toLowerCase());
        return dbChildren.map(cat => {
          const uniqueKey = `${parentKey}_${cat.name.toUpperCase().replace(/\s+/g, '_')}`;
          return {
            key: uniqueKey,
            dbName: cat.name,
            label: cat.name,
            children: buildTree(cat.name, uniqueKey)
          };
        });
      };

      const structure = [];
      const dbRoots = categoriesList.filter(cat => (!cat.parent || cat.parent === '—') && cat.name !== '—');

      defaultGroups.forEach(def => {
        const dbRoot = dbRoots.find(r => r.name.toLowerCase() === def.name.toLowerCase());
        const subcategories = dbRoot ? buildTree(dbRoot.name, def.key) : [];
        structure.push({
          name: def.name,
          key: def.key,
          subcategories
        });
      });

      dbRoots.forEach(dbRoot => {
        const alreadyAdded = structure.some(s => s.name.toLowerCase() === dbRoot.name.toLowerCase());
        if (!alreadyAdded) {
          const key = dbRoot.name.toUpperCase().replace(/\s+/g, '_');
          structure.push({
            name: dbRoot.name,
            key,
            subcategories: buildTree(dbRoot.name, key)
          });
        }
      });
      return structure;
    };

    const getProductSubCategory = (p) => {
      if (p.subCategory) return p.subCategory.toUpperCase();
      const title = p.title.toLowerCase();
      if (p.category === 'CLOTHING') {
        if (title.includes('girl')) return 'GIRLS';
        if (title.includes('boy')) return 'BOYS';
        if (title.includes('kids') || title.includes('child')) return 'KIDS';
        if (title.includes('men') || title.includes('male') || title.includes('dhoti') || title.includes('kurta')) return 'MEN';
        if (title.includes('women') || title.includes('saree') || title.includes('frock') || title.includes('lehenga') || title.includes('anarkali') || title.includes('kurti')) return 'WOMEN';
        return 'WOMEN';
      }
      return 'ALL';
    };

    const getAllSubcategoryKeysUnder = (subCategoryDbName) => {
      if (!subCategoryDbName || subCategoryDbName === 'ALL') return [];
      const unified = getUnifiedCategories();
      
      const collectDbNames = (node) => {
        let names = [node.dbName.toUpperCase()];
        if (node.children && node.children.length > 0) {
          node.children.forEach(child => {
            names = [...names, ...collectDbNames(child)];
          });
        }
        return names;
      };

      const findNode = (nodes) => {
        for (const node of nodes) {
          if (node.dbName.toUpperCase() === subCategoryDbName.toUpperCase()) {
            return node;
          }
          if (node.children && node.children.length > 0) {
            const found = findNode(node.children);
            if (found) return found;
          }
        }
        return null;
      };

      for (const group of unified) {
        const found = findNode(group.subcategories);
        if (found) {
          return collectDbNames(found);
        }
      }
      return [subCategoryDbName.toUpperCase()];
    };

    console.log('--- TEST RUN ---');
    const checkedShirtsProd = allProducts.find(p => p.name === 'checked shirts');
    console.log('Product subCategory:', checkedShirtsProd.subCategory);
    console.log('getProductSubCategory(product):', getProductSubCategory(checkedShirtsProd));

    const activeSubTab = 'SHIRTS';
    const allowedKeys = getAllSubcategoryKeysUnder(activeSubTab);
    console.log('allowedKeys for SHIRTS:', allowedKeys);
    console.log('Matches:', allowedKeys.includes(getProductSubCategory(checkedShirtsProd)));

    const activeSubTabMen = 'MEN';
    const allowedKeysMen = getAllSubcategoryKeysUnder(activeSubTabMen);
    console.log('allowedKeys for MEN:', allowedKeysMen);
    console.log('Matches Men:', allowedKeysMen.includes(getProductSubCategory(checkedShirtsProd)));

    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  });
