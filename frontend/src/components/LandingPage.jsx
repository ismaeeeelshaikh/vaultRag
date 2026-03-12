import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import {
  Shield, Zap, FileText, MessageSquare, Bot, ClipboardList,
  Database, Code2, Lock, Globe, ArrowRight, CheckCircle,
  Upload, Search, Brain, Server, Link2, Cpu
} from 'lucide-react';

/* ═══════════════════ SITE CONFIGURATION ═══════════════════
   All content is here — nothing is hardcoded in JSX.
   Change any value below to update the landing page.
   ═══════════════════════════════════════════════════════════ */
const CONFIG = {
  siteName: "VaultRAG",

  nav: {
    ctaText: "Get Started",
    ctaLink: "/register",
  },

  hero: {
    badge: "Secure & Private AI Assistant",
    heading: "Know Your Documents.",
    subtitle:
      "Get instant answers from your files. AI-powered, private, and completely free.",
    prompts: [
      "Summarize the Q3 financial report",
      "What are the key findings in the research?",
      "Compare clause 5 across both contracts",
      "Extract action items from meeting notes",
      "What does the policy say about refunds?",
    ],
    primaryCta: { text: "Start Free Consultation", link: "/register" },
    secondaryCta: { text: "Try as Guest (5 free questions)", link: "/login" },
  },

  demo: {
    badge: "LIVE DEMO",
    heading: "See It In Action",
    description:
      "Real example: Watch how VaultRAG analyzes your documents, retrieves the answer instantly, and provides actionable insights.",
    chat: {
      botName: "VaultRAG AI",
      status: "ONLINE",
      userMessage: "What does the leave policy say about work from home?",
      response: {
        source: "HR Policy Document, 2024",
        text: "According to Section 4.2, employees are entitled to ",
        highlight: "3 days of remote work per week",
        textAfter: " after completing the probation period.",
      },
      actions: ["Verified", "View Source"],
      nextStep: "Apply for WFH →",
      nextStepLink: "Auto-generate request",
    },
    stats: [
      { icon: "tools", value: "6", label: "AI Tools Built" },
      { icon: "docs", value: "50+", label: "Document Types" },
      { icon: "shield", value: "100%", label: "Data Privacy" },
      { icon: "clock", value: "24/7", label: "Always Available" },
    ],
  },

  problem: {
    badge: "THE PROBLEM",
    heading: "Why You Need VaultRAG",
    subtitle:
      "Organizations are drowning in documents. Finding answers shouldn't take hours. Real numbers from industry reports.",
    stats: [
      { value: "7.5x", label: "Time wasted searching for info daily", source: "McKinsey" },
      { value: "80%", label: "Enterprise data is unstructured", source: "Gartner" },
      { value: "2.5 Hr", label: "Avg. daily time lost to doc search", source: "IDC" },
      { value: "31%", label: "Workers can't find files when needed", source: "Wakefield" },
    ],
  },

  howItWorks: {
    badge: "SIMPLE PROCESS",
    heading: "How It Works",
    steps: [
      {
        num: "01",
        icon: "upload",
        title: "Upload Your Documents",
        desc: "Upload PDFs, docs, or any text files to your private vault.",
      },
      {
        num: "02",
        icon: "bot",
        title: "AI Analyzes",
        desc: "Our AI indexes your documents, understands context, and builds your knowledge base.",
      },
      {
        num: "03",
        icon: "clipboard",
        title: "Get Instant Answers",
        desc: "Ask questions in natural language and get accurate, sourced answers instantly.",
      },
    ],
  },

  technology: {
    badge: "TECHNOLOGY",
    heading: "Powered by Trusted Technology",
    stack: [
      { name: "Groq", desc: "Ultra-fast LLM inference engine", icon: "zap", color: "text-yellow-400" },
      { name: "ChromaDB", desc: "Vector store for semantic search", icon: "database", color: "text-purple-400" },
      { name: "FastAPI", desc: "High-performance Python backend", icon: "server", color: "text-green-400" },
      { name: "LangChain", desc: "Advanced RAG pipeline orchestration", icon: "link", color: "text-blue-400" },
      { name: "React", desc: "Modern reactive UI framework", icon: "code", color: "text-cyan-400" },
      { name: "PostgreSQL", desc: "Reliable relational database", icon: "cpu", color: "text-orange-400" },
    ],
  },

  footer: {
    tagline: "Empowering teams with AI-driven document intelligence.",
    legal: [
      { text: "Privacy Policy", link: "#" },
      { text: "Terms of Service", link: "#" },
    ],
    copyright: `© ${new Date().getFullYear()} VaultRAG — AI for Everyone`,
    madeWith: "Built with ❤️ for Productivity",
  },
};

