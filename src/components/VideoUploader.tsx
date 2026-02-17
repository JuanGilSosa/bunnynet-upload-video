import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { uploadVideoToBunnyNet } from '../services/bunnynet';
import type { UploadProgress } from '../types';
import './VideoUploader.css';

const VideoUploader = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    percentage: 0,
    status: 'idle',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Validar que sea un video
    if (!file.type.startsWith('video/')) {
      setUploadProgress({
        percentage: 0,
        status: 'error',
        message: 'Por favor selecciona un archivo de video válido',
      });
      return false;
    }

    // Validar tamaño (máximo 2GB)
    const maxSize = 2048 * 1024 * 1024; // 2GB
    if (file.size > maxSize) {
      setUploadProgress({
        percentage: 0,
        status: 'error',
        message: 'El archivo es demasiado grande. Máximo 2GB',
      });
      return false;
    }

    return true;
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);

    // Crear preview del video
    const url = URL.createObjectURL(file);
    setVideoPreview(url);

    setUploadProgress({
      percentage: 0,
      status: 'idle',
    });
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadProgress({
      percentage: 0,
      status: 'uploading',
      message: 'Subiendo video...',
    });

    try {
      const result = await uploadVideoToBunnyNet(selectedFile, (percentage) => {
        setUploadProgress({
          percentage,
          status: 'uploading',
          message: `Subiendo... ${percentage}%`,
        });
      });

      if (result.success) {
        setUploadProgress({
          percentage: 100,
          status: 'success',
          message: '¡Video subido exitosamente!',
        });
      } else {
        setUploadProgress({
          percentage: 0,
          status: 'error',
          message: result.message,
        });
      }
    } catch (error) {
      setUploadProgress({
        percentage: 0,
        status: 'error',
        message: 'Error al subir el video',
      });
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setVideoPreview(null);
    setUploadProgress({
      percentage: 0,
      status: 'idle',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="uploader-container">
      <div className="uploader-card">
        <h1 className="uploader-title">Subir Video a la Plataforma</h1>

        {!selectedFile ? (
          <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="drop-zone-content">
              <svg
                className="upload-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="drop-zone-text">
                Arrastra y suelta tu video aquí
              </p>
              <p className="drop-zone-subtext">o</p>
              <button className="browse-button" onClick={handleBrowse}>
                Seleccionar archivo
              </button>
              <p className="file-info">
                Formatos soportados: MP4, MOV, AVI, etc. (Máx. 2GB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileInput}
              className="file-input"
            />
          </div>
        ) : (
          <div className="preview-section">
            {videoPreview && (
              <video
                src={videoPreview}
                controls
                className="video-preview"
              />
            )}

            <div className="file-details">
              <p className="file-name">{selectedFile.name}</p>
              <p className="file-size">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            {uploadProgress.status === 'uploading' && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress.percentage}%` }}
                  />
                </div>
                <p className="progress-text">{uploadProgress.message}</p>
              </div>
            )}

            {uploadProgress.status === 'success' && (
              <div className="status-message success">
                <svg className="status-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>{uploadProgress.message}</p>
              </div>
            )}

            {uploadProgress.status === 'error' && (
              <div className="status-message error">
                <svg className="status-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>{uploadProgress.message}</p>
              </div>
            )}

            <div className="button-group">
              {uploadProgress.status !== 'uploading' && uploadProgress.status !== 'success' && (
                <button className="upload-button" onClick={handleUpload}>
                  Subir Video
                </button>
              )}
              <button className="reset-button" onClick={handleReset}>
                {uploadProgress.status === 'success' ? 'Subir otro video' : 'Cancelar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUploader;
