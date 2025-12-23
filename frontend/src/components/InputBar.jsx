import React, { useState, useRef, useEffect } from 'react';

const SendIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
    </svg>
);

const AttachmentIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
    </svg>
);

function InputBar({ onSendMessage, isLoading }) {
  const [text, setText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
      const el = textareaRef.current;
      if (el) {
          el.style.height = 'auto';
          el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
      }
  }, [text]);

  const handleSend = (e) => {
      if (e) e.preventDefault();
      if (text.trim() && !isLoading) {
          // Combine text with file content if available
          const messageData = {
              message: text.trim(),
              fileContent: uploadedFiles.length > 0 ? uploadedFiles.map(f => f.content).join('\n\n') : null
          };
          onSendMessage(messageData);
          setText('');
          setUploadedFiles([]);
      }
  };

  const handleKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
      }
  };
  
  const handleFileButtonClick = () => {
      fileInputRef.current.click();
  };

  const handleFileUpload = async (event) => {
      const files = Array.from(event.target.files);
      if (files.length === 0) return;

      setUploading(true);
      try {
          const formData = new FormData();
          files.forEach(file => formData.append('files', file));

          const response = await fetch('http://localhost:8000/api/files/upload', {
              method: 'POST',
              body: formData,
          });

          if (!response.ok) {
              throw new Error('Upload failed');
          }

          const result = await response.json();
          setUploadedFiles(prev => [...prev, ...result.files]);
          
          // Clear the file input
          event.target.value = '';
      } catch (error) {
          console.error('File upload error:', error);
          alert('Failed to upload files. Please try again.');
      } finally {
          setUploading(false);
      }
  };

  const removeFile = (fileId) => {
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className="border-t border-gray-300 p-4">
        {/* Display uploaded files */}
        {uploadedFiles.length > 0 && (
            <div className="max-w-4xl mx-auto mb-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h4>
                    <div className="space-y-2">
                        {uploadedFiles.map(file => (
                            <div key={file.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-md p-2">
                                <div className="flex items-center space-x-2">
                                    <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        {file.filename}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        ({Math.round(file.size / 1024)}KB)
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(file.id)}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
        
        <form onSubmit={handleSend} className="flex items-end space-x-2 max-w-4xl mx-auto">
            <div className="flex-1 min-h-[40px] bg-gray-100 border border-gray-300 rounded-full overflow-hidden flex items-center">
                <button 
                    type="button"
                    onClick={handleFileButtonClick}
                    disabled={uploading}
                    className="p-3 text-gray-600 hover:text-black transition-colors disabled:opacity-50"
                    aria-label="Attach file"
                >
                    {uploading ? (
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <AttachmentIcon />
                    )}
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden"
                    multiple
                    accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.gif"
                    onChange={handleFileUpload}
                />
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isLoading ? "AI is thinking..." : uploadedFiles.length > 0 ? "Ask about your uploaded files..." : "Type something or click 📎 to upload files"}
                    className="w-full bg-transparent border-none resize-none px-2 py-3 text-black placeholder-gray-500 focus:outline-none disabled:opacity-50 min-h-[40px] max-h-[200px]"
                    rows="1"
                    disabled={isLoading}
                />
            </div>
            <button
                type="submit"
                disabled={!text.trim() || isLoading}
                className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
            >
                <SendIcon />
            </button>
        </form>
    </div>
  );
}

export default InputBar;