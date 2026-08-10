/* =========================================================
   THE CREDIT ADVICE — MAIN SCRIPT
   ========================================================= */

'use strict';

/* ── Utility ─────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── 1. NAVIGATION ──────────────────────────────────────── */
(function initNav() {
  const navbar  = $('#navbar');
  const hamburger = $('.nav-hamburger');
  const mobileNav = $('.nav-mobile');
  const mobileLinks = $$('.nav-mobile a');

  function setScrolled() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
      navbar.classList.remove('transparent');
    } else {
      navbar.classList.remove('scrolled');
      navbar.classList.add('transparent');
    }
  }
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  }

  mobileLinks.forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target) && !mobileNav.contains(e.target)) closeMenu();
  });

  /* Active link on scroll */
  const sections = $$('section[id]');
  const navLinks  = $$('.nav-links a[href^="#"], .nav-mobile a[href^="#"]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = '#' + entry.target.id;
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();

/* ── 2. SMOOTH SCROLL ───────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ── 3. SCROLL REVEAL ───────────────────────────────────── */
(function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
    observer.observe(el);
  });
})();

/* ── 4. COUNTER ANIMATION ───────────────────────────────── */
(function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const DURATION = 2000;

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.count);
    const suffix   = el.dataset.suffix || '';
    const prefix   = el.dataset.prefix || '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      const value    = target * easeOut(progress);
      el.textContent = prefix + value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ── 5. TESTIMONIAL SLIDER ──────────────────────────────── */
(function initTestimonials() {
  const track   = $('.testimonials-track');
  const wrapper = $('.testimonials-wrapper');
  const cards   = $$('.testimonial-card');
  const dots    = $$('.tn-dot');
  const prevBtn = $('#tn-prev');
  const nextBtn = $('#tn-next');
  if (!track || !cards.length) return;

  const GAP = 20;
  let current = 0;
  let autoId;

  const visibleCount = () => window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;

  /* Set exact pixel widths on every card from the wrapper's real width */
  function applyCardWidths() {
    const visible = visibleCount();
    const w = Math.floor((wrapper.offsetWidth - GAP * (visible - 1)) / visible);
    cards.forEach(c => {
      c.style.minWidth = w + 'px';
      c.style.maxWidth = w + 'px';
    });
    return w;
  }

  function goTo(index) {
    const visible = visibleCount();
    const max     = Math.max(0, cards.length - visible);
    current       = Math.max(0, Math.min(index, max));

    const w     = applyCardWidths();
    const stepW = w + GAP;
    track.style.transform = `translateX(-${current * stepW}px)`;

    cards.forEach((c, i) => c.classList.toggle('active', i === current));
    dots.forEach((d, i)  => d.classList.toggle('active', i === current));
  }

  function prev() { goTo(current - 1); resetAuto(); }
  function next() {
    const max = cards.length - visibleCount();
    goTo(current + 1 > max ? 0 : current + 1);
    resetAuto();
  }

  function startAuto() {
    autoId = setInterval(() => {
      const max = cards.length - visibleCount();
      goTo(current + 1 > max ? 0 : current + 1);
    }, 5000);
  }
  function resetAuto() { clearInterval(autoId); startAuto(); }

  prevBtn && prevBtn.addEventListener('click', prev);
  nextBtn && nextBtn.addEventListener('click', next);
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); resetAuto(); }));

  /* Touch swipe */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  });

  /* Recalculate on resize */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => goTo(current), 100);
  });

  applyCardWidths();
  goTo(0);
  startAuto();
})();

/* ── 6. FAQ ACCORDION ───────────────────────────────────── */
(function initFAQ() {
  const items = $$('.faq-item');
  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      items.forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-answer').style.maxHeight = '0';
      });
      // Open clicked (if was closed)
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
    // ARIA
    question.setAttribute('aria-expanded', 'false');
    question.setAttribute('role', 'button');
    item.querySelector('.faq-answer').setAttribute('role', 'region');
  });

  // Update aria on toggle
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      if (m.target.classList) {
        const q = m.target.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', m.target.classList.contains('open') ? 'true' : 'false');
      }
    });
  });
  items.forEach(i => observer.observe(i, { attributes: true, attributeFilter: ['class'] }));
})();

