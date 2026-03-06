import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { useWallet } from "@/contexts/WalletContext";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Zap, Globe, Wallet, FileText, CheckCircle, ExternalLink, Menu, X, BookOpen, Github, Twitter, ChevronUp, Quote } from "lucide-react";
import { PactumLogo } from "@/components/shared/PactumLogo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

/* ------------------------------------------------------------------ */
/*  Animated count-up hook                                            */
/* ------------------------------------------------------------------ */
function useCountUp(target: number, duration = 2000, inView: boolean) {
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!inView || hasRun.current) return;
    hasRun.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target, duration]);

  return count;
}

/* ------------------------------------------------------------------ */
/*  RevealText – word-by-word masked slide-up                         */
/* ------------------------------------------------------------------ */
function RevealText({ text, className = "", as: Tag = "h2" }: { text: string; className?: string; as?: "h1" | "h2" | "h3" | "span" }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const words = text.split(" ");
  const container = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  };
  const child = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: "0%",
      opacity: 1,
      transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] as const },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={container}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
      aria-label={text}
    >
      <Tag className={className}>
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden align-bottom">
            <motion.span variants={child} className="inline-block">
              {word}
            </motion.span>
            {i < words.length - 1 && <span>&nbsp;</span>}
          </span>
        ))}
      </Tag>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  BlurFadeIn – paragraph blur reveal                                */
/* ------------------------------------------------------------------ */
function BlurFadeIn({ children, delay = 0.3, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.p>
  );
}

/* ------------------------------------------------------------------ */
/*  Enhanced StatItem with blur + slide-up + scale                    */
/* ------------------------------------------------------------------ */
function StatItem({ value, suffix, label, index = 0 }: { value: number; suffix: string; label: string; index?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const count = useCountUp(value, 1800, inView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.95, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="flex flex-col items-center gap-1 px-4 py-6"
    >
      <span className="text-3xl font-bold text-foreground md:text-4xl">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Particle canvas                                                    */
/* ------------------------------------------------------------------ */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let isMobile = canvas.offsetWidth < 768;

    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = [];
    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    const initParticles = () => {
      const count = isMobile ? 20 : 60;
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w(),
          y: Math.random() * h(),
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 1.5 + 0.5,
          o: Math.random() * 0.4 + 0.1,
        });
      }
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
      const wasMobile = isMobile;
      isMobile = canvas.offsetWidth < 768;
      if (wasMobile !== isMobile) initParticles();
    };
    resize();
    initParticles();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, w(), h());
      const primary = getComputedStyle(canvas).getPropertyValue("--primary").trim();
      const hsl = `hsl(${primary})`;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w();
        if (p.x > w()) p.x = 0;
        if (p.y < 0) p.y = h();
        if (p.y > h()) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = hsl.replace(")", ` / ${p.o})`).replace("hsl(", "hsl(");
        ctx.fill();
      }

      if (!isMobile) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = hsl.replace(")", ` / ${0.06 * (1 - dist / 120)})`);
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity: 0.7 }}
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const stats = [
  { value: 1000, suffix: "+", label: "Agreements Created" },
  { value: 2, suffix: "M+", label: "STX Secured" },
  { value: 500, suffix: "+", label: "Active Users" },
  { value: 99, suffix: ".9%", label: "Uptime" },
];

const features = [
  {
    icon: Shield,
    title: "Smart Contract Escrow",
    desc: "Funds held trustlessly in on-chain escrow until all conditions are met by both parties.",
  },
  {
    icon: Zap,
    title: "On-Chain Invoicing",
    desc: "Create, send, and track invoices with immutable blockchain proof of every transaction.",
  },
  {
    icon: Globe,
    title: "Multi-Sig Support",
    desc: "Team-based approvals and enterprise-grade agreement workflows with multi-signature wallets.",
  },
];

const steps = [
  { icon: Wallet, title: "Connect Wallet", desc: "Link your Stacks wallet in one click", detail: "Works with Hiro, Xverse, and other Stacks-compatible wallets. No signups or KYC required.", color: "from-primary to-orange-400" },
  { icon: FileText, title: "Create Agreement", desc: "Set terms, parties, and escrow amount", detail: "Define milestones, deadlines, and payment conditions. Your counterparty reviews and accepts on-chain.", color: "from-secondary to-violet-400" },
  { icon: CheckCircle, title: "Get Paid", desc: "Funds released automatically on fulfillment", detail: "Smart contract verifies delivery and releases escrow instantly. No manual approvals, no delays.", color: "from-emerald-500 to-green-400" },
];

const testimonials = [
  {
    quote: "Pactum replaced the trust problem entirely. I get paid on delivery, every single time.",
    name: "Maya Chen",
    role: "Freelance Developer",
  },
  {
    quote: "On-chain invoicing gives our clients full transparency. Disputes dropped to nearly zero.",
    name: "Luca Moretti",
    role: "Design Agency Founder",
  },
  {
    quote: "Multi-sig approvals made it possible for our DAO to hire contractors without custodial risk.",
    name: "Aisha Okafor",
    role: "DAO Operations Lead",
  },
];


