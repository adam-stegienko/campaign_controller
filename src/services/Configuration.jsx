class Configuration {
  constructor() {
    this.config = null;
    this.isLoaded = false;
    this.loadPromise = null;
  }

  async loadConfig() {
    // Return existing promise if already loading
    if (this.loadPromise) {
      return this.loadPromise;
    }

    if (this.isLoaded) {
      return this.config;
    }

    this.loadPromise = this._fetchConfig();
    return this.loadPromise;
  }

  async _fetchConfig() {
    try {
      const response = await fetch('/config.json');
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }
      this.config = await response.json();
      this.isLoaded = true;
      console.log('Configuration loaded:', this.config);
      return this.config;
    } catch (error) {
      console.error('Error loading configuration:', error);
      this.loadPromise = null; // Reset promise on error
      throw error;
    }
  }

  getConfig() {
    return this.config;
  }

  get(key) {
    if (!this.config) return null;
    
    // Support dot notation like 'googleAds.customerId'
    if (key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], this.config);
    }
    
    return this.config[key];
  }
}

// Create and export a singleton instance
const configurationInstance = new Configuration();
export default configurationInstance;
