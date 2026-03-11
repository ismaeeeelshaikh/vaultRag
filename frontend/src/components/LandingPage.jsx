import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const LandingPage = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="min-h-screen bg-background-dark text-gray-200 flex flex-col">
      {/* Navbar */}
      <nav className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">VaultRAG</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-600/20 border border-primary-500/30 text-primary-500 text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            AI-Powered Privacy Assistant
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight">
            <span className="text-white">Your Intelligent </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-light">
              Privacy Vault
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Ask questions about your documents with AI-powered retrieval. 
            Secure, private, and built for speed — your knowledge base, always at your fingertips.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="px-8 py-3 text-base font-semibold bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-lg shadow-primary-500/25 transition transform hover:scale-105"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 text-base font-semibold border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-lg transition"
            >
              Sign In →
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 mb-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto w-full px-4">
          <div className="p-6 rounded-xl bg-background-card border border-gray-700/50 text-left space-y-3 hover:border-primary-500/50 transition">
            <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg">Smart RAG</h3>
            <p className="text-gray-400 text-sm">Upload documents and get instant, accurate answers powered by retrieval-augmented generation.</p>
          </div>

          <div className="p-6 rounded-xl bg-background-card border border-gray-700/50 text-left space-y-3 hover:border-primary-500/50 transition">
            <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg">Privacy First</h3>
            <p className="text-gray-400 text-sm">Your data stays yours. End-to-end secure conversations with full control over your knowledge base.</p>
          </div>

          <div className="p-6 rounded-xl bg-background-card border border-gray-700/50 text-left space-y-3 hover:border-primary-500/50 transition">
            <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-lg">Lightning Fast</h3>
            <p className="text-gray-400 text-sm">Powered by Groq's ultra-fast inference. Get answers in milliseconds, not seconds.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-gray-500 text-sm border-t border-gray-800">
        © 2026 VaultRAG. Built with ❤️ for privacy.
      </footer>
    </div>
  );
};

export default LandingPage;
