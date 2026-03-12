import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════
   LOGO COMPONENT
   ═══════════════════════════════════════════════════════════ */

function VaultRAGLogo({ className = "w-10 h-10" }) {
    return (
        <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Owl/Bird V-shape head */}
            <path d="M50 85 L20 25 C20 25 18 15 25 12 L35 20 L45 15 L50 20 L55 15 L65 20 L75 12 C82 15 80 25 80 25 L50 85 Z" fill="#0F172A" stroke="#1E293B" strokeWidth="2"/>
            {/* Left eye */}
            <ellipse cx="35" cy="38" rx="8" ry="10" fill="#E87D20"/>
            <ellipse cx="36" cy="37" rx="3" ry="4" fill="#1E293B"/>
            <ellipse cx="37" cy="36" rx="1.5" ry="2" fill="#FFFFFF"/>
            {/* Right eye */}
            <ellipse cx="65" cy="38" rx="8" ry="10" fill="#E87D20"/>
            <ellipse cx="64" cy="37" rx="3" ry="4" fill="#1E293B"/>
            <ellipse cx="63" cy="36" rx="1.5" ry="2" fill="#FFFFFF"/>
            {/* Beak */}
            <path d="M50 45 L45 52 L50 50 L55 52 Z" fill="#E87D20"/>
            <line x1="48" y1="53" x2="48" y2="55" stroke="#1E293B" strokeWidth="1"/>
            <line x1="52" y1="53" x2="52" y2="55" stroke="#1E293B" strokeWidth="1"/>
        </svg>
    );
}

/* ═══════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════ */

function useCountUp(target, duration = 2000) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true;
                const start = performance.now();
                const step = (now) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setCount(Math.floor(eased * target));
                    if (progress < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            }
        }, { threshold: 0.3 });
        observer.observe(el);
        return () => observer.disconnect();
    }, [target, duration]);

    return { count, ref };
}

function useInView(threshold = 0.15) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);
    return { ref, inView };
}

/* ═══════════════════════════════════════════════════════════
   CONSTELLATION PARTICLES
   ═══════════════════════════════════════════════════════════ */
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

    return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-80" />;
}

/* ═══════════════════════════════════════════════════════════
   TYPING ANIMATION COMPONENT
   ═══════════════════════════════════════════════════════════ */
function TypingText({ texts, className }) {
    const [current, setCurrent] = useState(0);
    const [displayed, setDisplayed] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let timeout;
        const text = texts[current];

        if (!isDeleting) {
            if (displayed.length < text.length) {
                timeout = setTimeout(() => {
                    setDisplayed(text.slice(0, displayed.length + 1));
                }, 50);
            } else {
                timeout = setTimeout(() => {
                    setIsDeleting(true);
                }, 2000);
            }
        } else {
            if (displayed.length > 0) {
                timeout = setTimeout(() => {
                    setDisplayed(text.slice(0, displayed.length - 1));
                }, 30);
            } else {
                setIsDeleting(false);
                setCurrent((current + 1) % texts.length);
            }
        }

        return () => clearTimeout(timeout);
    }, [displayed, isDeleting, current, texts]);

    return (
        <span className={className}>
            {displayed}
            <span className="animate-pulse text-[#E87D20] ml-[2px]">|</span>
        </span>
    );
}

/* ═══════════════════════════════════════════════════════════
   LIVE CHAT DEMO COMPONENT
   ═══════════════════════════════════════════════════════════ */
