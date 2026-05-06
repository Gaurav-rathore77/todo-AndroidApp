// Media Recording API - Audio and Video Recording
import { IP_ADDRESS, getApiUrl } from '../app/config/ip';

export interface MediaRecording {
  id: string;
  type: 'audio' | 'video';
  uri: string;
  duration: number;
  timestamp: string;
  transcript?: string;
  metadata?: {
    size: number;
    format: string;
    quality?: string;
  };
}

export interface MediaUploadResponse {
  id: string;
  url: string;
  type: 'audio' | 'video';
  timestamp: string;
  transcript?: string;
  metadata?: any;
}

// Upload recorded audio to backend
export const uploadAudioRecording = async (
  audioUri: string, 
  duration: number,
  transcript?: string
): Promise<MediaUploadResponse> => {
  try {
    console.log("🎙 Uploading audio recording...");
    
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/mp4',
      name: `recording_${Date.now()}.mp4`,
    } as any);
    formData.append('duration', duration.toString());
    if (transcript) {
      formData.append('transcript', transcript);
    }
    formData.append('timestamp', new Date().toISOString());
    formData.append('type', 'audio');

    const response = await fetch(`${getApiUrl()}/media/upload-audio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload audio: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Upload failed');
    }
    
    console.log("✅ Audio uploaded successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Audio upload error:", error);
    throw new Error(`Audio upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Upload recorded video to backend
export const uploadVideoRecording = async (
  videoUri: string, 
  duration: number,
  transcript?: string,
  thumbnail?: string
): Promise<MediaUploadResponse> => {
  try {
    console.log("🎥 Uploading video recording...");
    
    const formData = new FormData();
    formData.append('video', {
      uri: videoUri,
      type: 'video/mp4',
      name: `video_${Date.now()}.mp4`,
    } as any);
    formData.append('duration', duration.toString());
    if (transcript) {
      formData.append('transcript', transcript);
    }
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }
    formData.append('timestamp', new Date().toISOString());
    formData.append('type', 'video');

    const response = await fetch(`${getApiUrl()}/media/upload-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload video: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Upload failed');
    }
    
    console.log("✅ Video uploaded successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Video upload error:", error);
    throw new Error(`Video upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get all media recordings for user
export const getUserMediaRecordings = async (userId: string): Promise<MediaRecording[]> => {
  try {
    console.log("📋 Fetching user media recordings...");
    
    const response = await fetch(`${getApiUrl()}/media/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recordings: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Media recordings fetched successfully");
    return data.recordings || [];
  } catch (error) {
    console.error("❌ Fetch recordings error:", error);
    throw new Error(`Failed to fetch recordings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Delete a media recording
export const deleteMediaRecording = async (recordingId: string): Promise<void> => {
  try {
    console.log("🗑️ Deleting media recording:", recordingId);
    
    const response = await fetch(`${getApiUrl()}/media/${recordingId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete recording: ${response.status}`);
    }

    console.log("✅ Media recording deleted successfully");
  } catch (error) {
    console.error("❌ Delete recording error:", error);
    throw new Error(`Failed to delete recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get media recording by ID
export const getMediaRecording = async (recordingId: string): Promise<MediaRecording> => {
  try {
    console.log("🎬 Fetching media recording:", recordingId);
    
    const response = await fetch(`${getApiUrl()}/media/${recordingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recording: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Media recording fetched successfully");
    return data;
  } catch (error) {
    console.error("❌ Fetch recording error:", error);
    throw new Error(`Failed to fetch recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
