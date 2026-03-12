import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import Linkify from 'react-linkify';
import { User, Bot, Send, Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';

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

/* Constellation Particles Background Animation */
function ConstellationParticles() {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const mouse = useRef({ x: -1000, y: -1000 });
    const animFrame = useRef(0);

    const init = useCallback(() => {
        const count = window.innerWidth < 768 ? 40 : 80;
        const colors = ['#E87D20', '#FF512F', '#FFFFFF', '#FFB366'];
        particles.current = Array.from({ length: count }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 1.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.5,
            color: colors[Math.floor(Math.random() * colors.length)]
        }));
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        init();

        const onMouse = (e) => { mouse.current = { x: e.clientX, y: e.clientY }; };
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', onMouse);

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const pts = particles.current;
            for (let i = 0; i < pts.length; i++) {
                const p = pts[i];

                const dx = p.x - mouse.current.x;
                const dy = p.y - mouse.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    p.vx += dx / dist * 0.05;
                    p.vy += dy / dist * 0.05;
                }

                p.vx *= 0.99;
                p.vy *= 0.99;

                if (Math.abs(p.vx) < 0.1) p.vx += (Math.random() - 0.5) * 0.1;
                if (Math.abs(p.vy) < 0.1) p.vy += (Math.random() - 0.5) * 0.1;

                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fill();

                for (let j = i + 1; j < pts.length; j++) {
                    const p2 = pts[j];
                    const d = Math.hypot(p.x - p2.x, p.y - p2.y);
                    if (d < 150) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(232, 125, 32, ${0.25 * (1 - d / 150)})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
                ctx.globalAlpha = 1.0;
            }
            animFrame.current = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animFrame.current);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouse);
        };
    }, [init]);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none opacity-40" />;
}

