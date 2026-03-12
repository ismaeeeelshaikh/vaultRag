import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';

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

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // Function to get display name in priority order
  const getDisplayName = () => {
    // 1. Try username first (preferred)
    if (user?.username && user.username.trim()) {
      return user.username;
    }
    // 2. If no username, extract name from email before @
    if (user?.email) {
      return user.email.split('@')[0];
    }
    // 3. Fallback to "User"
    return 'User';
  };

  return (
    <header className="bg-[#0D1220]/95 backdrop-blur-md border-b border-[#1E293B] shadow-lg">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VaultRAGLogo className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#E87D20] to-[#FF512F] bg-clip-text text-transparent">
                VaultRAG
              </h1>
              <p className="text-xs text-[#8B95A5]">Document Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121827]/50 rounded-lg border border-[#1E293B]">
              <User className="h-4 w-4 text-[#E87D20]" />
              <span className="text-sm font-medium text-gray-200">
                {getDisplayName()}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#E87D20]/20 to-[#FF512F]/20 hover:from-[#E87D20]/30 hover:to-[#FF512F]/30 border border-[#E87D20]/30 text-[#E87D20] hover:text-[#FF512F] rounded-lg transition-all duration-300"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
