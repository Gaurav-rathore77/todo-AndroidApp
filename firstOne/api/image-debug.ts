import ImageKit from "imagekit-javascript";

const imagekit = new ImageKit({
  publicKey: "public_XiBBoC8s7KdL/fXGGeOUMxAl8cU=",
  urlEndpoint: "https://ik.imagekit.io/hvyv0mo68",
});

export const uploadImageFromUriDebug = async (uri: string, fileName: string, folder: string = "/profile-images"): Promise<string> => {
  try {
    console.log("🚀 Starting detailed image upload debug...");
    console.log("📸 Image URI:", uri);
    console.log("📝 File name:", fileName);
    console.log("📁 Folder:", folder);
    
    // Step 1: Test backend connectivity
    console.log("🔍 Step 1: Testing backend connectivity...");
    const possibleUrls = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://192.168.1.5:3000'
    ];
    
    let authParams = null;
    let workingUrl = null;
    
    for (const url of possibleUrls) {
      try {
        console.log(`🌐 Trying: ${url}/auth/imagekit`);
        const authResponse = await fetch(`${url}/auth/imagekit`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        
        console.log(`📊 Response status: ${authResponse.status}`);
        
        if (authResponse.ok) {
          authParams = await authResponse.json();
          workingUrl = url;
          console.log("✅ Backend connection successful!");
          console.log("🔑 Auth params received:", {
            token: authParams.token ? "✅" : "❌",
            signature: authParams.signature ? "✅" : "❌", 
            expire: authParams.expire ? "✅" : "❌"
          });
          break;
        } else {
          console.log(`❌ Backend responded with status: ${authResponse.status}`);
        }
      } catch (error) {
        console.log(`❌ Failed to connect to ${url}:`, error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    if (!authParams) {
      console.log("❌ No backend connection established!");
      throw new Error('Could not connect to any backend server. Please make sure the backend is running on localhost:3000');
    }
    
    // Step 2: Convert image to blob
    console.log("🔍 Step 2: Converting image to blob...");
    let file: File;
    
    try {
      const response = await fetch(uri);
      console.log("📊 Image fetch status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log("📦 Blob created:", {
        size: blob.size,
        type: blob.type
      });
      
      file = new File([blob], fileName, { type: blob.type });
      console.log("📄 File created:", {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
    } catch (error) {
      console.log("❌ Failed to convert image to blob:", error);
      throw error;
    }
    
    // Step 3: Test ImageKit direct upload
    console.log("🔍 Step 3: Testing ImageKit direct upload...");
    return new Promise((resolve, reject) => {
      console.log("⬆️ Starting ImageKit upload...");
      
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
          console.log("📋 ImageKit callback received...");
          
          if (err) {
            console.log("❌ ImageKit upload error:", err);
            console.log("🔍 Error details:", {
              name: err.name,
              message: err.message,
              stack: err.stack
            });
            reject(new Error(`ImageKit upload failed: ${err.message || 'Unknown error'}`));
          } else if (result) {
            console.log("✅ ImageKit upload success!");
            console.log("🔗 Result URL:", result.url);
            console.log("📊 Full result:", result);
            resolve(result.url);
          } else {
            console.log("❌ Upload failed - no result returned");
            reject(new Error("Upload failed - no result returned from ImageKit"));
          }
        }
      );
    });
    
  } catch (error) {
    console.error("❌ Complete upload process failed:", error);
    throw error;
  }
};
