import * as tus from 'tus-js-client';
import type { BunnyNetUploadResponse, BunnyNetCollection, BunnyNetCollectionResponse } from '../types';
import { getToken } from './auth';

const WORKER_URL = import.meta.env.VITE_WORKER_API_URL;

// Helper para llamadas al Worker
const fetchFromWorker = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const response = await fetch(`${WORKER_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error en el Worker: ${response.statusText}`);
  }
  return response.json();
};

export const getCollections = async (): Promise<BunnyNetCollection[]> => {
  try {
    const result = await fetchFromWorker('/managment/video/collections', { method: 'GET' });
    // El backend devuelve { ok: true, data: { items: [], ... } }
    if (result.ok && result.data?.items) {
      return result.data.items;
    }
    return result.items || result || [];
  } catch (error) {
    console.error('Error getting collections:', error);
    throw error;
  }
};

export const createCollection = async (name: string): Promise<BunnyNetCollectionResponse> => {
  try {
    const result = await fetchFromWorker('/managment/video/collections', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });

    // Si el backend sigue el patrón { ok, data }
    if (result.ok) {
      return {
        success: true,
        message: 'Colección creada',
        data: result.data,
      };
    }

    return {
      success: true, // Mantener compatibilidad si no viene el objeto ok/data
      message: 'Colección creada',
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al crear colección',
    };
  }
};

export const deleteCollection = async (collectionId: string): Promise<BunnyNetCollectionResponse> => {
  try {
    await fetchFromWorker(`/managment/video/collections/${collectionId}`, {
      method: 'DELETE',
    });
    return {
      success: true,
      message: 'Colección eliminada',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error al eliminar colección',
    };
  }
};

export const uploadVideoToBunnyNet = async (
  file: File,
  description: string,
  onProgress: (percentage: number, isResuming: boolean) => void,
  collectionId?: string,
  abortSignal?: AbortSignal
): Promise<BunnyNetUploadResponse> => {
  try {
    // 1. Solicitar credenciales TUS al Worker
    // El Worker debe devolver: { ok: true, data: { videoId, libraryId, expirationTime, signature } }
    const result = await fetchFromWorker('/managment/video/tusurl', {
      method: 'POST',
      body: JSON.stringify({
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: description,
        collectionId: collectionId,
      }),
    });

    if (!result.ok) {
      throw new Error(result.error || 'Error al obtener URL firmada');
    }

    const { videoId, libraryId, expirationTime, signature } = result.data;
    return await new Promise((resolve) => {
      const upload = new tus.Upload(file, {
        endpoint: 'https://video.bunnycdn.com/tusupload',
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          'AuthorizationSignature': signature,
          'AuthorizationExpire': String(expirationTime),
          'VideoId': videoId,
          'LibraryId': String(libraryId),
        },
        metadata: {
          filetype: file.type,
          title: file.name
        },
        onError: (error) => {
          console.error('TUS Upload failed:', error);
          resolve({
            success: false,
            message: `Error de subida (TUS): ${error.message}`,
          });
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
          onProgress(percentage, !!upload.url);
        },
        onSuccess: () => {
          resolve({
            success: true,
            message: 'Video subido exitosamente con TUS',
            guid: videoId,
          });
        },
      });

      // Manejar aborto
      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          upload.abort();
          resolve({
            success: false,
            message: 'Subida cancelada por el usuario',
          });
        });
      }

      // Intentar reanudar si hay subidas previas
      upload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      });
    });

  } catch (error) {
    console.error('Error in TUS signed upload flow:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error en el proceso de subida TUS',
    };
  }
};
