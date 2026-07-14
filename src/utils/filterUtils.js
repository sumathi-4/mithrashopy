export const COLOR_MAP = {
  pink: '#E94FA8',
  red: '#FF0000',
  yellow: '#FFCC00',
  green: '#00CC66',
  purple: '#8A2BE2',
  black: '#000000',
  white: '#FFFFFF',
  blue: '#051838',
  navy: '#051838',
  orange: '#FF6600',
  grey: '#808080',
  gray: '#808080',
  brown: '#8B4513',
  gold: '#D4AF37',
  silver: '#C0C0C0',
  beige: '#F5F5DC',
  maroon: '#800000',
  lavender: '#E6E6FA',
  teal: '#008080',
  coral: '#FF7F50',
  peach: '#FFDAB9',
  cream: '#FFFDD0',
  khaki: '#F0E68C',
  olive: '#808000',
  plum: '#8E44AD',
  sage: '#BC8F8F',
  charcoal: '#36454F',
  magenta: '#FF00FF',
  cyan: '#00FFFF',
  mustard: '#FFDB58',
  violet: '#EE82EE',
  indigo: '#4B0082',
  bronze: '#CD7F32',
  copper: '#B87333',
  rust: '#B7410E',
  turquoise: '#40E0D0',
  apricot: '#FBCEB1',
  rose: '#FF007F',
  wine: '#722F37',
  mint: '#98FF98',
  'sage green': '#99b399',
  'mint green': '#66e0a3',
  'light blue': '#88ccff',
  'purple-white': '#b39ddb',
  'yellow-white': '#fff59d',
  'pink-white': '#f8bbd0',
  'green-white': '#a5d6a7',
  'black-white': '#e0e0e0',
  'crimson red': '#b32142',
  'champagne gold': '#D4AF37',
  'midnight black': '#111111',
  'pure white': '#ffffff',
  'ocean blue': '#051838',
  'soft pink': '#f8bbd0',
  'blue-white': '#051838'
};

export const getColorHex = (name) => {
  if (!name) return '#cccccc';
  const key = name.toLowerCase().trim();
  return COLOR_MAP[key] || name.trim() || '#cccccc';
};

export const getValuesForFilter = (product, filterName) => {
  if (!product || !filterName) return [];
  const nameLower = String(filterName).toLowerCase().trim();

  const cleanValues = (val) => {
    if (val === undefined || val === null) return [];
    if (Array.isArray(val)) {
      return val.map(v => String(v).trim()).filter(Boolean);
    }
    return [String(val).trim()].filter(Boolean);
  };

  // 1. Direct property check
  for (const key of Object.keys(product)) {
    if (key.toLowerCase() === nameLower) {
      const val = product[key];
      if (val !== undefined && val !== null) {
        return cleanValues(val);
      }
    }
  }

  // Camelcase fallback, e.g., "Neck Type" -> "neckType"
  const camelKey = filterName.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
  if (product[camelKey] !== undefined && product[camelKey] !== null) {
    return cleanValues(product[camelKey]);
  }

  // 2. product.attributes
  if (product.attributes && typeof product.attributes === 'object') {
    for (const key of Object.keys(product.attributes)) {
      if (key.toLowerCase() === nameLower) {
        return cleanValues(product.attributes[key]);
      }
    }
    if (product.attributes[camelKey] !== undefined && product.attributes[camelKey] !== null) {
      return cleanValues(product.attributes[camelKey]);
    }
  }

  // 3. product.specifications
  if (product.specifications && typeof product.specifications === 'object') {
    for (const key of Object.keys(product.specifications)) {
      if (key.toLowerCase() === nameLower) {
        return cleanValues(product.specifications[key]);
      }
    }
  }
  if (Array.isArray(product.specifications)) {
    for (const spec of product.specifications) {
      if (spec && spec.name && spec.name.toLowerCase() === nameLower) {
        return cleanValues(spec.value);
      }
    }
  }

  // 4. Variant check
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const values = new Set();
    for (const variant of product.variants) {
      if (variant && typeof variant === 'object') {
        for (const key of Object.keys(variant)) {
          if (key.toLowerCase() === nameLower) {
            const val = variant[key];
            if (val) values.add(String(val).trim());
          }
        }
        if (variant.attributes && typeof variant.attributes === 'object') {
          for (const key of Object.keys(variant.attributes)) {
            if (key.toLowerCase() === nameLower) {
              const val = variant.attributes[key];
              if (val) values.add(String(val).trim());
            }
          }
        }
      }
    }
    if (values.size > 0) {
      return Array.from(values);
    }
  }

  return [];
};

export const getFilterOptions = (categoryProducts, filterName) => {
  const options = new Set();
  for (const product of categoryProducts) {
    const vals = getValuesForFilter(product, filterName);
    for (const val of vals) {
      options.add(val);
    }
  }
  return Array.from(options).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
};

export const applyDynamicFilters = (products, activeFilters) => {
  let filtered = products;
  Object.entries(activeFilters).forEach(([filterName, selectedValues]) => {
    if (selectedValues && selectedValues.length > 0) {
      filtered = filtered.filter(p => {
        const productValues = getValuesForFilter(p, filterName).map(v => v.toUpperCase());
        return selectedValues.some(val => productValues.includes(val.toUpperCase()));
      });
    }
  });
  return filtered;
};

