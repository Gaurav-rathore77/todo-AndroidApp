import ImageKit from "imagekit-javascript";

const imagekit = new ImageKit({
  publicKey: "public_XiBBoC8s7KdL/fXGGeOUMxAl8cU=",
  urlEndpoint: "https://ik.imagekit.io/hvyv0mo68",
});

export const uploadImageFromUriSimple = async (uri: string, fileName: string, folder: string = "/profile-images"): Promise<string> => {
  try {
    console.log("🚀 Starting simple image upload (no auth)...");
    console.log("📸 Image URI:", uri);
    console.log("📝 File name:", fileName);
    console.log("📁 Folder:", folder);
    
    // Convert image to blob
    console.log("📦 Converting image to blob...");
    const response = await fetch(uri);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    
    console.log("📄 File created:", {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Upload directly without auth (using public key only)
    console.log("⬆️ Uploading to ImageKit (direct)...");
    return new Promise((resolve, reject) => {
      imagekit.upload(
        { 
          file: file,
          fileName: fileName,
          folder: folder,
          useUniqueFileName: true,
        },
        function (err: Error | null, result: { url: string; [key: string]: any } | null) {
          console.log("📋 ImageKit callback received...");
          
          if (err) {
            console.log("❌ ImageKit upload error:", err);
            console.log("🔍 Error details:", {
              name: err.name,
              message: err.message
            });
            reject(new Error(`ImageKit upload failed: ${err.message || 'Unknown error'}`));
          } else if (result) {
            console.log("✅ ImageKit upload success!");
            console.log("🔗 Result URL:", result.url);
            resolve(result.url);
          } else {
            console.log("❌ Upload failed - no result returned");
            reject(new Error("Upload failed - no result returned from ImageKit"));
          }
        }
      );
    });
    
  } catch (error) {
    console.error("❌ Simple upload process failed:", error);
    throw error;
  }
};
