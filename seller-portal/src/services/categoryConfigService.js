// Reusable Category Configuration Service
// Single source of truth: always reads/writes category configurations from the backend API.
// DEFAULT_CONFIGS are used ONLY as a seed on first startup if the backend has no data.
// No component should access localStorage directly for category configuration data.

const DEFAULT_CATEGORIES = [
  { name: 'Clothing', parent: '—', status: 'Active' },
  { name: 'Women', parent: 'Clothing', status: 'Active' },
  { name: 'Kurti', parent: 'Women', status: 'Active' },
  { name: 'Saree', parent: 'Women', status: 'Active' },
  { name: 'Men', parent: 'Clothing', status: 'Active' },
  { name: 'Kids', parent: 'Clothing', status: 'Active' },
  { name: 'Stationery', parent: '—', status: 'Active' },
  { name: 'Gifts', parent: '—', status: 'Active' },
  { name: 'Accessories', parent: '—', status: 'Active' },
  { name: 'Kids Clothing', parent: 'Clothing', status: 'Active' },
  { name: 'Jewellery', parent: '—', status: 'Active' }
];

// DEFAULT_CONFIGS: Used only as a seed on first application startup.
// After seeding, the backend file is the single source of truth.
const DEFAULT_CONFIGS = {
  'Clothing': {
    attributes: ['Brand', 'Fabric', 'Material', 'Occasion', 'Fit'],
    variants: ['Color', 'Size'],
    affectsPrice: true,
    affectsStock: true,
    requireImages: true,
    filters: ['Price', 'Size', 'Color', 'Brand'],
    specs: ['Material', 'Fabric care instructions', 'Style Code', 'Fit type'],
    shippingOptions: ['Standard Shipping', 'Express Clothing Delivery'],
    validationRules: {
      name: { required: true, minLength: 3 },
      price: { required: true, min: 100 },
      stock: { required: true, min: 0 }
    }
  },
  'Kids Clothing': {
    attributes: ['Brand', 'Material', 'Safety Grade', 'Age Group'],
    variants: ['Color', 'Age'],
    affectsPrice: true,
    affectsStock: true,
    requireImages: true,
    filters: ['Price', 'Color', 'Age', 'Brand'],
    specs: ['Material', 'Wash care', 'Safety certification'],
    shippingOptions: ['Standard Shipping', 'Next-Day Kids Care Delivery'],
    validationRules: {
      name: { required: true, minLength: 3 },
      price: { required: true, min: 50 },
      stock: { required: true, min: 0 }
    }
  },
  'Jewellery': {
    attributes: ['Brand', 'Purity', 'Certificate', 'Design Type'],
    variants: ['Metal', 'Stone', 'Length'],
    affectsPrice: true,
    affectsStock: true,
    requireImages: true,
    filters: ['Price', 'Metal', 'Stone', 'Brand'],
    specs: ['Metal purity', 'Stone weight (carat)', 'Certification body', 'Weight'],
    shippingOptions: ['Insured Jewellery Shipping', 'Hand-Delivered Premium Courier'],
    validationRules: {
      name: { required: true, minLength: 5 },
      price: { required: true, min: 1000 },
      stock: { required: true, min: 1 }
    }
  },
  'Stationery': {
    attributes: ['Brand', 'Pages', 'Paper Type', 'Ruling', 'Binding'],
    variants: ['Pack Size', 'Ink Color'],
    affectsPrice: true,
    affectsStock: true,
    requireImages: false,
    filters: ['Price', 'Pack Size', 'Ink Color', 'Brand'],
    specs: ['Number of pages', 'Dimensions', 'Paper thickness (GSM)', 'Cover type'],
    shippingOptions: ['Standard Shipping', 'Bulk Stationery Cargo'],
    validationRules: {
      name: { required: true, minLength: 2 },
      price: { required: true, min: 10 },
      stock: { required: true, min: 0 }
    }
  },
  'Gifts': {
    attributes: ['Brand', 'Occasion Theme', 'Personalized'],
    variants: ['Theme', 'Wrapping', 'Personalization'],
    affectsPrice: false,
    affectsStock: true,
    requireImages: true,
    filters: ['Price', 'Occasion', 'Brand'],
    specs: ['Material', 'Weight', 'Dimensions', 'Country of Origin'],
    shippingOptions: ['Standard Gift Shipping', 'Same-Day Gift Delivery', 'Gift Wrapping Included'],
    validationRules: {
      name: { required: true, minLength: 3 },
      price: { required: true, min: 50 },
      stock: { required: true, min: 0 }
    }
  }
};

