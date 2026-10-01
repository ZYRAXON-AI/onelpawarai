/* ==========================================================================
   Nova — landing page behaviour
   Plain ES2018-compatible vanilla JS. No dependencies, no build step.

   Modules:
     1. Small shared helpers
     2. Sticky nav state
     3. Mobile navigation
     4. Smooth scrolling + scroll spy
     5. Hero typing effect
     6. Animated stat counters
     7. FAQ accordion
     8. Fade-in on scroll
     9. Footer year
    10. Bootstrap
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. Small shared helpers
     ------------------------------------------------------------------ */

  /** querySelector shorthand. */
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  /** querySelectorAll shorthand, returned as a real array. */
  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  /** True when the visitor asked the OS to reduce motion. */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** Clamp a number between a low and high value. */
  function clamp(value, low, high) {
    return Math.min(Math.max(value, low), high);
  }

  /* ------------------------------------------------------------------
     2. Sticky nav state
     Adds .is-stuck once the page has scrolled, which solidifies the
     glass background so text stays readable over bright sections.
     ------------------------------------------------------------------ */
  function initStickyNav() {
    var nav = $('#nav');
    if (!nav) return;

    var ticking = false;

    function update() {
      nav.classList.toggle('is-stuck', window.scrollY > 8);
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );

    update();
  }

  /* ------------------------------------------------------------------
     3. Mobile navigation
     ------------------------------------------------------------------ */
  function initMobileNav() {
    var toggle = $('#navToggle');
    var menu = $('#navMenu');
    if (!toggle || !menu) return;

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('is-open', open);
    }

    function isOpen() {
      return toggle.getAttribute('aria-expanded') === 'true';
    }

    toggle.addEventListener('click', function () {
      setOpen(!isOpen());
    });

    // Close when a link inside the menu is chosen
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    // Close on Escape, and return focus to the button
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Close when clicking outside the header
    document.addEventListener('click', function (event) {
      if (isOpen() && !event.target.closest('.nav')) setOpen(false);
    });

    // If the layout grows back to desktop, reset the collapsed state
    window.addEventListener('resize', function () {
      if (window.innerWidth > 880 && isOpen()) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------
     4. Smooth scrolling + scroll spy
     Anchors are intercepted so we can (a) offset for the sticky nav,
     (b) close the mobile menu, and (c) honour reduced motion.
     ------------------------------------------------------------------ */
  function initSmoothScroll() {
    var navHeight = 68;

    function offset() {
      var nav = $('#nav');
      return nav ? nav.offsetHeight : navHeight;
    }

    function scrollToTarget(target) {
      var top = target.getBoundingClientRect().top + window.scrollY - offset() - 12;
      window.scrollTo({
        top: clamp(top, 0, document.documentElement.scrollHeight),
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });
    }

    /**
     * Focus a section once scrolling has come to rest.
     * Prefers the `scrollend` event, with a timer fallback for browsers
     * that do not implement it. `once` listeners are cleaned up either way.
     */
    function focusWhenSettled(target) {
      var done = false;

      function finish() {
        if (done) return;
        done = true;
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }

      if (prefersReducedMotion()) {
        finish();
        return;
      }

      if ('onscrollend' in window) {
        window.addEventListener('scrollend', finish, { once: true });
      }
      // Fallback in case scrollend is unsupported or never fires
      window.setTimeout(finish, 900);
    }

    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href^="#"]');
      if (!link) return;

      var hash = link.getAttribute('href');
      if (!hash || hash === '#') return;

      var target = document.getElementById(hash.slice(1));
      if (!target) return;

      event.preventDefault();
      scrollToTarget(target);

      if (history.replaceState) history.replaceState(null, '', hash);

      // Move focus to the section for keyboard and screen-reader users, but
      // only AFTER the smooth scroll has settled. Calling focus() while a
      // smooth scroll is still animating aborts it and leaves the page
      // stranded part-way down.
      focusWhenSettled(target);
    });

    // Scroll spy — highlight the section currently in view
    var links = $$('.nav__link[href^="#"]');
    var sections = links
      .map(function (link) {
        return document.getElementById(link.getAttribute('href').slice(1));
      })
      .filter(Boolean);

    if (!sections.length) return;

    var ticking = false;

    function spy() {
      var line = window.scrollY + offset() + 80;
      var currentId = '';

      sections.forEach(function (section) {
        if (section.offsetTop <= line) currentId = section.id;
      });

      links.forEach(function (link) {
        link.classList.toggle(
          'is-active',
          link.getAttribute('href') === '#' + currentId
        );
      });
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(spy);
        }
      },
      { passive: true }
    );

    spy();
  }

  /* ------------------------------------------------------------------
     5. Hero typing effect
     Types each phrase, holds it, deletes it, moves to the next.
     The static fallback text in the HTML is swapped in when the visitor
     prefers reduced motion, so the headline is never blank.
     ------------------------------------------------------------------ */
  var TYPING = {
    phrases: [
      'actually matters.',
      'deserves your best hours.',
      'matters most.',
      'you said matters.'
    ],
    typeSpeed: 62,
    deleteSpeed: 34,
    holdTime: 1900,
    startDelay: 900
  };

  function initTyping() {
    var target = $('#typed');
    var wrapper = $('.hero__typed-wrap');
    var fallback = $('#typedFallback');
    if (!target) return;

    // Reduced motion: show the first phrase statically.
    if (prefersReducedMotion()) {
      target.textContent = TYPING.phrases[0];
      if (fallback) fallback.textContent = '';
      return;
    }

    var phraseIndex = 0;
    var charIndex = 0;
    var deleting = false;
    var timer = null;

    /** Keep the underline in step with the typed text. */
    function syncUnderline() {
      if (!wrapper) return;
      var text = target.textContent || '';
      // Average glyph width of this headline is close to 0.5em
      wrapper.style.setProperty('--typed-width', (text.length * 0.5).toFixed(2) + 'em');
    }

    function tick() {
      var phrase = TYPING.phrases[phraseIndex];
      var current = target.textContent;

      if (!deleting) {
        charIndex += 1;
        target.textContent = phrase.slice(0, charIndex);
        syncUnderline();

        if (charIndex >= phrase.length) {
          deleting = true;
          timer = window.setTimeout(tick, TYPING.holdTime);
          return;
        }
        timer = window.setTimeout(tick, TYPING.typeSpeed + Math.random() * 55);
        return;
      }

      charIndex -= 1;
      target.textContent = phrase.slice(0, Math.max(charIndex, 0));
      syncUnderline();

      if (charIndex <= 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % TYPING.phrases.length;
        timer = window.setTimeout(tick, 320);
        return;
      }
      timer = window.setTimeout(tick, TYPING.deleteSpeed);
    }

    // Only animate while the hero is on screen — no wasted timers
    timer = window.setTimeout(tick, TYPING.startDelay);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              if (timer === null) tick();
            } else if (timer !== null) {
              window.clearTimeout(timer);
              timer = null;
            }
          });
        },
        { threshold: 0.1 }
      ).observe(target);
    }
  }

  /* ------------------------------------------------------------------
     6. Animated stat counters
     Counts up to the value in data-count, adding data-suffix at the end.
     Each counter is marked as finished once it runs, and a fallback pass
     guarantees none is ever left showing a bare "0" if the observer does
     not fire (deep link, restored scroll position, very short viewport).
     ------------------------------------------------------------------ */
  function initCounters() {
    var counters = $$('[data-count]');
    if (!counters.length) return;

    var done = counters.map(function () { return false; });

    /** 12400000 -> "12,400,000" */
    function format(value) {
      return Math.round(value).toLocaleString('en-US');
    }

    function run(index) {
      var el = counters[index];
      if (done[index]) return;
      done[index] = true;

      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1500;
      var start = null;

      if (prefersReducedMotion()) {
        el.textContent = format(target) + suffix;
        return;
      }

      function step(timestamp) {
        if (start === null) start = timestamp;
        var progress = clamp((timestamp - start) / duration, 0, 1);
        // easeOutCubic
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = format(target * eased) + suffix;
        if (progress < 1) window.requestAnimationFrame(step);
      }

      window.requestAnimationFrame(step);
    }

    // With reduced motion there is no count-up to watch, so show the final
    // values straight away rather than waiting for the element to scroll in.
    if (prefersReducedMotion()) {
      counters.forEach(function (_, i) { run(i); });
      return;
    }

    if (!('IntersectionObserver' in window)) {
      counters.forEach(function (_, i) { run(i); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          run(counters.indexOf(entry.target));
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) { observer.observe(el); });

    // Anything already on screen should count immediately.
    counters.forEach(function (el, i) {
      if (el.getBoundingClientRect().top < window.innerHeight) run(i);
    });

    // Last-resort net: no stat may stay on its placeholder "0".
    window.setTimeout(function () {
      counters.forEach(function (_, i) { run(i); });
    }, 4000);
  }

  /* ------------------------------------------------------------------
     7. FAQ accordion
     Each panel animates from 0 to its measured height, then releases to
     "auto" so long answers can still reflow when the window resizes.
     One panel open at a time, and the trigger keeps aria-expanded honest.

     Every deferred callback (transitionend + fallback timer) is tied to a
     per-panel token and cancelled on close. Without that, a transition
     left over from opening would fire after the close and force the panel
     back to height:auto, leaving it visually open but reporting collapsed.
     ------------------------------------------------------------------ */
  function initFaq() {
    var items = $$('.faq__item');
    if (!items.length) return;

    // Per-item bookkeeping: the pending open-timer and the release handler.
    var pending = items.map(function () {
      return { timer: null, onTransitionEnd: null };
    });

    function stateOf(item) {
      return pending[items.indexOf(item)];
    }

    /** Drop any deferred "release to auto" work for a panel. */
    function cancelPending(item) {
      var state = stateOf(item);
      if (!state) return;

      if (state.timer !== null) {
        window.clearTimeout(state.timer);
        state.timer = null;
      }
      if (state.onTransitionEnd) {
        var answer = $('.faq__answer', item);
        if (answer) answer.removeEventListener('transitionend', state.onTransitionEnd);
        state.onTransitionEnd = null;
      }
    }

    function close(item) {
      var button = $('.faq__question', item);
      var answer = $('.faq__answer', item);
      if (!button || !answer) return;

      // Kill in-flight open work FIRST, so nothing can re-expand the panel.
      cancelPending(item);

      item.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
      answer.setAttribute('aria-hidden', 'true');

      // Animate from the current height down to zero. Read the height
      // before touching the class so the value is the real content height.
      var from = answer.getBoundingClientRect().height;
      answer.style.height = from + 'px';
      // Force a reflow so the browser registers the starting height
      void answer.offsetHeight;
      answer.style.height = '0px';
    }

    function open(item) {
      var button = $('.faq__question', item);
      var answer = $('.faq__answer', item);
      if (!button || !answer) return;

      cancelPending(item);

      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
      answer.setAttribute('aria-hidden', 'false');

      answer.style.height = answer.scrollHeight + 'px';

      // Once the opening animation finishes, let the panel size itself.
      // Guarded by both the token and the live class so a close that
      // happens mid-flight always wins.
      var state = stateOf(item);

      function release(event) {
        if (event && event.propertyName && event.propertyName !== 'height') return;
        if (state.onTransitionEnd) {
          answer.removeEventListener('transitionend', state.onTransitionEnd);
          state.onTransitionEnd = null;
        }
        if (!item.classList.contains('is-open')) return;
        answer.style.height = 'auto';
      }

      state.onTransitionEnd = release;
      answer.addEventListener('transitionend', release);

      // Safety net if transitionend never fires (e.g. reduced motion)
      state.timer = window.setTimeout(function () {
        state.timer = null;
        if (!item.classList.contains('is-open')) return;
        answer.style.height = 'auto';
      }, 500);
    }

    // Prepare: strip the markup's `hidden` attribute so the panel can be
    // animated, but keep it out of the tab order and the a11y tree.
    items.forEach(function (item) {
      var answer = $('.faq__answer', item);
      if (answer) {
        answer.removeAttribute('hidden');
        answer.setAttribute('aria-hidden', 'true');
        answer.style.height = '0px';
      }
    });

    items.forEach(function (item) {
      var button = $('.faq__question', item);
      if (!button) return;

      button.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');

        // Accordion behaviour: collapse every other panel
        items.forEach(function (other) {
          if (other !== item && other.classList.contains('is-open')) close(other);
        });

        if (isOpen) close(item);
        else open(item);
      });
    });

    // Keep open panels correctly sized when the viewport changes
    window.addEventListener('resize', function () {
      items.forEach(function (item) {
        if (!item.classList.contains('is-open')) return;
        var answer = $('.faq__answer', item);
        if (answer) answer.style.height = 'auto';
      });
    });
  }

  /* ------------------------------------------------------------------
     8. Fade-in on scroll
     Staggered by index within each batch so grids cascade nicely.

     Two safety nets guarantee content is never permanently invisible:
       a) anything already at or above the fold reveals on load;
       b) a final timeout force-reveals everything, in case an observer
          never fires (deep link, restored scroll position, odd viewport).
     ------------------------------------------------------------------ */
  function initReveal() {
    var targets = $$('.reveal');

    function revealAll() {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
    }

    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      revealAll();
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
          window.setTimeout(function () {
            el.classList.add('is-visible');
          }, delay);
          observer.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    targets.forEach(function (el, index) {
      // Give items inside a grid a small cascade offset
      if (!el.getAttribute('data-reveal-delay')) {
        el.setAttribute('data-reveal-delay', String((index % 3) * 90));
      }
      observer.observe(el);
    });

    // (a) Anything the visitor can already see must not wait for a scroll.
    function revealInView() {
      var limit = window.innerHeight;
      targets.forEach(function (el) {
        if (el.classList.contains('is-visible')) return;
        if (el.getBoundingClientRect().top < limit) el.classList.add('is-visible');
      });
    }
    revealInView();
    window.addEventListener('load', revealInView);

    // (b) Last-resort net: no section may stay hidden.
    window.setTimeout(revealAll, 4000);
  }

  /* ------------------------------------------------------------------
     9. Footer year
     ------------------------------------------------------------------ */
  function initYear() {
    var el = $('#year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------
     10. Bootstrap
     ------------------------------------------------------------------ */
  function init() {
    initStickyNav();
    initMobileNav();
    initSmoothScroll();
    initTyping();
    initCounters();
    initFaq();
    initReveal();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
