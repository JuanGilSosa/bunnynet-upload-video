export interface UploadProgress {
  percentage: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  message?: string;
}

export interface BunnyNetCollection {
  guid: string;
  name: string;
  videoCount: number;
  totalSize: number;
  previewVideoIds: string | null;
}

export interface LoginCredentials {
  user: string;
  pw: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
}

export interface BunnyNetUploadResponse {
  success: boolean;
  message: string;
  guid?: string;
}

export interface BunnyNetCollectionResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface VideoFile extends File {
  preview?: string;
}
