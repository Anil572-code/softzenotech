/* =====================================================
   SOFTZENO TECH — Premium Vanilla JS
   ===================================================== */

'use strict';

// ── Utility ──────────────────────────────────────────
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

// ── State ─────────────────────────────────────────────
let mouse = { x: 0, y: 0, tx: 0, ty: 0 };
let scrollY = 0;
let ticking = false;

// =====================================================
// 1. CANVAS PARTICLE SYSTEM
// =====================================================
(function initParticles() {
  const canvas = qs('#particle-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animFrame;

  const COLORS = ['#3b82f6', '#a855f7', '#ec4899', '#f97316', '#22d3ee', '#facc15'];
  const COUNT  = window.innerWidth < 768 ? 60 : 120;

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 10;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = -(Math.random() * 0.6 + 0.2);
      this.r  = Math.random() * 1.8 + 0.4;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.6 + 0.1;
      this.life  = 0;
      this.maxLife = Math.random() * 300 + 200;
      // connections
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = Math.random() * 0.02 + 0.005;
    }
    update() {
      this.x += this.vx + Math.sin(this.life * 0.01) * 0.3;
      this.y += this.vy;
      this.life++;
      this.pulse += this.pulseSpeed;
      const ratio = this.life / this.maxLife;
      this.currentAlpha = this.alpha * Math.sin(ratio * Math.PI);
      if (this.life > this.maxLife || this.y < -20) this.reset();
    }
    draw() {
      const pulse = 1 + Math.sin(this.pulse) * 0.3;
      const r = this.r * pulse;
      ctx.save();
      ctx.globalAlpha = clamp(this.currentAlpha, 0, 1);
      // Glow
      const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, r * 4);
      grd.addColorStop(0, this.color);
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 4, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.globalAlpha = clamp(this.currentAlpha * 0.3, 0, 1);
      ctx.fill();
      // Core
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = clamp(this.currentAlpha, 0, 1);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawConnections() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          ctx.save();
          ctx.globalAlpha = (1 - d / maxDist) * 0.08;
          ctx.strokeStyle = particles[i].color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  // Light trail following mouse
  const trail = [];
  const TRAIL_LEN = 20;
  function drawTrail() {
    if (trail.length < 2) return;
    for (let i = 1; i < trail.length; i++) {
      const t = i / trail.length;
      ctx.save();
      ctx.globalAlpha = t * 0.15;
      ctx.strokeStyle = `hsl(${260 + i * 4}, 80%, 70%)`;
      ctx.lineWidth = t * 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
      ctx.restore();
    }
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, () => new Particle());
    loop();
  }

  function loop() {
    animFrame = requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);
    // Scroll-based bg colour shift
    const scrollRatio = clamp(window.scrollY / (document.body.scrollHeight - H), 0, 1);
    ctx.fillStyle = `rgba(3,3,10,${0.02 + scrollRatio * 0.01})`;
    ctx.fillRect(0, 0, W, H);

    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    // Trail
    trail.push({ x: mouse.tx, y: mouse.ty });
    if (trail.length > TRAIL_LEN) trail.shift();
    drawTrail();
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => {
    mouse.tx = e.clientX;
    mouse.ty = e.clientY;
  });

  init();
})();

// =====================================================
// 2. MOUSE GLOW FOLLOW
// =====================================================
(function initMouseGlow() {
  const glow = qs('#mouse-glow');
  let cx = 0, cy = 0;
  let tx = window.innerWidth / 2, ty = window.innerHeight / 2;

  window.addEventListener('mousemove', e => {
    tx = e.clientX;
    ty = e.clientY;
    // Custom cursor via CSS vars
    document.documentElement.style.setProperty('--cx', tx + 'px');
    document.documentElement.style.setProperty('--cy', ty + 'px');
  });

  function animate() {
    cx = lerp(cx, tx, 0.08);
    cy = lerp(cy, ty, 0.08);
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';
    requestAnimationFrame(animate);
  }
  animate();
})();

