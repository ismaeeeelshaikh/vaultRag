import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { requestPasswordReset } from "../../services/auth";

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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      await requestPasswordReset(email);
      setMessage("If your email exists, you will receive an OTP.");
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setError("Error sending OTP. Try again later.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505]">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#121827] via-[#050505] to-[#050505] z-0" />

      {/* Constellation Particles */}
      <ConstellationParticles />

      {/* Gradient Background Effects */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-[#E87D20] opacity-10 rounded-full blur-3xl animate-pulse-slow z-0" />
      <div className="fixed bottom-20 right-20 w-96 h-96 bg-[#FF512F] opacity-10 rounded-full blur-3xl animate-pulse-slow z-0" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <VaultRAGLogo className="w-16 h-16" />
            </div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#E87D20] via-[#FF7F50] to-[#FF512F] bg-clip-text text-transparent mb-3">
              Forgot Password
            </h1>
            <p className="text-[#8B95A5] text-sm">
              Enter your email to receive OTP
            </p>
          </div>

          {/* Card */}
          <div className="bg-[#0D1220]/80 backdrop-blur-md rounded-2xl border border-[#1E293B] p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-[#8B95A5] text-xs font-medium uppercase tracking-wide mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B95A5] group-focus-within:text-[#E87D20] transition-colors duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full pl-12 pr-4 py-3 bg-[#121827] border border-[#1E293B] rounded-xl text-white placeholder-[#8B95A5]/50 focus:outline-none focus:border-[#E87D20] focus:ring-4 focus:ring-[#E87D20]/30 transition-all duration-300"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}
              {message && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <p className="text-green-400 text-sm text-center">{message}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#E87D20] to-[#FF512F] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#E87D20]/30 transform hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#E87D20]/50"
              >
                Send OTP
              </button>

              {/* Back to Login Link */}
              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-[#8B95A5] hover:text-[#E87D20] text-sm font-medium transition-colors duration-300 inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.15; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