/* ChatMessage Component - Inline */
const ChatMessage = ({ message }) => {
  const isUser = message.type === 'user';

  const componentDecorator = (decoratedHref, decoratedText, key) => (
    <a
      key={key}
      href={decoratedHref}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#E87D20] hover:text-[#FF512F] underline break-words transition-colors"
    >
      {decoratedText}
    </a>
  );

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-gradient-to-r from-[#E87D20] to-[#FF512F] text-white' 
              : 'bg-[#0D1220]/80 border border-[#1E293B] text-[#8B95A5]'
          }`}>
            {isUser ? (
              <User className="h-4 w-4" />
            ) : (
              <VaultRAGLogo className="w-5 h-5" />
            )}
          </div>
        </div>

        <div className={`rounded-xl px-4 py-2 max-w-full ${
          isUser
            ? 'bg-gradient-to-r from-[#E87D20] to-[#FF512F] text-white'
            : 'bg-[#0D1220]/80 backdrop-blur-md border border-[#1E293B] text-gray-100'
        }`}>
          {isUser ? (
            <div className="text-sm whitespace-pre-wrap break-words">
              <Linkify componentDecorator={componentDecorator}>
                {message.content}
              </Linkify>
            </div>
          ) : (
            <div className="text-sm prose prose-sm max-w-none break-words prose-invert">
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E87D20] hover:text-[#FF512F] underline transition-colors"
                    >
                      {children}
                    </a>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2">
                      <Linkify componentDecorator={componentDecorator}>
                        {children}
                      </Linkify>
                    </p>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
          <div className={`text-xs mt-1 ${
            isUser ? 'text-white/70' : 'text-[#8B95A5]'
          }`}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ChatInput Component - Inline */
const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const recognitionRef = useRef(null);
  const restartTimeoutRef = useRef(null);

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported. Please use Chrome, Edge, or Safari.');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }
      if (finalTranscript) {
        const cleanedText = finalTranscript.trim();
        setMessage(prev => prev + cleanedText + ' ');
      }
    };

    recognition.onend = () => {
      if (isRecording) {
        restartTimeoutRef.current = setTimeout(() => {
          if (isRecording && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              console.log('Restart failed:', err);
              setIsRecording(false);
            }
          }
        }, 100);
      }
    };

    recognition.onerror = (event) => {
      switch (event.error) {
        case 'not-allowed':
          setError('Microphone access denied. Please allow microphone permissions and refresh.');
          setIsRecording(false);
          setPermissionGranted(false);
          break;
        case 'network':
          setError('Speech recognition network error. Check internet connection.');
          setIsRecording(false);
          break;
        case 'audio-capture':
          setError('Microphone not found. Please check your microphone.');
          setIsRecording(false);
          break;
        default:
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            setError(`Speech error: ${event.error}`);
            setIsRecording(false);
          }
      }
      
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        setTimeout(() => setError(''), 4000);
      }
    };

    recognition.onstart = () => {
      setError('');
    };

    return recognition;
  };

  useEffect(() => {
    const checkSupportAndPermissions = async () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setError('Speech recognition not supported. Please use Chrome, Edge, or Safari.');
        return;
      }

      setIsSupported(true);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setPermissionGranted(true);
        recognitionRef.current = initializeSpeechRecognition();
      } catch (err) {
        setPermissionGranted(false);
      }
    };

    checkSupportAndPermissions();

    return () => {
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, [isRecording]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);
      setError('');
      window.location.reload();
    } catch (err) {
      setError('Please allow microphone access in browser settings and refresh the page.');
    }
  };

  const toggleRecording = async () => {
    if (!isSupported) {
      setError('Speech recognition not supported. Please use Chrome, Edge, or Safari.');
      setTimeout(() => setError(''), 4000);
      return;
    }

    if (!permissionGranted) {
      await requestMicrophonePermission();
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      
      try {
        recognitionRef.current?.stop();
      } catch (err) {
        console.log('Stop error:', err);
      }
    } else {
      try {
        setIsRecording(true);
        recognitionRef.current?.start();
        setError('');
      } catch (err) {
        setError('Failed to start recording. Please try again.');
        setIsRecording(false);
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  return (
    <div className="relative border-t border-[#1E293B] bg-[#0D1220]/80 backdrop-blur-md px-4 py-3">
      {/* Error message */}
      {error && (
        <div className="absolute bottom-full left-0 right-0 px-4 pb-2">
          <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
            {error.includes('permission') && (
              <button
                onClick={requestMicrophonePermission}
                className="text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg transition-colors"
              >
                Allow Microphone
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute bottom-full left-0 right-0 px-4 pb-2">
          <div className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-[#E87D20]/20 border border-green-500/30 rounded-xl backdrop-blur-md">
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                🎤 Listening... Speak in Hindi, Hinglish, Marathi, or English
              </span>
              <div className="w-2 h-2 bg-[#E87D20] rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            isRecording
              ? '🎤 Listening for your voice...'
              : "Ask VaultRAG AI Assistant"
          }
          className="flex-1 px-4 py-3 rounded-xl border border-[#1E293B] bg-[#121827] text-white placeholder-[#8B95A5]/50 focus:outline-none focus:border-[#E87D20] focus:ring-4 focus:ring-[#E87D20]/30 transition-all duration-300 disabled:opacity-50"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={toggleRecording}
          disabled={disabled}
          className={`px-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
            isRecording
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white animate-pulse'
              : !permissionGranted
              ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-600 text-white'
              : 'bg-[#1E293B] hover:bg-[#2D3B4E] focus:ring-[#1E293B] text-[#8B95A5]'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={
            !permissionGranted
              ? 'Click to allow microphone access'
              : isRecording
              ? 'Stop recording'
              : 'Start voice input (Multi-language)'
          }
        >
          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          className="px-4 py-3 bg-gradient-to-r from-[#E87D20] to-[#FF512F] hover:shadow-lg hover:shadow-[#E87D20]/30 focus:outline-none focus:ring-4 focus:ring-[#E87D20]/50 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 transform hover:scale-105"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>

      {/* Help text */}
      <div className="mt-2 text-xs text-[#8B95A5] text-center">
        {!isSupported
          ? 'Speech recognition not supported - Please use Chrome, Edge, or Safari'
          : !permissionGranted
          ? '🔒 Click microphone to allow voice input'
          : isRecording
          ? '🎤 Recording active - Speak in Hindi, Hinglish, Marathi ya English'
          : 'VaultRAG is here to help with your documents'}
      </div>
    </div>
  );
};

