import ImageKit from "imagekit-javascript";

const imagekit = new ImageKit({
  publicKey: "public_XiBBoC8s7KdL/fXGGeOUMxAl8cU=",
  urlEndpoint: "https://ik.imagekit.io/hvyv0mo68",
});

export const uploadImage = async (file: File, fileName: string, folder?: string): Promise<string> => {
  try {
    // Get authentication parameters first
    const authParams = await fetch('http://192.168.1.5:3000/auth/imagekit').then(res => res.json());
    
    const fullFileName = folder ? `${folder}/${fileName}` : fileName;
    
    const result = await imagekit.upload({
      file: file,
      fileName: fullFileName,
      useUniqueFileName: true,
      tags: [folder || 'general'],
      ...authParams
    });
    
    return result.url;
  } catch (error) {
    throw new Error('Failed to upload image: ' + error);
  }
};

export const uploadImageFromUri = async (uri: string, fileName: string, folder?: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    return await uploadImage(file, fileName, folder);
  } catch (error) {
    throw new Error('Failed to upload image: ' + error);
  }
};