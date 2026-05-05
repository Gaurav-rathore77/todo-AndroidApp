import ImageKit from "imagekit-javascript";

const imagekit = new ImageKit({
  publicKey: "public_XiBBoC8s7KdL/fXGGeOUMxAl8cU=",
  urlEndpoint: "https://ik.imagekit.io/hvyv0mo68",
});

export const uploadImageFromUri = async (uri: string, fileName: string, folder: string = "/profile-images"): Promise<string> => {
  try {
    console.log("🚀 Starting image upload...");
    
    // Try multiple possible API URLs for better connectivity
    const possibleUrls = [
      'http://192.168.1.5:3000',   // Your actual IP address - try first
      'http://localhost:3000',     // Web testing
      'http://127.0.0.1:3000'     // Alternative localhost
    ];
    
    let authParams = null;
    let workingUrl = null;
    
    // Try each URL until one works
    for (const url of possibleUrls) {
      try {
        console.log(`🔍 Trying auth endpoint: ${url}/auth/imagekit`);
        const authResponse = await fetch(`${url}/auth/imagekit`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (authResponse.ok) {
          authParams = await authResponse.json();
          workingUrl = url;
          console.log(`✅ Auth endpoint working: ${url}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Failed to connect to ${url}:`, error instanceof Error ? error.message : 'Unknown error');
        continue;
      }
    }
    
    if (!authParams) {
      throw new Error('Could not connect to any backend server. Please make sure the backend is running on localhost:3000');
    }
    
    console.log("📸 Using React Native URI for ImageKit...");
    
    // For React Native, ImageKit can use the URI directly
    // No need to convert to File object in React Native
    const file = uri;
    
    console.log("⬆️ Uploading to ImageKit...");
    return new Promise((resolve, reject) => {
      imagekit.upload(
        { 
          file: file,
          fileName: fileName,
          folder: folder,
          signature: authParams.signature,
          token: authParams.token,
          expire: authParams.expire,
          useUniqueFileName: true,
        },
        function (err: Error | null, result: { url: string; [key: string]: any } | null) {
          if (err) {
            console.error("❌ ImageKit upload error:", err);
            reject(new Error(`ImageKit upload failed: ${err.message || 'Unknown error'}`));
          } else if (result) {
            console.log("✅ ImageKit upload success:", result.url);
            resolve(result.url);
          } else {
            console.error("❌ Upload failed - no result returned");
            reject(new Error("Upload failed - no result returned from ImageKit"));
          }
        }
      );
    });
  } catch (error) {
    console.error("❌ Image upload error:", error);
    throw error;
  }
};
