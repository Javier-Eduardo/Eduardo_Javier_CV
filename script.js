/**
 * Antigravity CV — script.js
 * Navigation logic, cursor glow, floating FX, mobile hamburger
 */

(function () {
  'use strict';

  /* ─── Initialise Feather Icons ─────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof feather !== 'undefined') feather.replace();
    initNavigation();
    initCursorGlow();
    initFloatingCards();
    initHamburger();
    initSkillStagger();
    initDynamicStats();   // ← counts DOM items at runtime
  });

  /* ─── SECTION NAVIGATION ───────────────────────────── */
  function initNavigation() {
    const navLinks  = document.querySelectorAll('.nav-link');
    const sections  = document.querySelectorAll('.section');
    const overlay   = document.getElementById('nav-overlay');
    const hamburger = document.getElementById('hamburger');

    navLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = link.dataset.section;
        if (!target) return;

        // Update active state on ALL matching nav links (sidebar + overlay)
        document.querySelectorAll(`.nav-link[data-section="${target}"]`)
          .forEach(l => l.classList.add('active'));
        document.querySelectorAll(`.nav-link:not([data-section="${target}"])`)
          .forEach(l => l.classList.remove('active'));

        // Hide all, show target
        sections.forEach(sec => {
          if (sec.id === `section-${target}`) {
            sec.removeAttribute('hidden');
            sec.classList.add('active');
            // Re-run stagger animation
            animateSectionIn(sec);
          } else {
            sec.setAttribute('hidden', '');
            sec.classList.remove('active');
          }
        });

        // Close mobile overlay if open
        if (overlay && overlay.classList.contains('open')) {
          closeOverlay(overlay, hamburger);
        }

        // Scroll content area to top on mobile
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
  }

  /* ─── ANIMATE SECTION IN ───────────────────────────── */
  function animateSectionIn(section) {
    section.style.animation = 'none';
    // Trigger reflow
    void section.offsetWidth;
    section.style.animation = '';
    section.style.animationName = 'sectionReveal';
    section.style.animationDuration = '0.55s';
    section.style.animationTimingFunction = 'cubic-bezier(0.4,0,0.2,1)';
    section.style.animationFillMode = 'both';

    // Stagger children
    const children = section.querySelectorAll(
      '.glass-card, .project-card, .timeline__item, .skill-tag, .edu-card, .speaking-card, .stat-card, .cert-card'
    );
    children.forEach((el, i) => {
      el.style.animationDelay = `${i * 80}ms`;
    });
  }

  /* ─── CUSTOM CURSOR GLOW ───────────────────────────── */
  function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow) return;

    let mouseX = 0, mouseY = 0;
    let glowX  = 0, glowY  = 0;
    let rafId;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Smooth trailing follow
    function lerp(a, b, t) { return a + (b - a) * t; }
    function tick() {
      glowX = lerp(glowX, mouseX, 0.14);
      glowY = lerp(glowY, mouseY, 0.14);
      glow.style.left = `${glowX}px`;
      glow.style.top  = `${glowY}px`;
      rafId = requestAnimationFrame(tick);
    }
    tick();

    // Scale up on interactive elements
    const interactives = document.querySelectorAll(
      'a, button, .nav-link, .project-card, .social-link, .skill-tag'
    );
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => {
        glow.style.transform = 'translate(-50%, -50%) scale(2.4)';
        glow.style.borderColor = '#81d4fa';
        glow.style.boxShadow = '0 0 22px rgba(79,195,247,0.6)';
      });
      el.addEventListener('mouseleave', () => {
        glow.style.transform = 'translate(-50%, -50%) scale(1)';
        glow.style.borderColor = '#4fc3f7';
        glow.style.boxShadow = '0 0 10px rgba(79,195,247,0.35)';
      });
    });

    // Hide when mouse leaves window
    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; });
  }

  /* ─── FLOATING CARD PHYSICS (tilt on hover) ─────────── */
  function initFloatingCards() {
    const cards = document.querySelectorAll('.project-card, .stat-card, .cert-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) / (rect.width  / 2); // -1 to 1
        const dy     = (e.clientY - cy) / (rect.height / 2); // -1 to 1
        const rotX   = -dy * 8;
        const rotY   =  dx * 8;
        card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
        card.style.boxShadow = `${-dx*12}px ${-dy*12}px 40px rgba(79,195,247,0.18)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });
  }

  /* ─── HAMBURGER / MOBILE OVERLAY ───────────────────── */
  function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const overlay   = document.getElementById('nav-overlay');
    const closeBtn  = document.getElementById('nav-close');
    if (!hamburger || !overlay) return;

    hamburger.addEventListener('click', () => {
      const isOpen = overlay.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeOverlay(overlay, hamburger));
    }

    // Close on backdrop click
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeOverlay(overlay, hamburger);
    });

    // Keyboard: Escape closes overlay
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        closeOverlay(overlay, hamburger);
      }
    });
  }

  function closeOverlay(overlay, hamburger) {
    overlay.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /* ─── DYNAMIC STATS ─────────────────────────────────── */
  function initDynamicStats() {
    // Years in IT: difference between current year and career start year
    const IT_START_YEAR = 2021;
    const yearsEl = document.getElementById('stat-years');
    if (yearsEl) {
      const years = new Date().getFullYear() - IT_START_YEAR;
      yearsEl.textContent = years + '+';
    }

    // Projects: count .project-item elements in the DOM
    const projectsEl = document.getElementById('stat-projects');
    if (projectsEl) {
      const count = document.querySelectorAll('.project-item').length;
      projectsEl.textContent = count;
    }

    // Speaking engagements: count .speaking-item elements in the DOM
    const speakingEl = document.getElementById('stat-speaking');
    if (speakingEl) {
      const count = document.querySelectorAll('.speaking-item').length;
      speakingEl.textContent = count;
    }
  }

  /* ─── SKILL TAG STAGGER ────────────────────────────── */
  function initSkillStagger() {
    const tags = document.querySelectorAll('.skill-tag');
    tags.forEach((tag, i) => {
      tag.style.animationDelay = `${i * 50}ms`;
    });
  }

  /* ─── INTERSECTION OBSERVER (lazy reveal) ───────────── */
  (function initRevealObserver() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    // Observe timeline items and cards that weren't in initial view
    document.querySelectorAll('.timeline__item, .speaking-card, .cert-card').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(el);
    });
  })();

})();
