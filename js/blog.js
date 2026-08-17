'use strict';


/* ─────────────────────────────────────────────────────────────
   1. BLOG POST DATA
   ───────────────────────────────────────────────────────────── */
const BLOG_POSTS = [
  {
    id: 1,
    title: '10 Best Debt Advice Companies UK (2026) – Escape Debt Faster Than You Think',
    category: 'Debt Advice',
    categorySlug: 'debt-advice',
    date: '21 July 2026',
    featured: false,
    image: 'blog-images/TOP-10-DEBT-SOLUTION-COMPANIES.jpeg',
    excerpt: 'Search demand for financial help is growing rapidly in the UK. Discover the top 10 debt advice companies and proven strategies to escape debt faster in 2026.',
    link: '/best-debt-advice-companies-uk'
  },
  {
    id: 2,
    title: 'Student Finance UK 2026: A Complete Guide to Student Loans, Maintenance & Managing Money',
    category: 'Financial Planning',
    categorySlug: 'financial-planning',
    date: '13 August 2026',
    featured: false,
    image: 'blog-images/uk-student-finance-2026.png',
    excerpt: 'Understand student finance UK 2026, including Maintenance Loans, Tuition Fee Loans, budgeting, repayments and what to do if student debt becomes difficult.',
    link: '/student-finance-uk-2026'
  }
];


/* ─────────────────────────────────────────────────────────────
   2. CATEGORY CONFIG
   ───────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { label: 'All Articles', slug: 'all' },
  { label: 'Debt Advice', slug: 'debt-advice' },
  { label: 'Financial Planning', slug: 'financial-planning' }
];

const CATEGORY_META = {
  'financial-planning': { color: '#1D3461', gradient: 'linear-gradient(135deg,#1D3461 0%,#2F5FA8 100%)', icon: 'fa-chart-line' },
  'debt-solutions':     { color: '#007237', gradient: 'linear-gradient(135deg,#007237 0%,#00A651 100%)', icon: 'fa-shield-halved' },
  'credit-tips':        { color: '#4F46E5', gradient: 'linear-gradient(135deg,#4338CA 0%,#6366F1 100%)', icon: 'fa-star' },
  'loans':              { color: '#0E7490', gradient: 'linear-gradient(135deg,#0E7490 0%,#0891B2 100%)', icon: 'fa-money-bill-wave' },
  'debt-advice':        { color: '#059669', gradient: 'linear-gradient(135deg,#047857 0%,#059669 100%)', icon: 'fa-handshake' }
};

function getCatMeta(slug) {
  return CATEGORY_META[slug] || CATEGORY_META['financial-planning'];
}


/* ─────────────────────────────────────────────────────────────
   3. HTML BUILDERS
   ───────────────────────────────────────────────────────────── */
function buildCardHTML(post) {
  const meta = getCatMeta(post.categorySlug);
  const href = post.link || `blog-post.html?id=${post.id}`;

  const imageArea = post.image
    ? `<a href="${href}" class="blog-card-image blog-card-img-real" aria-label="Read: ${post.title}">
        <img src="${post.image}" alt="${post.title}" loading="lazy" />
      </a>`
    : `<a href="${href}" class="blog-card-image" style="background:${meta.gradient}" aria-label="Read: ${post.title}">
        <i class="fa-solid ${meta.icon}" aria-hidden="true"></i>
      </a>`;

  return `
    <article class="blog-card" data-cat="${post.categorySlug}">
      ${imageArea}
      <div class="blog-card-body">
        <div class="bc-meta">
          <span><i class="fa-regular fa-calendar" aria-hidden="true"></i>${post.date}</span>
        </div>
        <h3><a href="${href}">${post.title}</a></h3>
        <p>${post.excerpt}</p>
        <a href="${href}" class="read-more-btn">
          Read More
          <svg viewBox="0 0 24 24" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
    </article>`;
}


/* ─────────────────────────────────────────────────────────────
   4. BLOG LISTING PAGE  (blog.html)
   ───────────────────────────────────────────────────────────── */
