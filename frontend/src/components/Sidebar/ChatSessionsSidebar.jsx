import { useState } from 'react';
import { MessageSquare, Plus, Edit2, Trash2, Calendar, MessageCircle } from 'lucide-react';

/* VaultRAG Logo Component */
function VaultRAGLogo({ className = "w-10 h-10" }) {
    return (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 85 L20 25 C20 25 18 15 25 12 L35 20 L45 15 L50 20 L55 15 L65 20 L75 12 C82 15 80 25 80 25 L50 85 Z" fill="#0F172A" stroke="#1E293B" strokeWidth="2"/>
            <ellipse cx="35" cy="38" rx="8" ry="10" fill="#E87D20"/>
            <ellipse cx="36" cy="37" rx="3" ry="4" fill="#1E293B"/>
            <ellipse cx="37" cy="36" rx="1.5" ry="2" fill="#FFFFFF"/>
            <ellipse cx="65" cy="38" rx="8" ry="10" fill="#E87D20"/>
            <ellipse cx="64" cy="37" rx="3" ry="4" fill="#1E293B"/>
            <ellipse cx="63" cy="36" rx="1.5" ry="2" fill="#FFFFFF"/>
            <path d="M50 45 L45 52 L50 50 L55 52 Z" fill="#E87D20"/>
            <line x1="48" y1="53" x2="48" y2="55" stroke="#1E293B" strokeWidth="1"/>
            <line x1="52" y1="53" x2="52" y2="55" stroke="#1E293B" strokeWidth="1"/>
        </svg>
    );
}

const ChatSessionsSidebar = ({ 
  sessions, 
  currentSession, 
  onNewChat, 
  onSelectSession, 
  onUpdateTitle, 
  onDeleteSession,
  isNewChat 
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const startEditing = (session) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const saveTitle = async (sessionId) => {
    if (editTitle.trim()) {
      await onUpdateTitle(sessionId, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="w-80 bg-[#0D1220]/95 backdrop-blur-md border-r border-[#1E293B] text-white h-full flex flex-col">
      {/* Header with Logo */}
      <div className="p-4 border-b border-[#1E293B]">
        <div className="flex items-center gap-3 mb-4">
          <VaultRAGLogo className="w-10 h-10" />
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-[#E87D20] to-[#FF512F] bg-clip-text text-transparent">
              VaultRAG
            </h1>
            <p className="text-xs text-[#8B95A5]">Document Assistant</p>
          </div>
        </div>
        
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#E87D20] to-[#FF512F] hover:shadow-lg hover:shadow-[#E87D20]/30 rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#E87D20]/50 font-medium"
        >
          <Plus className="h-5 w-5" />
          <span>New Chat</span>
        </button>
      </div>
      
      {/* Chat Sessions List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1E293B] scrollbar-track-transparent">
        <div className="p-2">
          {sessions.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1E293B]/50 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-[#8B95A5]" />
              </div>
              <p className="text-sm text-[#8B95A5] mb-1">No chats yet</p>
              <p className="text-xs text-[#8B95A5]/70">Start a new conversation</p>
            </div>
          ) : (
            <>
              <div className="px-3 py-2 mb-2">
                <div className="flex items-center gap-2 text-xs text-[#8B95A5] uppercase tracking-wide font-semibold">
                  <Calendar className="h-3 w-3" />
                  <span>Recent Chats</span>
                </div>
              </div>
              
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      currentSession?.id === session.id
                        ? 'bg-gradient-to-r from-[#E87D20]/20 to-[#FF512F]/20 border-l-4 border-[#E87D20]'
                        : isNewChat
                        ? 'bg-[#121827]/50 hover:bg-[#1E293B]/50'
                        : 'bg-[#121827]/50 hover:bg-[#1E293B]/50'
                    }`}
                    onClick={() => onSelectSession(session.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {editingId === session.id ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="flex-1 px-3 py-1.5 text-sm bg-[#121827] border border-[#1E293B] rounded-lg focus:outline-none focus:border-[#E87D20] focus:ring-2 focus:ring-[#E87D20]/30 text-white"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveTitle(session.id);
                                if (e.key === 'Escape') cancelEditing();
                              }}
                              onBlur={() => saveTitle(session.id)}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start gap-2 mb-2">
                              <MessageCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                                currentSession?.id === session.id ? 'text-[#E87D20]' : 'text-[#8B95A5]'
                              }`} />
                              <h3 className={`font-medium text-sm leading-tight ${
                                currentSession?.id === session.id ? 'text-white' : 'text-gray-200'
                              }`}>
                                {session.title}
                              </h3>
                            </div>
                            <div className="flex items-center justify-between text-xs text-[#8B95A5] ml-6">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(session.updated_at)}
                              </span>
                              {session.message_count > 0 && (
                                <span className="px-2 py-0.5 bg-[#1E293B] rounded-full text-[10px]">
                                  {session.message_count} msgs
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      
                      {editingId !== session.id && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(session);
                            }}
                            className="p-1.5 text-[#8B95A5] hover:text-[#E87D20] hover:bg-[#1E293B] rounded-lg transition-colors"
                            title="Edit title"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this chat?')) {
                                onDeleteSession(session.id);
                              }
                            }}
                            className="p-1.5 text-[#8B95A5] hover:text-red-400 hover:bg-[#1E293B] rounded-lg transition-colors"
                            title="Delete chat"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-[#1E293B] p-3">
        <div className="text-xs text-[#8B95A5] text-center">
          <p className="mb-1">💾 {sessions.length} conversation{sessions.length !== 1 ? 's' : ''} saved</p>
          <p className="text-[10px] opacity-70">Powered by VaultRAG AI</p>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #1E293B;
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #2D3B4E;
        }
      `}</style>
    </div>
  );
};

export default ChatSessionsSidebar;
