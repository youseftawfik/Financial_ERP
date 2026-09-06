import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import M1 from "../assets/hero_bg.png"
import M2 from "../assets/feature_1.png"
import Logo from "../../public/Flugur_Logo_v2.png"
import Style from './Landing.module.css'

const FlugurLanding = () => {
  const canvasRef = useRef(null);
  const sparkChartRef = useRef(null);
  const typedTextRef = useRef(null);
  const heroSceneRef = useRef(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Particle Canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const handleResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const PARTICLE_COUNT = 90;
    const particles = [];
    const colors = ['96,165,250', '37,99,235', '56,189,248', '14,165,233', '125,211,252'];

    class Particle {
      constructor() {
        this.reset(true);
      }
      reset(init = false) {
        this.x = Math.random() * W;
        this.y = init ? Math.random() * H : H + 10;
        this.size = Math.random() * 1.8 + 0.3;
        this.speedY = -(Math.random() * 0.5 + 0.2);
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.15;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.life = 0;
        this.maxLife = Math.random() * 300 + 200;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life++;
        if (this.y < -10 || this.life > this.maxLife) this.reset();
      }
      draw() {
        const alpha = this.opacity * Math.sin((this.life / this.maxLife) * Math.PI);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color},${alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.08;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(37,99,235,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    let animId;
    function loop() {
      ctx.clearRect(0, 0, W, H);
      drawConnections();
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animId = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // 2. Navbar scroll
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 3. Scroll reveal
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revealed');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // 4. Hero parallax
  useEffect(() => {
    const scene = heroSceneRef.current;
    if (!scene) return;
    const img = scene.querySelector('.hero-img-main');
    const badges = scene.querySelectorAll('.float-badge');
    if (!img) return;

    const onMove = (e) => {
      const rect = scene.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      img.style.transform = `rotateY(${nx * 14}deg) rotateX(${-ny * 14}deg) scale(1.02)`;
      badges.forEach((badge, i) => {
        const depth = [0.5, 0.7, 0.6, 0.9][i] || 0.6;
        badge.style.transform = `translate(${nx * depth * 22}px, ${ny * depth * 12}px)`;
      });
    };
    const onLeave = () => {
      img.style.transform = '';
      img.style.transition = 'transform 0.8s ease';
      badges.forEach((b) => {
        b.style.transform = '';
        b.style.transition = 'transform 0.8s ease';
      });
    };
    const onEnter = () => {
      img.style.transition = 'none';
      badges.forEach((b) => (b.style.transition = 'none'));
    };

    scene.addEventListener('mousemove', onMove);
    scene.addEventListener('mouseleave', onLeave);
    scene.addEventListener('mouseenter', onEnter);
    return () => {
      scene.removeEventListener('mousemove', onMove);
      scene.removeEventListener('mouseleave', onLeave);
      scene.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  // 5. Card tilts
  useEffect(() => {
    const wraps = document.querySelectorAll('.tilt-wrap');
    const cleanups = [];
    wraps.forEach((wrap) => {
      const inner = wrap.querySelector('.tilt-inner');
      if (!inner) return;
      const onMove = (e) => {
        const rect = wrap.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        inner.style.transform = `rotateX(${-y * 14}deg) rotateY(${x * 14}deg) translateZ(15px)`;
        inner.style.transition = 'none';
      };
      const onLeave = () => {
        inner.style.transform = 'rotateX(0) rotateY(0) translateZ(0)';
        inner.style.transition = 'transform 0.55s ease';
      };
      wrap.addEventListener('mousemove', onMove);
      wrap.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        wrap.removeEventListener('mousemove', onMove);
        wrap.removeEventListener('mouseleave', onLeave);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, []);

  // 6. Animated counters
  useEffect(() => {
    const counters = document.querySelectorAll('[data-counter]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseFloat(el.dataset.counter);
          const suffix = el.dataset.suffix || '';
          const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
          const duration = 1800;
          const start = performance.now();
          function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            const current = target * ease;
            el.textContent = current.toFixed(decimals) + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          io.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  // 7. Mini sparkline chart
  useEffect(() => {
    const canvas = sparkChartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = 80;
    canvas.style.height = '40px';

    const data = [22, 38, 30, 52, 45, 68, 60, 80, 74, 90, 85, 100];
    const step = canvas.width / (data.length - 1);
    let progress = 0;
    let animId;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const maxD = progress | 0;

      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, 'rgba(37,99,235,0.3)');
      grad.addColorStop(1, 'rgba(37,99,235,0)');

      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      data.slice(0, maxD + 1).forEach((val, i) => {
        const x = i * step;
        const y = canvas.height - (val / 100) * (canvas.height - 10) - 5;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.lineTo(maxD * step, canvas.height);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = 'rgba(37,99,235,0.6)';
      ctx.shadowBlur = 8;
      data.slice(0, maxD + 1).forEach((val, i) => {
        const x = i * step;
        const y = canvas.height - (val / 100) * (canvas.height - 10) - 5;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      if (maxD >= 1) {
        const lx = maxD * step;
        const ly = canvas.height - (data[maxD] / 100) * (canvas.height - 10) - 5;
        ctx.beginPath();
        ctx.arc(lx, ly, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = 10;
        ctx.fill();
      }

      if (progress < data.length - 1) {
        progress += 0.25;
        animId = requestAnimationFrame(draw);
      }
    }
    const t = setTimeout(draw, 1000);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(animId);
    };
  }, []);

  // 8. Typed text
  useEffect(() => {
    const el = typedTextRef.current;
    if (!el) return;
    const phrases = ['Work Smarter', 'Grow Revenue', 'Stay Ahead'];
    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;
    let timeoutId;

    function type() {
      const currentPhrase = phrases[phraseIdx];
      if (!deleting) {
        el.textContent = currentPhrase.slice(0, ++charIdx);
        if (charIdx === currentPhrase.length) {
          deleting = true;
          timeoutId = setTimeout(type, 2200);
          return;
        }
      } else {
        el.textContent = currentPhrase.slice(0, --charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
        }
      }
      timeoutId = setTimeout(type, deleting ? 55 : 90);
    }
    timeoutId = setTimeout(type, 800);
    return () => clearTimeout(timeoutId);
  }, []);

  // 9. Modal forms
  useEffect(() => {
    const forms = document.querySelectorAll('.smart-form');
    const handlers = [];
    forms.forEach((form) => {
      const modalId = form.dataset.modal;
      const handler = (e) => {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.classList.add('was-validated');
          return;
        }
        const originalHTML = form.innerHTML;
        form.innerHTML = `
          <div class="text-center py-4">
            <div style="font-size:3.5rem; margin-bottom:16px;">
              <i class="bi bi-check-circle-fill" style="color:#8b5cf6;filter:drop-shadow(0 0 12px rgba(139,92,246,0.8))"></i>
            </div>
            <h4 class="mb-2">You're in! 🎉</h4>
            <p class="small" style="color:var(--text-muted); max-width:320px; margin:0 auto;">
              Thanks for signing up. Check your email for your free trial access link.
            </p>
            <button type="button" class="btn btn-primary-glow mt-4" data-bs-dismiss="modal">
              Done
            </button>
          </div>`;
        if (modalId) {
          const modalEl = document.getElementById(modalId);
          if (modalEl) {
            modalEl.addEventListener(
              'hidden.bs.modal',
              () => {
                form.innerHTML = originalHTML;
                form.classList.remove('was-validated');
              },
              { once: true }
            );
          }
        }
      };
      form.addEventListener('submit', handler);
      handlers.push({ form, handler });
    });
    return () => handlers.forEach(({ form, handler }) => form.removeEventListener('submit', handler));
  }, []);

  // Demo modal iframe
  useEffect(() => {
    const demoModal = document.getElementById('demoModal');
    if (!demoModal) return;
    const onShow = () => {
      const iframe = document.getElementById('demoIframe');
      if (iframe) iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
    };
    const onHide = () => {
      const iframe = document.getElementById('demoIframe');
      if (iframe) iframe.src = '';
    };
    demoModal.addEventListener('show.bs.modal', onShow);
    demoModal.addEventListener('hidden.bs.modal', onHide);
    return () => {
      demoModal.removeEventListener('show.bs.modal', onShow);
      demoModal.removeEventListener('hidden.bs.modal', onHide);
    };
  }, []);

  // Demo tabs
  useEffect(() => {
    const btns = document.querySelectorAll('.demo-tab-btn');
    const handlers = [];
    btns.forEach((btn) => {
      const handler = () => {
        btns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      };
      btn.addEventListener('click', handler);
      handlers.push({ btn, handler });
    });
    return () => handlers.forEach(({ btn, handler }) => btn.removeEventListener('click', handler));
  }, []);

  return (
    <>
      {/* Particle canvas + mesh */}
      <canvas id={Style.bgCanvas} ref={canvasRef} />
      <div className={Style.bgmesh} />

      {/* ========== NAV ========== */}
      <nav className={`${Style.sitenav} ${navScrolled ? 'scrolled' : ''}`} id={Style.siteNav}>
        <div className={`${Style.container} container`}>
          <div className={`d-flex align-items-center justify-content-between gap-4`}>
            <a href="#" className={`${Style.navbrand} text-decoration-none`}>
              <div className={Style.navbrandicon}>
                <img src={Logo} />
              </div>
              <span>Flugur ERP</span>
            </a>

            <ul className={`nav d-none d-lg-flex align-items-center gap-1`}>
              <li><a href="#features" className={Style.navlink}>Features</a></li>
              <li><a href="#demo" className={Style.navlink}>Product</a></li>
              <li><a href="#pricing" className={Style.navlink}>Pricing</a></li>
              <li><a href="#testimonials" className={Style.navlink}>Reviews</a></li>
            </ul>

            <div className={`d-flex align-items-center gap-2`}>
              <a href="#" onClick={(e) => {e.preventDefault(); navigate('/login');}}className={`btn ${Style.btnghost} d-none d-md-inline-flex py-2 px-4`}>Sign In</a>
              <button className={`btn ${Style.btnprimaryglow} py-2 px-4`} data-bs-toggle="modal" data-bs-target="#signupModal">
                Start Free <i className="bi bi-arrow-right ms-1" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ========== HERO ========== */}
      <section className={Style.herosection} id="hero">
        <div className={`${Style.container} container`}>
          <div className="row align-items-center g-5">
            <div className={`col-lg-5 ${Style.reveal} reveal`}>
              <div className={Style.labelbadge}>
                <span className={Style.dot} />
                Now in public beta — join 12,000+ teams
              </div>

              <h1 className={Style.herotitle}>
                The Flugur ERP Platform that Brings you{' '}
                <span className={Style.gradienttext} ref={typedTextRef} id="typedText">
                  Brilliance to Your Business
                </span>
              </h1>

              <p className={Style.herosub}>
                Flugur ERP unifies your finance, operations, and teams in one intelligent platform. Automate workflows, gain real-time insights, and make data-driven decisions with confidence.
              </p>

              <div className="d-flex flex-wrap gap-3">
                <button className={`btn ${Style.btnprimaryglow}`} data-bs-toggle="modal" data-bs-target="#signupModal">
                  Start for Free <i className="bi bi-arrow-right ms-1" />
                </button>
                <button className={`btn ${Style.btnghost}`} data-bs-toggle="modal" data-bs-target="#demoModal">
                  <i className="bi bi-play-circle me-1" /> Watch Demo
                </button>
              </div>

              <div className={`mt-4 p-3 ${Style.glasscard}`} style={{ maxWidth: 340 }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Monthly Revenue Growth</span>
                  <span className="badge rounded-pill" style={{ background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', fontSize: '0.72rem', fontWeight: 600 }}>
                    +34.2% ↑
                  </span>
                </div>
                <canvas ref={sparkChartRef} id="sparkChart" style={{ width: '100%' }} />
              </div>

              <div className={Style.herostats}>
                <div className={Style.statitem}>
                  <h3 className={Style.gradienttextpurple}>50K+</h3>
                  <p>Active users</p>
                </div>
                <div className={Style.statitem}>
                  <h3 className={Style.gradienttextpurple}>99.9%</h3>
                  <p>Uptime SLA</p>
                </div>
                <div className={Style.statitem}>
                  <h3 className={Style.gradienttextpurple}>4.9★</h3>
                  <p>Avg. rating</p>
                </div>
              </div>
            </div>

            <div className={`col-lg-7 ${Style.reveal} ${Style.revealdelay2} reveal`}>
              <div className={Style.hero3dscene} ref={heroSceneRef}>
                <img
                  src={M2}
                  alt="Flugur ERP Dashboard Interface"
                  className={`${Style.heroimgmain} hero-img-main`}
                  onError={(e) => {
                    e.target.style.background = 'linear-gradient(135deg,#0c2a6e,#1a4edc)';
                    e.target.style.minHeight = '400px';
                  }}
                />

                <div className={`${Style.floatbadge} ${Style.floatbadgetl} float-badge`}>
                  <div className={Style.badgelabel}>Live Users</div>
                  <div className={`${Style.badgevalue} ${Style.gradienttextpurple}`}>2,847</div>
                  <div className={`${Style.badgesub} d-flex align-items-center gap-1`}>
                    <span style={{ color: '#6ee7b7', fontSize: '0.72rem' }}>
                      <i className="bi bi-graph-up-arrow" /> +12.4% today
                    </span>
                  </div>
                </div>

                <div className={`${Style.floatbadge} ${Style.floatbadgetr} float-badge`}>
                  <div className={Style.badgelabel}>Conversion</div>
                  <div className={Style.badgesub} style={{ color: '#f9a8d4' }}>8.6%</div>
                  <div className={Style.badgesub}>
                    <span style={{ color: '#86efac', fontSize: '0.72rem' }}>↑ above industry avg</span>
                  </div>
                </div>

                <div className={`${Style.floatbadge} ${Style.floatbadgebl} float-badge`}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <div style={{ width: 8, height: 8, background: 'var(--highlight)', borderRadius: '50%', boxShadow: '0 0 8px var(--highlight)', animation: 'pulse-dot 1.5s infinite' }} />
                    <span className={`${Style.badgelabel} mb-0`}>AI Engine</span>
                  </div>
                  <div className={Style.badgesub} style={{ color: 'var(--highlight)' }}>Running</div>
                  <div className={Style.badgesub}>372 automations / hr</div>
                </div>

                <div className={`${Style.floatbadge} ${Style.floatbadgebr} float-badge`}>
                  <div className={Style.badgelabel}>MRR</div>
                  <div className={`${Style.badgevalue} ${Style.gradienttext}`}>$1.2M</div>
                  <div className={Style.badgesub}>
                    <span style={{ color: '#fde68a', fontSize: '0.72rem' }}>
                      <i className="bi bi-star-fill" /> Record month
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== LOGOS ========== */}
      <section className={Style.logossection}>
        <div className={`${Style.container} container mb-4`}>
          <p className="text-center mb-0" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600 }}>
            Trusted by teams at
          </p>
        </div>
        <div className={Style.logotrackwrap}>
          <div className={Style.logotrack}>
            {[...Array(2)].map((_, copy) => (
              <React.Fragment key={copy}>
                <div className={Style.logoitem}><i className="bi bi-hexagon-fill" style={{ color: '#7c3aed' }} /> Vercel Corp</div>
                <div className={Style.logoitem}><i className="bi bi-triangle-fill" style={{ color: '#ec4899' }} /> Notion Labs</div>
                <div className={Style.logoitem}><i className="bi bi-circle-fill" style={{ color: '#22d3ee' }} /> Linear Inc.</div>
                <div className={Style.logoitem}><i className="bi bi-square-fill" style={{ color: '#8b5cf6' }} /> Figma Design</div>
                <div className={Style.logoitem}><i className="bi bi-star-fill" style={{ color: '#f59e0b' }} /> Stripe Co.</div>
                <div className={Style.logoitem}><i className="bi bi-lightning-fill" style={{ color: '#3b82f6' }} /> FastAPI</div>
                <div className={Style.logoitem}><i className="bi bi-diamond-fill" style={{ color: '#ec4899' }} /> Loom Video</div>
                <div className={Style.logoitem}><i className="bi bi-pentagon-fill" style={{ color: '#a78bfa' }} /> Airtable</div>
                <div className={Style.logoitem}><i className="bi bi-shield-fill" style={{ color: '#22d3ee' }} /> Retool Apps</div>
                <div className={Style.logoitem}><i className="bi bi-gem" style={{ color: '#7c3aed' }} /> Intercom</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className={Style.sectionpadding} id="features">
        <div className={`${Style.container} container`}>
          <div className="text-center mb-5">
            <div className={`${Style.sectionlabel} ${Style.reveal} reveal`}><i className="bi bi-stars me-1" /> Core Features</div>
            <h2 className={`${Style.sectiontitle} ${Style.reveal} reveal`}>Everything You Need to Run and Grow</h2>
            <p className={`${Style.sectiondesc} mx-auto ${Style.reveal} reveal ${Style.revealdelay1}`}>
              From finance to operations, Flugur ERP unifies all busuness processes in one intelligent platform - so youcan automate, analyze, and achieve more.
            </p>
          </div>

          <div className="row g-4">
            {[
              { icon: 'bi-bar-chart-line-fill', cls: 'icon-purple', title: 'Real-Time Analytics', color: 'var(--purple-300)', desc: 'Get a live view of your financial and operational performance. Interactive dashboards and KPIs help you monitor every metric that matters in real time.' },
              { icon: 'bi-cpu-fill', cls: 'icon-pink', title: 'AI Automation', color: '#f9a8d4', desc: 'Automate repetitive tasks, detect anomalies, and get intelligent recommendations. Our AI copilot helps you forecast, optimize cash flow, and make better decisions.' },
              { icon: 'bi-people-fill', cls: 'icon-cyan', title: 'Team Collaboration', color: 'var(--cyan-400)', desc: 'Work together in real time with shared notes, approvals, tasks. and activity feeds. Keep your team aligned and productive from anywhere.' },
              { icon: 'bi-shield-fill-check', cls: 'icon-blue', title: 'Enterprise Security', color: '#93c5fd', desc: 'Built with enterprise-grade security. SOC 2 Type || certified, GDPR compliant, with end-to-end encryption, SSO, and role-based access control.' },
            ].map((f, i) => (
              <div className={`col-md-6 col-xl-3 ${Style.reveal} reveal ${Style.revealdelay}${i + 1}`} key={f.title}>
                <div className={`${Style.tiltwrap} h-100`}>
                  <div className={`${Style.tiltinner} h-100`}>
                    <div className={`${Style.featurecard} ${Style.glasscard} h-100`}>
                      <div className={`${Style.featureicon} ${f.cls}`}>
                        <i className={`bi ${f.icon}`} />
                      </div>
                      <h4>{f.title}</h4>
                      <p>{f.desc}</p>
                      <a href="#" className="d-inline-flex align-items-center gap-1 mt-3" style={{ color: f.color, fontSize: '0.88rem', fontWeight: 600 }}>
                        Learn more <i className="bi bi-arrow-right-short fs-5 lh-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="row g-4 mt-2">
            <div className={`col-md-6 ${Style.reveal} reveal`}>
              <div className={`${Style.glasscard} p-4 d-flex gap-4 align-items-start`}>
                <div className={`${Style.featureicon} ${Style.iconpurple} flex-shrink-0`} style={{ width: 46, height: 46 }}>
                  <i className="bi bi-plug-fill" />
                </div>
                <div>
                  <h4 className="h5 mb-2">200+ Integrations</h4>
                  <p className="small mb-0">Connect Flugur ERP with the tools you already use. Slack, GitHub, banking systems, payment gateways, and more.</p>
                </div>
              </div>
            </div>
            <div className={`col-md-6 ${Style.reveal} reveal ${Style.revealdelay2}`}>
              <div className={`${Style.glasscard} p-4 d-flex gap-4 align-items-start`}>
                <div className={`${Style.featureicon} ${Style.iconpink} flex-shrink-0`} style={{ width: 46, height: 46 }}>
                  <i className="bi bi-graph-up-arrow" />
                </div>
                <div>
                  <h4 className="h5 mb-2">Predictive Forecasting</h4>
                  <p className="small mb-0">Our ML models analyze your trends and project revenue, churn, and usage 90 days out with industry-leading accuracy.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== METRICS ========== */}
      <section className={Style.metricssection} id="metrics">
        <div className={`${Style.container} container`}>
          <div className="row g-0">
            {[
              { counter: 50, suffix: 'K+', label: 'Teams using NexaFlow' },
              { counter: 2.4, suffix: 'B', decimals: 1, label: 'Events processed daily' },
              { counter: 99.9, suffix: '%', decimals: 1, label: 'Guaranteed uptime' },
              { counter: 4.9, suffix: '★', decimals: 1, label: 'Average user rating' },
            ].map((m, i) => (
              <div className="col-6 col-md-3" key={m.label}>
                <div className={`${Style.metriccard} ${Style.reveal}${i ? ` ${Style.revealdelay}${i}` : ''}`}>
                  <div className={`${Style.metricnumber} ${Style.gradienttext}`}>
                    <span data-counter={m.counter} data-suffix={m.suffix} {...(m.decimals ? { 'data-decimals': m.decimals } : {})}>
                      0
                    </span>
                  </div>
                  <div className={Style.metriclabel}>{m.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== DEMO ========== */}
      <section className={`${Style.sectionpadding} ${Style.demosection}`} id="demo">
        <div className={`${Style.container} container`}>
          <div className="row align-items-center g-5">
            <div className={`col-lg-5 ${Style.reveal}`}>
              <div className={Style.sectionlabel}><i className="bi bi-display me-1" /> Product Tour</div>
              <h2 className={Style.sectiontitle}>See Your Business Clearly, in One View</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                Flugur ERP&apos;s unified dashboard brings all your financial, operational, and analytical data together from real-time transactions to forecasts, all in one intelligent interface.
              </p>
              <ul className="list-unstyled d-flex flex-column gap-3">
                {[
                  { icon: 'icon-purple', title: 'Drag-and-drop Dashboard Builder', sub: 'Design custom dashboards and KPI reports easily with our no-code interface.' },
                  { icon: 'icon-pink', title: 'Instant Alerts & Notifications', sub: 'Get real-time alerts on anomalies, approvals, paye=ments, and critical business events.' },
                  { icon: 'icon-cyan', title: 'One-click Data Exports', sub: 'Export reports or push data to your data warehouse in CSV, PDF, Excel, or via API.' },
                ].map((item) => (
                  <li className="d-flex gap-3 align-items-start" key={item.title}>
                    <div className={`${Style.featureicon} ${item.icon} flex-shrink-0`} style={{ width: 36, height: 36, margin: 0, fontSize: '0.9rem' }}>
                      <i className="bi bi-check-lg" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
                      <div className="small" style={{ color: 'var(--text-muted)' }}>{item.sub}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <button className={`btn ${Style.btnprimaryglow} mt-4`} data-bs-toggle="modal" data-bs-target="#demoModal">
                <i className="bi bi-play-circle me-1" /> Watch full demo
              </button>
            </div>
            <div className={`col-lg-7 ${Style.reveal} ${Style.revealdelay2}`}>
              <div className={Style.democanvaswrap}>
                <img
                  src={M1}
                  alt="Flugur ERP Analytics Dashboard"
                  onError={(e) => {
                    e.target.style.background = 'linear-gradient(135deg,#0c2a6e,#1a4edc)';
                    e.target.style.minHeight = '320px';
                  }}
                />
                <div className={Style.demooverlaybar}>
                  <div className="d-flex gap-2">
                    <button className={`${Style.demotabbtn} ${Style.active}`} id="tab1">Overview</button>
                    <button className={Style.demotabbtn} id="tab2">Funnels</button>
                    <button className={Style.demotabbtn} id="tab3">Cohorts</button>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Live data preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section className={Style.sectionpadding} id="pricing">
        <div className={`${Style.container} container`}>
          <div className="text-center mb-5">
            <div className={`${Style.sectionlabel} ${Style.reveal} reveal`}><i className="bi bi-tag me-1" /> Pricing Plans</div>
            <h2 className={`${Style.sectiontitle} ${Style.reveal} reveal`}>Simple, transparent pricing</h2>
            <p className={`${Style.sectiondesc} mx-auto ${Style.reveal} reveal ${Style.revealdelay1}`}>
              Start for free. Scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            {/* Starter */}
            <div className={`col-md-6 col-lg-4 ${Style.reveal} reveal ${Style.revealdelay1}`}>
              <div className={`${Style.tiltwrap} tilt-wrap h-100`}>
                <div className={`${Style.tiltinner} tilt-inner h-100`}>
                  <div className={`${Style.pricingcard} ${Style.glasscard} h-100`}>
                    <div className={Style.planname}>Starter</div>
                    <div className={`${Style.planprice} ${Style.gradienttextpurple}`}>$0</div>
                    <div className={Style.plancycle}>/ month · forever free</div>
                    <hr className={Style.plandivider} />
                    <div className={Style.planfeature}><i className="bi bi-check2" /> Up to 3 users</div>
                    <div className={Style.planfeature}><i className="bi bi-check2" /> 10 dashboards</div>
                    <div className={Style.planfeature}><i className="bi bi-check2" /> 7-day data retention</div>
                    <div className={Style.planfeature}><i className="bi bi-check2" /> Basic integrations</div>
                    <div className={`${Style.planfeature} ${Style.disabled}`}><i className="bi bi-x" /> AI automation</div>
                    <div className={`${Style.planfeature} ${Style.disabled}`}><i className="bi bi-x" /> Priority support</div>
                    <button className={`btn ${Style.btnghost} w-100 mt-4`} data-bs-toggle="modal" data-bs-target="#signupModal">
                      Get started free
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro */}
            <div className={`col-md-6 col-lg-4 ${Style.reveal} reveal ${Style.revealdelay2}`}>
              <div className={`${Style.tiltwrap} tilt-wrap h-100`}>
                <div className={`${Style.tiltinner} tilt-inner h-100`}>
                  <div className={`${Style.pricingcard} ${Style.glasscard} ${Style.featured} h-100`}>
                    <div className={Style.planbadge}>Most Popular</div>
                    <div className={Style.planname}>Pro</div>
                    <div className={`${Style.planprice} ${Style.gradienttext}`}>$49</div>
                    <div className={Style.plancycle}>/ month per workspace</div>
                    <hr className={Style.plandivider} />
                    <div className={Style.planfeature}><i className="bi bi-check2" /> Unlimited users</div>
                    <div className={Style.planfeature}><i className="bi bi-check2" /> Unlimited dashboards</div>
                    <div className={Style.planfeature}><i className="bi bi-check2" /> 1-year data retention</div>
                    <div className={Style.planfeature}><i className="bi bi-check2" /> 100+ integrations</div>
                    <div className={Style.planfeature}><i className="bi bi-check2" /> AI automation engine</div>
                    <div className={Style.planfeature}><i className="bi bi-check2" /> Priority support 24/7</div>
                    <button className={`btn ${Style.btnprimaryglow} w-100 mt-4`} data-bs-toggle="modal" data-bs-target="#signupModal">
                      Start 14-day trial <i className="bi bi-arrow-right ms-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Enterprise */}
            <div className={`col-md-6 col-lg-4 ${Style.reveal} reveal ${Style.revealdelay3}`}>
              <div className={`${Style.tiltwrap} tilt-wrap h-100`}>
                <div className={`${Style.tiltinner} tilt-inner h-100`}>
                  <div className={`${Style.pricingcard} ${Style.glasscard} h-100`}>
                    <div className={Style.planname}>Enterprise</div>
                    <div className={`${Style.planprice} ${Style.gradienttextpurple}`}>Custom</div>
                    <div className={Style.plancycle}>tailored to your scale</div>
                    <hr className={Style.plandivider} />
                    <div className={Style.planfeature}><i className="bi bi-check2" /> Everything in Pro</div>
                    <div className={Style.planfeature}><i className="bi bi-check2" /> Custom data retention</div>
                    <div className={Style.planfeature}><i className="bi bi-check2" /> SSO / SAML / SCIM</div>
                    <div className={Style.planfeature}><i className="bi bi-check2" /> Dedicated CSM</div>
                    <div className={Style.planfeature}><i className="bi bi-check2" /> SLA &amp; uptime guarantee</div>
                    <div className={Style.planfeature}><i className="bi bi-check2" /> On-prem deployment</div>
                    <button className={`btn ${Style.btnghost} w-100 mt-4`} data-bs-toggle="modal" data-bs-target="#contactModal">
                      Contact sales <i className="bi bi-arrow-right ms-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className={Style.sectionpadding} id="testimonials">
        <div className={`${Style.container} container`}>
          <div className="text-center mb-5">
            <div className={`${Style.sectionlabel} ${Style.reveal} reveal`}><i className="bi bi-chat-quote me-1" /> Testimonials</div>
            <h2 className={`${Style.sectiontitle} ${Style.reveal} reveal`}>Loved by teams worldwide</h2>
          </div>
          <br></br>
          <div className="row g-4">
            {[
              { initials: 'AH', bg: 'linear-gradient(135deg,#1d4ed8,#0ea5e9)', name: 'Ahmed Hassan', title: 'Finance Manager, Enterprise Company', text: '"Flugur ERP transformed the way we manage our finances. We moved from manual reporting to real-time financial insights, giving our team faster and more confident decision-making."' },
              { initials: 'OK', bg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', name: 'Omar Khaled', title: 'Chief Accountant, Growing Business', text: '"The AI-powered forecasting helped us better understand our future revenue and cash flow. Flugur ERP saves our team hours of manual analysis every week."' },
              { initials: 'MA', bg: 'linear-gradient(135deg,#2563eb,#0ea5e9)', name: 'Mariam Adel', title: 'Operations Manager, Retail Company', text: '"Flugur ERP brings accounting, sales, purchasing, and inventory together in one platform. Having everything connected has made our daily operations much more efficient."' },
            ].map((t, i) => (
              <div className={`col-md-4 reveal reveal-delay-${i + 1}`} key={t.name}>
                <div className={`${Style.tiltwrap} tilt-wrap h-100`}>
                  <div className={`${Style.tiltinner} tilt-inner h-100`}>
                    <div className={`${Style.testimonialcard} ${Style.glasscard}`}>
                      <div className={Style.testimonialstars}>★★★★★</div>
                      <p className={Style.testimonialtext}>{t.text}</p>
                      <div className={Style.testimonialauthor}>
                        <div className={Style.authoravatar} style={{ background: t.bg, color: 'white' }}>{t.initials}</div>
                        <div>
                          <div className={Style.authorname}>{t.name}</div>
                          <div className={Style.authortitle}>{t.title}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className={Style.ctasection} id="cta">
        <div className={`${Style.container} container position-relative`}>
          <div className={Style.ctagloworb}/>
          <div className={`${Style.ctabox} ${Style.reveal} reveal`}>
            <div className={`${Style.labelbadge} mx-auto mb-3`} style={{ display: 'inline-flex' }}>
              <span className={Style.dot}/> 14-day free trial · No credit card required
            </div>
            <h2 className={`${Style.ctatitle} ${Style.gradienttext}`}>Start scaling with Flugur ERP today</h2>
            <p className={Style.ctasub}>
              Join 50,000+ teams who use Flugur ERP to make faster, smarter decisions — and grow revenue without growing headcount.
            </p>
            <div className={Style.emailinputgroup}>
              <input type="email" className={Style.emailinput} placeholder="Enter your work email…" id="ctaEmailInput" />
              <button
                className={`btn ${Style.btnaccent}`}
                onClick={() => {
                  const cta = document.getElementById('ctaEmailInput');
                  const modalInput = document.querySelector('.email-input-modal');
                  if (cta && modalInput) modalInput.value = cta.value;
                }}
                data-bs-toggle="modal"
                data-bs-target="#signupModal"
              >
                Get Started Free <i className="bi bi-arrow-right-short fs-5 lh-1" />
              </button>
            </div>
            <p className="mt-3 mb-0" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              No credit card required &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; SOC 2 Certified
            </p>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className={Style.sitefooter}>
        <div className={`${Style.container} container`}>
          <div className="row g-5">
            <div className="col-lg-4">
              <div className={Style.footerbrand}>
                <div className={Style.navbrandicon} style={{ width: 32, height: 32, borderRadius: 8 }}>
                  <img src={Logo} />
                </div>
                Flugur ERP
              </div>
              <p className={Style.footerdesc}>The all-in-one analytics and automation platform for modern product teams.</p>
              <div className={Style.socialrow}>
                <a href="#" className={Style.socialbtn}><i className="bi bi-twitter-x" /></a>
                <a href="#" className={Style.socialbtn}><i className="bi bi-linkedin" /></a>
                <a href="#" className={Style.socialbtn}><i className="bi bi-github" /></a>
                <a href="#" className={Style.socialbtn}><i className="bi bi-youtube" /></a>
              </div>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Integrations', 'Changelog', 'Roadmap', 'Status'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press Kit', 'Contact'] },
              { title: 'Resources', links: ['Docs', 'API Reference', 'Community', 'Templates', 'Guides'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Security', 'GDPR', 'Compliance'] },
            ].map((col) => (
              <div className="col-6 col-md-4 col-lg-2" key={col.title}>
                <div className={Style.footercol}>
                  <h6>{col.title}</h6>
                  <ul className={Style.footerlinks}>
                    {col.links.map((l) => (
                      <li key={l}><a href="#">{l}</a></li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className={Style.footerbottom}>
            <p>&copy; 2026 Flugur ERP, Inc. All rights reserved.</p>
            <p>Built with Flugur for product teams everywhere</p>
          </div>
        </div>
      </footer>

      {/* ========== MODALS ========== */}
      {/* Sign-Up */}
      <div className="modal fade" id="signupModal" tabIndex={-1} aria-labelledby="signupModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className={Style.modalcontent}>
            <div className={`${Style.modalheader} modal-header border-0`}>
              <h5 className={Style.modaltitle} id="signupModalLabel">
                <i className="bi bi-lightning-charge-fill me-2" style={{ color: 'var(--purple-300)' }} />
                Start your free trial
              </h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" />
            </div>
            <div className={`${Style.modalbody} modal-body`}>
              <form className="smart-form needs-validation" data-modal="signupModal" noValidate>
                <div className="mb-3">
                  <label className={`form-label ${Style.formlabeldark}`} htmlFor="signupName">Full Name</label>
                  <input type="text" className={`form-control ${Style.formcontroldark}`} id="signupName" placeholder="Jane Smith" required />
                  <div className="invalid-feedback">Please enter your name.</div>
                </div>
                <div className="mb-3">
                  <label className={`form-label ${Style.formlabeldark}`} htmlFor="signupEmail">Work Email</label>
                  <input type="email" className={`form-control ${Style.formcontroldark} ${Style.emailinputmodal}`} id="signupEmail" placeholder="jane@company.com" required />
                  <div className="invalid-feedback">Please enter a valid email.</div>
                </div>
                <div className="mb-4">
                  <label className={`form-label ${Style.formlabeldark}`} htmlFor="signupTeam">Team Size</label>
                  <select className={`form-control ${Style.formcontroldark}`} id="signupTeam" required defaultValue="">
                    <option value="" disabled>Select team size…</option>
                    <option>Just me</option>
                    <option>2–10</option>
                    <option>11–50</option>
                    <option>51–200</option>
                    <option>200+</option>
                  </select>
                  <div className="invalid-feedback">Please select a team size.</div>
                </div>
                <button type="submit" className={`btn ${Style.btnprimaryglow} w-100 py-3`}>
                  Create Free Account <i className="bi bi-arrow-right ms-2" />
                </button>
                <p className="text-center mt-3 mb-0" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  By signing up you agree to our <a href="#" style={{ color: 'var(--purple-300)' }}>Terms</a> &amp; <a href="#" style={{ color: 'var(--purple-300)' }}>Privacy Policy</a>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      <div className="modal fade" id="demoModal" tabIndex={-1} aria-labelledby="demoModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className={`${Style.modalcontent} modal-content`}>
            <div className={`${Style.modalheader} modal-header border-0`}>
              <h5 className="modal-title" id="demoModalLabel">Flugur ERP — Product Demo</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" />
            </div>
            <div className={`${Style.modalbody} p-2`}>
              <div className="ratio ratio-16x9">
                <iframe src="" id="demoIframe" title="Flugur ERP Demo Video" allow="autoplay; encrypted-media" allowFullScreen className="rounded-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Sales Modal */}
      <div className="modal fade" id="contactModal" tabIndex={-1} aria-labelledby="contactModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title" id="contactModalLabel">Talk to our sales team</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              <form className="smart-form needs-validation" data-modal="contactModal" noValidate>
                <div className="mb-3">
                  <label className="form-label form-label-dark" htmlFor="contactName">Full Name</label>
                  <input type="text" className="form-control form-control-dark" id="contactName" placeholder="Your name" required />
                  <div className="invalid-feedback">Required field.</div>
                </div>
                <div className="mb-3">
                  <label className="form-label form-label-dark" htmlFor="contactEmail">Work Email</label>
                  <input type="email" className="form-control form-control-dark" id="contactEmail" placeholder="you@company.com" required />
                  <div className="invalid-feedback">Valid email required.</div>
                </div>
                <div className="mb-3">
                  <label className="form-label form-label-dark" htmlFor="contactCompany">Company</label>
                  <input type="text" className="form-control form-control-dark" id="contactCompany" placeholder="Your company name" required />
                  <div className="invalid-feedback">Required field.</div>
                </div>
                <div className="mb-4">
                  <label className="form-label form-label-dark" htmlFor="contactMsg">What are you looking for?</label>
                  <textarea className="form-control form-control-dark" id="contactMsg" rows={3} placeholder="Tell us about your needs…" required />
                  <div className="invalid-feedback">Please describe your needs.</div>
                </div>
                <button type="submit" className="btn btn-primary-glow w-100 py-3">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FlugurLanding;