const CHAT_SCENARIOS = [
    {
        userMsg: "What information is in my passport scan?",
        docTitle: "passport_scan.pdf",
        botDescPart1: "Your document contains: Name (John Smith), Passport No. (J1234567), Date of Birth. ",
        highlightWord: "All PII was filtered",
        botDescPart2: " before processing by AI.",
        chip1: "✓ Privacy Protected",
        chip2: "📄 3 pages • 2.4MB",
        nextStepText: "Ask a follow-up question or upload another document → ",
        nextStepLink: "Continue chatting"
    },
    {
        userMsg: "Summarize the research paper I uploaded",
        docTitle: "ai_research_2024.pdf",
        botDescPart1: "This paper discusses transformer architectures for NLP. Key findings: ",
        highlightWord: "Attention mechanisms",
        botDescPart2: " improve accuracy by 23% over baseline models.",
        chip1: "✓ 12 pages analyzed",
        chip2: "📊 4 figures extracted",
        nextStepText: "Want more details on methodology? → ",
        nextStepLink: "Deep dive into Section 3"
    },
    {
        userMsg: "Find all mentions of 'revenue' in my contracts",
        docTitle: "contracts_folder (18 files)",
        botDescPart1: "Found 47 mentions across 18 documents. ",
        highlightWord: "Revenue projections: $2.4M",
        botDescPart2: " in Q4 2024 (contract_v3.pdf, page 8).",
        chip1: "✓ 18 docs scanned",
        chip2: "⚡ <0.2s response",
        nextStepText: "Compare with last quarter's contracts? → ",
        nextStepLink: "Run comparison"
    },
    {
        userMsg: "What are the key terms in my lease agreement?",
        docTitle: "apartment_lease.pdf",
        botDescPart1: "Rent: $1,800/month, Security deposit: $3,600, Lease duration: 12 months. ",
        highlightWord: "Notice period: 60 days",
        botDescPart2: " required for termination.",
        chip1: "✓ Verified clauses",
        chip2: "📄 Legal document",
        nextStepText: "Need a summary of tenant rights? → ",
        nextStepLink: "Explain rights"
    },
    {
        userMsg: "Extract all email addresses from these invoices",
        docTitle: "invoices_Q1_2024 (23 files)",
        botDescPart1: "Extracted 18 unique email addresses. ",
        highlightWord: "All contact info was masked",
        botDescPart2: " in AI processing for privacy.",
        chip1: "✓ Privacy filtered",
        chip2: "📧 18 contacts found",
        nextStepText: "Export as CSV or continue analyzing? → ",
        nextStepLink: "Export data"
    }
];

