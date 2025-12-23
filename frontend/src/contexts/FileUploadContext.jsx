import React, { createContext, useContext, useState } from 'react';
import { api } from '../config/api';

const FileUploadContext = createContext();

export const useFileUpload = () => {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error('useFileUpload must be used within a FileUploadProvider');
  }
  return context;
};

export const FileUploadProvider = ({ children }) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file) => {
    setIsUploading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('files', file);
      
      // Call backend API
      const response = await fetch(api.files.upload, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.files.length > 0) {
        const fileData = data.files[0];
        
        // Add icon based on file type
        let icon = '📎';
        if (fileData.type === 'application/pdf') {
          icon = '📄';
        } else if (fileData.type.startsWith('text/')) {
          icon = '📝';
        } else if (fileData.type.startsWith('image/')) {
          icon = '�️';
        }

        const processedFile = {
          id: fileData.id,
          name: fileData.filename,
          size: fileData.size,
          type: fileData.type,
          uploadedAt: new Date().toISOString(),
          content: fileData.content,
          icon: icon
        };

        setUploadedFiles(prev => [...prev, processedFile]);
        return processedFile;
      } else {
        throw new Error('No file data received from server');
      }
      
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getFileContent = (fileId) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    return file?.content || '';
  };

  const value = {
    uploadedFiles,
    isUploading,
    uploadFile,
    removeFile,
    getFileContent
  };

  return (
    <FileUploadContext.Provider value={value}>
      {children}
    </FileUploadContext.Provider>
  );
};