/* ── 7. CONTACT FORM ────────────────────────────────────── */
(function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  const successEl = form.parentElement.querySelector('.form-success');

  function validateField(field) {
    const val   = field.value.trim();
    const group = field.closest('.form-group');
    let errEl   = group.querySelector('.form-error');

    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'form-error';
      group.appendChild(errEl);
    }

    field.classList.remove('error');
    errEl.textContent = '';

    if (field.required && !val) {
      field.classList.add('error');
      errEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> This field is required';
      return false;
    }
    if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      field.classList.add('error');
      errEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a valid email address';
      return false;
    }
    if (field.type === 'tel' && val && !/^[\d\s\+\-\(\)]{7,}$/.test(val)) {
      field.classList.add('error');
      errEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a valid phone number';
      return false;
    }
    return true;
  }

  form.querySelectorAll('.form-control').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) validateField(field);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const fields = [...form.querySelectorAll('.form-control[required], .form-control[type="email"], .form-control[type="tel"]')];
    const valid  = fields.map(validateField).every(Boolean);

    const consent = form.querySelector('#cf-consent');
    const consentError = document.querySelector('#consent-error');
    let consentOk = true;
    if (consent && !consent.checked) {
      if (consentError) consentError.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> You must agree to the Privacy Policy';
      consentOk = false;
    } else if (consentError) {
      consentError.textContent = '';
    }

    if (!valid || !consentOk) return;

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';

    const data = {};
    new FormData(form).forEach((v, k) => { data[k] = v; });
    data['access_key'] = '50c7d8d6-52a5-4e41-b2dd-2b52971df52f';
    data['subject']    = 'New Contact Form – The Credit Advice';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        form.style.display = 'none';
        if (successEl) successEl.style.display = 'block';
      } else {
        throw new Error('Server error');
      }
    } catch {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
      alert('Sorry, something went wrong. Please call us on +44 7307228634.');
    }
  });
})();

/* ── 8. GUIDANCE MODAL ──────────────────────────────────── */
(function initGuidanceModal() {
  const overlay = document.getElementById('guidance-modal');
  if (!overlay) return;

  const popForm    = document.getElementById('popup-form');
  const popSuccess = document.getElementById('popup-success');

  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    const first = overlay.querySelector('#pop-firstname');
    if (first) setTimeout(() => first.focus(), 100);
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.open-guidance-modal').forEach(btn => {
    btn.addEventListener('click', e => { e.preventDefault(); openModal(); });
  });

  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  overlay.querySelector('.modal-close').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeModal();
  });

  function validatePopField(field) {
    const val   = field.value.trim();
    const group = field.closest('.form-group');
    let errEl   = group.querySelector('.form-error');
    if (!errEl) { errEl = document.createElement('span'); errEl.className = 'form-error'; group.appendChild(errEl); }
    field.classList.remove('error');
    errEl.textContent = '';
    if (field.required && !val) {
      field.classList.add('error');
      errEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> This field is required';
      return false;
    }
    if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      field.classList.add('error');
      errEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a valid email address';
      return false;
    }
    if (field.type === 'tel' && val && !/^[\d\s\+\-\(\)]{7,}$/.test(val)) {
      field.classList.add('error');
      errEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a valid phone number';
      return false;
    }
    return true;
  }

  popForm.querySelectorAll('.form-control').forEach(field => {
    field.addEventListener('blur', () => validatePopField(field));
    field.addEventListener('input', () => { if (field.classList.contains('error')) validatePopField(field); });
  });

  popForm.addEventListener('submit', async e => {
    e.preventDefault();
    const fields   = [...popForm.querySelectorAll('.form-control[required], .form-control[type="email"], .form-control[type="tel"]')];
    const valid    = fields.map(validatePopField).every(Boolean);
    const consent  = popForm.querySelector('#pop-consent');
    const cErr     = popForm.querySelector('#pop-consent-error');
    let consentOk  = true;
    if (consent && !consent.checked) {
      if (cErr) cErr.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> You must agree to the Privacy Policy';
      consentOk = false;
    } else if (cErr) { cErr.textContent = ''; }
    if (!valid || !consentOk) return;

    const submitBtn = popForm.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';

    const data = {};
    new FormData(popForm).forEach((v, k) => { data[k] = v; });
    data['access_key'] = '50c7d8d6-52a5-4e41-b2dd-2b52971df52f';
    data['subject']    = 'New Guidance Request – The Credit Advice';

    try {
      const res  = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        popForm.style.display = 'none';
        if (popSuccess) popSuccess.style.display = 'block';
      } else { throw new Error('Server error'); }
    } catch {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
      alert('Sorry, something went wrong. Please call us on +44 7307228634.');
    }
  });
})();

