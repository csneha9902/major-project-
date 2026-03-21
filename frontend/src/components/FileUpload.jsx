import { useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function FileUpload({ onUploadSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const { getAuthHeaders } = useAuth();

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.edf') && !lower.endsWith('.csv')) {
      setError('Please select an EDF or CSV file');
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      setError('File size must be less than 200MB');
      return;
    }
    setSelectedFile(file);
    setError('');
  };

  const handleFileInput = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await res.json();
      setSelectedFile(null);
      if (onUploadSuccess) {
        onUploadSuccess(data.upload_id);
      }
    } catch (err) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError('');
  };

  return (
    <div className="file-upload-container">
      <h3 className="upload-title">Upload EDF or CSV File for Analysis</h3>
      <div
        className={`upload-dropzone ${dragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="file-selected">
            <File className="file-icon" />
            <div className="file-info">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
            <button className="btn-remove" onClick={handleRemove} disabled={uploading}>
              <X size={20} />
            </button>
          </div>
        ) : (
          <>
            <Upload className="upload-icon" />
            <p className="upload-text">
              Drag and drop an EDF/CSV file here, or <label className="upload-label">browse<input type="file" accept=".edf,.EDF,.csv,.CSV" onChange={handleFileInput} className="file-input" /></label>
            </p>
            <p className="upload-hint">Maximum file size: 200MB</p>
          </>
        )}
      </div>

      {error && <div className="upload-error">{error}</div>}

      {selectedFile && (
        <button
          className="btn-upload"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? 'Processing...' : 'Upload & Analyze'}
        </button>
      )}
    </div>
  );
}

