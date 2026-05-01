// Fix ImageKit URLs for React Native
export const fixImageKitUrl = (url?: string) => {
  if (!url) return null;
  
  // If it's not ImageKit URL, return as is
  if (!url.includes('imagekit.io')) {
    return url;
  }
  
  // Check if URL already has our parameters or problematic parameters
  if (url.includes('w=200') && url.includes('h=200') && !url.includes('c=at_max')) {
    return url; // Already fixed with correct parameters
  }
  
  // Fix ImageKit URL for React Native
  // Add query parameters that work well with React Native
  const urlObj = new URL(url);
  urlObj.searchParams.set('w', '200'); // Width
  urlObj.searchParams.set('h', '200'); // Height
  urlObj.searchParams.set('c', 'maintain_ratio'); // Better crop for React Native
  urlObj.searchParams.set('q', '80'); // Quality
  
  return urlObj.toString();
};

export const getWorkingProfileImage = (username?: string, currentUrl?: string) => {
  // Try to fix current URL first
  if (currentUrl) {
    const fixedUrl = fixImageKitUrl(currentUrl);
    if (fixedUrl) {
      console.log('🔧 Fixed ImageKit URL:', fixedUrl);
      return fixedUrl;
    }
  }
  
  // Fallback to placeholder only if no image
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
};

// Alternative URL generator for problematic images
export const getAlternativeImageUrl = (username?: string, originalUrl?: string) => {
  if (!originalUrl) return null;
  
  // If it's ImageKit URL, try with minimal parameters
  if (originalUrl.includes('imagekit.io')) {
    const baseUrl = originalUrl.split('?')[0]; // Remove all query params
    return `${baseUrl}?tr=w-200,h-200`; // Use ImageKit's tr parameter format
  }
  
  return originalUrl;
};

// Force refresh URL by removing all parameters and adding fresh ones
export const forceRefreshImageUrl = (originalUrl?: string) => {
  if (!originalUrl) return null;
  
  if (originalUrl.includes('imagekit.io')) {
    const baseUrl = originalUrl.split('?')[0]; // Remove all existing parameters
    return `${baseUrl}?w=200&h=200&c=maintain_ratio&q=80`;
  }
  
  return originalUrl;
};

// Third fallback - original URL without any transformations
export const getOriginalImageUrl = (originalUrl?: string) => {
  if (!originalUrl) return null;
  
  if (originalUrl.includes('imagekit.io')) {
    return originalUrl.split('?')[0]; // Just the base URL, no parameters
  }
  
  return originalUrl;
};

// Fourth fallback - convert ImageKit URL to direct download URL
export const getDirectImageUrl = (originalUrl?: string) => {
  if (!originalUrl) return null;
  
  if (originalUrl.includes('imagekit.io')) {
    // Convert to ImageKit's direct URL format that forces download
    const baseUrl = originalUrl.split('?')[0];
    return `${baseUrl}?format=webp&format=jpg`; // Try forcing webp first, then jpg
  }
  
  return originalUrl;
};
