/* =========================================================
   RegaPro — script.js
   1) Хэл солих (MN / EN)
   2) Header (scroll), гар утасны цэс
   3) Hero slideshow
   4) Scroll-оор гарч ирэх анимаци
   5) Холбоо барих форм (mailto)
   6) Ажлын туршлага — галерей, lightbox
   ========================================================= */
(function () {
    'use strict';

    var CONTACT_EMAIL = 'info@regapro.com';   // ← Хүсэлт хүлээн авах и-мэйл
    var STORAGE_KEY = 'regapro-lang';
    var root = document.documentElement;
    var dict = window.REGAPRO_I18N || { en: {}, mn: {} };
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------------------------------------------------
       1) ХЭЛ СОЛИХ
       Монгол текстийг HTML-ээс нь уншиж хадгална, англи текст i18n.js-д.
    --------------------------------------------------------- */
    var ATTRS = [
        { sel: '[data-i18n]',             key: 'i18n',            apply: function (el, v) { el.innerHTML = v; },               read: function (el) { return el.innerHTML; } },
        { sel: '[data-i18n-placeholder]', key: 'i18nPlaceholder', apply: function (el, v) { el.placeholder = v; },             read: function (el) { return el.placeholder; } },
        { sel: '[data-i18n-aria]',        key: 'i18nAria',        apply: function (el, v) { el.setAttribute('aria-label', v); }, read: function (el) { return el.getAttribute('aria-label'); } },
        { sel: '[data-i18n-alt]',         key: 'i18nAlt',         apply: function (el, v) { el.alt = v; },                     read: function (el) { return el.alt; } },
        { sel: '[data-i18n-content]',     key: 'i18nContent',     apply: function (el, v) { el.setAttribute('content', v); },  read: function (el) { return el.getAttribute('content'); } }
    ];

    // Анхны (монгол) утгуудыг цуглуулах
    ATTRS.forEach(function (a) {
        document.querySelectorAll(a.sel).forEach(function (el) {
            var k = el.dataset[a.key];
            if (k && dict.mn[k] === undefined) dict.mn[k] = a.read(el);
        });
    });

    var currentLang = 'mn';

    function t(key) {
        var d = dict[currentLang] || {};
        return d[key] !== undefined ? d[key] : (dict.mn[key] !== undefined ? dict.mn[key] : key);
    }

    function setLang(lang, save) {
        if (lang !== 'mn' && lang !== 'en') lang = 'mn';
        currentLang = lang;

        ATTRS.forEach(function (a) {
            document.querySelectorAll(a.sel).forEach(function (el) {
                var v = t(el.dataset[a.key]);
                if (v !== undefined) a.apply(el, v);
            });
        });

        root.lang = lang;
        root.classList.remove('lang-pending');

        document.querySelectorAll('.lang-btn').forEach(function (b) {
            var on = b.dataset.lang === lang;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });

        updateMenuLabel();
        if (typeof updateMoreLabel === 'function') updateMoreLabel();

        if (save) {
            try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
            try {
                var url = new URL(location.href);
                if (url.searchParams.has('lang')) {
                    url.searchParams.set('lang', lang);
                    history.replaceState(null, '', url);
                }
            } catch (e) {}
        }
    }

    function initialLang() {
        try {
            var q = new URLSearchParams(location.search).get('lang');
            if (q === 'en' || q === 'mn') return q;
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'en' || saved === 'mn') return saved;
        } catch (e) {}
        return 'mn';
    }

    document.querySelectorAll('.lang-btn').forEach(function (b) {
        b.addEventListener('click', function () { setLang(b.dataset.lang, true); });
    });

    /* ---------------------------------------------------------
       2) HEADER + ГАР УТАСНЫ ЦЭС
    --------------------------------------------------------- */
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('main-nav');

    function onScroll() {
        header.classList.toggle('is-scrolled', window.scrollY > 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function menuOpen() { return header.classList.contains('menu-open'); }

    function updateMenuLabel() {
        if (!toggle) return;
        toggle.setAttribute('aria-label', t(menuOpen() ? 'a11y.menuClose' : 'a11y.menu'));
    }

    function setMenu(open) {
        header.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        document.body.classList.toggle('no-scroll', open);
        updateMenuLabel();
    }

    if (toggle) {
        toggle.addEventListener('click', function () { setMenu(!menuOpen()); });
        nav.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () { setMenu(false); });
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menuOpen()) { setMenu(false); toggle.focus(); }
        });
        window.addEventListener('resize', function () {
            if (window.innerWidth > 980 && menuOpen()) setMenu(false);
        });
    }

    // Идэвхтэй хэсгийг цэсэнд тодруулах
    var links = Array.prototype.slice.call(document.querySelectorAll('.main-nav .nav-link'));
    var sections = links.map(function (l) { return document.querySelector(l.getAttribute('href')); }).filter(Boolean);
    if ('IntersectionObserver' in window && sections.length) {
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (!en.isIntersecting) return;
                links.forEach(function (l) {
                    l.classList.toggle('is-current', l.getAttribute('href') === '#' + en.target.id);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach(function (s) { spy.observe(s); });
    }

    /* ---------------------------------------------------------
       3) HERO SLIDESHOW
    --------------------------------------------------------- */
    var slides = document.querySelectorAll('.hero-slide');
    var dots = document.querySelectorAll('.hero-dot');
    var current = 0, timer = null, DELAY = 6000;

    function loadSlide(i) {
        var s = slides[i];
        if (s && s.dataset.bg) {
            s.style.backgroundImage = "url('" + s.dataset.bg + "')";
            s.removeAttribute('data-bg');
        }
    }

    function show(i) {
        if (!slides.length) return;
        i = (i + slides.length) % slides.length;
        loadSlide(i);
        loadSlide((i + 1) % slides.length);
        slides[current].classList.remove('is-active');
        dots[current] && dots[current].classList.remove('is-active');
        current = i;
        slides[current].classList.add('is-active');
        dots[current] && dots[current].classList.add('is-active');
    }

    function start() {
        if (reduceMotion || slides.length < 2) return;
        stop();
        timer = setInterval(function () { show(current + 1); }, DELAY);
    }
    function stop() { if (timer) clearInterval(timer); timer = null; }

    dots.forEach(function (d, i) {
        d.addEventListener('click', function () { show(i); start(); });
    });
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop(); else start();
    });
    window.addEventListener('load', function () { loadSlide(1); });
    start();

    /* ---------------------------------------------------------
       4) SCROLL REVEAL
    --------------------------------------------------------- */
    var reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
        root.classList.add('js-reveal');
        var ro = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add('is-visible'); ro.unobserve(en.target); }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        reveals.forEach(function (el) { ro.observe(el); });
    }

    /* ---------------------------------------------------------
       5) ХОЛБОО БАРИХ ФОРМ → mailto
    --------------------------------------------------------- */
    var form = document.getElementById('contact-form');
    if (form) {
        var status = form.querySelector('.form-status');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var f = form.elements;
            var name = f.name.value.trim(), email = f.email.value.trim();
            var company = f.company.value.trim(), msg = f.message.value.trim();

            status.className = 'form-status';
            if (!name || !email || !msg) { status.textContent = t('form.errRequired'); status.classList.add('is-error'); return; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status.textContent = t('form.errEmail'); status.classList.add('is-error'); return; }

            var subject = 'RegaPro — ' + t('form.subject') + ': ' + name + (company ? ' (' + company + ')' : '');
            var body = msg + '\n\n—\n' + name + (company ? '\n' + company : '') + '\n' + email;
            window.location.href = 'mailto:' + CONTACT_EMAIL +
                '?subject=' + encodeURIComponent(subject) +
                '&body=' + encodeURIComponent(body);

            status.textContent = t('form.ok');
            status.classList.add('is-ok');
        });
    }

    /* ---------------------------------------------------------
       6) АЖЛЫН ТУРШЛАГА — шүүлтүүр + зураг томруулах (lightbox)
    --------------------------------------------------------- */
    var workItems = Array.prototype.slice.call(document.querySelectorAll('.work-item'));
    var filters = document.querySelectorAll('.work-filter');
    var moreBtn = document.querySelector('.work-more-btn');
    var WORK_LIMIT = 9;              // эхэндээ харуулах зургийн тоо
    var workFilter = 'all', workExpanded = false;

    function applyGallery() {
        var match = workItems.filter(function (it) { return workFilter === 'all' || it.dataset.group === workFilter; });
        workItems.forEach(function (it) { it.hidden = true; });
        match.forEach(function (it, i) { it.hidden = !workExpanded && i >= WORK_LIMIT; });
        if (moreBtn) {
            moreBtn.parentElement.hidden = match.length <= WORK_LIMIT;
            moreBtn.setAttribute('aria-expanded', workExpanded ? 'true' : 'false');
            moreBtn.dataset.count = match.length;
            updateMoreLabel();
        }
    }
    function updateMoreLabel() {
        if (!moreBtn) return;
        moreBtn.textContent = workExpanded ? t('work.less') : t('work.more') + ' (' + (moreBtn.dataset.count || '') + ')';
    }

    filters.forEach(function (btn) {
        btn.addEventListener('click', function () {
            workFilter = btn.dataset.filter;
            workExpanded = false;
            filters.forEach(function (b) {
                var on = b === btn;
                b.classList.toggle('is-active', on);
                b.setAttribute('aria-pressed', on ? 'true' : 'false');
            });
            applyGallery();
        });
    });
    if (moreBtn) {
        moreBtn.addEventListener('click', function () {
            workExpanded = !workExpanded;
            applyGallery();
            if (!workExpanded) document.querySelector('.work-filters').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        });
    }
    applyGallery();

    var lb = document.getElementById('lightbox');
    if (lb && workItems.length) {
        var lbImg = lb.querySelector('.lb-img');
        var lbTitle = lb.querySelector('.lb-title');
        var lbDesc = lb.querySelector('.lb-desc');
        var lbTag = lb.querySelector('.lb-tag');
        var lbCount = lb.querySelector('.lb-count');
        var lbClose = lb.querySelector('.lb-close');
        var visible = [], idx = 0, lastFocus = null;

        function render() {
            var it = visible[idx];
            var img = it.querySelector('img');
            lbImg.src = img.getAttribute('src');
            lbImg.alt = img.alt;
            lbTitle.textContent = it.querySelector('figcaption strong').textContent;
            lbDesc.textContent = it.querySelector('.work-desc').textContent;
            lbTag.textContent = it.querySelector('.work-tag').textContent;
            lbCount.textContent = (idx + 1) + ' / ' + visible.length;
        }
        function openLb(item) {
            visible = workItems.filter(function (i) { return !i.hidden; });
            idx = Math.max(0, visible.indexOf(item));
            lastFocus = document.activeElement;
            render();
            lb.hidden = false;
            document.body.classList.add('no-scroll');
            lbClose.focus();
        }
        function closeLb() {
            lb.hidden = true;
            document.body.classList.remove('no-scroll');
            if (lastFocus) lastFocus.focus();
        }
        function step(d) { idx = (idx + d + visible.length) % visible.length; render(); }

        workItems.forEach(function (it) {
            it.querySelector('.work-thumb').addEventListener('click', function () { openLb(it); });
        });
        lb.querySelectorAll('[data-lb-close]').forEach(function (el) { el.addEventListener('click', closeLb); });
        lb.querySelector('.lb-prev').addEventListener('click', function () { step(-1); });
        lb.querySelector('.lb-next').addEventListener('click', function () { step(1); });

        document.addEventListener('keydown', function (e) {
            if (lb.hidden) return;
            if (e.key === 'Escape') closeLb();
            else if (e.key === 'ArrowLeft') step(-1);
            else if (e.key === 'ArrowRight') step(1);
            else if (e.key === 'Tab') {   // фокусыг lightbox дотор барих
                var f = lb.querySelectorAll('button');
                var first = f[0], last = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        });

        // Гар утсан дээр шудрах
        var x0 = null;
        lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
        lb.addEventListener('touchend', function (e) {
            if (x0 === null) return;
            var dx = e.changedTouches[0].clientX - x0;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
            x0 = null;
        });
    }

    /* Он */
    document.querySelectorAll('.js-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    /* Эхлүүлэх */
    setLang(initialLang(), false);
})();
