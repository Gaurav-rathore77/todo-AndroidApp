// Image proxy to handle ImageKit URLs that don't work in React Native
import { IP_ADDRESS, getApiUrl } from "../app/config/ip";

export const getProxyImageUrl = async (imageKitUrl?: string): Promise<string | null> => {
  if (!imageKitUrl) return null;
  
  // If it's not ImageKit URL, return as is
  if (!imageKitUrl.includes('imagekit.io')) {
    return imageKitUrl;
  }
  
  try {
    console.log('🔄 Using proxy for ImageKit URL:', imageKitUrl);
    
    // Request the backend to proxy the image
    const response = await fetch(getApiUrl('/proxy/image'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl: imageKitUrl })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Proxy image URL generated:', data.proxyUrl);
      return data.proxyUrl;
    } else {
      console.log('❌ Proxy request failed:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Proxy error:', error);
    return null;
  }
};
