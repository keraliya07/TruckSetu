import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardPath } from '../utils/roleRoutes';

/* ─── Scroll-reveal hook ─── */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    root.querySelectorAll('.reveal').forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

/* ─── Static data ─── */
const FEATURES = [
  {
    emoji: '🧠',
    title: 'ML Truck Optimization',
    desc: 'AI ranks best-fit trucks by cost, CO₂ emissions, capacity utilization, and proximity — so every shipment moves smarter.',
    accent: 'from-teal-500 to-emerald-500',
    bg: 'bg-teal-50',
  },
  {
    emoji: '📍',
    title: 'Real-Time GPS Tracking',
    desc: 'Live map tracking via Socket.IO with checkpoint updates, giving warehouses full visibility from pickup to delivery.',
    accent: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
  },
  {
    emoji: '🔄',
    title: 'Return Load Matching',
    desc: 'Automatically finds nearby return shipments for trucks headed back empty — eliminating dead miles and cutting costs.',
    accent: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
  },
  {
    emoji: '🌱',
    title: 'CO₂ Emission Reports',
    desc: 'Per-trip carbon footprint calculation with downloadable PDF reports, helping you track and reduce your environmental impact.',
    accent: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50',
  },
];

const STEPS = [
  { num: '01', emoji: '📦', title: 'Create Shipment', desc: 'Warehouse defines origin, destination, weight, volume, and delivery deadline.' },
  { num: '02', emoji: '🤖', title: 'ML Matches Trucks', desc: 'The platform ranks available trucks using ML optimization for the best fit.' },
  { num: '03', emoji: '🚛', title: 'Track & Deliver', desc: 'Real-time GPS tracking with live updates until the shipment is delivered.' },
];

const ROLES = [
  {
    emoji: '🏭',
    title: 'Warehouse Manager',
    desc: 'Create shipments, run ML truck optimization, book trucks, and track deliveries live on the map.',
    color: 'border-teal-400',
    gradient: 'from-teal-500 to-teal-700',
    items: ['Create & manage shipments', 'Run ML optimization', 'Book & track live', 'View shipment history'],
  },
  {
    emoji: '🚛',
    title: 'Truck Dealer',
    desc: 'Manage your fleet availability, accept or counter bookings, and run trip operations with return-load suggestions.',
    color: 'border-amber-400',
    gradient: 'from-amber-500 to-orange-600',
    items: ['Manage truck fleet', 'Accept/counter bookings', 'Manage active trips', 'Get return-load matches'],
  },
  {
    emoji: '🛡️',
    title: 'Platform Admin',
    desc: 'Full platform oversight with user management, analyst accounts, trip invoices, and system-wide analytics.',
    color: 'border-indigo-400',
    gradient: 'from-indigo-500 to-indigo-700',
    items: ['User management', 'System analytics', 'Manage analysts', 'Invoice oversight'],
  },
];

const TRUST = ['ML-Powered', 'Real-Time GPS', 'CO₂ Reports', 'Secure Auth'];

/* ─── Check icon SVG (reused) ─── */
function CheckIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   HomePage Component
   ═══════════════════════════════════════════ */
