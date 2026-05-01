// Centralized Mobile Configuration
// Change IP address here only - will update everywhere

export const MOBILE_CONFIG = {
  // 🎯 CHANGE THIS IP ADDRESS ONLY HERE 🎯
  API_BASE_IP: '192.168.56.1', // Current IP - Update here only
  
  // Auto-generated URLs - Don't modify these
  get API_BASE_URL() {
    return `http://${this.API_BASE_IP}:3000`;
  },
  
  get API_URLS() {
    return [
      `http://${this.API_BASE_IP}:3000`,  // Mobile IP - try first
      'http://localhost:3000',            // Fallback for web
      'http://127.0.0.1:3000'             // Alternative localhost
    ];
  },
  
  // ImageKit Configuration
  IMAGEKIT: {
    URL_ENDPOINT: 'https://ik.imagekit.io/hvyv0mo68',
    DEFAULT_FOLDER: 'profiles'
  }
};

// Export individual configs for easy use
export const { API_BASE_URL, API_URLS, IMAGEKIT } = MOBILE_CONFIG;

console.log('🔧 Mobile Config Loaded:');
console.log(`   📡 API IP: ${MOBILE_CONFIG.API_BASE_IP}`);
console.log(`   🌐 Base URL: ${MOBILE_CONFIG.API_BASE_URL}`);
console.log(`   📸 ImageKit: ${MOBILE_CONFIG.IMAGEKIT.URL_ENDPOINT}`);