/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */
const sectionFadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const featureCardContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const featureCardItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const featureIconVariant = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 15, delay: 0.05 },
  },
};

const featureTextVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: 0.15, ease: "easeOut" as const },
  },
};

const stepContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.2, delayChildren: 0.15 },
  },
};

const stepItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const stepChildStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const stepChildItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

const stepSlideLeft = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const stepSlideRight = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const testimonialContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const testimonialItem = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

/* ------------------------------------------------------------------ */
/*  Hero with parallax + particles                                     */
/* ------------------------------------------------------------------ */
function HeroSection({ onConnect, isConnected }: { onConnect: () => void; isConnected?: boolean }) {
  const navigate = useNavigate();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Multi-layer parallax speeds
  const farY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);   // far back, drifts most
  const midY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);   // mid layer
  const nearY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);  // near, barely moves

  // Mouse-follow glow
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);
  const springConfig = { stiffness: 40, damping: 25, mass: 1 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  const glowLeft = useMotionTemplate`${springX}%`;
  const glowTop = useMotionTemplate`${springY}%`;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width) * 100);
    mouseY.set(((e.clientY - rect.top) / rect.height) * 100);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(50);
    mouseY.set(50);
  }, [mouseX, mouseY]);

  return (
    <section ref={ref} id="main-content" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-16" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <ParticleField />

      {/* Mouse-follow glow */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute z-[1] hidden md:block h-[400px] w-[400px] rounded-full bg-primary/[0.12] blur-[100px]"
        style={{ left: glowLeft, top: glowTop, x: "-50%", y: "-50%" }}
      />

      {/* Existing background layer */}
      <motion.div style={{ y: bgY }} className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--primary)/0.08)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]" />
      </motion.div>

      {/* Far layer – drifts fastest, feels deepest */}
      <motion.div style={{ y: farY }} className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
        <div className="absolute right-[10%] top-[15%] h-[340px] w-[340px] rounded-full bg-primary/[0.06] blur-[100px]" />
        <div className="absolute left-0 right-0 top-[60%] h-px bg-gradient-to-r from-transparent via-primary/[0.08] to-transparent" />
      </motion.div>

      {/* Mid layer – geometric rings */}
      <motion.div style={{ y: midY }} className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
        <div className="absolute left-[8%] top-[25%] h-24 w-24 rounded-full border border-primary/[0.08]" />
        <div className="absolute right-[15%] top-[45%] h-40 w-40 rounded-full border border-primary/[0.06]" />
        <div className="absolute left-[45%] top-[70%] h-16 w-16 rounded-full border border-primary/[0.1]" />
      </motion.div>

      {/* Near layer – small accents, barely moves */}
      <motion.div style={{ y: nearY }} className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
        <div className="absolute left-[20%] top-[35%] h-3 w-3 rounded-full bg-primary/[0.15]" />
        <div className="absolute right-[25%] top-[20%] h-2 w-2 rounded-full bg-primary/[0.12]" />
        <div className="absolute left-[70%] top-[65%] h-4 w-4 rounded-full bg-primary/[0.1]" />
      </motion.div>

      {/* Floating logos – distributed across depth layers */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute hidden md:block"
          style={{
            top: `${15 + i * 15}%`,
            left: `${10 + i * 18}%`,
            y: i % 2 === 0 ? farY : midY,
            opacity: 0.1,
          }}
          animate={{ y: [0, -20, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          <PactumLogo size={i % 2 === 0 ? 48 : 64} />
        </motion.div>
      ))}

      <motion.div
        style={{ y: contentY, opacity }}
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center"
        >
          <div className="mb-6 rounded-2xl animate-pulse-glow">
            <PactumLogo size={64} />
          </div>

          <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-6xl lg:text-7xl">
            Trustless Escrow &amp;{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Invoicing on Stacks
            </span>
          </h1>

          <p className="mb-8 max-w-xl text-lg text-muted-foreground md:text-xl">
            Secure your agreements with smart contracts. No middlemen, no borders — just trustless, on-chain settlement.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={isConnected ? () => navigate("/dashboard") : onConnect}
                size="lg"
                className="gradient-orange border-0 px-8 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
              >
                {isConnected ? "Go to Dashboard" : "Connect Your Wallet"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                size="lg"
                className="px-8"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              >
                Learn More
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function Landing() {
  const { isConnected, address, connect } = useWallet();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ref for the connecting line animation in How It Works
  const lineRef = useRef<HTMLDivElement>(null);
  const lineInView = useInView(lineRef, { once: true, margin: "-100px" });

  

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav
        aria-label="Main navigation"
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-3 transition-all duration-300 ${
          scrolled ? "border-b border-border bg-card/80 backdrop-blur-xl shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="flex items-center gap-2">
          <PactumLogo size={32} />
          <span className="text-lg font-bold tracking-tight">Pactum</span>
        </div>
        {/* Desktop nav */}
        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {isConnected ? (
            <Button
              onClick={() => navigate("/dashboard")}
              size="sm"
              variant="outline"
              className="gap-2 font-mono text-xs"
            >
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connected"}
              <ArrowRight className="h-3 w-3" />
            </Button>
          ) : (
            <Button
              onClick={() => connect()}
              size="sm"
              className="gradient-orange border-0 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow duration-300"
            >
              <Wallet className="mr-1.5 h-4 w-4" />
              Connect
            </Button>
          )}
        </div>
        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </nav>

      {/* ── Mobile menu panel ──────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-x-0 top-[52px] z-50 overflow-hidden border-b border-border bg-card/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-3 px-6 py-4">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                How It Works
              </a>
              <div className="flex items-center gap-2 px-3 py-1">
                <ThemeToggle />
              </div>
              {isConnected ? (
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/dashboard");
                  }}
                  variant="outline"
                  className="gap-2 font-mono text-xs"
                >
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connected"}
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    connect();
                  }}
                  className="gradient-orange border-0 text-white shadow-lg shadow-primary/25"
                >
                  <Wallet className="mr-1.5 h-4 w-4" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <HeroSection onConnect={() => connect()} isConnected={isConnected} />

      {/* ── Stats Bar ──────────────────────────────────────────── */}
      <motion.section className="border-y border-border bg-muted/30" variants={sectionFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        <div className="mx-auto grid max-w-5xl grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <StatItem key={s.label} {...s} index={i} />
          ))}
        </div>
      </motion.section>

      {/* ── Features ───────────────────────────────────────────── */}
      <motion.section id="features" className="mx-auto max-w-6xl px-4 py-24 md:py-32" variants={sectionFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        <div className="mb-16 text-center">
          <RevealText
            text="Everything you need"
            as="h2"
            className="mb-3 text-3xl font-bold md:text-4xl"
          />
          <BlurFadeIn delay={0.35} className="mx-auto max-w-lg text-muted-foreground">
            A complete suite of tools for trustless commerce on the Stacks blockchain.
          </BlurFadeIn>
        </div>

        <motion.div
          variants={featureCardContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              variants={featureCardItem}
              whileHover={{ y: -8, transition: { duration: 0.25 } }}
              whileTap={{ scale: 0.98 }}
              className="group relative rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-xl hover:shadow-primary/10 overflow-hidden cursor-pointer before:absolute before:inset-0 before:rounded-xl before:border before:border-primary/0 before:transition-all before:duration-500 group-hover:before:border-primary/25 group-hover:before:shadow-[0_0_20px_hsl(18,100%,50%,0.1)]"
            >
              {/* Hover background gradient overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
              <motion.div
                variants={featureIconVariant}
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl gradient-orange shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 group-hover:scale-110 group-hover:rotate-3 group-hover:ring-4 group-hover:ring-primary/15 transition-all duration-300"
              >
                <Icon className="h-7 w-7 text-white" />
              </motion.div>
              <motion.div variants={featureTextVariant}>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ── How It Works ───────────────────────────────────────── */}
      <motion.section id="how-it-works" className="border-t border-border bg-muted/20 px-4 py-24 md:py-32" variants={sectionFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <RevealText
              text="How it works"
              as="h2"
              className="mb-3 text-3xl font-bold md:text-4xl"
            />
            <BlurFadeIn delay={0.35} className="mx-auto max-w-lg text-muted-foreground">
              Get started in three simple steps — no paperwork, no intermediaries.
            </BlurFadeIn>
          </div>

          <motion.div
            variants={stepContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="relative flex flex-col gap-12 md:gap-16"
          >
            {/* Animated vertical spine */}
            <motion.div
              ref={lineRef}
              initial={{ scaleY: 0 }}
              animate={lineInView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
              className="pointer-events-none absolute top-0 bottom-0 left-6 w-px origin-top bg-border md:left-1/2 md:-translate-x-px"
              aria-hidden="true"
            />

            {steps.map(({ icon: Icon, title, desc, detail, color }, i) => {
              const isLeft = i % 2 === 0; // odd steps (0,2) content on left (desktop)
              return (
                <motion.div
                  key={title}
                  variants={stepItem}
                  className="relative flex items-start gap-6 md:gap-0"
                >
                  {/* Desktop left column */}
                  <div className={`hidden md:flex md:w-[calc(50%-2rem)] ${isLeft ? "justify-end" : ""}`}>
                    {isLeft && (
                      <motion.div
                        variants={stepSlideRight}
                        className="group w-full max-w-sm rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
                      >
                        <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-primary">Step {i + 1}</span>
                        <h3 className="mb-1 text-lg font-semibold">{title}</h3>
                        <p className="mb-2 text-sm text-muted-foreground">{desc}</p>
                        <p className="text-sm text-muted-foreground/70">{detail}</p>
                      </motion.div>
                    )}
                  </div>

                  {/* Center node – icon circle */}
                  <div className="relative z-10 flex flex-shrink-0 items-center justify-center md:w-16">
                    {/* Connecting dot */}
                    <div className="absolute left-[22px] top-[26px] h-3 w-3 rounded-full bg-primary md:left-1/2 md:-translate-x-1/2" aria-hidden="true" />
                    <div className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${color} shadow-lg md:h-16 md:w-16`}>
                      <Icon className="h-6 w-6 text-white md:h-7 md:w-7" />
                      {/* Step number badge */}
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-card text-[10px] font-bold text-primary shadow ring-1 ring-border">
                        {i + 1}
                      </span>
                      {/* Pulse ring */}
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0.6 }}
                        whileInView={{ scale: 1.4, opacity: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.2, ease: "easeOut" }}
                        className="absolute inset-0 rounded-full border-2 border-primary/30"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* Desktop right column */}
                  <div className={`hidden md:flex md:w-[calc(50%-2rem)] ${!isLeft ? "justify-start" : ""}`}>
                    {!isLeft && (
                      <motion.div
                        variants={stepSlideLeft}
                        className="group w-full max-w-sm rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
                      >
                        <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-primary">Step {i + 1}</span>
                        <h3 className="mb-1 text-lg font-semibold">{title}</h3>
                        <p className="mb-2 text-sm text-muted-foreground">{desc}</p>
                        <p className="text-sm text-muted-foreground/70">{detail}</p>
                      </motion.div>
                    )}
                  </div>

                  {/* Mobile content card (always right of spine) */}
                  <motion.div
                    variants={stepSlideLeft}
                    className="flex-1 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md md:hidden"
                  >
                    <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-primary">Step {i + 1}</span>
                    <h3 className="mb-1 text-lg font-semibold">{title}</h3>
                    <p className="mb-2 text-sm text-muted-foreground">{desc}</p>
                    <p className="text-sm text-muted-foreground/70">{detail}</p>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* ── Social Proof ───────────────────────────────────────── */}
      <motion.section
        className="border-t border-border px-4 py-24 md:py-32"
        variants={sectionFadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 text-center">
            <RevealText text="Trusted by builders" as="h2" className="text-3xl font-bold md:text-4xl" />
          </div>
          <BlurFadeIn delay={0.3} className="mx-auto mb-16 max-w-2xl text-center text-lg text-muted-foreground">
            From solo freelancers to DAOs, teams trust Pactum to handle what matters most — their money.
          </BlurFadeIn>

          {/* Testimonial cards */}
          <motion.div
            className="mb-20 grid gap-6 md:grid-cols-3"
            variants={testimonialContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                variants={testimonialItem}
                className="group relative rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-primary/5"
              >
                <Quote className="mb-4 h-6 w-6 text-primary/30" />
                <p className="mb-6 text-sm leading-relaxed text-foreground/90">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </motion.section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <motion.section className="px-4 py-24 md:py-32" variants={sectionFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative mx-auto max-w-3xl rounded-2xl bg-gradient-to-r from-primary via-secondary to-primary p-[2px] animate-gradient-shift before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-primary before:via-secondary before:to-primary before:blur-xl before:opacity-30 before:-z-10 before:animate-gradient-shift"
        >
          <div className="rounded-2xl bg-card p-10 text-center md:p-16">
            <RevealText
              text="Ready to secure your next deal?"
              as="h2"
              className="mb-3 text-3xl font-bold md:text-4xl"
            />
            <BlurFadeIn delay={0.4} className="mb-8 text-muted-foreground">
              Join hundreds of users already transacting trustlessly on Stacks.
            </BlurFadeIn>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={() => connect()}
                  size="lg"
                  className="gradient-orange border-0 px-10 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow duration-300"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
              <a
                href="#"
                className="inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                View Documentation <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <motion.footer className="border-t border-border px-4 py-8" variants={sectionFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <span>Built on Stacks · © {new Date().getFullYear()} Pactum</span>
          <div className="flex gap-6">
            <motion.a href="https://docs.pactum.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}><BookOpen size={16} />Docs</motion.a>
            <motion.a href="https://github.com/pactum" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}><Github size={16} />GitHub</motion.a>
            <motion.a href="https://x.com/pactum" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}><Twitter size={16} />Twitter</motion.a>
          </div>
        </div>
      </motion.footer>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow"
            aria-label="Scroll to top"
          >
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