export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const pageRef = useScrollReveal();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Redirect authenticated users to their dashboard
  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return (
    <div ref={pageRef} className="min-h-screen bg-[#f8fafc]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ────────────────── Navbar ────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border-b border-slate-200/60'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 font-heading text-xl font-extrabold text-slate-900">
            <span className="text-2xl">🚛</span>
            Truck<span className="text-freight-600">Setu</span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {['Features', 'How It Works', 'Roles'].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-[0.84rem] font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 rounded-full hover:bg-slate-100/60">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary !text-sm !py-2.5 !px-5">
              Get Started Free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 text-slate-700" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200/60 px-6 pb-5 pt-2 space-y-2 animate-slide-down">
            {['Features', 'How It Works', 'Roles'].map((label) => (
              <a
                key={label}
                href={`#${label.toLowerCase().replace(/\s+/g, '-')}`}
                className="block py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </a>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/login" className="btn-secondary text-center !text-sm" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn-primary text-center !text-sm" onClick={() => setMobileOpen(false)}>Get Started Free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ────────────────── Hero Section ────────────────── */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Animated background */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -top-40 -left-40 w-[550px] h-[550px] rounded-full opacity-[0.18] blur-3xl animate-float"
            style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.5), transparent 70%)' }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full opacity-[0.14] blur-3xl animate-float"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.45), transparent 70%)', animationDelay: '1.5s' }}
          />
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-[0.06] blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.5), transparent 60%)' }}
          />
          {/* Subtle dot grid */}
          <div className="absolute inset-0 bg-dashboard-grid opacity-40" style={{ backgroundSize: '48px 48px' }} />
        </div>

        <div className="relative max-w-3xl mx-auto px-5 sm:px-8 text-center">
          {/* Badge */}
          <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-slate-200/60 text-xs font-semibold tracking-wide text-slate-500 mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-glow-pulse" />
            SMART LOGISTICS PLATFORM
          </div>

          {/* Main heading */}
          <h1 className="reveal font-heading text-[2.75rem] sm:text-6xl lg:text-[4.25rem] font-extrabold leading-[1.08] tracking-tight mb-6">
            <span className="text-slate-900">Move Freight{' '}</span>
            <span className="bg-gradient-to-r from-freight-600 via-teal-500 to-accent-500 bg-clip-text text-transparent">
              Smarter
            </span>
            <span className="text-slate-900">,</span>
            <br className="hidden sm:block" />
            <span className="text-slate-900"> Not Harder.</span>
          </h1>

          {/* Subtitle */}
          <p className="reveal reveal-delay-1 text-base sm:text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed">
            TruckSetu connects warehouses and truck dealers on one intelligent platform — with ML-powered optimization, real-time tracking, and zero empty runs.
          </p>

          {/* CTA buttons */}
          <div className="reveal reveal-delay-2 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14">
            <Link
              to="/register"
              className="btn-primary w-full sm:w-auto text-base !px-8 !py-3.5 group"
            >
              Get Started Free
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              to="/login"
              className="btn-secondary w-full sm:w-auto text-base !px-8 !py-3.5"
            >
              Sign In to Dashboard
            </Link>
          </div>

          {/* Trust badges */}
          <div className="reveal reveal-delay-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[0.8rem] text-slate-400 font-medium">
            {TRUST.map((label) => (
              <span key={label} className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-freight-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── Features Section ────────────────── */}
      <section id="features" className="relative py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="reveal text-xs font-bold tracking-[0.25em] text-freight-600 uppercase mb-3">Core Capabilities</p>
            <h2 className="reveal font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Everything You Need to Move Freight
            </h2>
            <p className="reveal reveal-delay-1 text-slate-500 max-w-lg mx-auto">
              A complete suite of intelligent tools, from AI optimization to carbon tracking.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`reveal ${i > 0 ? `reveal-delay-${i}` : ''} group panel-hover p-6 sm:p-8 cursor-default`}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${f.bg} text-xl mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {f.emoji}
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── How It Works ────────────────── */}
      <section id="how-it-works" className="relative py-20 sm:py-28 overflow-hidden">
        {/* Subtle background tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 to-transparent pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="reveal text-xs font-bold tracking-[0.25em] text-accent-500 uppercase mb-3">Simple Workflow</p>
            <h2 className="reveal font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              From Shipment to Delivery
            </h2>
            <p className="reveal reveal-delay-1 text-slate-500 max-w-md mx-auto">
              Three simple steps — from creating a shipment to real-time delivery tracking.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-[3.5rem] left-[16%] right-[16%] h-[2px] bg-gradient-to-r from-freight-200 via-slate-200 to-accent-200 z-0" />

            {STEPS.map((s, i) => (
              <div key={s.num} className={`reveal ${i > 0 ? `reveal-delay-${i}` : ''} relative z-10 text-center`}>
                {/* Step circle */}
                <div className="mx-auto w-[4.5rem] h-[4.5rem] rounded-full bg-white border-2 border-slate-200 shadow-card flex items-center justify-center mb-6 group-hover:border-freight-400 transition-colors">
                  <span className="text-2xl">{s.emoji}</span>
                </div>
                {/* Step number */}
                <p className="text-xs font-bold tracking-widest text-freight-500 mb-2">{s.num}</p>
                <h3 className="font-heading text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── Roles Section ────────────────── */}
      <section id="roles" className="relative py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="reveal text-xs font-bold tracking-[0.25em] text-amber-500 uppercase mb-3">Built For Everyone</p>
            <h2 className="reveal font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              One Platform, Every Role
            </h2>
            <p className="reveal reveal-delay-1 text-slate-500 max-w-lg mx-auto">
              Dedicated workspaces tailored exactly for what you need to do.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {ROLES.map((r, i) => (
              <div
                key={r.title}
                className={`reveal ${i > 0 ? `reveal-delay-${i}` : ''} panel-hover p-6 sm:p-8 border-t-[3px] ${r.color}`}
              >
                <span className="text-3xl block mb-4">{r.emoji}</span>
                <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">{r.title}</h3>
                <p className="text-sm text-slate-500 mb-5 leading-relaxed">{r.desc}</p>
                <ul className="space-y-2.5">
                  {r.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${r.gradient} flex items-center justify-center`}>
                        <CheckIcon className="w-3 h-3 text-white" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────── CTA Section ────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">
          <div
            className="reveal relative rounded-[2rem] overflow-hidden px-8 py-16 sm:px-16 sm:py-20 text-center"
            style={{
              background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 40%, #4f46e5 100%)',
            }}
          >
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/[0.06]" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/[0.04]" />

            <h2 className="relative font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Ready to Optimize Your Freight?
            </h2>
            <p className="relative text-white/80 text-base sm:text-lg max-w-md mx-auto mb-8 leading-relaxed">
              Join warehouses and dealers already using TruckSetu to cut costs, reduce emissions, and eliminate empty runs.
            </p>
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center w-full sm:w-auto rounded-full bg-white text-freight-700 px-7 py-3.5 text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full sm:w-auto rounded-full border-2 border-white/40 text-white px-7 py-3.5 text-sm font-semibold hover:bg-white/10 hover:border-white/60 transition-all duration-200"
              >
                Sign In Instead
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── Footer ────────────────── */}
      <footer className="bg-white border-t border-slate-200/80 relative">
        {/* Back to top */}
        <div className="flex justify-center -mt-6 relative z-10">
          <a
            href="#"
            className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-freight-600 hover:border-freight-500 hover:-translate-y-1 shadow-md hover:shadow-lg transition-all duration-300"
            aria-label="Back to top"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </a>
        </div>

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-8">
          {/* 3-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">

            {/* Column 1 — Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 font-heading text-xl font-extrabold text-slate-900 mb-3">
                <span className="text-2xl">🚛</span>
                Truck<span className="text-freight-600">Setu</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-xs mb-5">
                An intelligent logistics platform connecting warehouses and truck dealers — powered by ML optimization, real-time tracking, and smart route planning.
              </p>
            </div>

            {/* Column 2 — Product */}
            <div>
              <p className="font-heading text-xs font-bold tracking-[0.2em] text-slate-900 uppercase mb-4">Product</p>
              <ul className="space-y-2.5">
                {[
                  { label: 'Features', href: '#features' },
                  { label: 'How It Works', href: '#how-it-works' },
                  { label: 'User Roles', href: '#roles' },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-slate-500 hover:text-freight-600 transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <Link to="/login" className="text-sm text-slate-500 hover:text-freight-600 transition-colors duration-200">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-sm text-slate-500 hover:text-freight-600 transition-colors duration-200">
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 — Resources */}
            <div>
              <p className="font-heading text-xs font-bold tracking-[0.2em] text-slate-900 uppercase mb-4">Resources</p>
              <ul className="space-y-2.5">
                <li>
                  <a href="https://github.com/keraliya07/TruckSetu" target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-freight-600 transition-colors duration-200">
                    GitHub Repository
                  </a>
                </li>
                <li>
                  <a href="https://github.com/keraliya07/TruckSetu#readme" target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-freight-600 transition-colors duration-200">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="https://github.com/keraliya07/TruckSetu/issues" target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-freight-600 transition-colors duration-200">
                    Report Issues
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} TruckSetu. Built for educational &amp; demo purposes.</p>
            <p className="flex items-center gap-1">
              Designed with
              <span className="text-red-400 mx-0.5">❤️</span>
              for modern logistics
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