// Internal flag to track if we've already seeded the backend on first startup
let _backendSeeded = false;

export const categoryConfigService = {
  // ─── Categories ─────────────────────────────────────────────────────────────

  async getCategories() {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        const cats = data.categories || data;
        if (cats && cats.length > 0) {
          localStorage.setItem('mithra_admin_categories', JSON.stringify(cats));
          return cats;
        }
      }
    } catch (e) {
      // Network error — use cached local data
    }

    try {
      const local = localStorage.getItem('mithra_admin_categories');
      if (local) return JSON.parse(local);
    } catch (e) {
      // ignore
    }
    return DEFAULT_CATEGORIES;
  },

  async saveCategories(categories) {
    // Save to localStorage as a cache
    try {
      localStorage.setItem('mithra_admin_categories', JSON.stringify(categories));
    } catch (e) {
      console.warn('Failed to cache categories to localStorage:', e);
    }
    return true;
  },

  // ─── Category Configurations (Backend is the single source of truth) ────────

  /**
   * Fetches all category configurations from the backend API.
   * If the backend returns an empty object AND this is the first startup,
   * seeds the backend with DEFAULT_CONFIGS so there's always data available.
   * Falls back to localStorage only if the backend is completely unreachable.
   */
  async getCategoryConfigurations() {
    try {
      const response = await fetch('/api/categories/configurations');
      if (response.ok) {
        const data = await response.json();
        const confs = data.configurations;

        // Backend returned valid configurations — always use these
        if (confs && typeof confs === 'object') {
          // If the backend has data, cache it and return
          if (Object.keys(confs).length > 0) {
            localStorage.setItem('mithra_category_configurations', JSON.stringify(confs));
            return confs;
          }

          // Backend is empty (first startup) — seed with defaults
          if (!_backendSeeded) {
            _backendSeeded = true;
            try {
              await this.saveCategoryConfigurations(DEFAULT_CONFIGS);
              localStorage.setItem('mithra_category_configurations', JSON.stringify(DEFAULT_CONFIGS));
              return DEFAULT_CONFIGS;
            } catch (seedErr) {
              console.warn('Could not seed backend with default configs:', seedErr);
            }
          }

          // Backend intentionally empty (admin deleted all configs)
          return {};
        }
      }
    } catch (e) {
      // Backend unreachable — fall through to localStorage
    }

    // Offline fallback: use cached configs
    try {
      const local = localStorage.getItem('mithra_category_configurations');
      if (local) {
        return JSON.parse(local);
      }
    } catch (e) {
      // ignore
    }

    // Last resort: return DEFAULT_CONFIGS (should rarely happen)
    return DEFAULT_CONFIGS;
  },

  /**
   * Saves the entire configurations map to the backend and caches locally.
   * Used for bulk saves (e.g., admin resetting all configs).
   */
  async saveCategoryConfigurations(configs) {
    // Cache locally for offline resilience
    try {
      localStorage.setItem('mithra_category_configurations', JSON.stringify(configs));
    } catch (e) {
      console.warn('Failed to cache configurations to localStorage:', e);
    }

    // Persist to backend (single source of truth)
    try {
      const token = localStorage.getItem('mithira_auth_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/categories/configurations', {
        method: 'POST',
        headers,
        body: JSON.stringify({ configurations: configs })
      });
      return response.ok;
    } catch (e) {
      console.warn('Failed to save configurations to backend API:', e);
      return false;
    }
  },

  // ─── Individual Configuration Methods ─────────────────────────────────────

  /**
   * Get configuration for a specific category (alias).
   */
  async getConfigurationByCategory(categoryPath) {
    return this.getCategoryConfig(categoryPath);
  },

  /**
   * Save/overwrite a single category's configuration.
   * First tries the individual PUT endpoint; falls back to bulk POST.
   */
  async saveConfiguration(categoryName, config) {
    // Optimistically update local cache
    try {
      const local = localStorage.getItem('mithra_category_configurations');
      const cached = local ? JSON.parse(local) : {};
      cached[categoryName] = config;
      localStorage.setItem('mithra_category_configurations', JSON.stringify(cached));
    } catch (e) {
      // ignore
    }

    // Try individual PUT endpoint first (atomic, no race condition risk)
    try {
      const token = localStorage.getItem('mithira_auth_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const encodedName = encodeURIComponent(categoryName);
      const response = await fetch(`/api/categories/configurations/${encodedName}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(config)
      });

      if (response.ok) return true;
    } catch (e) {
      // Individual endpoint failed — fall back to bulk save
    }

    // Fallback: read all → merge → save all
    const allConfigs = await this.getCategoryConfigurations();
    allConfigs[categoryName] = config;
    return this.saveCategoryConfigurations(allConfigs);
  },

  /**
   * Update (partial merge) a single category's configuration.
   */
  async updateConfiguration(categoryName, config) {
    const allConfigs = await this.getCategoryConfigurations();
    allConfigs[categoryName] = {
      ...(allConfigs[categoryName] || this.getDefaultEmptyConfig()),
      ...config
    };
    return this.saveCategoryConfigurations(allConfigs);
  },

  /**
   * Delete a single category's configuration.
   * Tries DELETE /configurations/:name endpoint first; falls back to bulk.
   */
  async deleteConfiguration(categoryName) {
    // Update local cache
    try {
      const local = localStorage.getItem('mithra_category_configurations');
      const cached = local ? JSON.parse(local) : {};
      delete cached[categoryName];
      localStorage.setItem('mithra_category_configurations', JSON.stringify(cached));
    } catch (e) {
      // ignore
    }

    // Try individual DELETE endpoint
    try {
      const token = localStorage.getItem('mithira_auth_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const encodedName = encodeURIComponent(categoryName);
      const response = await fetch(`/api/categories/configurations/${encodedName}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) return true;
    } catch (e) {
      // Fall back to bulk
    }

    const allConfigs = await this.getCategoryConfigurations();
    delete allConfigs[categoryName];
    return this.saveCategoryConfigurations(allConfigs);
  },

  /**
   * Reset a single category configuration to DEFAULT_CONFIGS (or remove if no default exists).
   */
  async resetConfiguration(categoryName) {
    const allConfigs = await this.getCategoryConfigurations();
    if (DEFAULT_CONFIGS[categoryName]) {
      allConfigs[categoryName] = { ...DEFAULT_CONFIGS[categoryName] };
    } else {
      delete allConfigs[categoryName];
    }
    return this.saveCategoryConfigurations(allConfigs);
  },

  // ─── Category Config Resolver ──────────────────────────────────────────────

  /**
   * Resolves the best-matching configuration for a given category path.
   * Performs hierarchical fallback: tries the most specific part first,
   * then walks up the hierarchy. E.g. "Clothing > Women > Kurti" →
   * tries "kurti" → "women" → "clothing" → uses first match found.
   *
   * @param {string} categoryPath  e.g. "Clothing > Women > Kurti"
   * @returns {object} Merged config with defaults for any missing keys
   */
  async getCategoryConfig(categoryPath) {
    if (!categoryPath) {
      return this.getDefaultEmptyConfig();
    }

    const configs = await this.getCategoryConfigurations();

    // Normalize path: "Clothing > Men" → ["clothing", "men"]
    const parts = categoryPath.split('>').map(p => p.trim().toLowerCase());

    // Walk from most-specific to least-specific (bottom → top)
    for (let i = parts.length - 1; i >= 0; i--) {
      const partName = parts[i];
      const matchingKey = Object.keys(configs).find(
        key => key.toLowerCase() === partName
      );
      if (matchingKey) {
        return {
          ...this.getDefaultEmptyConfig(),
          ...configs[matchingKey],
          categoryName: matchingKey
        };
      }
    }

    // Substring match fallback (e.g. path "Clothing > Kids" matches key "Kids Clothing")
    const fullPathLower = categoryPath.toLowerCase();
    for (const key of Object.keys(configs)) {
      if (fullPathLower.includes(key.toLowerCase()) || key.toLowerCase().includes(parts[parts.length - 1])) {
        return {
          ...this.getDefaultEmptyConfig(),
          ...configs[key],
          categoryName: key
        };
      }
    }

    return this.getDefaultEmptyConfig();
  },

  // ─── Default Empty Config ──────────────────────────────────────────────────

  getDefaultEmptyConfig() {
    return {
      attributes: [],
      variants: [],
      affectsPrice: false,
      affectsStock: true,
      requireImages: false,
      filters: [],
      specs: [],
      shippingOptions: ['Standard Shipping'],
      validationRules: {
        name: { required: true },
        price: { required: true, min: 1 },
        stock: { required: true, min: 0 }
      }
    };
  }
};
