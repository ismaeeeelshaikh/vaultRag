import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Trash2, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { documentAPI } from '../../services/api';

const DocumentUpload = ({ isOpen, onClose }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: '' }
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    setLoadingList(true);
    try {
      const res = await documentAPI.list();
      setDocuments(res.data.documents || []);
    } catch {
      setDocuments([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
      setMessage(null);
    }
  }, [isOpen]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    setMessage(null);

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
      try {
        await documentAPI.upload(file);
        successCount++;
      } catch (err) {
        failCount++;
        const detail = err.response?.data?.detail || `Failed to upload ${file.name}`;
        setMessage({ type: 'error', text: detail });
      }
    }

    if (successCount > 0) {
      setMessage({
        type: 'success',
        text: `${successCount} file(s) uploaded and indexed successfully.${failCount > 0 ? ` ${failCount} failed.` : ''}`,
      });
    }

    setUploading(false);
    fileInputRef.current.value = '';
    fetchDocuments();
  };

  const handleDelete = async (filename) => {
    try {
      await documentAPI.delete(filename);
      setMessage({ type: 'success', text: `'${filename}' deleted.` });
      fetchDocuments();
    } catch {
      setMessage({ type: 'error', text: `Failed to delete '${filename}'.` });
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background-card border border-gray-700 rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-500" />
            Knowledge Base
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="px-6 py-4">
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-600 hover:border-primary-500 rounded-lg p-6 text-center cursor-pointer transition group"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
                <p className="text-sm text-gray-400">Uploading & indexing...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-500 group-hover:text-primary-500 transition" />
                <p className="text-sm text-gray-400">
                  Click to upload <span className="text-primary-500 font-medium">PDF, DOCX, TXT</span> files
                </p>
                <p className="text-xs text-gray-500">Max 20MB per file</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt,.md"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Message */}
        {message && (
          <div className={`mx-6 mb-3 flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-900/40 text-green-300 border border-green-700/50'
              : 'bg-red-900/40 text-red-300 border border-red-700/50'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            {message.text}
          </div>
        )}

        {/* Document List */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <h3 className="text-sm font-medium text-gray-400 mb-2">
            Uploaded Documents ({documents.length})
          </h3>
          {loadingList ? (
            <div className="text-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-primary-500 mx-auto" />
            </div>
          ) : documents.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No documents uploaded yet. Upload files to build your knowledge base.
            </p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.name}
                  className="flex items-center justify-between bg-background-dark rounded-lg px-4 py-3 border border-gray-700/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-4 w-4 text-primary-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-200 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">{formatSize(doc.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.name)}
                    className="text-gray-500 hover:text-red-400 transition p-1"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