export const getProductBadge = (product, discountPercentage) => {
  if (!product) return null;
  const badgeStr = product.badge ? String(product.badge).toUpperCase().trim() : '';
  const isNew = !!(product.isNewArrival || badgeStr === 'NEW' || badgeStr === 'NEW ARRIVAL' || String(product.id).startsWith('n'));
  const isOffer = !!(product.isOffer || badgeStr.includes('OFFER') || badgeStr.includes('DEAL') || discountPercentage > 0);
  
  if (isNew) {
    return { type: 'NEW', text: 'NEW' };
  } else if (isOffer) {
    if (discountPercentage > 0) {
      return { type: 'DISCOUNT', text: `${discountPercentage}% OFF` };
    }
    if (product.badge) {
      return { type: 'DISCOUNT', text: product.badge };
    }
    return { type: 'DISCOUNT', text: 'OFFER' };
  }
  return null;
};

/**
 * Given the full configs object (keyed by category name), an activeTab, an activeSubTab,
 * and the list of selected sidebar subcategories + the DB categories list,
 * resolves and merges filter names from the most-specific to least-specific config,
 * case-insensitively, without duplicates.
 *
 * Returns an array of filter name strings (excluding "Price").
 */
export const getMergedFiltersForPath = (configs, activeTab, activeSubTab, selectedSubcategories, categoriesList) => {
  const safeConfigs = configs || {};
  const safeSubs = selectedSubcategories || [];
  const safeCats = categoriesList || [];

  // Recursive helper to get all descendant subcategories under a parent category
  const getDescendants = (parentName) => {
    const list = [];
    const directChildren = safeCats.filter(c => c.parent && c.parent.toUpperCase().trim() === parentName.toUpperCase().trim());
    directChildren.forEach(child => {
      list.push(child);
      list.push(...getDescendants(child.name));
    });
    return list;
  };

  // --- Build list of category paths to resolve ---
  const activePaths = [];

  const tabNorm = (activeTab || '').trim().toUpperCase();
  const subNorm = (activeSubTab || '').trim().toUpperCase();

  if (tabNorm && tabNorm !== 'ALL') {
    if (subNorm && subNorm !== 'ALL') {
      // Navigated to a specific subcategory tab
      activePaths.push(`${tabNorm} > ${subNorm}`);
    } else if (safeSubs.length > 0) {
      // Sidebar subcategory checkboxes selected
      safeSubs.forEach(sub => {
        const dbCat = safeCats.find(c => c.name.toUpperCase() === sub.toUpperCase());
        if (dbCat && dbCat.parent && dbCat.parent !== '—') {
          activePaths.push(`${dbCat.parent.toUpperCase()} > ${sub.toUpperCase()}`);
        } else {
          activePaths.push(`${tabNorm} > ${sub.toUpperCase()}`);
        }
      });
    } else {
      // Just the parent category tab — include parent + all its descendant subcategories' configs
      const descendants = getDescendants(tabNorm);
      descendants.forEach(c => {
        let current = c;
        const pathSegments = [current.name.toUpperCase().trim()];
        while (current && current.parent && current.parent !== '—') {
          pathSegments.unshift(current.parent.toUpperCase().trim());
          const nextParent = safeCats.find(cat => cat.name.toUpperCase().trim() === current.parent.toUpperCase().trim());
          if (!nextParent || nextParent === current) break;
          current = nextParent;
        }
        activePaths.push(pathSegments.join(' > '));
      });
      activePaths.push(tabNorm);
    }
  } else {
    if (safeSubs.length > 0) {
      safeSubs.forEach(sub => {
        const dbCat = safeCats.find(c => c.name.toUpperCase() === sub.toUpperCase());
        if (dbCat && dbCat.parent && dbCat.parent !== '—') {
          activePaths.push(`${dbCat.parent.toUpperCase()} > ${sub.toUpperCase()}`);
        } else {
          activePaths.push(sub.toUpperCase());
        }
      });
    }
  }

  // If no specific path, return all filter names from all configs
  if (activePaths.length === 0) {
    const allFilters = [];
    const seen = new Set();
    Object.values(safeConfigs).forEach(cfg => {
      if (cfg && cfg.filters) {
        cfg.filters.forEach(f => {
          if (f && typeof f === 'string') {
            const norm = f.trim().toLowerCase();
            if (!seen.has(norm)) { seen.add(norm); allFilters.push(f.trim()); }
          }
        });
      }
    });
    return allFilters;
  }

  // --- For each path, find matching config keys and merge filters ---
  const mergedFilters = [];
  const seen = new Set();

  /**
   * Find a config key that matches a single segment name (case-insensitive).
   * Exact match is preferred over substring match.
   */
  const findConfigKey = (segmentName) => {
    const lower = segmentName.toLowerCase();
    // Exact match first
    let key = Object.keys(safeConfigs).find(k => k.toLowerCase() === lower);
    if (key) return key;
    // Substring match (e.g. "kids" matches "Kids Clothing")
    key = Object.keys(safeConfigs).find(k =>
      k.toLowerCase().includes(lower) || lower.includes(k.toLowerCase())
    );
    return key || null;
  };

  const addFilters = (filterList) => {
    if (!filterList || !Array.isArray(filterList)) return;
    filterList.forEach(f => {
      if (f && typeof f === 'string') {
        const norm = f.trim().toLowerCase();
        if (!seen.has(norm)) {
          seen.add(norm);
          mergedFilters.push(f.trim());
        }
      }
    });
  };

  activePaths.forEach(path => {
    const segments = path.split('>').map(s => s.trim());
    // Process most-specific (rightmost/subcategory) first, then parent
    const reversedSegments = [...segments].reverse();
    reversedSegments.forEach(segment => {
      const key = findConfigKey(segment);
      if (key && safeConfigs[key]) {
        addFilters(safeConfigs[key].filters);
      }
    });
  });

  return mergedFilters;
};

