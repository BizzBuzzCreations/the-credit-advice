/* =========================================================
   THE CREDIT ADVICE — LEGAL PAGES SCRIPT
   ========================================================= */

'use strict';

/* ── Navbar scroll (legal pages — always solid, no transparent hero overlay) */
(function() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  navbar.classList.add('scrolled');
  navbar.classList.remove('transparent');
  window.addEventListener('scroll', () => {
    navbar.classList.add('scrolled');
    navbar.classList.remove('transparent');
  }, { passive: true });

  const hamburger = document.querySelector('.nav-hamburger');
  const mobileNav = document.querySelector('.nav-mobile');
  hamburger && hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileNav && mobileNav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  document.querySelectorAll('.nav-mobile a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger && hamburger.classList.remove('open');
      mobileNav && mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

/* ── Table of Contents — active section highlight ───────── */
(function() {
  const tocLinks = document.querySelectorAll('.toc-item');
  if (!tocLinks.length) return;

  const sections = [...tocLinks].map(link => {
    const id = link.getAttribute('href').replace('#', '');
    return document.getElementById(id);
  }).filter(Boolean);

  const observer = new IntersectionObserver(entries => {
    let lastVisible = null;
    entries.forEach(entry => {
      if (entry.isIntersecting) lastVisible = entry.target;
    });
    if (lastVisible) {
      tocLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + lastVisible.id);
      });
    }
  }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));

  /* Smooth scroll for TOC links */
  tocLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

/* ── Back to top ────────────────────────────────────────── */
(function() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── Print button ───────────────────────────────────────── */
(function() {
  const printBtn = document.querySelector('.toc-print-btn');
  printBtn && printBtn.addEventListener('click', () => window.print());
})();

/* ── Cookie banner ──────────────────────────────────────── */
(function() {
  const banner = document.getElementById('cookie-banner');
  if (!banner || localStorage.getItem('cookies-accepted')) return;
  setTimeout(() => banner.classList.add('show'), 2000);
  const accept  = document.getElementById('cookie-accept');
  const decline = document.getElementById('cookie-decline');
  function dismiss(v) {
    localStorage.setItem('cookies-accepted', v);
    banner.classList.remove('show');
    setTimeout(() => banner.remove(), 500);
  }
  accept  && accept.addEventListener('click', () => dismiss('all'));
  decline && decline.addEventListener('click', () => dismiss('necessary'));
})();
