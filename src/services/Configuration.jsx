class Configuration {
  constructor() {
    this.config = null;
    this.isLoaded = false;
  }

  async loadConfig() {
    if (this.isLoaded) {
      return this.config;
    }

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
    }
  }

  getConfig() {
    return this.config;
  }

  get(key) {
    return this.config ? this.config[key] : null;
  }
}

const configurationInstance = new Configuration();
export default configurationInstance;
