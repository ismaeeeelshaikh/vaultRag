import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

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

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-70" />;
}

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading || success) return;

    // Validate email presence and format
    if (!formData.email || !formData.email.trim()) {
      alert('Please enter a valid email address.');
      setError('Please enter a valid email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      alert('Please enter a valid email address format.');
      setError('Invalid email address format.');
      return;
    }

    // Validate username length
    if (formData.username.length < 3) {
      alert('Username must be at least 3 characters long.');
      setError('Username must be at least 3 characters long.');
      return;
    }

    // Validate password complexity (min 6 chars, uppercase, lowercase, digit)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      alert('Password must be at least 6 characters long and include uppercase, lowercase letters, and a number.');
      setError('Password must include uppercase, lowercase, and a number, and be at least 6 characters long.');
      return;
    }

    // Confirm password match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match.');
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/request-signup-otp', { email: formData.email.trim().toLowerCase() });

      navigate('/verify-signup-otp', { state: {
        username: formData.username,
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      }});
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Could not send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const SECURITY_FEATURES = [
    { emoji: '🔒', label: 'Encrypted' },
    { emoji: '🛡️', label: 'Secure' },
    { emoji: '🔐', label: 'Private' },
    { emoji: '⚡', label: 'Fast' },
    { emoji: '☁️', label: 'Cloud-Based' },
    { emoji: '📱', label: 'Multi-Device' },
  ];

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="max-w-md w-full text-center">
          <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold text-green-400 mb-2">Registration Successful!</h2>
            <p className="text-green-300">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#121827] via-[#050505] to-[#050505] pointer-events-none z-0"></div>
      <ConstellationParticles />
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#E87D20]/10 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse-slow pointer-events-none z-0"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#FF512F]/10 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-pulse-slow pointer-events-none z-0" style={{ animationDelay: '4s' }}></div>
      
      {/* Left Panel - Info Section */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-[#090C15]/50 border-r border-[#1E293B] p-12 flex-col justify-between overflow-hidden backdrop-blur-md z-10">
        
        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 group">
            <VaultRAGLogo className="w-12 h-12 transition-transform group-hover:scale-110" />
            <span className="text-2xl font-extrabold tracking-tight text-white">
              VaultRAG
            </span>
          </Link>
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
              Join VaultRAG,<br />
              <span className="text-[#E87D20]">Start Creating.</span>
            </h1>
            <p className="text-[#8B95A5] text-lg leading-relaxed max-w-md">
              Create your free account and unlock the power of AI-driven document intelligence. Your data stays private, always.
            </p>
          </div>

          {/* Security Feature Pills */}
          <div className="flex flex-wrap gap-3">
            {SECURITY_FEATURES.map((feature, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#121827]/80 backdrop-blur-sm rounded-full text-sm text-[#8B95A5] border border-[#1E293B] font-medium hover:border-[#E87D20] hover:text-white transition-all cursor-default"
              >
                <span className="text-base">{feature.emoji}</span>
                {feature.label}
              </span>
            ))}
          </div>

          {/* Feature Box */}
          <div className="bg-[#0D1220]/80 backdrop-blur-md rounded-2xl p-6 border border-[#1E293B] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-[#121827] rounded-xl flex items-center justify-center text-xl border border-[#1E293B]">✨</div>
                <div className="w-12 h-12 bg-[#121827] rounded-xl flex items-center justify-center text-xl border border-[#1E293B]">🚀</div>
                <div className="w-12 h-12 bg-[#121827] rounded-xl flex items-center justify-center text-xl border border-[#1E293B]">💎</div>
              </div>
              <div>
                <div className="text-white font-bold text-lg">Free Forever · No Credit Card</div>
                <div className="text-[#8B95A5] text-sm mt-1">Get started in minutes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[#8B95A5]/70 text-sm flex items-center gap-2">
          <span className="w-2 h-2 bg-[#E87D20] rounded-full animate-pulse"></span>
          <p>&copy; {new Date().getFullYear()} VaultRAG &mdash; Trusted by Professionals</p>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative z-10">
        
        {/* Back to Home */}
        <div className="absolute top-6 right-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#8B95A5] hover:text-white font-medium transition-colors text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden mb-8">
          <div className="flex items-center gap-3">
            <VaultRAGLogo className="w-10 h-10" />
            <span className="text-2xl font-extrabold text-white">VaultRAG</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-md">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-white mb-2">
              Create Account
            </h2>
            <p className="text-[#8B95A5] font-medium">
              Start your document intelligence journey
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-[#0D1220]/80 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] border border-[#1E293B] p-8">
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Username Input */}
              <div>
                <label htmlFor="username" className="block text-[#8B95A5] font-medium mb-2 text-sm uppercase tracking-wide">
                  Username
                </label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    disabled={loading}
                    value={formData.username}
                    onChange={handleChange}
                    minLength="3"
                    className="w-full bg-[#121827] text-white rounded-xl px-4 py-3.5 pl-11 border border-[#1E293B] focus:border-[#E87D20] focus:ring-2 focus:ring-[#E87D20]/30 outline-none transition-all placeholder-[#4B5563] font-medium disabled:opacity-50"
                    placeholder="Choose a username"
                  />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4B5563]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-[#8B95A5] font-medium mb-2 text-sm uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={loading}
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#121827] text-white rounded-xl px-4 py-3.5 pl-11 border border-[#1E293B] focus:border-[#E87D20] focus:ring-2 focus:ring-[#E87D20]/30 outline-none transition-all placeholder-[#4B5563] font-medium disabled:opacity-50"
                    placeholder="your@email.com"
                  />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4B5563]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-[#8B95A5] font-medium mb-2 text-sm uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={loading}
                    value={formData.password}
                    onChange={handleChange}
                    minLength="6"
                    className="w-full bg-[#121827] text-white rounded-xl px-4 py-3.5 pl-11 border border-[#1E293B] focus:border-[#E87D20] focus:ring-2 focus:ring-[#E87D20]/30 outline-none transition-all placeholder-[#4B5563] font-medium disabled:opacity-50"
                    placeholder="Min 6 characters"
                  />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4B5563]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-[#8B95A5] font-medium mb-2 text-sm uppercase tracking-wide">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    disabled={loading}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    minLength="6"
                    className="w-full bg-[#121827] text-white rounded-xl px-4 py-3.5 pl-11 border border-[#1E293B] focus:border-[#E87D20] focus:ring-2 focus:ring-[#E87D20]/30 outline-none transition-all placeholder-[#4B5563] font-medium disabled:opacity-50"
                    placeholder="Re-enter password"
                  />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4B5563]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3.5 text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-gradient-to-r from-[#E87D20] to-[#FF512F] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-[#E87D20]/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </span>
                ) : (
                  'Send OTP'
                )}
              </button>

              {/* Already have account */}
              <div className="text-center pt-2">
                <Link to="/login" className="text-sm text-[#8B95A5] hover:text-[#E87D20] font-medium transition-colors">
                  Already have an account? Sign in
                </Link>
              </div>
            </form>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 pt-6 mt-6 border-t border-[#1E293B]">
              <svg className="w-4 h-4 text-[#E87D20]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
              </svg>
              <span className="text-[#8B95A5] text-xs font-medium">Protected by Enterprise-Grade Security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Register;