/* ═══════════════════ PARTICLES CONFIG ═══════════════════ */
const PARTICLES_OPTIONS = {
  background: { color: { value: "transparent" } },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: { enable: true, mode: "grab" },
      resize: { enable: true },
    },
    modes: {
      grab: { distance: 180, links: { opacity: 0.4 } },
    },
  },
  particles: {
    color: { value: "#ffffff" },
    links: {
      color: "#ffffff",
      distance: 160,
      enable: true,
      opacity: 0.12,
      width: 1,
    },
    move: {
      enable: true,
      speed: 0.8,
      direction: "none",
      outModes: { default: "bounce" },
    },
    number: {
      density: { enable: true, height: 800, width: 800 },
      value: 90,
    },
    opacity: { value: 0.25 },
    shape: { type: "circle" },
    size: { value: { min: 1, max: 3 } },
  },
  detectRetina: true,
};

/* ═══════════════════ TYPEWRITER HOOK ═══════════════════ */
function useTypewriter(texts, typingMs = 70, deletingMs = 35, pauseMs = 1800) {
  const [display, setDisplay] = useState("");
  const idx = useRef(0);
  const charIdx = useRef(0);
  const deleting = useRef(false);

  useEffect(() => {
    const tick = () => {
      const current = texts[idx.current];
      if (!deleting.current) {
        charIdx.current++;
        setDisplay(current.slice(0, charIdx.current));
        if (charIdx.current === current.length) {
          deleting.current = true;
          return pauseMs;
        }
        return typingMs;
      } else {
        charIdx.current--;
        setDisplay(current.slice(0, charIdx.current));
        if (charIdx.current === 0) {
          deleting.current = false;
          idx.current = (idx.current + 1) % texts.length;
        }
        return deletingMs;
      }
    };

    let timer;
    const schedule = () => {
      const delay = tick();
      timer = setTimeout(schedule, delay);
    };
    timer = setTimeout(schedule, typingMs);
    return () => clearTimeout(timer);
  }, [texts, typingMs, deletingMs, pauseMs]);

  return display;
}

/* ═══════════════════ ICON MAPPER ═══════════════════ */
const iconMap = {
  tools: Zap,
  docs: FileText,
  shield: Shield,
  clock: Globe,
  upload: Upload,
  bot: Bot,
  clipboard: ClipboardList,
  zap: Zap,
  database: Database,
  server: Server,
  link: Link2,
  code: Code2,
  cpu: Cpu,
  search: Search,
  brain: Brain,
};

function Icon({ name, className = "w-5 h-5" }) {
  const Comp = iconMap[name];
  return Comp ? <Comp className={className} /> : null;
}

/* ═══════════════════ SECTION COMPONENTS ═══════════════════ */

function Navbar() {
  const { nav, siteName } = CONFIG;
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0b0f1a]/80 border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">{siteName}</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            to={nav.ctaLink}
            className="px-5 py-2.5 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-full transition shadow-lg shadow-orange-500/25"
          >
            {nav.ctaText}
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const { hero, siteName } = CONFIG;
  const typed = useTypewriter(hero.prompts);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center pt-24 pb-16">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-medium mb-8">
        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        {hero.badge}
      </div>

      {/* Heading */}
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-6 max-w-4xl">
        <span className="text-white">{hero.heading}</span>
      </h1>

      {/* Subtitle */}
      <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
        {hero.subtitle}
      </p>

      {/* Typewriter prompt */}
      <div className="flex items-center gap-3 mb-12 bg-[#1a1f35]/80 border border-gray-700/50 rounded-xl px-6 py-4 max-w-lg w-full">
        <span className="text-xs font-bold text-gray-500 tracking-widest uppercase shrink-0">
          Prompt
        </span>
        <div className="h-5 w-px bg-gray-600" />
        <span className="text-gray-200 text-left truncate flex-1">
          {typed}
          <span className="inline-block w-0.5 h-5 bg-orange-500 ml-0.5 animate-pulse align-middle" />
        </span>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to={hero.primaryCta.link}
          className="group px-8 py-3.5 text-base font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg shadow-orange-500/25 transition transform hover:scale-105 flex items-center gap-2"
        >
          {hero.primaryCta.text}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          to={hero.secondaryCta.link}
          className="px-8 py-3.5 text-base font-semibold border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white rounded-full transition"
        >
          {hero.secondaryCta.text}
        </Link>
      </div>
    </section>
  );
}

