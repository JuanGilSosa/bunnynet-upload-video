import type { BunnyNetUploadResponse } from '../types';

const API_KEY = import.meta.env.VITE_BUNNY_API_KEY;
const LIBRARY_ID = import.meta.env.VITE_BUNNY_LIBRARY_ID;

export const uploadVideoToBunnyNet = async (
  file: File,
  onProgress: (percentage: number) => void
): Promise<BunnyNetUploadResponse> => {
  try {
    // URL de la API de BunnyNet para subir videos
    const uploadUrl = `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos`;

    // Crear el video primero
    const createResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'AccessKey': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: file.name.replace(/\.[^/.]+$/, ''), // Nombre sin extensión
      }),
    });

    if (!createResponse.ok) {
      throw new Error('Error al crear el video en BunnyNet');
    }

    const videoData = await createResponse.json();
    const videoGuid = videoData.guid;

    // Ahora subir el archivo del video
    const uploadFileUrl = `https://video.bunnycdn.com/library/${LIBRARY_ID}/videos/${videoGuid}`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Monitorear el progreso
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded / e.total) * 100);
          onProgress(percentage);
        }
      });

      // Manejar la finalización
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            success: true,
            message: 'Video subido exitosamente',
            guid: videoGuid,
          });
        } else {
          reject({
            success: false,
            message: `Error al subir el video: ${xhr.statusText}`,
          });
        }
      });

      // Manejar errores
      xhr.addEventListener('error', () => {
        reject({
          success: false,
          message: 'Error de red al subir el video',
        });
      });

      // Configurar y enviar la petición
      xhr.open('PUT', uploadFileUrl);
      xhr.setRequestHeader('AccessKey', API_KEY);
      xhr.send(file);
    });
  } catch (error) {
    console.error('Error uploading to BunnyNet:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};
