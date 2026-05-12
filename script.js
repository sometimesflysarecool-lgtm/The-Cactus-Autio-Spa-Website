// ======= HIDE TIDIO CHAT BUBBLE LABEL =======
(function () {
  function hideBubble() {
    // Direct ID targets Tidio uses
    ['tidio-chat-bubble', 'tidio-chat-bubble-box', 'tidio-chat-launcher-text'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    // Target the bubble iframe by name/title
    var container = document.getElementById('tidio-chat');
    if (container) {
      container.querySelectorAll('iframe').forEach(function (f) {
        var key = ((f.getAttribute('name') || '') + (f.getAttribute('title') || '')).toLowerCase();
        if (key.includes('bubble') || key.includes('preview') || key.includes('launcher')) {
          f.style.display = 'none';
        }
      });
    }
  }
  var obs = new MutationObserver(hideBubble);
  obs.observe(document.documentElement, { childList: true, subtree: true });
  [500, 1500, 3000, 6000].forEach(function (t) { setTimeout(hideBubble, t); });
})();

// ======= NAV SERVICES DROPDOWN =======
// Desktop: hover with 300ms close delay
document.querySelectorAll('.nav-services').forEach(function(item) {
  var menu = item.querySelector('.nav-services-menu');
  var hideTimeout;
  if (!menu) return;
  item.addEventListener('mouseenter', function() {
    if (window.innerWidth > 768) {
      clearTimeout(hideTimeout);
      item.classList.add('js-open');
    }
  });
  item.addEventListener('mouseleave', function() {
    if (window.innerWidth > 768) {
      hideTimeout = setTimeout(function() {
        item.classList.remove('js-open');
      }, 300);
    }
  });
});

// Mobile: click to toggle dropdown open/close
document.querySelectorAll('nav li').forEach(function(item) {
  var dropdown = item.querySelector('ul');
  if (!dropdown) return;
  var trigger = item.querySelector('a');
  if (!trigger) return;
  trigger.addEventListener('click', function(e) {
    if (window.innerWidth > 768) return;
    e.preventDefault();
    e.stopPropagation();
    var isOpen = item.classList.contains('open');
    document.querySelectorAll('nav li').forEach(function(i) { i.classList.remove('open'); });
    if (!isOpen) item.classList.add('open');
  });
});

// Click outside closes mobile dropdown
document.addEventListener('click', function() {
  document.querySelectorAll('nav li').forEach(function(i) { i.classList.remove('open'); });
});

// ======= MOBILE NAV HAMBURGER TOGGLE =======
function toggleMenu() {
  const navLinks = document.querySelector('.nav-links');
  const hamburger = document.querySelector('.hamburger');
  if (!navLinks || !hamburger) return;
  navLinks.classList.toggle('active');
  hamburger.classList.toggle('active');
}

function closeMobileNav() {
  const navLinks = document.querySelector('.nav-links');
  const hamburger = document.querySelector('.hamburger');
  if (!navLinks || !hamburger) return;
  navLinks.classList.remove('active');
  hamburger.classList.remove('active');
}

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', closeMobileNav);
});

document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', function (event) {
    if (window.innerWidth <= 768) {
      event.preventDefault();
      const submenu = this.nextElementSibling;
      if (!submenu) return;
      submenu.classList.toggle('open');
      this.setAttribute('aria-expanded', submenu.classList.contains('open'));
    }
  });
});

// ======= SMOOTH SCROLL =======
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ======= CONTACT FORM VALIDATION =======
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.querySelector('input[name="full-name"]').value.trim();
    const phone = document.querySelector('input[name="phone"]').value.trim();
    const email = document.querySelector('input[name="email"]').value.trim();
    const city = document.querySelector('input[name="city"]').value.trim();
    const zip = document.querySelector('input[name="zip"]').value.trim();
    const vehicle = document.querySelector('select[name="vehicle-type"]').value;
    const service = document.querySelector('select[name="service-interest"]').value;

    if (!name || !phone || !email || !city || !zip || !vehicle || !service) {
      alert('Please fill out all required fields before submitting.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    const phoneRegex = /^\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}$/;
    if (!phoneRegex.test(phone)) {
      alert('Please enter a valid phone number.');
      return;
    }

    alert('Thank you! We will be in touch shortly.');
    contactForm.reset();
  });
}

// ======= PORTFOLIO IMAGE LIGHTBOX =======
const portfolioItems = document.querySelectorAll('.portfolio-item img');

if (portfolioItems.length > 0) {
  const lightbox = document.createElement('div');
  lightbox.classList.add('lightbox');
  lightbox.innerHTML = `
    <div class="lightbox-overlay"></div>
    <div class="lightbox-content">
      <img src="" alt="Portfolio Image" class="lightbox-img">
      <button class="lightbox-close">?</button>
      <button class="lightbox-prev">�</button>
      <button class="lightbox-next">�</button>
    </div>
  `;
  document.body.appendChild(lightbox);

  let currentIndex = 0;
  const images = Array.from(portfolioItems);

  images.forEach((img, index) => {
    img.addEventListener('click', () => {
      currentIndex = index;
      openLightbox(img.src);
    });
  });

  function openLightbox(src) {
    document.querySelector('.lightbox-img').src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    document.querySelector('.lightbox-img').src = images[currentIndex].src;
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    document.querySelector('.lightbox-img').src = images[currentIndex].src;
  }

  document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  document.querySelector('.lightbox-overlay').addEventListener('click', closeLightbox);
  document.querySelector('.lightbox-next').addEventListener('click', showNext);
  document.querySelector('.lightbox-prev').addEventListener('click', showPrev);

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
}