/* ── 9. AUTO LEAD POPUP ─────────────────────────────────── */
(function initLeadPopup() {
  const overlay = document.getElementById('lead-popup');
  if (!overlay) return;

  const lpForm    = document.getElementById('lead-popup-form');
  const lpSuccess = document.getElementById('lead-popup-success');

  function closePopup() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    sessionStorage.setItem('lead-popup-shown', '1');
  }

  if (!sessionStorage.getItem('lead-popup-shown')) {
    setTimeout(() => {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }, 5000);
  }

  overlay.querySelector('.lead-popup-close').addEventListener('click', closePopup);
  overlay.addEventListener('click', e => { if (e.target === overlay) closePopup(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closePopup();
  });

  function validateLpField(field) {
    const val   = field.value.trim();
    const group = field.closest('.form-group');
    let errEl   = group.querySelector('.form-error');
    if (!errEl) { errEl = document.createElement('span'); errEl.className = 'form-error'; group.appendChild(errEl); }
    field.classList.remove('error');
    errEl.textContent = '';
    if (field.required && !val) {
      field.classList.add('error');
      errEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> This field is required';
      return false;
    }
    if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      field.classList.add('error');
      errEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a valid email address';
      return false;
    }
    if (field.type === 'tel' && val && !/^[\d\s\+\-\(\)]{7,}$/.test(val)) {
      field.classList.add('error');
      errEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a valid phone number';
      return false;
    }
    return true;
  }

  lpForm.querySelectorAll('.form-control').forEach(field => {
    field.addEventListener('blur', () => validateLpField(field));
    field.addEventListener('input', () => { if (field.classList.contains('error')) validateLpField(field); });
  });

  lpForm.addEventListener('submit', async e => {
    e.preventDefault();
    const fields  = [...lpForm.querySelectorAll('.form-control[required], .form-control[type="email"], .form-control[type="tel"]')];
    const valid   = fields.map(validateLpField).every(Boolean);
    const consent = lpForm.querySelector('#lp-consent');
    const cErr    = lpForm.querySelector('#lp-consent-error');
    let consentOk = true;
    if (consent && !consent.checked) {
      if (cErr) cErr.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> You must agree to the Privacy Policy';
      consentOk = false;
    } else if (cErr) { cErr.textContent = ''; }
    if (!valid || !consentOk) return;

    const submitBtn = lpForm.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting…';

    const data = {};
    new FormData(lpForm).forEach((v, k) => { data[k] = v; });
    data['access_key'] = '50c7d8d6-52a5-4e41-b2dd-2b52971df52f';
    data['subject']    = 'Quick Enquiry – The Credit Advice';

    try {
      const res  = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        lpForm.style.display = 'none';
        if (lpSuccess) lpSuccess.style.display = 'block';
      } else { throw new Error('Server error'); }
    } catch {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit';
      alert('Sorry, something went wrong. Please call us on +44 7307228634.');
    }
  });
})();