function LiveChatDemo() {
    const [step, setStep] = useState(0);
    const [scenarioIdx, setScenarioIdx] = useState(0);
    const [isFading, setIsFading] = useState(false);
    const { ref, inView } = useInView(0.3);

    const currentScenario = CHAT_SCENARIOS[scenarioIdx];

    useEffect(() => {
        if (!inView) return;
        let isCancelled = false;

        const runAnimation = () => {
            if (isCancelled) return;
            setIsFading(false);
            setStep(4);

            setTimeout(() => {
                if (!isCancelled) setIsFading(true);
            }, 5000);

            setTimeout(() => {
                if (!isCancelled) {
                    setStep(0);
                    setScenarioIdx(prev => (prev + 1) % CHAT_SCENARIOS.length);
                }
            }, 5500);
        };

        if (step === 0) {
            runAnimation();
        }

        return () => {
            isCancelled = true;
        };
    }, [inView, step, scenarioIdx]);

    return (
        <div ref={ref} className="relative w-full max-w-md mx-auto">
            <Link to="/login" className="block relative bg-[#090C15] backdrop-blur-2xl border border-[#1E293B] rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden cursor-pointer group hover:border-[#E87D20]/50 transition-colors duration-300">
                <div className="bg-[#090C15]/90 border-b border-[#1E293B] px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#121827] rounded-xl flex items-center justify-center text-lg border border-[#1E293B] shadow-inner text-[#E87D20]">
                        🛡️
                    </div>
                    <div>
                        <div className="text-white font-bold text-base tracking-wide flex items-center gap-2">
                            VaultRAG AI
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 bg-[#E87D20] rounded-full shadow-[0_0_8px_rgba(232,125,32,0.8)]"></span>
                            <span className="text-[#8B95A5] text-[11px] font-bold uppercase tracking-wider">Privacy Active</span>
                        </div>
                    </div>
                </div>

                <div className={`p-5 space-y-5 min-h-[350px] transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                    {step >= 1 && (
                        <div key={`user-${scenarioIdx}`} className="flex justify-end animate-slide-up">
                            <div className="bg-[linear-gradient(to_right,#E87D20,#FF512F)] text-white px-5 py-4 rounded-[1.5rem] rounded-tr-sm text-[15px] max-w-[90%] leading-relaxed shadow-[0_0_20px_rgba(232,125,32,0.15)] font-medium">
                                {currentScenario.userMsg}
                            </div>
                        </div>
                    )}
                    {step >= 4 && (
                        <div key={`bot-${scenarioIdx}`} className="flex gap-3 animate-slide-up">
                            <div className="w-9 h-9 rounded-full bg-[#121827] border border-[#1E293B] flex items-center justify-center flex-shrink-0 mt-1 text-white shadow-inner">🤖</div>
                            <div className="flex-1">
                                <div className="bg-[#0D1220] border border-[#1E293B] p-5 rounded-[1.5rem] rounded-tl-sm text-sm text-[#E2E8F0] w-full shadow-sm">
                                    <p className="font-bold text-[#E87D20] text-[15px] mb-3 flex items-center gap-2">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        {currentScenario.docTitle}
                                    </p>
                                    <p className="text-[15px] leading-relaxed">
                                        {currentScenario.botDescPart1}
                                        <strong className="text-[#FF512F] font-bold">{currentScenario.highlightWord}</strong>
                                        {currentScenario.botDescPart2}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="px-4 py-2 bg-[#E87D20]/10 text-[#E87D20] rounded-full text-sm font-bold border border-[#E87D20]/30 flex items-center gap-1.5 shadow-[0_0_15px_rgba(232,125,32,0.1)] transition-all">
                                        {currentScenario.chip1}
                                    </span>
                                    <span className="px-4 py-2 bg-[#121827] text-[#8B95A5] rounded-full text-sm font-bold border border-[#1E293B] flex items-center gap-1.5 transition-all">
                                        {currentScenario.chip2}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                    {step >= 4 && (
                        <div key={`next-${scenarioIdx}`} className="flex gap-3 animate-slide-up ml-12">
                            <div className="bg-[#0D1220] border border-[#2D3748] p-4 rounded-2xl w-full shadow-lg group-hover:border-[#E87D20]/50 transition-colors">
                                <p className="font-bold text-[#FF512F] text-[11px] mb-2 flex items-center gap-1.5 uppercase tracking-widest">
                                    <span className="text-sm">💡</span> NEXT STEP
                                </p>
                                <p className="text-[#F1F5F9] text-sm leading-relaxed">
                                    {currentScenario.nextStepText}
                                    <span className="text-[#E87D20] underline font-bold decoration-2 underline-offset-2 group-hover:text-white transition-colors">{currentScenario.nextStepLink}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </Link>
            <div className="absolute -inset-10 bg-[#E87D20]/10 rounded-[3rem] blur-[80px] -z-10 animate-pulse-slow pointer-events-none"></div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════ */

const FEATURES = [
    { icon: '💬', title: 'AI Chat Interface', desc: 'Ask questions about your documents in natural language. Get instant, accurate answers.', delay: 0 },
    { icon: '🔒', title: 'Privacy Middleware', desc: 'Sensitive data like SSNs, credit cards, and names are filtered before AI processing.', delay: 100 },
    { icon: '📄', title: 'Multi-Document Upload', desc: 'Upload PDFs, contracts, research papers, invoices - we index everything securely.', delay: 200 },
    { icon: '⚡', title: 'Fast Search', desc: 'Search through millions of document chunks in <0.2 seconds with vector embeddings.', delay: 300 },
    { icon: '🧠', title: 'Smart Context Retrieval', desc: 'Parent Document Retrieval ensures AI gets full context, not just matching snippets.', delay: 400 },
    { icon: '🗄️', title: 'Chat Memory', desc: 'Your chat history and uploaded documents persist across sessions securely.', delay: 500 },
];

const STEPS = [
    { num: '01', title: 'Upload Documents', desc: 'Drop your PDFs, contracts, research papers - anything. We chunk and index them securely.', icon: '📤' },
    { num: '02', title: 'Privacy Filter Active', desc: 'Our middleware detects and masks PII (names, SSNs, credit cards) before AI processing.', icon: '🛡️' },
    { num: '03', title: 'Ask Questions', desc: 'Query your documents in natural language. Get verified answers with source citations.', icon: '💬' },
];

const IMPACT_STATS = [
    { value: 24, suffix: '/7', label: 'Always Available', icon: '🕐' },
];

const CRISIS_STATS = [
    { value: 80, suffix: '%', label: 'Of companies struggle with unstructured data', highlight: true },
    { value: 52, suffix: '%', label: 'Of enterprise data is dark (unused)', highlight: false },
    { value: 3.5, suffix: 'hrs', label: 'Average time employees spend searching for info', highlight: true },
    { value: 2.1, suffix: 'T', label: 'USD lost annually to poor knowledge management', highlight: false },
];

/* ─── StatCard ─── */
function StatCard({ value, suffix, label, icon }) {
    const { count, ref } = useCountUp(value);
    const displayValue = value < 10 ? count.toFixed(1) : count.toLocaleString();
    return (
        <div ref={ref} className="relative group">
            <div className="bg-[#0D1220] border border-[#1E293B] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-6 rounded-[1.5rem] text-center transition-all duration-500 hover:-translate-y-1">
                <div className="text-3xl mb-2">{icon}</div>
                <div className="text-3xl sm:text-4xl font-extrabold font-display text-transparent bg-clip-text bg-gradient-to-r from-[#E87D20] to-[#FF512F]">
                    {displayValue}{suffix}
                </div>
                <div className="text-sm font-medium text-[#8B95A5] mt-2">{label}</div>
            </div>
        </div>
    );
}

/* ─── CrisisStatCard ─── */
function CrisisStatCard({ value, suffix, label, highlight }) {
    const { count, ref } = useCountUp(value, 2500);
    const displayValue = value < 10 ? count.toFixed(1) : count.toLocaleString();
    return (
        <div ref={ref} className={`p-6 rounded-[1.5rem] text-center transition-all duration-500 hover:scale-[1.03] backdrop-blur-xl border ${highlight
            ? 'bg-[#121827]/80 border-[#E87D20]/50 shadow-[0_8px_30px_-10px_rgba(232,125,32,0.2)]'
            : 'bg-[#0D1220]/40 border-[#1E293B]'
            }`}>
            <div className={`text-3xl sm:text-4xl font-extrabold font-display ${highlight ? 'text-[#E87D20] drop-shadow-[0_0_10px_rgba(232,125,32,0.5)]' : 'text-white'}`}>
                {displayValue}{suffix}
            </div>
            <div className="text-sm font-medium text-[#8B95A5] mt-2 leading-tight">{label}</div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function LandingPage() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const featuresView = useInView(0.1);
    const stepsView = useInView(0.1);
    const crisisView = useInView(0.1);

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative font-sans selection:bg-[#E87D20]/30 selection:text-white">

            {/* ═══ Background Effects ═══ */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#121827] via-[#050505] to-[#050505] pointer-events-none z-0"></div>
            <ConstellationParticles />
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#E87D20]/20 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse-slow pointer-events-none z-0"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#FF512F]/20 rounded-full mix-blend-screen filter blur-[100px] opacity-60 animate-pulse-slow pointer-events-none z-0" style={{ animationDelay: '3s' }}></div>

            {/* ═══ Header ═══ */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 20 ? 'bg-[#090C15]/90 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border-b border-[#1E293B]' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">
                    <div className="flex items-center gap-3">
                        <VaultRAGLogo className="w-10 h-10" />
                        <span className="text-xl font-extrabold font-display tracking-tight text-white">
                            VAULT<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E87D20] to-[#FF512F]">RAG</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="hidden sm:inline-flex items-center justify-center px-6 py-2 rounded-full text-white font-bold text-sm bg-[linear-gradient(to_right,#E87D20,#FF512F)] hover:bg-[linear-gradient(to_right,#FF512F,#E87D20)] shadow-[0_4px_20px_-2px_rgba(232,125,32,0.5)] transition-all hover:scale-105 active:scale-95">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* ═══ HERO SECTION ═══ */}
            <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-16 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#121827] border border-[#1E293B] text-[#8B95A5] text-sm font-medium mb-8 shadow-[0_0_10px_rgba(232,125,32,0.1)]"
                    style={{ transform: `translateY(${scrollY * 0.1}px)`, opacity: Math.max(0, 1 - scrollY * 0.002) }}>
                    <span className="w-2.5 h-2.5 bg-[#E87D20] rounded-full animate-pulse shadow-[0_0_8px_rgba(232,125,32,0.8)]"></span>
                    Privacy-First RAG System
                </div>

                <div style={{ transform: `translateY(${scrollY * 0.12}px)`, opacity: Math.max(0, 1 - scrollY * 0.0015) }}>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-white tracking-tight">
                        Chat with Your Documents.
                    </h1>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-transparent bg-clip-text bg-gradient-to-r from-[#E87D20] to-[#FF512F] tracking-tight mt-4">
                        Keep Your Privacy.
                    </h1>
                </div>

                <p className="text-lg sm:text-xl text-[#8B95A5] mt-6 max-w-2xl mx-auto font-medium leading-relaxed"
                    style={{ transform: `translateY(${scrollY * 0.1}px)`, opacity: Math.max(0, 1 - scrollY * 0.0015) }}>
                    Upload contracts, research papers, invoices - anything. Our AI reads them all, but sensitive data like names, credit cards, and SSNs <span className="text-[#FF512F] font-bold">never leave your machine</span>.
                </p>

                {/* Prompt Box */}
                <div className="mt-10" style={{ transform: `translateY(${scrollY * 0.08}px)`, opacity: Math.max(0, 1 - scrollY * 0.002) }}>
                    <div className="inline-flex items-center justify-center pl-6 pr-2 py-2 rounded-full bg-[#0D1220] border border-[#1E293B] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] h-[64px]">
                        <span className="text-[#8B95A5] font-bold text-[13px] tracking-[0.2em] uppercase mr-4">ASK</span>
                        <div className="bg-[#1E1B33] h-full flex items-center px-4 rounded text-white font-medium text-xl border border-[#E87D20]/20 shadow-inner">
                            <TypingText
                                texts={[
                                    'What are the key terms in my lease?',
                                    'Summarize all revenue projections',
                                    'Find mentions of patent claims',
                                ]}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 mt-14"
                    style={{ transform: `translateY(${scrollY * 0.06}px)`, opacity: Math.max(0, 1 - scrollY * 0.0015) }}>
                    <Link to="/register" className="group flex items-center justify-center gap-3 px-10 py-4 rounded-full text-white font-bold text-lg bg-[linear-gradient(to_right,#E87D20,#FF512F)] hover:bg-[linear-gradient(to_right,#FF512F,#E87D20)] shadow-[0_4px_20px_-2px_rgba(232,125,32,0.5)] transition-all hover:scale-105 active:scale-95">
                        Start Free
                        <svg className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </Link>
                    <Link to="/login" className="px-10 py-4 rounded-full font-bold text-white border border-[#1E293B] bg-[#090C15] hover:bg-[#121827] hover:text-[#E87D20] transition-all shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
                        View Demo
                    </Link>
                </div>
            </section>

            {/* ═══ LIVE DEMO + STATS ═══ */}
            <section className="relative z-10 px-6 py-24 max-w-7xl mx-auto border-t border-[#1E293B]">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="inline-block px-4 py-1.5 rounded-full bg-[#121827] border border-[#1E293B] text-[#E87D20] text-xs font-bold tracking-widest uppercase mb-6 shadow-[0_0_10px_rgba(232,125,32,0.1)]">
                            Live Demo
                        </span>
                        <h2 className="text-4xl sm:text-5xl font-extrabold font-display text-white leading-tight mb-6">
                            See Privacy-First RAG in Action
                        </h2>
                        <p className="text-lg text-[#8B95A5] leading-relaxed mb-10 max-w-md">
                            Real example: Watch how VaultRAG analyzes documents, filters sensitive data, and provides intelligent answers with source citations.
                        </p>
                        <div className="grid grid-cols-1 gap-4 mb-4">
                            {IMPACT_STATS.map((stat, i) => (
                                <StatCard key={i} {...stat} />
                            ))}
                        </div>
                    </div>
                    <LiveChatDemo />
                </div>
            </section>

            {/* ═══ WHY ENTERPRISES NEED THIS ═══ */}
            <section ref={crisisView.ref} className="relative z-10 px-6 py-24 border-t border-[#1E293B] bg-[#0D1220]/50">
                <div className="max-w-5xl mx-auto">
                    <div className={`text-center mb-16 transition-all duration-1000 ${crisisView.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <span className="inline-block px-4 py-1.5 rounded-full bg-[#121827] border border-[#E87D20]/50 text-[#E87D20] text-xs font-bold tracking-widest uppercase mb-6 shadow-[0_0_15px_rgba(232,125,32,0.15)]">
                            The Problem
                        </span>
                        <h2 className="text-4xl sm:text-5xl font-extrabold font-display text-white leading-tight">
                            The Enterprise Data Crisis
                        </h2>
                        <p className="text-[#8B95A5] mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
                            Organizations drown in unstructured data while employees waste hours searching for information. Industry research shows the scale of the problem.
                        </p>
                    </div>

                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-1000 delay-200 ${crisisView.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        {CRISIS_STATS.map((stat, i) => (
                            <CrisisStatCard key={i} {...stat} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ Features Grid ═══ */}
            <section id="features" ref={featuresView.ref} className="relative z-10 px-6 py-24 max-w-7xl mx-auto border-t border-[#1E293B]">
                <div className={`text-center mb-20 transition-all duration-1000 ${featuresView.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#121827] border border-[#1E293B] text-[#8B95A5] text-xs font-bold tracking-widest uppercase mb-6">
                        Features
                    </span>
                    <h2 className="text-4xl sm:text-6xl font-extrabold font-display text-white">
                        Everything You Need
                    </h2>
                    <p className="text-[#8B95A5] mt-4 text-lg">From document upload to intelligent Q&A — all in one place</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {FEATURES.map((f, i) => (
                        <Link
                            to="/login"
                            key={i}
                            className={`bg-[#0D1220] border border-[#1E293B] block p-8 rounded-3xl group cursor-pointer shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-700
                                ${featuresView.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                            style={{ transitionDelay: `${i * 100}ms` }}
                        >
                            <div className="w-14 h-14 bg-[#121827] border border-[#E87D20]/40 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-[0_0_10px_rgba(232,125,32,0.1)] group-hover:scale-110 transition-transform duration-300">
                                {f.icon}
                            </div>
                            <h3 className="text-xl font-bold font-display text-white mb-2 tracking-wide group-hover:text-[#E87D20] transition-colors">
                                {f.title}
                            </h3>
                            <p className="text-[15px] text-[#8B95A5] leading-relaxed font-medium">
                                {f.desc}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ═══ How It Works ═══ */}
            <section id="how-it-works" ref={stepsView.ref} className="relative z-10 px-6 py-24 max-w-6xl mx-auto border-t border-[#1E293B] bg-[#0D1220]/50 rounded-[3rem]">
                <div className={`text-center mb-20 transition-all duration-1000 ${stepsView.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#121827] border border-[#1E293B] text-[#8B95A5] text-xs font-bold tracking-widest uppercase mb-6">
                        Simple Process
                    </span>
                    <h2 className="text-4xl sm:text-5xl font-extrabold font-display text-white">How It Works</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 relative">
                    <div className={`hidden sm:block absolute top-[3rem] left-[20%] right-[20%] h-px bg-[linear-gradient(to_right,#E87D20,#FF512F)] transition-all duration-1500 ${stepsView.inView ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`} style={{ transformOrigin: 'left' }}></div>
                    {STEPS.map((s, i) => (
                        <div key={i} className={`text-center relative group transition-all duration-700 ${stepsView.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${i * 200 + 300}ms` }}>
                            <div className="w-[6rem] h-[6rem] mx-auto bg-[#050505] border-2 border-[#E87D20] rounded-[2rem] flex items-center justify-center text-4xl shadow-[0_0_15px_rgba(232,125,32,0.3)] mb-6 relative z-10 group-hover:bg-[#121827] transition-colors">
                                <span className="relative z-10">{s.icon}</span>
                            </div>
                            <div className="text-[11px] font-bold text-[#E87D20] tracking-[0.2em] mb-2 uppercase">STEP {s.num}</div>
                            <h3 className="text-xl font-bold font-display text-white mb-3">{s.title}</h3>
                            <p className="text-sm text-[#8B95A5] leading-relaxed max-w-[250px] mx-auto">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ Footer ═══ */}
            <footer className="relative z-10 px-6 pt-24 pb-12 bg-[#090C15]/90 backdrop-blur-md border-t border-[#1E293B]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-left mb-16">
                        {/* Brand Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <VaultRAGLogo className="w-12 h-12" />
                                <h3 className="text-xl font-bold font-display text-white">
                                    VAULT<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E87D20] to-[#FF512F]">RAG</span>
                                </h3>
                            </div>
                            <p className="text-sm text-[#8B95A5] leading-relaxed">
                                Your documents, your privacy. Advanced RAG technology with enterprise-grade security built in.
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-[#E87D20] rounded-full animate-pulse"></span>
                                <span className="text-xs text-[#8B95A5]">All systems operational</span>
                            </div>
                        </div>

                        {/* Product Links */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold font-display text-white">Product</h3>
                            <ul className="space-y-3 text-sm text-[#8B95A5]">
                                <li><Link to="/features" className="hover:text-[#E87D20] transition-colors">Features</Link></li>
                                <li><Link to="/pricing" className="hover:text-[#E87D20] transition-colors">Pricing</Link></li>
                                <li><Link to="/security" className="hover:text-[#E87D20] transition-colors">Security</Link></li>
                                <li><Link to="/docs" className="hover:text-[#E87D20] transition-colors">Documentation</Link></li>
                            </ul>
                        </div>

                        {/* Company Links */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold font-display text-white">Company</h3>
                            <ul className="space-y-3 text-sm text-[#8B95A5]">
                                <li><Link to="/about" className="hover:text-[#E87D20] transition-colors">About Us</Link></li>
                                <li><Link to="/contact" className="hover:text-[#E87D20] transition-colors">Contact</Link></li>
                                <li><Link to="/privacy" className="hover:text-[#E87D20] transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="hover:text-[#E87D20] transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>

                        {/* CTA Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold font-display text-white">Get Started</h3>
                            <p className="text-sm text-[#8B95A5] leading-relaxed">
                                Join thousands of users who trust VaultRAG for secure document intelligence.
                            </p>
                            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-bold text-sm bg-[linear-gradient(to_right,#E87D20,#FF512F)] hover:bg-[linear-gradient(to_right,#FF512F,#E87D20)] shadow-[0_4px_20px_-2px_rgba(232,125,32,0.5)] transition-all hover:scale-105">
                                Start Free Trial
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </Link>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-8 border-t border-[#1E293B] flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-[#8B95A5]">
                        <div className="flex items-center gap-3">
                            <p>&copy; {new Date().getFullYear()} VaultRAG. All rights reserved.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <a href="#" className="hover:text-[#E87D20] transition-colors">Status</a>
                            <a href="#" className="hover:text-[#E87D20] transition-colors">Support</a>
                            <a href="#" className="hover:text-[#E87D20] transition-colors">Changelog</a>
                        </div>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.4s ease-out forwards;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.6; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
