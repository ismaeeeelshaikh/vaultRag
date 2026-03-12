import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await login(formData);
            if (response.data.user) {
                const userInfo = {
                    id: response.data.user.id,
                    username: response.data.user.username,
                    email: response.data.user.email
                };
                localStorage.setItem('user', JSON.stringify(userInfo));
            }
            navigate('/chat');
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const DOCUMENT_TYPES = [
        { emoji: '💼', label: 'Salary Issues' },
        { emoji: '🏢', label: 'Property' },
        { emoji: '👨‍👩‍👧', label: 'Family' },
        { emoji: '🛒', label: 'Consumer' },
        { emoji: '💻', label: 'Cyber Crime' },
        { emoji: '📋', label: 'RTI' },
    ];

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
                            Your Documents,<br />
                            <span className="text-[#E87D20]">Made Searchable.</span>
                        </h1>
                        <p className="text-[#8B95A5] text-lg leading-relaxed max-w-md">
                            AI-powered document intelligence with RAG technology. Secure, private, and available 24/7.
                        </p>
                    </div>

                    {/* Document Type Pills */}
                    <div className="flex flex-wrap gap-3">
                        {DOCUMENT_TYPES.map((doc, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#121827]/80 backdrop-blur-sm rounded-full text-sm text-[#8B95A5] border border-[#1E293B] font-medium hover:border-[#E87D20] hover:text-white transition-all cursor-default"
                            >
                                <span className="text-base">{doc.emoji}</span>
                                {doc.label}
                            </span>
                        ))}
                    </div>

                    {/* Feature Box */}
                    <div className="bg-[#0D1220]/80 backdrop-blur-md rounded-2xl p-6 border border-[#1E293B] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                        <div className="flex items-center gap-4">
                            <div className="flex gap-3">
                                <div className="w-12 h-12 bg-[#121827] rounded-xl flex items-center justify-center text-xl border border-[#1E293B]">🎯</div>
                                <div className="w-12 h-12 bg-[#121827] rounded-xl flex items-center justify-center text-xl border border-[#1E293B]">📚</div>
                                <div className="w-12 h-12 bg-[#121827] rounded-xl flex items-center justify-center text-xl border border-[#1E293B]">🔒</div>
                            </div>
                            <div>
                                <div className="text-white font-bold text-lg">Advanced RAG · Privacy-First</div>
                                <div className="text-[#8B95A5] text-sm mt-1">Built for secure document analysis</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-[#8B95A5]/70 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#E87D20] rounded-full animate-pulse"></span>
                    <p>&copy; {new Date().getFullYear()} VaultRAG &mdash; AI for Documents</p>
                </div>
            </div>

            {/* Right Panel - Login Form */}
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
                            Welcome Back
                        </h2>
                        <p className="text-[#8B95A5] font-medium">
                            Your AI Document Assistant
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-[#0D1220]/80 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] border border-[#1E293B] p-8">
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            
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
                                        autoComplete="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-[#121827] text-white rounded-xl px-4 py-3.5 pl-11 border border-[#1E293B] focus:border-[#E87D20] focus:ring-2 focus:ring-[#E87D20]/30 outline-none transition-all placeholder-[#4B5563] font-medium"
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
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        autoComplete="current-password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-[#121827] text-white rounded-xl px-4 py-3.5 pl-11 pr-12 border border-[#1E293B] focus:border-[#E87D20] focus:ring-2 focus:ring-[#E87D20]/30 outline-none transition-all placeholder-[#4B5563] font-medium"
                                        placeholder="Enter your password"
                                    />
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4B5563]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B95A5] hover:text-white transition-colors"
                                    >
                                        {showPassword ? (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
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
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-[#E87D20] to-[#FF512F] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-[#E87D20]/50 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </button>

                            {/* Forgot Password */}
                            <div className="text-center pt-2">
                                <Link to="/forgot-password" className="text-sm text-[#8B95A5] hover:text-[#E87D20] font-medium transition-colors">
                                    Forgot your password?
                                </Link>
                            </div>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#1E293B]"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#0D1220] px-4 text-[#8B95A5] font-bold tracking-widest">OR</span>
                            </div>
                        </div>

                        {/* Create Account Button */}
                        <Link
                            to="/register"
                            className="w-full flex items-center justify-center gap-2 bg-[#121827] text-white font-bold py-4 rounded-xl border-2 border-[#1E293B] hover:border-[#E87D20] hover:bg-[#1A1F2E] transition-all duration-300"
                        >
                            Create New Account
                        </Link>

                        {/* Security Badge */}
                        <div className="flex items-center justify-center gap-2 pt-6">
                            <svg className="w-4 h-4 text-[#E87D20]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                            </svg>
                            <span className="text-[#8B95A5] text-xs font-medium">256-bit Encrypted Connection</span>
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
}