/* Main ChatInterface Component */
const ChatInterface = ({ messages, onSendMessage, loading, error, currentSession, isNewChat }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!currentSession && !isNewChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#050505]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E87D20] mx-auto mb-4"></div>
          <p className="text-[#8B95A5]">Loading chat session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col h-full bg-[#050505] overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#121827] via-[#050505] to-[#050505] z-0" />

      {/* Constellation Particles */}
      <ConstellationParticles />

      {/* Gradient Background Effects */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#E87D20] opacity-5 rounded-full blur-3xl animate-pulse-slow z-0" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#FF512F] opacity-5 rounded-full blur-3xl animate-pulse-slow z-0" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Session Header */}
        {currentSession && (
          <div className="flex-shrink-0 bg-[#0D1220]/80 backdrop-blur-md border-b border-[#1E293B] px-6 py-3">
            <div className="flex items-center gap-3">
              <VaultRAGLogo className="w-8 h-8" />
              <h2 className="text-lg font-semibold bg-gradient-to-r from-[#E87D20] to-[#FF512F] bg-clip-text text-transparent">
                {currentSession.title}
              </h2>
            </div>
          </div>
        )}
        
        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">{messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-4xl px-4">
                <VaultRAGLogo className="w-20 h-20 mx-auto mb-6" />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-[#E87D20] via-[#FF7F50] to-[#FF512F] bg-clip-text text-transparent mb-3">
                  Welcome to VaultRAG
                </h2>
                <p className="text-[#8B95A5] mb-8">
                  Your intelligent document assistant. Upload documents and ask questions!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <button
                    onClick={() => onSendMessage('What can you help me with?')}
                    className="p-4 bg-[#0D1220]/80 backdrop-blur-md border border-[#1E293B] rounded-xl hover:border-[#E87D20] hover:bg-[#0D1220] text-left transition-all duration-300 group"
                  >
                    <div className="font-medium text-[#E87D20] mb-1">Getting Started</div>
                    <div className="text-sm text-[#8B95A5] group-hover:text-gray-300">What can you help me with?</div>
                  </button>
                  <button
                    onClick={() => onSendMessage('How do I upload documents?')}
                    className="p-4 bg-[#0D1220]/80 backdrop-blur-md border border-[#1E293B] rounded-xl hover:border-[#E87D20] hover:bg-[#0D1220] text-left transition-all duration-300 group"
                  >
                    <div className="font-medium text-[#E87D20] mb-1">Upload Documents</div>
                    <div className="text-sm text-[#8B95A5] group-hover:text-gray-300">How do I upload documents?</div>
                  </button>
                  <button
                    onClick={() => onSendMessage('Summarize my documents')}
                    className="p-4 bg-[#0D1220]/80 backdrop-blur-md border border-[#1E293B] rounded-xl hover:border-[#E87D20] hover:bg-[#0D1220] text-left transition-all duration-300 group"
                  >
                    <div className="font-medium text-[#E87D20] mb-1">Summarization</div>
                    <div className="text-sm text-[#8B95A5] group-hover:text-gray-300">Summarize my documents</div>
                  </button>
                  <button
                    onClick={() => onSendMessage('Search for specific information')}
                    className="p-4 bg-[#0D1220]/80 backdrop-blur-md border border-[#1E293B] rounded-xl hover:border-[#E87D20] hover:bg-[#0D1220] text-left transition-all duration-300 group"
                  >
                    <div className="font-medium text-[#E87D20] mb-1">Search</div>
                    <div className="text-sm text-[#8B95A5] group-hover:text-gray-300">Search for specific information</div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              
              {loading && (
                <div className="flex justify-start mb-4">
                  <div className="flex max-w-3xl">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 rounded-full bg-[#0D1220]/80 border border-[#1E293B] text-[#E87D20] flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                    <div className="bg-[#0D1220]/80 backdrop-blur-md border border-[#E87D20] text-white rounded-xl px-4 py-2">
                      <p className="text-sm">Thinking...</p>
                    </div>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="max-w-3xl mx-auto mb-4">
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-2">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Input Area - Fixed at Bottom */}
        <div className="flex-shrink-0 bg-[#050505] relative">
          <ChatInput onSendMessage={onSendMessage} disabled={loading} />
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.05; }
          50% { opacity: 0.1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;
