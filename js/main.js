/* ================================================
   MAIN.JS — Comportamiento compartido
   Sin dependencias externas
   ================================================ */

(function () {
  'use strict';

  /* ---- PROGRESS BAR ---- */
  function initProgressBar() {
    var bar = document.getElementById('progress-bar');
    if (!bar) return;
    window.addEventListener('scroll', function () {
      var scrollTop  = window.scrollY;
      var docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ---- NAVEGACION ---- */
  function initNav() {
    var nav    = document.querySelector('.site-nav');
    var toggle = document.querySelector('.nav-toggle');
    var menu   = document.querySelector('.nav-menu');
    if (!nav) return;

    // Sombra al hacer scroll
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    // Menu movil
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        var open = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open);
      });

      // Cerrar al hacer click fuera
      document.addEventListener('click', function (e) {
        if (!nav.contains(e.target)) {
          menu.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Marcar enlace activo
    var links = nav.querySelectorAll('.nav-menu a');
    var currentPath = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ---- REVEAL ON SCROLL ---- */
  function initReveal() {
    var elements = document.querySelectorAll(
      '.card, .module-card, .principle-card, .timeline-item, .step, ' +
      '.callout, .stat-card, .checklist li, .resource-item, .reveal'
    );

    if (!elements.length) return;

    elements.forEach(function (el) {
      el.classList.add('reveal');
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, idx) {
        if (entry.isIntersecting) {
          var delay = (entry.target.dataset.delay || 0) * 80;
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    // Asignar delays escalonados por grupo
    var groups = {};
    elements.forEach(function (el) {
      var parent = el.parentElement;
      if (!groups[parent]) { groups[parent] = 0; }
      el.dataset.delay = groups[parent]++;
      observer.observe(el);
    });
  }

  /* ---- CONTADORES ANIMADOS ---- */
  function animateCount(el) {
    var target   = parseFloat(el.dataset.target);
    var decimals = (el.dataset.decimals || 0);
    var suffix   = el.dataset.suffix || '';
    var duration = 1600;
    var start    = performance.now();

    function step(now) {
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var value = eased * target;
      el.textContent = value.toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    var counters = document.querySelectorAll('[data-target]');
    if (!counters.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (c) { observer.observe(c); });
  }

  /* ---- TABLA DE CONTENIDOS ACTIVA (sidebar) ---- */
  function initActiveToc() {
    var tocLinks = document.querySelectorAll('.sidebar-toc a');
    if (!tocLinks.length) return;

    var sections = [];
    tocLinks.forEach(function (link) {
      var id = link.getAttribute('href').replace('#', '');
      var el = document.getElementById(id);
      if (el) sections.push({ el: el, link: link });
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          tocLinks.forEach(function (l) { l.classList.remove('active'); });
          sections.forEach(function (s) {
            if (s.el === entry.target) s.link.classList.add('active');
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    });

    sections.forEach(function (s) { observer.observe(s.el); });
  }

  /* ---- COPIAR FRAGMENTOS DE CODIGO ---- */
  function initCodeCopy() {
    var blocks = document.querySelectorAll('pre');
    blocks.forEach(function (block) {
      var btn = document.createElement('button');
      btn.textContent = 'Copiar';
      btn.style.cssText = [
        'position:absolute', 'top:8px', 'right:8px',
        'font-family:var(--font-mono)', 'font-size:0.68rem',
        'letter-spacing:0.08em', 'text-transform:uppercase',
        'padding:3px 10px', 'background:rgba(255,255,255,0.1)',
        'color:rgba(255,255,255,0.6)', 'border:1px solid rgba(255,255,255,0.15)',
        'border-radius:4px', 'cursor:pointer',
        'transition:background 0.2s'
      ].join(';');

      block.style.position = 'relative';
      block.appendChild(btn);

      btn.addEventListener('click', function () {
        var code = block.querySelector('code');
        var text = code ? code.textContent : block.textContent;
        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = 'Copiado';
          setTimeout(function () { btn.textContent = 'Copiar'; }, 1800);
        });
      });
    });
  }

  /* ---- INIT ---- */
  function init() {
    initProgressBar();
    initNav();
    initReveal();
    initCounters();
    initActiveToc();
    initCodeCopy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();