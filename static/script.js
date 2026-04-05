const preloader = document.querySelector('.preloader');
const progressBar = document.querySelector('.scroll-progress');
const cursorGlow = document.querySelector('.cursor-glow');
const cursorStar = document.querySelector('.cursor-star');
const revealItems = document.querySelectorAll('.reveal');
const navLinks = document.querySelectorAll('.nav-link');
const filterButtons = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
const magneticItems = document.querySelectorAll('.magnetic');
const tiltCards = document.querySelectorAll('.tilt-card');
const sections = document.querySelectorAll('main section[id]');
const modalTriggers = document.querySelectorAll('[data-bs-target="#projectModal"]');
const projectModal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalSubtitle = document.getElementById('modalSubtitle');
const modalDescription = document.getElementById('modalDescription');
const modalImage = document.getElementById('modalImage');
const modalLink = document.getElementById('modalLink');
const modalYear = document.getElementById('modalYear');
const galleryStatusLabel = document.getElementById('galleryStatusLabel');
const galleryCount = document.getElementById('galleryCount');
const contactForm = document.getElementById('contactForm');
const messageField = document.getElementById('message');
const messageCounter = document.getElementById('messageCounter');
const formStatus = document.getElementById('formStatus');
const submitButton = contactForm?.querySelector('button[type="submit"]');
const mainNav = document.getElementById('mainNav');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const allowMotion = !prefersReducedMotion.matches;
const allowInteractiveEffects = allowMotion && finePointer.matches;

const setActiveNavLink = (sectionId) => {
  navLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    const isSectionLink = href.startsWith('#');
    link.classList.toggle('active', isSectionLink && href === `#${sectionId}`);
  });
};

window.addEventListener(
  'load',
  () => {
    preloader?.classList.add('is-hidden');
  },
  { once: true },
);

const revealAll = () => {
  revealItems.forEach((item) => item.classList.add('is-visible'));
};

if (allowInteractiveEffects && (cursorGlow || cursorStar)) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let glowX = mouseX;
  let glowY = mouseY;
  let starX = mouseX;
  let starY = mouseY;

  document.body.classList.add('has-custom-cursor');

  document.addEventListener(
    'mousemove',
    (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (cursorGlow) {
        cursorGlow.style.opacity = '1';
      }

      if (cursorStar) {
        cursorStar.style.opacity = '1';
      }
    },
    { passive: true },
  );

  document.addEventListener('mouseleave', () => {
    if (cursorGlow) {
      cursorGlow.style.opacity = '0';
    }

    if (cursorStar) {
      cursorStar.style.opacity = '0';
    }
  });

  const animateCursor = () => {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    starX += (mouseX - starX) * 0.22;
    starY += (mouseY - starY) * 0.22;

    if (cursorGlow) {
      cursorGlow.style.left = `${glowX}px`;
      cursorGlow.style.top = `${glowY}px`;
    }

    if (cursorStar) {
      const rotation = ((mouseX - starX) + (mouseY - starY)) * 0.08;
      cursorStar.style.left = `${starX}px`;
      cursorStar.style.top = `${starY}px`;
      cursorStar.style.transform = `rotate(${rotation.toFixed(2)}deg) scale(1)`;
    }

    requestAnimationFrame(animateCursor);
  };

  animateCursor();
} else {
  if (cursorGlow) {
    cursorGlow.style.display = 'none';
  }

  if (cursorStar) {
    cursorStar.style.display = 'none';
  }
}

let progressTicking = false;
const paintProgress = () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }

  progressTicking = false;
};

const requestProgressPaint = () => {
  if (progressTicking) {
    return;
  }

  progressTicking = true;
  requestAnimationFrame(paintProgress);
};

window.addEventListener('scroll', requestProgressPaint, { passive: true });
paintProgress();

if (window.gsap && window.ScrollTrigger && allowMotion) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.hero__content > *', {
    y: 34,
    opacity: 0,
    duration: 0.9,
    stagger: 0.08,
    ease: 'power3.out',
    delay: 0.15,
  });

  gsap.from('.hero__media', {
    x: 34,
    opacity: 0,
    duration: 0.95,
    ease: 'power3.out',
    delay: 0.3,
  });

  gsap.from('.hero__aside', {
    y: 24,
    opacity: 0,
    duration: 0.85,
    ease: 'power3.out',
    delay: 0.55,
  });

  revealItems.forEach((item) => {
    gsap.to(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 84%',
        once: true,
      },
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
      onStart: () => item.classList.add('is-visible'),
    });
  });
} else {
  revealAll();
}

if (sections.length > 0) {
  let navTicking = false;

  const syncActiveSection = () => {
    const activationLine = window.innerHeight * 0.34;
    let currentSectionId = sections[0].getAttribute('id') || '';

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= activationLine) {
        currentSectionId = section.getAttribute('id') || currentSectionId;
      }
    });

    if (currentSectionId) {
      setActiveNavLink(currentSectionId);
    }

    navTicking = false;
  };

  const requestActiveSectionSync = () => {
    if (navTicking) {
      return;
    }

    navTicking = true;
    requestAnimationFrame(syncActiveSection);
  };

  window.addEventListener('scroll', requestActiveSectionSync, { passive: true });
  window.addEventListener('resize', requestActiveSectionSync);
  requestActiveSectionSync();
}

