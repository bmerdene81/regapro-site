/* ============================================
   REGAPRO - Interactive Scripts
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initScrollReveal();
  initShowcaseTabs();
  initVideoPlayer();
  initContactForm();
  initStatCounters();
  initSmoothScroll();
  initGallery();
  initHeroSlideshow();
});

/* ---------- HEADER SCROLL EFFECT ---------- */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* ---------- MOBILE MENU ---------- */
function initMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('.nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
  });

  // close menu when link clicked
  menu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('active');
    });
  });
}

/* ---------- SCROLL REVEAL ---------- */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length || !('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* ---------- SHOWCASE TABS ---------- */
function initShowcaseTabs() {
  const tabs = document.querySelectorAll('.showcase-tab');
  const panels = document.querySelectorAll('.showcase-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-target');

      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) panel.classList.add('active');
    });
  });
}

/* ---------- VIDEO PLAYER ---------- */
function initVideoPlayer() {
  const placeholder = document.querySelector('.video-placeholder');
  const iframe = document.querySelector('.video-iframe');
  if (!placeholder || !iframe) return;

  placeholder.addEventListener('click', () => {
    const videoUrl = iframe.getAttribute('data-src');
    if (videoUrl) {
      iframe.setAttribute('src', videoUrl);
    }
    placeholder.classList.add('hidden');
    iframe.classList.add('active');
  });
}

/* ---------- CONTACT FORM VALIDATION ---------- */
function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const successMsg = form.querySelector('.form-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    const fields = form.querySelectorAll('[data-required]');

    fields.forEach(field => {
      const errorEl = field.parentElement.querySelector('.form-error');
      const value = field.value.trim();

      if (!value) {
        if (errorEl) errorEl.textContent = 'Энэ хэсгийг бөглөнө үү';
        field.style.borderColor = '#f87171';
        isValid = false;
      } else if (field.type === 'email' && !isValidEmail(value)) {
        if (errorEl) errorEl.textContent = 'Зөв имэйл хаяг оруулна уу';
        field.style.borderColor = '#f87171';
        isValid = false;
      } else {
        if (errorEl) errorEl.textContent = '';
        field.style.borderColor = '';
      }
    });

    if (!isValid) return;

    // Construct mailto fallback (works without backend)
    const data = new FormData(form);
    const name = data.get('name') || '';
    const email = data.get('email') || '';
    const phone = data.get('phone') || '';
    const subject = data.get('subject') || 'Сайтаас ирсэн хүсэлт';
    const message = data.get('message') || '';

    const body = `Нэр: ${name}%0D%0A` +
                 `Имэйл: ${email}%0D%0A` +
                 `Утас: ${phone}%0D%0A%0D%0A` +
                 `Зурвас:%0D%0A${message}`;

    // Show success first
    if (successMsg) {
      successMsg.classList.add('visible');
      setTimeout(() => successMsg.classList.remove('visible'), 6000);
    }

    // Open user's mail client with prefilled message
    const mailto = `mailto:info@regapro.com?subject=${encodeURIComponent(subject)}&body=${body}`;
    window.location.href = mailto;

    form.reset();
  });

  // clear error on input
  form.querySelectorAll('input, textarea, select').forEach(field => {
    field.addEventListener('input', () => {
      const errorEl = field.parentElement.querySelector('.form-error');
      if (errorEl) errorEl.textContent = '';
      field.style.borderColor = '';
    });
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ---------- STAT COUNTERS ---------- */
function initStatCounters() {
  const stats = document.querySelectorAll('[data-counter]');
  if (!stats.length) return;

  const animate = (el) => {
    const target = parseFloat(el.getAttribute('data-counter'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;

      if (target % 1 === 0) {
        el.textContent = Math.round(value).toLocaleString() + suffix;
      } else {
        el.textContent = value.toFixed(1) + suffix;
      }

      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    stats.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(s => observer.observe(s));
}

/* ---------- SMOOTH SCROLL FOR ANCHOR LINKS ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#' || href.length < 2) return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ---------- GALLERY LIGHTBOX ---------- */
function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  // Create lightbox once
  let lightbox = document.querySelector('.lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Хаах">×</button>
        <img class="lightbox-image" src="" alt="">
        <div class="lightbox-caption"></div>
      </div>
    `;
    document.body.appendChild(lightbox);
  }

  const lightboxImg = lightbox.querySelector('.lightbox-image');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  items.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('.gallery-image');
      const title = item.querySelector('.gallery-title');
      if (!img) return;

      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = title ? title.textContent : '';
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/* ---------- HERO SLIDESHOW ---------- */
function initHeroSlideshow() {
  const slideshow = document.getElementById('hero-slideshow');
  if (!slideshow) return;

  const slides = slideshow.querySelectorAll('.hero-photo');
  const dots = slideshow.querySelectorAll('.hero-dot');
  if (slides.length <= 1) return;

  let currentIndex = 0;
  const intervalMs = 3000;
  let timer = null;

  const goToSlide = (index) => {
    slides[currentIndex].classList.remove('active');
    dots[currentIndex]?.classList.remove('active');

    currentIndex = (index + slides.length) % slides.length;

    slides[currentIndex].classList.add('active');
    dots[currentIndex]?.classList.add('active');
  };

  const nextSlide = () => goToSlide(currentIndex + 1);

  const startTimer = () => {
    stopTimer();
    timer = setInterval(nextSlide, intervalMs);
  };

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  // Dot click to jump to slide
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
      startTimer(); // restart timer after manual click
    });
  });

  startTimer();
}

/* ---------- AUTO YEAR IN FOOTER ---------- */
const yearEl = document.getElementById('current-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
