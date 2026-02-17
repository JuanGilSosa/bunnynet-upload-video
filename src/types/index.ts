export interface UploadProgress {
  percentage: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  message?: string;
}

export interface BunnyNetUploadResponse {
  success: boolean;
  message: string;
  guid?: string;
}

export interface VideoFile extends File {
  preview?: string;
}