function initBlogListing() {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;

  const noResults = document.getElementById('noResults');

  function renderGrid(posts) {
    if (!posts.length) {
      grid.innerHTML = '';
      if (noResults) noResults.removeAttribute('hidden');
      return;
    }
    if (noResults) noResults.setAttribute('hidden', '');
    grid.innerHTML = posts.map(buildCardHTML).join('');
  }

  let activeFilter = 'all';
  let searchQuery  = '';

  function applyFilters() {
    let results = activeFilter === 'all'
      ? BLOG_POSTS
      : BLOG_POSTS.filter(p => p.categorySlug === activeFilter);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    renderGrid(results);
  }

  /* Category pills */
  const catsWrap = document.getElementById('blog-categories');
  if (catsWrap) {
    catsWrap.innerHTML = CATEGORIES.map(cat =>
      `<span class="cat-pill ${cat.slug === 'all' ? 'active' : ''}" data-cat="${cat.slug}">${cat.label}</span>`
    ).join('');

    catsWrap.addEventListener('click', e => {
      const pill = e.target.closest('.cat-pill');
      if (!pill) return;
      catsWrap.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.dataset.cat;
      applyFilters();
    });
  }

  /* Search — button + Enter */
  const searchInput = document.getElementById('blogSearch');
  const searchBtn   = document.getElementById('blogSearchBtn');

  function runSearch() {
    searchQuery = searchInput ? searchInput.value.trim() : '';
    applyFilters();
  }

  if (searchBtn) searchBtn.addEventListener('click', runSearch);
  if (searchInput) {
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') runSearch(); });
    searchInput.addEventListener('input', () => { if (!searchInput.value) runSearch(); });
  }

  renderGrid(BLOG_POSTS);
}


/* ─────────────────────────────────────────────────────────────
   5. BLOG POST PAGE — LEGACY DYNAMIC RENDERER (no-op on static page)
   ───────────────────────────────────────────────────────────── */
function initBlogPost() {
  /* Static blog-post.html no longer uses #post-content — exit cleanly */
  const contentEl = document.getElementById('post-content');
  if (!contentEl) return;

  const params = new URLSearchParams(window.location.search);
  const id     = parseInt(params.get('id'), 10);
  const post   = BLOG_POSTS.find(p => p.id === id);
  if (!post) { window.location.href = 'blog.html'; return; }

  document.title = `${post.title} | The Credit Advice Blog`;
}


/* ─────────────────────────────────────────────────────────────
   6. STATIC BLOG POST — FAQ ACCORDION
   ───────────────────────────────────────────────────────────── */
function initFAQAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });

    question.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); question.click(); }
    });
  });
}


/* ─────────────────────────────────────────────────────────────
   7. STATIC BLOG POST — CONTACT FORM + MODAL
   ───────────────────────────────────────────────────────────── */
function initBlogContactForm() {
  const form  = document.getElementById('blogContactForm');
  const modal = document.getElementById('thankYouModal');
  if (!form) return;

  const FIELDS = [
    { el: 'blogName',    err: 'err-name',    key: 'err-n' },
    { el: 'blogEmail',   err: 'err-email',   key: 'err-e' },
    { el: 'blogPhone',   err: 'err-phone',   key: 'err-p' },
    { el: 'blogMessage', err: 'err-message', key: 'err-m' }
  ];

  /* Clear error on input */
  FIELDS.forEach(({ el, err }) => {
    const input = document.getElementById(el);
    const errEl = document.getElementById(err);
    if (!input) return;
    input.addEventListener('input', () => {
      input.classList.remove('error');
      if (errEl) errEl.classList.remove('visible');
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const nameEl    = document.getElementById('blogName');
    const emailEl   = document.getElementById('blogEmail');
    const phoneEl   = document.getElementById('blogPhone');
    const messageEl = document.getElementById('blogMessage');
    const btn       = form.querySelector('button[type="submit"]');

    /* Validation */
    let valid = true;
    FIELDS.forEach(({ el, err }) => {
      const input = document.getElementById(el);
      const errEl = document.getElementById(err);
      if (!input) return;
      if (!input.value.trim()) {
        input.classList.add('error');
        if (errEl) errEl.classList.add('visible');
        valid = false;
      }
    });
    if (!valid) return;

    const original = btn.innerHTML;
    btn.disabled  = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Sending…';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: '50c7d8d6-52a5-4e41-b2dd-2b52971df52f',
          subject:    'Blog Enquiry – 10 Best Debt Advice Companies – The Credit Advice',
          to:         'advisor@thecreditadvice.co.uk',
          name:       nameEl.value.trim(),
          email:      emailEl.value.trim(),
          phone:      phoneEl.value.trim(),
          message:    messageEl.value.trim(),
          source:     'Blog Post Contact Form',
          page:       document.title
        })
      });
      const data = await res.json();
      if (data.success) {
        form.reset();
        if (modal) modal.classList.add('show');
      } else {
        throw new Error('Submission failed');
      }
    } catch {
      btn.disabled  = false;
      btn.innerHTML = original;
    }
  });
}

