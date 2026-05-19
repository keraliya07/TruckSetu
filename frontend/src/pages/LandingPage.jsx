import React, { useEffect, useState, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardPath } from '../utils/roleRoutes';
import './LandingPage.css';

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Protect route if user is logged in
  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  useEffect(() => {
    const handleScroll = () => {
      // Navbar blur
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Scroll Progress
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollProgress(scrolled);

      // Active Section logic
      const sections = ['features', 'roles', 'how-it-works', 'tech-stack'];
      let current = '';
      sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
          const sectionTop = section.offsetTop;
          if (window.pageYOffset >= sectionTop - 200) {
            current = sectionId;
          }
        }
      });
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Fade Up Animations
    const fadeElements = document.querySelectorAll('.fade-up');
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    fadeElements.forEach(el => fadeObserver.observe(el));

    // Counter Animations
    const counters = document.querySelectorAll('.stat-number');
    let hasAnimated = false;
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const duration = 2000;
            const increment = target / (duration / 16);
            
            let current = 0;
            const updateCounter = () => {
              current += increment;
              if (current < target) {
                counter.innerText = Math.ceil(current) + (target === 100 ? '%' : target === 7 ? '+' : '');
                requestAnimationFrame(updateCounter);
              } else {
                counter.innerText = target + (target === 100 ? '%' : target === 7 ? '+' : '');
              }
            };
            updateCounter();
          });
        }
      });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats');
    if(statsSection) {
      counterObserver.observe(statsSection);
    }

    return () => {
      fadeObserver.disconnect();
      counterObserver.disconnect();
    };
  }, []);

  const handleMouseMove = (e, cardRef) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const featureCards = [
    { icon: '🤖', title: 'ML Truck Optimization', desc: 'Ranks best-fit trucks by cost, utilization, CO₂, and proximity using machine learning.' },
    { icon: '📍', title: 'Real-Time Tracking', desc: 'Live GPS tracking on interactive Leaflet maps with Socket.IO updates.', delay: 'delay-1' },
    { icon: '🔄', title: 'Return Load Matching', desc: 'Automatically finds nearby return shipments to eliminate empty truck runs.', delay: 'delay-2' },
    { icon: '📈', title: 'Demand Forecasting', desc: 'Predicts future shipment volumes using Prophet time-series models.' },
    { icon: '💰', title: 'Dynamic Pricing', desc: 'ML-based cost estimation for every shipment based on market factors.', delay: 'delay-1' },
    { icon: '🌍', title: 'CO₂ Emission Reports', desc: 'Per-trip carbon footprint calculation with downloadable PDF reports.', delay: 'delay-2' },
    { icon: '📄', title: 'Invoice Generation', desc: 'Auto-generated trip invoices stored securely in MinIO object storage.' },
    { icon: '🔒', title: 'Secure Auth System', desc: 'JWT with refresh token rotation, email verification, and multi-session control.', delay: 'delay-1' },
    { icon: '📊', title: 'Analytics Dashboards', desc: 'Role-specific insights for Admins, Warehouses, Analysts and Dealers.', delay: 'delay-2' },
  ];

  return (
    <div className="landing-page">
      {/* Scroll Progress */}
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }}></div>

      {/* Navbar */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <a href="#" className="logo">
            🚛 Truck<span>Setu</span>
          </a>
          
          <ul className={`nav-links ${isMobileMenuOpen ? 'nav-menu-active' : ''}`}>
            <li><a href="#features" className={`nav-link ${activeSection === 'features' ? 'active' : ''}`}>Features</a></li>
            <li><a href="#roles" className={`nav-link ${activeSection === 'roles' ? 'active' : ''}`}>Roles</a></li>
            <li><a href="#how-it-works" className={`nav-link ${activeSection === 'how-it-works' ? 'active' : ''}`}>How It Works</a></li>
            <li><a href="#tech-stack" className={`nav-link ${activeSection === 'tech-stack' ? 'active' : ''}`}>Tech Stack</a></li>
          </ul>

          <div className={`nav-actions ${isMobileMenuOpen ? 'nav-menu-active' : ''}`} style={isMobileMenuOpen ? { top: '280px' } : {}}>
            <Link to="/login" className="btn-custom btn-outline-custom">Login</Link>
            <Link to="/register" className="btn-custom btn-primary-custom">Get Started Free</Link>
          </div>

          <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            ☰
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero" id="home">
        <div className="container hero-content fade-up">
          <div className="hero-badge">
            🎉 v1.0 Live | <a href="https://github.com/keraliya07/TruckSetu" target="_blank" rel="noreferrer">View on GitHub</a>
          </div>
          
          <h1 className="hero-title">Smart Logistics.<br/>Smarter Routes.<br/>Zero Empty Runs.</h1>
          
          <p className="hero-subtitle">
            TruckSetu connects Warehouses and Truck Dealers on one intelligent platform — with ML-powered truck optimization, real-time tracking, and automated trip management.
          </p>

          <div className="hero-cta">
            <Link to="/register" className="btn-custom btn-primary-custom">Start as Warehouse</Link>
            <Link to="/register" className="btn-custom btn-outline-custom">Start as Dealer</Link>
          </div>

          <div className="hero-diagram fade-up delay-2">
            <div className="diagram-node">
              <div className="diagram-icon">🏭</div>
              <div className="diagram-label">Warehouse</div>
            </div>
            <div className="diagram-path"></div>
            <div className="diagram-node platform">
              <div className="diagram-icon">🚛</div>
              <div className="diagram-label" style={{ color: 'var(--orange)' }}>TruckSetu ML</div>
            </div>
            <div className="diagram-path"></div>
            <div className="diagram-node">
              <div className="diagram-icon">🚚</div>
              <div className="diagram-label">Truck Dealer</div>
            </div>
          </div>

          <div className="trust-badges fade-up delay-3">
            {['ML-Powered Optimization', 'Real-Time Tracking', 'CO₂ Reports', 'Secure JWT Auth'].map(badge => (
              <div className="trust-badge" key={badge}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {badge}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="stats fade-up">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">🚛</div>
              <div className="stat-number" data-target="4">0</div>
              <div className="stat-label">User Roles Built-in</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">⚡</div>
              <div className="stat-number" data-target="7">0</div>
              <div className="stat-label">ML Endpoints</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📦</div>
              <div className="stat-number" data-target="100">0</div>
              <div className="stat-label">% Lifecycle Tracking</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🔋</div>
              <div className="stat-number" data-target="24">0</div>
              <div className="stat-label">Socket.IO Updates/sec</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <h2 className="section-title fade-up">Everything You Need to Move Freight</h2>
          <p className="section-subtitle fade-up">A complete suite of tools integrated directly into your workflow.</p>

          <div className="features-grid">
            {featureCards.map((feat, i) => {
              const cardRef = useRef(null);
              return (
                <div 
                  key={i} 
                  ref={cardRef}
                  className={`feature-card fade-up ${feat.delay || ''}`}
                  onMouseMove={(e) => handleMouseMove(e, cardRef)}
                >
                  <div className="feature-icon">{feat.icon}</div>
                  <h3 className="feature-title">{feat.title}</h3>
                  <p className="feature-desc">{feat.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles" id="roles">
        <div className="container">
          <h2 className="section-title fade-up">Built for Every Player in Logistics</h2>
          <p className="section-subtitle fade-up">Dedicated workspaces tailored exactly for what you need to do.</p>

          <div className="roles-grid">
            <div className="role-card fade-up" style={{ '--accent': 'var(--role-blue)' }}>
              <div className="role-icon">🏭</div>
              <h3 className="role-title">Warehouse Manager</h3>
              <ul className="role-list">
                <li>Create & manage shipments</li>
                <li>Run ML truck optimization</li>
                <li>Book trucks & track live</li>
                <li>View full shipment history</li>
              </ul>
            </div>

            <div className="role-card fade-up delay-1" style={{ '--accent': 'var(--role-orange)' }}>
              <div className="role-icon">🚛</div>
              <h3 className="role-title">Truck Dealer</h3>
              <ul className="role-list">
                <li>Manage your truck fleet</li>
                <li>Accept/counter bookings</li>
                <li>Manage active trips & stops</li>
                <li>Get return-load suggestions</li>
              </ul>
            </div>

            <div className="role-card fade-up delay-2" style={{ '--accent': 'var(--role-purple)' }}>
              <div className="role-icon">🛡️</div>
              <h3 className="role-title">Admin</h3>
              <ul className="role-list">
                <li>Platform user management</li>
                <li>Account suspension control</li>
                <li>Manage analyst users</li>
                <li>System-wide analytics</li>
              </ul>
            </div>

            <div className="role-card fade-up delay-3" style={{ '--accent': 'var(--role-teal)' }}>
              <div className="role-icon">📈</div>
              <h3 className="role-title">Analyst</h3>
              <ul className="role-list">
                <li>View platform metrics</li>
                <li>Analyze ML accuracy</li>
                <li>Export aggregate reports</li>
                <li>Monitor system health</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <h2 className="section-title fade-up">From Shipment to Delivery</h2>
          <p className="section-subtitle fade-up">A seamless 4-step workflow connecting demand with supply.</p>

          <div className="steps-container fade-up delay-1">
            {[
              { num: 1, icon: '📦', title: 'Create Shipment', desc: 'Warehouse adds origin, destination, weight, volume & deadline.' },
              { num: 2, icon: '🤖', title: 'ML Optimization Runs', desc: 'System ranks best available trucks by cost, CO₂, and fit.' },
              { num: 3, icon: '🤝', title: 'Dealer Accepts', desc: 'Dealer reviews and accepts (or counters) the booking request.' },
              { num: 4, icon: '📍', title: 'Track Live', desc: 'Real-time GPS tracking with continuous updates until delivery.' }
            ].map(step => (
              <div className="step-item" key={step.num}>
                <div className="step-number">{step.num}</div>
                <div className="step-icon">{step.icon}</div>
                <h4 className="step-title">{step.title}</h4>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="tech-stack" id="tech-stack">
        <div className="container">
          <h2 className="section-title fade-up">Powered by Modern Technology</h2>
          <p className="section-subtitle fade-up">A robust microservices architecture built for scale and performance.</p>

          <div className="tech-categories fade-up delay-1">
            {[
              { title: 'Frontend & UI', items: ['React 18', 'Vite', 'Tailwind CSS', 'Zustand', 'Leaflet Maps', 'Recharts'] },
              { title: 'Backend API', items: ['Node.js', 'Express', 'Prisma ORM', 'Socket.IO', 'Zod', 'JWT'] },
              { title: 'ML Microservice', items: ['Python', 'FastAPI', 'scikit-learn', 'Prophet', 'OR-Tools', 'Pandas'] },
              { title: 'Infrastructure & Data', items: ['PostgreSQL 15', 'Redis 7', 'MinIO', 'Docker', 'OSRM Routing'] }
            ].map(category => (
              <div className="tech-category" key={category.title}>
                <div className="tech-category-title">{category.title}</div>
                <div className="tech-badges">
                  {category.items.map(item => <span className="tech-badge" key={item}>{item}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="architecture" id="architecture">
        <div className="container">
          <h2 className="section-title fade-up">One Platform, Three Microservices</h2>
          <p className="section-subtitle fade-up">Clean separation of concerns with real-time data flow.</p>

          <div className="arch-diagram fade-up delay-1">
            {/* Layer 1 */}
            <div className="arch-row connected">
              <div className="arch-box">
                <div className="arch-box-title">React Frontend</div>
                <div className="arch-box-port">Port: 3000</div>
              </div>
            </div>

            {/* Layer 2 */}
            <div className="arch-row connected" style={{ justifyContent: 'space-around' }}>
              <div className="arch-box core">
                <div className="arch-box-title">Express Backend</div>
                <div className="arch-box-port">Port: 4000</div>
              </div>
              <div className="arch-box">
                <div className="arch-box-title">Socket.IO</div>
                <div className="arch-box-port">Real-time</div>
              </div>
            </div>

            {/* Layer 3 */}
            <div className="arch-row connected">
              <div className="arch-box">
                <div className="arch-box-title">PostgreSQL</div>
                <div className="arch-box-port">Database</div>
              </div>
              <div className="arch-box">
                <div className="arch-box-title">Redis</div>
                <div className="arch-box-port">Cache / Pub-Sub</div>
              </div>
            </div>

            {/* Layer 4 */}
            <div className="arch-row" style={{ justifyContent: 'space-between' }}>
              <div className="arch-box core">
                <div className="arch-box-title">FastAPI ML Service</div>
                <div className="arch-box-port">Port: 8000</div>
              </div>
              <div className="arch-box">
                <div className="arch-box-title">OSRM Engine</div>
                <div className="arch-box-port">Routing</div>
              </div>
              <div className="arch-box">
                <div className="arch-box-title">MinIO</div>
                <div className="arch-box-port">Storage</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta fade-up">
        <div className="container">
          <h2 className="section-title">Ready to Optimize Your Freight?</h2>
          <p className="section-subtitle">Join Warehouses and Dealers already using TruckSetu to cut costs, reduce emissions, and eliminate empty runs.</p>
          
          <div className="cta-buttons">
            <Link to="/register" className="btn-custom btn-white">Register as Warehouse</Link>
            <Link to="/register" className="btn-custom btn-outline-white">Register as Dealer</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <a href="#" className="logo">
                🚛 Truck<span>Setu</span>
              </a>
              <p className="footer-tagline">Smart Logistics for India's Roads</p>
            </div>
            
            <div className="footer-links">
              <a href="#features" className="footer-link">Features</a>
              <a href="#roles" className="footer-link">Roles</a>
              <a href="#how-it-works" className="footer-link">How It Works</a>
              <a href="#tech-stack" className="footer-link">Tech Stack</a>
              <a href="https://github.com/keraliya07/TruckSetu" target="_blank" rel="noreferrer" className="footer-link">GitHub</a>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2026 TruckSetu. Built for educational & demo purposes.</p>
            <p>Designed with ❤️ for modern logistics.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