function DemoSection() {
  const { demo } = CONFIG;
  const { chat, stats } = demo;

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Text + Stats */}
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold tracking-wider uppercase mb-6">
              {demo.badge}
            </span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
              {demo.heading}
            </h2>
            <p className="text-gray-400 text-lg mb-12 max-w-md">
              {demo.description}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-[#1a1f35]/80 border border-gray-700/40 text-center hover:border-orange-500/30 transition"
                >
                  <Icon name={stat.icon} className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <div className="text-3xl font-extrabold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Mock Chat */}
          <div className="relative">
            <div className="rounded-2xl bg-[#141829] border border-gray-700/50 overflow-hidden shadow-2xl shadow-black/40">
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-700/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">{chat.botName}</div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    {chat.status}
                  </div>
                </div>
              </div>

              {/* Chat Body */}
              <div className="p-6 space-y-5">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-orange-500 text-white px-5 py-3 rounded-2xl rounded-br-md max-w-[85%] text-sm">
                    {chat.userMessage}
                  </div>
                </div>

                {/* Bot response */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1a1f35] border border-gray-700 flex items-center justify-center shrink-0 mt-1">
                    <Lock className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="space-y-3 flex-1">
                    {/* Source */}
                    <div className="flex items-center gap-2 text-orange-400 text-sm font-semibold">
                      <Search className="w-4 h-4" />
                      {chat.response.source}
                    </div>
                    {/* Text */}
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {chat.response.text}
                      <span className="text-orange-400 font-semibold">{chat.response.highlight}</span>
                      {chat.response.textAfter}
                    </p>
                    {/* Action buttons */}
                    <div className="flex gap-3">
                      {chat.actions.map((action, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1a1f35] border border-gray-700/50 text-xs text-gray-300 font-medium"
                        >
                          {i === 0 && <CheckCircle className="w-3.5 h-3.5 text-green-400" />}
                          {i === 1 && <FileText className="w-3.5 h-3.5 text-gray-400" />}
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Next Step */}
                <div className="bg-[#1a1f35] border border-gray-700/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-orange-400 text-xs font-bold tracking-wide mb-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    NEXT STEP
                  </div>
                  <p className="text-gray-300 text-sm">
                    {chat.nextStep}{" "}
                    <span className="text-orange-400 underline underline-offset-2 cursor-pointer hover:text-orange-300">
                      {chat.nextStepLink}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const { problem } = CONFIG;

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-gray-700/40 border border-gray-600/50 text-gray-300 text-xs font-bold tracking-wider uppercase mb-6">
          {problem.badge}
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
          {problem.heading}
        </h2>
        <p className="text-gray-400 text-lg mb-16 max-w-2xl mx-auto">
          {problem.subtitle}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {problem.stats.map((stat, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-[#1a1f35]/60 border border-gray-700/40 hover:border-orange-500/30 transition"
            >
              <div className="text-4xl sm:text-5xl font-black text-orange-500 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
              <div className="text-xs text-gray-600 mt-1">({stat.source})</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const { howItWorks } = CONFIG;

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-gray-700/40 border border-gray-600/50 text-gray-300 text-xs font-bold tracking-wider uppercase mb-6">
          {howItWorks.badge}
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-16 leading-tight">
          {howItWorks.heading}
        </h2>

        {/* Steps */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-12 md:gap-0">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-orange-500/60" />

          {howItWorks.steps.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center flex-1 z-10">
              {/* Icon circle */}
              <div className="w-24 h-24 rounded-full bg-[#141829] border-2 border-orange-500/40 flex items-center justify-center mb-6 shadow-lg shadow-orange-500/10">
                <Icon name={step.icon} className="w-10 h-10 text-orange-400" />
              </div>
              <span className="text-orange-500 text-xs font-bold tracking-widest mb-2">
                STEP {step.num}
              </span>
              <h3 className="text-white text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TechnologySection() {
  const { technology } = CONFIG;

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-gray-700/40 border border-gray-600/50 text-gray-300 text-xs font-bold tracking-wider uppercase mb-6">
          {technology.badge}
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-16 leading-tight">
          {technology.heading}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {technology.stack.map((tech, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-5 rounded-2xl bg-[#1a1f35]/60 border border-gray-700/40 hover:border-orange-500/30 transition text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-[#0f1322] border border-gray-700/30 flex items-center justify-center shrink-0">
                <Icon name={tech.icon} className={`w-6 h-6 ${tech.color}`} />
              </div>
              <div>
                <div className="text-white font-bold text-base">{tech.name}</div>
                <div className="text-gray-400 text-sm">{tech.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { footer, siteName } = CONFIG;

  return (
    <footer className="relative border-t border-gray-800/60 bg-[#0a0e1a]/80">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                <Lock className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg">{siteName}</span>
            </div>
            <p className="text-gray-500 text-sm">{footer.tagline}</p>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            {footer.legal.map((item, i) => (
              <a
                key={i}
                href={item.link}
                className="block text-gray-500 hover:text-gray-300 text-sm mb-1.5 transition"
              >
                {item.text}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="md:text-right">
            <h4 className="text-white font-semibold mb-3">Start your free consultation</h4>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-full transition shadow-lg shadow-orange-500/20"
            >
              Start Free Consultation
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
              <Lock className="w-3 h-3 text-white" />
            </div>
            {footer.copyright}
          </div>
          <span className="text-gray-600 text-sm">{footer.madeWith}</span>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
const LandingPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const [particlesReady, setParticlesReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setParticlesReady(true));
  }, []);

  const particlesLoaded = useCallback(async (container) => {}, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return (
    <div className="relative min-h-screen bg-[#0b0f1a] text-gray-200 overflow-x-hidden">
      {/* Particle Background */}
      {particlesReady && (
        <Particles
          id="tsparticles"
          className="fixed inset-0 z-0"
          particlesLoaded={particlesLoaded}
          options={PARTICLES_OPTIONS}
        />
      )}

      {/* All content above particles */}
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <DemoSection />
        <ProblemSection />
        <HowItWorksSection />
        <TechnologySection />
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