// =====================================================
// 3. SCROLL PROGRESS BAR
// =====================================================
(function initScrollProgress() {
  const bar = qs('#scroll-progress');
  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// =====================================================
// 4. NAVBAR SCROLL EFFECT
// =====================================================
(function initNavbar() {
  const nav = qs('#navbar');
  function update() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// =====================================================
// 5. MOBILE MENU
// =====================================================
(function initMobileMenu() {
  const btn  = qs('#hamburger');
  const menu = qs('#mobile-menu');
  const links = qsa('.mob-link');
  let open = false;

  function toggle() {
    open = !open;
    btn.classList.toggle('active', open);
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  btn.addEventListener('click', toggle);
  links.forEach(l => l.addEventListener('click', () => {
    if (open) toggle();
  }));
})();

// =====================================================
// 6. INTERSECTION OBSERVER — REVEAL ANIMATIONS
// =====================================================
(function initReveal() {
  const revealEls = qsa('.reveal-up, .reveal-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        // Don't unobserve cards so they persist
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
})();

// =====================================================
// 7. HERO MOUSE PARALLAX
// =====================================================
(function initHeroParallax() {
  const heroText   = qs('#hero-text');
  const heroVisual = qs('#hero-visual');
  if (!heroText || !heroVisual) return;

  let cx = 0, cy = 0, tx = 0, ty = 0;

  window.addEventListener('mousemove', e => {
    const rect = document.documentElement;
    tx = (e.clientX / rect.clientWidth  - 0.5) * 2;
    ty = (e.clientY / rect.clientHeight - 0.5) * 2;
  });

  function animate() {
    cx = lerp(cx, tx, 0.06);
    cy = lerp(cy, ty, 0.06);

    if (heroText) {
      heroText.style.transform = `translate(${cx * -6}px, ${cy * -4}px)`;
    }
    if (heroVisual) {
      heroVisual.style.transform = `translate(${cx * 12}px, ${cy * 8}px)`;
    }
    requestAnimationFrame(animate);
  }
  animate();
})();

// =====================================================
// 8. PARALLAX SECTIONS ON SCROLL
// =====================================================
(function initScrollParallax() {
  const orbs = qsa('.orb');

  function update() {
    const sy = window.scrollY;
    orbs[0] && (orbs[0].style.transform = `translate(${sy * 0.05}px, ${sy * 0.08}px) scale(1)`);
    orbs[1] && (orbs[1].style.transform = `translate(${sy * -0.04}px, ${sy * 0.06}px) scale(1)`);
    orbs[2] && (orbs[2].style.transform = `translate(${sy * 0.03}px, ${sy * -0.05}px) scale(1)`);
    orbs[3] && (orbs[3].style.transform = `translate(${sy * -0.06}px, ${sy * 0.04}px) scale(1)`);
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => { update(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
})();

// =====================================================
// 9. SCROLL-BASED BACKGROUND COLOUR SHIFTS
// =====================================================
(function initScrollBackground() {
  const sections = [
    { id: 'hero',         color: 'rgba(59,130,246,0.03)' },
    { id: 'services',     color: 'rgba(168,85,247,0.04)' },
    { id: 'works',        color: 'rgba(7,7,26,1)' },
    { id: 'about',        color: 'rgba(236,72,153,0.03)' },
    { id: 'technologies', color: 'rgba(59,130,246,0.03)' },
    { id: 'process',      color: 'rgba(7,7,26,1)' },
    { id: 'contact',      color: 'rgba(168,85,247,0.04)' },
  ];

  // dynamically tint orbs based on current section
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sec = sections.find(s => s.id === entry.target.id);
        if (sec) {
          document.documentElement.style.setProperty('--current-section-tint', sec.color);
        }
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => {
    const el = qs('#' + s.id);
    if (el) observer.observe(el);
  });
})();

// =====================================================
// 10. ANIMATED STAT COUNTERS
// =====================================================
(function initCounters() {
  const counters = qsa('.stat-num');
  let done = false;

  function animateCounters() {
    if (done) return;
    done = true;
    counters.forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      const duration = 2000;
      const start = performance.now();

      function step(now) {
        const elapsed = now - start;
        const progress = clamp(elapsed / duration, 0, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        el.textContent = Math.round(ease * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    });
  }

  // Trigger when hero section is visible
  const heroEl = qs('#hero');
  if (heroEl) {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { animateCounters(); obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(heroEl);
  }
})();

// =====================================================
// 11. MAGNETIC CTA BUTTONS
// =====================================================
(function initMagneticButtons() {
  const btns = qsa('.magnetic-btn');

  btns.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.35;
      const dy   = (e.clientY - cy) * 0.35;
      btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.04)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

// =====================================================
// 12. SERVICE CARDS — POINTER-TILT EFFECT
// =====================================================
(function initCardTilt() {
  const cards = qsa('.service-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `
        translateY(-8px)
        rotateX(${-y * 8}deg)
        rotateY(${x * 8}deg)
        scale(1.01)
      `;
      // Move card glow
      const glow = card.querySelector('.card-glow');
      if (glow) {
        glow.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% 0%, rgba(168,85,247,0.7), transparent 60%)`;
        glow.style.height = '80px';
        glow.style.top = '-1px';
        glow.style.transform = 'scaleX(1)';
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      const glow = card.querySelector('.card-glow');
      if (glow) {
        glow.style.height = '1px';
        glow.style.background = '';
        glow.style.transform = 'scaleX(0)';
      }
    });
  });
})();

// =====================================================
// 13. WORK CARDS — TILT
// =====================================================
(function initWorkTilt() {
  const cards = qsa('.work-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `
        rotateX(${-y * 5}deg)
        rotateY(${x * 5}deg)
        scale(1.01)
      `;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// =====================================================
// 14. BACK TO TOP BUTTON
// =====================================================
(function initBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// =====================================================
// 15. CONTACT FORM
// =====================================================
(function initContactForm() {
  const form    = qs('#contact-form');
  const success = qs('#form-success');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit span');
    if (btn) btn.textContent = 'Sending…';

    // Simulate async send
    setTimeout(() => {
      form.reset();
      success.classList.add('visible');
      if (btn) btn.textContent = 'Send Message ✦';
      setTimeout(() => success.classList.remove('visible'), 5000);
    }, 1200);
  });
})();

// =====================================================
// 16. SMOOTH ANCHOR LINKS
// =====================================================
(function initSmoothAnchors() {
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = qs(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

// =====================================================
// 17. FLOATING CHIPS — EXTRA RANDOM MOTION
// =====================================================
(function initChipsDrift() {
  const chips = qsa('.floating-chip, .about-floater');
  chips.forEach((chip, i) => {
    let t = Math.random() * Math.PI * 2;
    const speed = 0.008 + Math.random() * 0.006;
    const ampX  = 4 + Math.random() * 6;
    const ampY  = 5 + Math.random() * 8;
    const baseX = parseFloat(chip.style.transform?.match(/translateX\((.+)px\)/)?.[1] ?? 0);
    const baseY = parseFloat(chip.style.transform?.match(/translateY\((.+)px\)/)?.[1] ?? 0);

    function drift() {
      t += speed;
      const dx = Math.sin(t + i) * ampX;
      const dy = Math.cos(t * 0.7 + i) * ampY;
      chip.style.transform = `translate(${dx}px, ${dy}px)`;
      requestAnimationFrame(drift);
    }
    drift();
  });
})();

// =====================================================
// 18. CURSOR CUSTOM STYLE — DYNAMIC COLOR
// =====================================================
(function initDynamicCursor() {
  const style = document.createElement('style');
  document.head.appendChild(style);

  let hue = 260;
  window.addEventListener('mousemove', () => {
    hue = (hue + 0.5) % 360;
    style.textContent = `body::before { 
      top: var(--cy, 0px); 
      left: var(--cx, 0px); 
      background: hsl(${hue}, 90%, 65%);
    }`;
  });
})();

// =====================================================
// 19. SECTION ACTIVE NAV LINK HIGHLIGHT
// =====================================================
(function initActiveNav() {
  const sections  = qsa('section[id]');
  const navLinks  = qsa('.nav-link');
  const navH = 80;

  function update() {
    const sy = window.scrollY + navH + 100;
    let current = '';
    sections.forEach(sec => {
      if (sec.offsetTop <= sy) current = sec.id;
    });
    navLinks.forEach(a => {
      const href = a.getAttribute('href').replace('#', '');
      a.style.color = href === current ? 'var(--text)' : '';
      a.style.background = href === current ? 'var(--surface)' : '';
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// =====================================================
// 20. HERO SCROLL HINT — FADE OUT ON SCROLL
// =====================================================
(function initScrollHintFade() {
  const hint = qs('.hero-scroll-hint');
  if (!hint) return;
  window.addEventListener('scroll', () => {
    const opacity = 1 - clamp(window.scrollY / 200, 0, 1);
    hint.style.opacity = opacity;
  }, { passive: true });
})();

// =====================================================
// 21. PROCESS STEPS — STAGGERED DELAY ON REVEAL
// =====================================================
(function initProcessStagger() {
  const steps = qsa('.process-step');
  steps.forEach((step, i) => {
    step.style.transitionDelay = `${i * 0.12}s`;
  });
})();

// =====================================================
// 22. MARQUEE — PAUSE ON HOVER (already CSS, but JS speed control)
// =====================================================
(function initMarquee() {
  const track = qs('#marquee-track');
  if (!track) return;
  // Speed can be changed dynamically
  let speed = 30;
  track.parentElement.addEventListener('mouseenter', () => {
    track.style.animationPlayState = 'paused';
  });
  track.parentElement.addEventListener('mouseleave', () => {
    track.style.animationPlayState = 'running';
  });
})();

// =====================================================
// 23. DYNAMIC ORB COLOUR PULSING
// =====================================================
(function initOrbPulse() {
  const orbs = qsa('.orb');
  const palette = [
    'rgba(59,130,246,0.12)',
    'rgba(168,85,247,0.12)',
    'rgba(236,72,153,0.10)',
    'rgba(249,115,22,0.09)',
    'rgba(34,211,238,0.08)',
  ];

  orbs.forEach((orb, i) => {
    let t = 0;
    const speed = 0.003 + i * 0.001;
    function pulse() {
      t += speed;
      const idx1 = i % palette.length;
      const idx2 = (i + 1) % palette.length;
      // interpolate colour (approximate via opacity)
      const mix = (Math.sin(t) + 1) / 2;
      orb.style.opacity = 0.6 + mix * 0.4;
      requestAnimationFrame(pulse);
    }
    pulse();
  });
})();

// =====================================================
// 24. CANVAS — MOUSE REPEL ON PARTICLES (optional extra)
// =====================================================
// Already handled by trail and glow — particles are purely atmospheric.

// =====================================================
// 25. PAGE LOAD ENTRANCE
// =====================================================
(function initPageLoad() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.6s ease';
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });
})();

// ── Final console signature ──
console.log(
  '%c✦ Softzeno Tech %c— Built with precision.',
  'background: linear-gradient(90deg,#3b82f6,#a855f7,#ec4899); color: white; padding: 6px 12px; border-radius: 4px 0 0 4px; font-weight: bold;',
  'background: #07071a; color: #7b7b9a; padding: 6px 12px; border-radius: 0 4px 4px 0;'
);