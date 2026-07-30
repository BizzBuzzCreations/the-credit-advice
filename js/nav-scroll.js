'use strict';

/* Keeps homepage section links (About/Services/etc.) working without ever
   showing a #hash in the address bar — from the homepage itself or from any
   other page. Does NOT touch other same-page anchors (e.g. a blog post's own
   table of contents), which should keep normal, shareable #hash links. */
(function () {
  var STORAGE_KEY = 'tca-scroll-target';

  function scrollToId(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  function isHomePath(pathname) {
    return pathname === '/' || pathname === '/index.html';
  }

  // Page loaded with a hash already in the URL (e.g. an old shared link) —
  // scroll to it once, then strip it from the address bar.
  if (window.location.hash) {
    var loadedId = window.location.hash.slice(1);
    window.addEventListener('load', function () {
      var el = document.getElementById(loadedId);
      if (el) el.scrollIntoView({ behavior: 'auto' });
      history.replaceState(null, '', window.location.pathname + window.location.search);
    });
  }

  // Resume a cross-page scroll requested before navigating here.
  var pending = sessionStorage.getItem(STORAGE_KEY);
  if (pending) {
    sessionStorage.removeItem(STORAGE_KEY);
    window.addEventListener('load', function () {
      scrollToId(pending);
    });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="#"]');
    if (!a) return;

    var href = a.getAttribute('href');
    if (!href || href === '#') return;

    var hashIndex = href.indexOf('#');
    var pathPart = href.slice(0, hashIndex);
    var id = href.slice(hashIndex + 1);
    if (!id) return;

    var destUrl = new URL(pathPart || '.', window.location.href);
    if (!isHomePath(destUrl.pathname)) return;

    var here = window.location;
    e.preventDefault();

    if (isHomePath(here.pathname)) {
      scrollToId(id);
      history.replaceState(null, '', here.pathname + here.search);
    } else {
      sessionStorage.setItem(STORAGE_KEY, id);
      window.location.href = '/';
    }
  });
})();