function initThankYouModal() {
  const modal    = document.getElementById('thankYouModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  if (!modal) return;

  function closeModal() { modal.classList.remove('show'); }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}


/* ─────────────────────────────────────────────────────────────
   8. STATIC BLOG POST — TOC ACTIVE HIGHLIGHT
   ───────────────────────────────────────────────────────────── */
function initStaticTOC() {
  const tocLinks = document.querySelectorAll('.blog-toc-list a');
  if (!tocLinks.length) return;

  const sections = [...tocLinks].map(link => {
    const id = link.getAttribute('href').replace('#', '');
    return document.getElementById(id);
  }).filter(Boolean);

  if (!sections.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(a => a.classList.remove('toc-active'));
        const activeLink = document.querySelector(`.blog-toc-list a[href="#${entry.target.id}"]`);
        if (activeLink) activeLink.classList.add('toc-active');
      }
    });
  }, { rootMargin: '-10% 0% -70% 0%', threshold: 0 });

  sections.forEach(s => observer.observe(s));
}


/* ─────────────────────────────────────────────────────────────
   9. SCROLL ANIMATIONS
   ───────────────────────────────────────────────────────────── */
const scrollObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      scrollObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

function initScrollAnimations() {
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    scrollObserver.observe(el);
  });
}


/* ─────────────────────────────────────────────────────────────
   10. NAVBAR
   ───────────────────────────────────────────────────────────── */
function initNavbar() {
  const nav       = document.getElementById('navbar');
  const hamburger = document.getElementById('nav-hamburger');
  const mobileNav = document.getElementById('nav-mobile');
  if (!nav) return;

  function onScroll() {
    if (window.scrollY > 50) {
      nav.classList.remove('transparent');
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
      nav.classList.add('transparent');
    }
  }
  if (nav.classList.contains('transparent')) {
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
}


/* ─────────────────────────────────────────────────────────────
   11. BACK TO TOP
   ───────────────────────────────────────────────────────────── */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}


/* ─────────────────────────────────────────────────────────────
   12. COOKIE BANNER
   ───────────────────────────────────────────────────────────── */
function initCookieBanner() {
  const banner  = document.getElementById('cookie-banner');
  const accept  = document.getElementById('cookie-accept');
  const decline = document.getElementById('cookie-decline');
  if (!banner) return;
  if (!localStorage.getItem('tca_cookie_consent')) {
    setTimeout(() => banner.classList.add('show'), 1500);
  }
  function dismiss(val) {
    localStorage.setItem('tca_cookie_consent', val);
    banner.classList.remove('show');
  }
  accept  && accept.addEventListener('click',  () => dismiss('accepted'));
  decline && decline.addEventListener('click', () => dismiss('declined'));
}


/* ─────────────────────────────────────────────────────────────
   13. NEWSLETTER FORM
   ───────────────────────────────────────────────────────────── */
function initNewsletterForm() {
  const form    = document.getElementById('newsletter-form');
  const success = document.getElementById('nl-success');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn   = form.querySelector('button[type="submit"]');
    const email = form.querySelector('input[type="email"]').value.trim();
    if (!email) return;

    const original = btn.innerHTML;
    btn.disabled   = true;
    btn.innerHTML  = '<i class="fa-solid fa-spinner fa-spin"></i> Subscribing…';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: '50c7d8d6-52a5-4e41-b2dd-2b52971df52f',
          subject: 'New Blog Newsletter Subscription – The Credit Advice',
          email,
          source: 'Blog Newsletter Form'
        })
      });
      const data = await res.json();
      if (data.success) {
        form.setAttribute('hidden', '');
        if (success) success.removeAttribute('hidden');
      } else {
        throw new Error('Failed');
      }
    } catch {
      btn.disabled  = false;
      btn.innerHTML = original;
    }
  });
}


/* ─────────────────────────────────────────────────────────────
   INIT
   ───────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  initBackToTop();
  initCookieBanner();
  initBlogListing();
  initBlogPost();
  initNewsletterForm();
  initFAQAccordion();
  initBlogContactForm();
  initThankYouModal();
  initStaticTOC();
});
