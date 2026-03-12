import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-[#0D1220] border border-[#1E293B] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-gradient-to-r from-[#0D1220] to-[#121827]">
          <h2 className="text-xl font-bold bg-gradient-to-r from-[#E87D20] to-[#FF512F] bg-clip-text text-transparent flex items-center gap-2">
            <FileText className="h-6 w-6 text-[#E87D20]" />
            Document Upload
          </h2>
          <button onClick={onClose} className="text-[#8B95A5] hover:text-white transition-colors p-2 hover:bg-[#1E293B] rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Upload Area */}
        <div className="px-6 py-4">
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#1E293B] hover:border-[#E87D20] bg-[#121827]/50 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 group"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 text-[#E87D20] animate-spin" />
                <p className="text-sm text-[#8B95A5] font-medium">Uploading & indexing your documents...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="h-10 w-10 text-[#8B95A5] group-hover:text-[#E87D20] transition-colors" />
                <p className="text-sm text-gray-300">
                  Click to upload <span className="text-[#E87D20] font-semibold">PDF, DOCX, TXT</span> files
                </p>
                <p className="text-xs text-[#8B95A5]">Max 20MB per file</p>
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
          <div className={`mx-6 mb-3 flex items-center gap-2 text-sm px-4 py-3 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-400 border-green-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
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
          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#E87D20]" />
            Uploaded Documents ({documents.length})
          </h3>
          {loadingList ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#E87D20] mx-auto" />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 px-4 bg-[#121827]/50 rounded-xl border border-[#1E293B]">
              <FileText className="h-12 w-12 text-[#8B95A5] mx-auto mb-3" />
              <p className="text-sm text-[#8B95A5]">
                No documents uploaded yet.<br />
                <span className="text-gray-400">Upload files to build your knowledge base.</span>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.name}
                  className="flex items-center justify-between bg-[#121827] rounded-lg px-4 py-3 border border-[#1E293B] hover:border-[#E87D20]/50 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-[#E87D20] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-gray-200 truncate font-medium">{doc.name}</p>
                      <p className="text-xs text-[#8B95A5]">{formatSize(doc.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.name)}
                    className="text-[#8B95A5] hover:text-red-400 transition-colors p-2 hover:bg-[#1E293B] rounded-lg opacity-0 group-hover:opacity-100"
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
      
      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DocumentUpload;