/* ── 10. BACK TO TOP ────────────────────────────────────── */
(function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── 10. COOKIE BANNER ──────────────────────────────────── */
(function initCookieBanner() {
  const banner = $('#cookie-banner');
  if (!banner) return;
  if (localStorage.getItem('cookies-accepted')) return;

  setTimeout(() => banner.classList.add('show'), 2000);

  const acceptBtn = $('#cookie-accept');
  const declineBtn = $('#cookie-decline');

  function dismiss(accepted) {
    localStorage.setItem('cookies-accepted', accepted ? 'all' : 'necessary');
    banner.classList.remove('show');
    setTimeout(() => banner.remove(), 500);
  }

  acceptBtn  && acceptBtn.addEventListener('click', () => dismiss(true));
  declineBtn && declineBtn.addEventListener('click', () => dismiss(false));
})();

/* ── 10. PARALLAX ORBS (light, desktop only) ────────────── */
(function initParallax() {
  if (window.innerWidth < 1024) return;
  const orbs = $$('.hero-orb-1, .hero-orb-2');
  window.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    orbs.forEach((orb, i) => {
      const factor = i === 0 ? 20 : -12;
      orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  }, { passive: true });
})();

/* ── 11. PHONE NUMBER FORMATTING ────────────────────────── */
(function initPhoneFormat() {
  const phoneInput = document.querySelector('input[type="tel"]');
  if (!phoneInput) return;
  phoneInput.addEventListener('input', e => {
    let v = e.target.value.replace(/[^\d\s\+\-\(\)]/g, '');
    e.target.value = v;
  });
})();

/* ── 12. DEBT REPAYMENT CALCULATOR ───────────────────────── */
(function () {
  const calcForm = document.getElementById('calcForm');
  if (calcForm) {
    calcForm.addEventListener('submit', function(e) {
      e.preventDefault();
      calculateDebt();
    });
    // Also recalculate on Enter key in inputs
    calcForm.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') calculateDebt();
      });
    });
  }

  function calculateDebt() {
    const totalDebt = parseFloat(document.getElementById('totalDebt')?.value);
    const interestRate = parseFloat(document.getElementById('interestRate')?.value);
    const monthlyPayment = parseFloat(document.getElementById('monthlyPayment')?.value);
    const resultsEl = document.getElementById('calcResults');
    const placeholderEl = document.getElementById('calcPlaceholder');

    if (!totalDebt || !interestRate || !monthlyPayment || totalDebt <= 0 || monthlyPayment <= 0) {
      showCalcError('Please enter valid values for all fields.');
      return;
    }

    const monthlyRate = interestRate / 100 / 12;
    let balance = totalDebt;
    let months = 0;
    let totalPaid = 0;

    if (monthlyRate === 0) {
      months = Math.ceil(totalDebt / monthlyPayment);
      totalPaid = monthlyPayment * months;
    } else {
      const minPayment = balance * monthlyRate;
      if (monthlyPayment <= minPayment) {
        showCalcError('Monthly payment must exceed the minimum interest charge of £' + minPayment.toFixed(2) + '. Please increase your payment.');
        return;
      }
      while (balance > 0 && months < 600) {
        const interest = balance * monthlyRate;
        const principal = Math.min(monthlyPayment - interest, balance);
        balance -= principal;
        totalPaid += monthlyPayment;
        months++;
        if (balance <= 0.01) break;
      }
    }

    const totalInterest = Math.max(0, totalPaid - totalDebt);
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    let timeStr = '';
    if (years > 0) timeStr += years + ' year' + (years > 1 ? 's' : '');
    if (years > 0 && remMonths > 0) timeStr += ', ';
    if (remMonths > 0) timeStr += remMonths + ' month' + (remMonths > 1 ? 's' : '');

    if (placeholderEl) placeholderEl.style.display = 'none';
    if (resultsEl) {
      resultsEl.style.display = 'flex';
      document.getElementById('resultMonths').textContent = timeStr;
      document.getElementById('resultTotal').textContent = '£' + totalPaid.toLocaleString('en-GB', {minimumFractionDigits:2,maximumFractionDigits:2});
      document.getElementById('resultInterest').textContent = '£' + totalInterest.toLocaleString('en-GB', {minimumFractionDigits:2,maximumFractionDigits:2});
    }
  }

  function showCalcError(msg) {
    const resultsEl = document.getElementById('calcResults');
    const placeholderEl = document.getElementById('calcPlaceholder');
    if (placeholderEl) { placeholderEl.style.display = 'flex'; }
    if (resultsEl) resultsEl.style.display = 'none';
    const errEl = document.getElementById('calcError');
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
    setTimeout(() => { if (errEl) errEl.style.display = 'none'; }, 4000);
  }
})();