if (mainNav && window.bootstrap) {
  const collapseInstance = window.bootstrap.Collapse.getOrCreateInstance(mainNav, { toggle: false });
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href') || '';
      if (href.startsWith('#')) {
        setActiveNavLink(href.slice(1));
      }

      if (window.innerWidth < 992 && mainNav.classList.contains('show')) {
        collapseInstance.hide();
      }
    });
  });
}

if (allowInteractiveEffects) {
  magneticItems.forEach((item) => {
    item.addEventListener('mousemove', (event) => {
      if (window.innerWidth < 992) {
        return;
      }

      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`;
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = 'translate(0, 0)';
    });
  });

  tiltCards.forEach((element) => {
    element.addEventListener('mousemove', (event) => {
      if (window.innerWidth < 992) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      element.style.transform = `perspective(1000px) rotateX(${(-y * 5.5).toFixed(2)}deg) rotateY(${(x * 6.5).toFixed(2)}deg) translateY(-4px)`;
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}

const setGalleryFilter = (filter = 'all') => {
  let visibleItems = 0;
  let activeLabel = 'все работы';

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filter;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));

    if (isActive) {
      activeLabel = filter === 'all' ? 'все работы' : button.textContent?.trim() || 'архив';
    }
  });

  galleryItems.forEach((item) => {
    const category = item.dataset.category || '';
    const show = filter === 'all' || category.split(' ').includes(filter) || category.includes(filter);
    item.classList.toggle('is-hidden', !show);
    item.hidden = !show;
    item.setAttribute('aria-hidden', String(!show));

    if (show) {
      visibleItems += 1;
    }
  });

  if (galleryStatusLabel) {
    galleryStatusLabel.textContent = activeLabel;
  }

  if (galleryCount) {
    galleryCount.textContent = String(visibleItems);
  }
};

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setGalleryFilter(button.dataset.filter || 'all');
  });
});

setGalleryFilter(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');

const populateModal = (trigger) => {
  if (!modalTitle || !modalSubtitle || !modalDescription || !modalImage || !modalLink || !modalYear) {
    return;
  }

  const title = trigger.dataset.title || 'Проект';
  modalTitle.textContent = title;
  modalSubtitle.textContent = trigger.dataset.subtitle || '';
  modalDescription.textContent = trigger.dataset.description || '';
  modalImage.src = trigger.dataset.image || '';
  modalImage.alt = `Превью проекта: ${title}`;
  modalLink.href = trigger.dataset.url || '#';
  modalYear.textContent = trigger.dataset.year || 'архив';
};

projectModal?.addEventListener('show.bs.modal', (event) => {
  const trigger = event.relatedTarget;
  if (!(trigger instanceof HTMLElement)) {
    return;
  }

  populateModal(trigger);
});

projectModal?.addEventListener('hidden.bs.modal', () => {
  if (modalImage) {
    modalImage.removeAttribute('src');
  }

  if (modalLink) {
    modalLink.href = '#';
  }

  if (modalYear) {
    modalYear.textContent = '';
  }
});

modalTriggers.forEach((trigger) => {
  trigger.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    trigger.click();
  });
});

const updateMessageCounter = () => {
  if (!(messageField instanceof HTMLTextAreaElement) || !messageCounter) {
    return;
  }

  const maxLength = Number(messageField.getAttribute('maxlength') || '1500');
  messageCounter.textContent = `${messageField.value.length} / ${maxLength}`;
};

messageField?.addEventListener('input', updateMessageCounter);
updateMessageCounter();

const setFormStatus = (message, state = 'idle') => {
  if (!formStatus) {
    return;
  }

  formStatus.textContent = message;
  formStatus.classList.toggle('is-error', state === 'error');
  formStatus.classList.toggle('is-success', state === 'success');
};

const setSubmitting = (isSubmitting) => {
  if (!contactForm) {
    return;
  }

  if (isSubmitting) {
    contactForm.setAttribute('aria-busy', 'true');
  } else {
    contactForm.removeAttribute('aria-busy');
  }

  if (submitButton instanceof HTMLButtonElement) {
    submitButton.disabled = isSubmitting;
  }
};

contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!contactForm.reportValidity()) {
    return;
  }

  const formData = new FormData(contactForm);
  const payload = Object.fromEntries(
    Array.from(formData.entries(), ([key, value]) => [key, String(value).trim()]),
  );

  setSubmitting(true);
  setFormStatus('Сохраняем сообщение...', 'pending');

  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));
    const message =
      typeof result.message === 'string' && result.message
        ? result.message
        : response.ok
          ? 'Сообщение отправлено.'
          : 'Не удалось отправить форму.';

    setFormStatus(message, response.ok ? 'success' : 'error');

    if (response.ok) {
      contactForm.reset();
      updateMessageCounter();
    }
  } catch (_error) {
    setFormStatus('Не удалось отправить форму. Проверьте сервер.', 'error');
  } finally {
    setSubmitting(false);
  }
});
