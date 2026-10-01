/* ==========================================================================
   Aurora — landing page behaviour
   Vanilla JS, no dependencies. Everything degrades gracefully:
   if JS is unavailable the page still reads and the FAQ answers stay openable.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var prefersReduced = function () { return reduceMotion; };

  /* ----------------------------------------------------------------------
     Sticky nav: glass background on scroll + mobile menu
     ---------------------------------------------------------------------- */
  (function nav() {
    var bar = document.getElementById('nav');
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (!bar || !toggle || !links) return;

    var onScroll = function () {
      bar.classList.toggle('is-stuck', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var setOpen = function (open) {
      bar.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close the menu when a link is chosen, and on Escape for keyboard users.
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && bar.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Leaving the mobile breakpoint should never leave the menu stuck open.
    if (window.matchMedia('(min-width: 900px)').matches) setOpen(false);
  })();

  /* ----------------------------------------------------------------------
     Hero typing effect
     ---------------------------------------------------------------------- */
  (function typing() {
    var el = document.getElementById('typed');
    if (!el) return;

    var phrases;
    try { phrases = JSON.parse(el.dataset.typed || '[]'); } catch (err) { phrases = []; }
    if (!phrases.length) return;

    var caret = el.parentElement ? el.parentElement.querySelector('.caret') : null;

    // Static fallback: show the first phrase, no animation.
    if (prefersReduced()) {
      el.textContent = phrases[0];
      if (caret) caret.classList.add('is-done');
      return;
    }

    var typeMs = 62;
    var eraseMs = 32;
    var holdMs = 1900;
    var phrase = 0;
    var chars = 0;
    var deleting = false;

    var tick = function () {
      var text = phrases[phrase];
      chars += deleting ? -1 : 1;
      el.textContent = text.slice(0, chars);

      var wait = deleting ? eraseMs : typeMs;
      var done = !deleting && chars === text.length;
      var cleared = deleting && chars === 0;

      if (done) {
        wait = holdMs;
        deleting = true;
      } else if (cleared) {
        deleting = false;
        phrase = (phrase + 1) % phrases.length;
        wait = 320;
      }
      window.setTimeout(tick, wait);
    };

    window.setTimeout(tick, 450);
  })();

  /* ----------------------------------------------------------------------
     Fade-in on scroll
     Siblings inside a group are staggered slightly for a smoother cascade.
     ---------------------------------------------------------------------- */
  (function reveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    if (!('IntersectionObserver' in window) || prefersReduced()) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    // Opt in to the hidden state only now, so a script failure leaves content visible.
    document.documentElement.classList.add('js-reveal');

    var groups = new Map();
    items.forEach(function (el) {
      var parent = el.parentElement;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent).push(el);
    });
    groups.forEach(function (group) {
      group.forEach(function (el, i) {
        el.style.setProperty('--reveal-delay', Math.min(i, 5) * 90 + 'ms');
      });
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { observer.observe(el); });
  })();

  /* ----------------------------------------------------------------------
     FAQ accordion — one open at a time, fully keyboard accessible
     ---------------------------------------------------------------------- */
  (function accordion() {
    var root = document.getElementById('accordion');
    if (!root) return;

    // Only now collapse the panels; without this flag they stay laid out open.
    document.documentElement.classList.add('js-accordion');

    var questions = Array.prototype.slice.call(root.querySelectorAll('.faq__q'));

    // Measure the natural height with the clamp lifted, so the transition matches the content.
    var naturalHeight = function (panel) {
      var previousMax = panel.style.maxHeight;
      panel.style.maxHeight = 'none';
      var height = panel.scrollHeight;
      panel.style.maxHeight = previousMax;
      return height;
    };

    var setState = function (btn, open) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var item = btn.closest('.faq');
      if (!panel || !item) return;

      btn.setAttribute('aria-expanded', String(open));
      item.classList.toggle('is-open', open);
      panel.style.maxHeight = open ? naturalHeight(panel) + 'px' : '0px';
      panel.setAttribute('aria-hidden', String(!open));
    };

    questions.forEach(function (btn) {
      setState(btn, false);

      btn.addEventListener('click', function () {
        var willOpen = btn.getAttribute('aria-expanded') !== 'true';
        questions.forEach(function (other) { setState(other, false); });
        setState(btn, willOpen);
      });
    });

    // Reflow open panels when the viewport width changes the text wrapping.
    var reflow = function () {
      questions.forEach(function (btn) {
        if (btn.getAttribute('aria-expanded') !== 'true') return;
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (panel) panel.style.maxHeight = naturalHeight(panel) + 'px';
      });
    };

    var resizeTimer;
    window.addEventListener('resize', function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(reflow, 150);
    });

    // Late-loading webfonts change the wrapped height after first paint.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(reflow).catch(function () { /* font loading failed; height stays valid */ });
    }

    // Arrow-key navigation between questions, as expected of a disclosure list.
    root.addEventListener('keydown', function (e) {
      var i = questions.indexOf(document.activeElement);
      if (i === -1) return;

      var target = null;
      if (e.key === 'ArrowDown') target = questions[(i + 1) % questions.length];
      else if (e.key === 'ArrowUp') target = questions[(i - 1 + questions.length) % questions.length];
      else if (e.key === 'Home') target = questions[0];
      else if (e.key === 'End') target = questions[questions.length - 1];
      else return;

      e.preventDefault();
      target.focus();
    });
  })();

  /* ----------------------------------------------------------------------
     Smooth scroll — offsets correctly for the sticky header on every browser
     ---------------------------------------------------------------------- */
  (function smoothScroll() {
    var navHeight = function () {
      var bar = document.getElementById('nav');
      return bar ? bar.offsetHeight : 72;
    };

    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var id = link.getAttribute('href');
      if (!id || id === '#') return;

      var target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      var top = target.getBoundingClientRect().top + window.scrollY - navHeight() - 12;
      var behavior = prefersReduced() ? 'auto' : 'smooth';

      window.scrollTo({ top: Math.max(top, 0), behavior: behavior });

      // Move keyboard focus with the viewport so the next Tab continues sensibly.
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });

      if (history.replaceState) history.replaceState(null, '', id);
    });
  })();

  /* ----------------------------------------------------------------------
     Footer year — keeps the copyright honest without a build step
     ---------------------------------------------------------------------- */
  (function year() {
    var el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  })();

})();
