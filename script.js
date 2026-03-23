const preloader = document.querySelector('.preloader');
const cursorGlow = document.querySelector('.cursor-glow');
const progressBar = document.querySelector('.scroll-progress');
const revealItems = document.querySelectorAll('.reveal');
const navLinks = document.querySelectorAll('.nav a');
const sections = document.querySelectorAll('main section[id]');
const filterButtons = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.art-card');
const lightbox = document.querySelector('.lightbox');
const lightboxImage = document.querySelector('.lightbox__image');
const lightboxTitle = document.querySelector('.lightbox__title');
const lightboxCaption = document.querySelector('.lightbox__caption');
const lightboxClose = document.querySelector('.lightbox__close');
const menuToggle = document.querySelector('.menu-toggle');
const siteHeader = document.querySelector('.site-header');
const parallaxCard = document.querySelector('.parallax-card');
const magneticItems = document.querySelectorAll('[data-magnetic]');
const tiltCards = document.querySelectorAll('.tilt-card');

window.addEventListener('load', () => {
  preloader.classList.add('is-hidden');
});

// cursor glow
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let currentX = mouseX;
let currentY = mouseY;

document.addEventListener('mousemove', (event) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
  cursorGlow.style.opacity = '1';
});

document.addEventListener('mouseleave', () => {
  cursorGlow.style.opacity = '0';
});

function animateCursor() {
  currentX += (mouseX - currentX) * 0.12;
  currentY += (mouseY - currentY) * 0.12;
  cursorGlow.style.left = `${currentX}px`;
  cursorGlow.style.top = `${currentY}px`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

// scroll progress
function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${progress}%`;
}
window.addEventListener('scroll', updateProgress);
updateProgress();

// reveal on scroll
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

revealItems.forEach((item) => revealObserver.observe(item));

// active nav item
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach((link) => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.45 });

sections.forEach((section) => sectionObserver.observe(section));

// mobile menu
menuToggle?.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  siteHeader.classList.toggle('menu-open');
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    siteHeader.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

// parallax hero card
if (parallaxCard) {
  const wrapper = document.querySelector('.hero__visual');
  wrapper.addEventListener('mousemove', (event) => {
    const rect = wrapper.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    parallaxCard.style.transform = `rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg) translateZ(0)`;
  });

  wrapper.addEventListener('mouseleave', () => {
    parallaxCard.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
}

// magnetic buttons
magneticItems.forEach((item) => {
  item.addEventListener('mousemove', (event) => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    item.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
  });

  item.addEventListener('mouseleave', () => {
    item.style.transform = 'translate(0, 0)';
  });
});

// tilt cards
const attachTilt = (element) => {
  element.addEventListener('mousemove', (event) => {
    if (window.innerWidth < 900) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    element.style.transform = `perspective(1000px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateY(-4px)`;
  });

  element.addEventListener('mouseleave', () => {
    element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
  });
};

tiltCards.forEach(attachTilt);

// gallery filter
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    cards.forEach((card) => {
      const categories = (card.dataset.category || '').split(' ');
      const show = filter === 'all' || categories.includes(filter);
      card.classList.toggle('is-hidden', !show);
      card.style.display = show ? '' : 'none';
    });
  });
});

// lightbox
function openLightbox(card) {
  const image = card.dataset.image;
  const title = card.dataset.title || 'Работа';
  const caption = card.dataset.caption || '';

  if (!image) return;

  lightboxImage.src = image;
  lightboxTitle.textContent = title;
  lightboxCaption.textContent = caption;
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-modal="true"]').forEach((card) => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => openLightbox(card));
});

lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLightbox();
});
