'use strict';

/* ==========================================================================
   Kala Vriksha Academy
   Edit CONFIG below; everything else can stay as it is.
   ========================================================================== */

const CONFIG = {
  // Contact form: leave empty while there is no backend. When it is set, the form POSTs JSON to this URL.
  endpoint: '',

  // YouTube sample links for each category.
  samples: {
    vocal: 'https://youtu.be/TZXMAw3TEsY?si=SZFAIKYlXJvN2xFd',
    instrumental: 'https://youtu.be/jM9b2Qo5qwM?si=6tpQE0UGWgr0Q6VK',
    dance: 'https://youtu.be/YbRX_cdTap8?si=-l4YhwptocfNXXai',
  },

  // Placeholder social links. An empty value hides that icon.
  social: {
    instagram: 'https://instagram.com/kalavriksha',
    facebook: 'https://facebook.com/kalavriksha',
    youtube: 'https://youtube.com/@kalavriksha',
    whatsapp: 'https://wa.me/16048039009',
  },
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- Fixed header: shrinks slightly once the page is scrolled ---------- */
function initHeader() {
  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');

  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }, { passive: true });

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = primaryNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.querySelector('.ic-menu').hidden = isOpen;
      navToggle.querySelector('.ic-close').hidden = !isOpen;
    });

    // Close menu when clicking links
    primaryNav.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        primaryNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.querySelector('.ic-menu').hidden = false;
        navToggle.querySelector('.ic-close').hidden = true;
      });
    });
  }
}
  // Mobile navigation drawer toggle
  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = primaryNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navToggle.querySelector('.ic-menu').hidden = isOpen;
      navToggle.querySelector('.ic-close').hidden = !isOpen;
    });

    primaryNav.querySelectorAll('.nav-link, .btn').forEach((link) => {
      link.addEventListener('click', () => {
        primaryNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.querySelector('.ic-menu').hidden = false;
        navToggle.querySelector('.ic-close').hidden = true;
      });
    });
  }
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window) || prefersReducedMotion.matches) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 },
  );
  items.forEach((el) => observer.observe(el));
}

/* ---------- Floating music notes: they only ever drift up, or up and to the right ---------- */
function initNotes() {
  const canvas = document.getElementById('notes');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const compact = window.matchMedia('(max-width: 720px)');
  const shapes = buildNoteShapes();
  let palette = [];
  let notes = [];
  let width = 0;
  let height = 0;
  let frameId = 0;
  let lastTime = 0;

  const random = (min, max) => min + Math.random() * (max - min);

  function readPalette() {
    const styles = getComputedStyle(document.documentElement);
    palette = [1, 2, 3, 4].map((n) => styles.getPropertyValue(`--note-${n}`).trim() || '#6e1730');
  }

  // Start a note just below the screen, or anywhere on screen when first populating
  function place(note, anywhere) {
    note.x = random(-0.15 * width, width);
    note.y = anywhere ? random(0, height) : height + random(40, 140);
    return note;
  }

  function createNote(anywhere) {
    const depth = Math.random(); // bigger notes are closer, so they move faster and show more
    return place(
      {
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        color: palette[Math.floor(Math.random() * palette.length)],
        size: 10 + depth * 12,
        vx: random(0, 0.55), // never negative: no leftward drift either
        vy: 0.35 + depth * 0.8, // upward speed
        alpha: 0.45 + depth * 0.4,
        sway: random(8, 28),
        swaySpeed: random(0.006, 0.014),
        phase: random(0, Math.PI * 2),
        tilt: random(-0.35, 0.35),
      },
      anywhere,
    );
  }

  function populate() {
    const count = compact.matches ? 16 : 30;
    notes = Array.from({ length: count }, () => createNote(true));
  }

  function draw(note) {
    const x = note.x + Math.sin(note.phase) * note.sway;
    ctx.save();
    ctx.translate(x, note.y);
    ctx.rotate(note.tilt + Math.sin(note.phase) * 0.18);
    ctx.scale(note.size, note.size);
    ctx.globalAlpha = note.alpha;
    ctx.fillStyle = note.color;
    ctx.fill(note.shape);
    ctx.restore();
  }

  function paintStill() {
    ctx.clearRect(0, 0, width, height);
    notes.slice(0, 14).forEach(draw);
  }

  function frame(time) {
    const step = Math.min((time - lastTime) / 16.667 || 1, 3); // keeps speed steady on any refresh rate
    lastTime = time;
    ctx.clearRect(0, 0, width, height);

    for (const note of notes) {
      note.x += note.vx * step;
      note.y -= note.vy * step;
      note.phase += note.swaySpeed * step;
      if (note.y < -90 || note.x > width + 90) place(note, false);
      draw(note);
    }
    frameId = requestAnimationFrame(frame);
  }

  function start() {
    if (frameId || prefersReducedMotion.matches) return;
    lastTime = performance.now();
    frameId = requestAnimationFrame(frame);
  }

  function stop() {
    cancelAnimationFrame(frameId);
    frameId = 0;
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = window.innerWidth;
    const nextHeight = window.innerHeight;
    // Mobile browsers change the height as the address bar hides; ignore small changes
    if (nextWidth === width && Math.abs(nextHeight - height) < 120) return;

    width = nextWidth;
    height = nextHeight;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    populate();
    if (prefersReducedMotion.matches) paintStill();
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  readPalette();
  resize();
  start();
}

// Vector note shapes in note-head units, so they look identical on every device
function buildNoteShapes() {
  const head = (path, x, y) => path.ellipse(x, y, 0.64, 0.44, -0.4, 0, Math.PI * 2);

  const quarter = new Path2D();
  head(quarter, 0, 0);
  quarter.rect(0.52, -3.2, 0.13, 3.2);

  const eighth = new Path2D();
  eighth.addPath(quarter);
  eighth.moveTo(0.65, -3.2);
  eighth.bezierCurveTo(1.7, -2.6, 1.9, -1.6, 1.3, -0.8);
  eighth.bezierCurveTo(1.6, -1.7, 1.1, -2.2, 0.65, -2.45);
  eighth.closePath();

  const beamed = new Path2D();
  head(beamed, 0, 0);
  head(beamed, 1.9, -0.25);
  beamed.rect(0.52, -3.2, 0.13, 3.2);
  beamed.rect(2.42, -3.45, 0.13, 3.2);
  beamed.moveTo(0.52, -3.2);
  beamed.lineTo(2.55, -3.45);
  beamed.lineTo(2.55, -2.9);
  beamed.lineTo(0.52, -2.65);
  beamed.closePath();

  const sharp = new Path2D();
  sharp.rect(-0.3, -1.5, 0.11, 2.9);
  sharp.rect(0.22, -1.7, 0.11, 2.9);
  sharp.moveTo(-0.75, -0.25);
  sharp.lineTo(0.75, -0.7);
  sharp.lineTo(0.75, -0.3);
  sharp.lineTo(-0.75, 0.15);
  sharp.closePath();
  sharp.moveTo(-0.75, 0.6);
  sharp.lineTo(0.75, 0.15);
  sharp.lineTo(0.75, 0.55);
  sharp.lineTo(-0.75, 1.0);
  sharp.closePath();

  const flat = new Path2D();
  flat.rect(-0.35, -2.3, 0.12, 2.7);
  flat.moveTo(-0.23, 0.4);
  flat.bezierCurveTo(0.75, -0.05, 1.0, -0.95, 0.25, -1.2);
  flat.bezierCurveTo(0.75, -0.7, 0.35, -0.4, -0.23, -0.3);
  flat.closePath();

  return [quarter, eighth, beamed, sharp, flat];
}

/* ---------- Categories: pick one to show its details and play a sample ---------- */
function initCategories() {
  const cards = [...document.querySelectorAll('.category')];
  const stage = document.getElementById('stage');
  const stageImg = document.getElementById('stageImg');
  const stageTitle = document.getElementById('stageTitle');
  const stageStyles = document.getElementById('stageStyles');
  const stageText = document.getElementById('stageText');
  const player = document.getElementById('player');
  const closeButton = document.getElementById('stageClose');
  let activeCard = null;

  // Accepts a full YouTube link or a bare video ID
  function videoId(value) {
    if (!value) return '';
    const match = value.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
    if (match) return match[1];
    return /^[\w-]{11}$/.test(value) ? value : '';
  }

  function mountPlayer(card) {
    player.replaceChildren();
    const id = videoId(CONFIG.samples[card.dataset.key]);

    if (!id) {
      const note = document.createElement('p');
      note.textContent = 'Sample coming soon.';
      player.append(note);
      return;
    }

    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
    frame.title = `${card.dataset.title} sample`;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture';
    frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    player.append(frame);
  }

  function setLabels(card) {
    cards.forEach((item) => {
      const active = item === card;
      item.setAttribute('aria-pressed', String(active));
      item.querySelector('.category-cta-text').textContent = active ? 'Playing sample. Tap to stop' : 'Hear a sample';
    });
  }

  function open(card) {
    activeCard = card;
    stageImg.src = card.querySelector('.category-media img').src;
    stageTitle.textContent = card.dataset.title;
    stageStyles.textContent = card.dataset.styles;
    stageText.textContent = card.dataset.detail;
    setLabels(card);
    mountPlayer(card);
    stage.hidden = false;
    stage.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth', block: 'nearest' });
  }

  function close() {
    activeCard = null;
    player.replaceChildren(); // removing the iframe stops the audio
    stage.hidden = true;
    setLabels(null);
  }

  cards.forEach((card) => card.addEventListener('click', () => (card === activeCard ? close() : open(card))));
  closeButton.addEventListener('click', () => {
    const card = activeCard;
    close();
    if (card) card.focus();
  });
}

/* ---------- Contact form (front end only; see CONFIG.endpoint) ---------- */
function initForm() {
  const form = document.getElementById('inquiryForm');
  const success = document.getElementById('inquirySuccess');
  const submitButton = document.getElementById('submitBtn');
  const formNote = document.getElementById('formNote');
  const startedField = document.getElementById('startedField');
  const NOTE_DEFAULT = formNote.textContent;

  const value = (id) => document.getElementById(id).value.trim();
  const checked = (name) => [...form.querySelectorAll(`[name="${name}"]:checked`)].map((input) => input.value);

  // One rule per field: returns an error message, or '' when the field is fine
  const rules = {
    'f-student': () => (value('f-student') ? '' : 'Please enter the student’s name.'),
    'f-age': () => {
      const age = Number(value('f-age'));
      return Number.isInteger(age) && age >= 3 && age <= 99 ? '' : 'Please enter an age between 3 and 99.';
    },
    'f-parent': () => {
      const age = Number(value('f-age'));
      return age > 0 && age < 18 && !value('f-parent') ? 'Please enter a parent or guardian name.' : '';
    },
    'f-email': () =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value('f-email')) ? '' : 'Please enter a valid email address.',
    'f-phone': () =>
      !value('f-phone') || /^[\d\s().+-]{7,20}$/.test(value('f-phone')) ? '' : 'Please enter a valid phone number.',
    'f-level': () => (value('f-level') ? '' : 'Please select a proficiency level.'),
    'f-address': () => (value('f-address') ? '' : 'Please enter your address.'),
    'f-category': () => (checked('category').length ? '' : 'Please choose at least one category.'),
    'f-taking': () => (checked('takingClasses').length ? '' : 'Please select Yes or No.'),
    'f-started': () =>
      checked('takingClasses')[0] === 'Yes' && !value('f-started') ? 'Please tell us when you started.' : '',
    'f-consent': () => (document.getElementById('f-consent').checked ? '' : 'Please agree so we can contact you.'),
  };

  function showError(id, message) {
    const field = document.getElementById(id).closest('.field');
    field.classList.toggle('is-invalid', Boolean(message));
    document.getElementById(`e-${id}`).textContent = message;
    field.querySelectorAll('input, select, textarea').forEach((control) => {
      control.setAttribute('aria-invalid', String(Boolean(message)));
      control.setAttribute('aria-describedby', `e-${id}`);
    });
  }

  function check(id) {
    if (!document.getElementById(id).offsetParent && id === 'f-started') {
      showError(id, '');
      return '';
    }
    const message = rules[id]();
    showError(id, message);
    return message;
  }

  // Validate a field when the visitor leaves it, then keep it up to date as they fix it
  Object.keys(rules).forEach((id) => {
    const field = document.getElementById(id);
    const isGroup = field.tagName === 'FIELDSET';
    const events = isGroup || field.type === 'checkbox' || field.tagName === 'SELECT' ? ['change'] : ['blur', 'input'];
    events.forEach((eventName) =>
      field.addEventListener(eventName, () => {
        const touched = field.closest('.field').classList.contains('is-invalid');
        if (eventName === 'input' && !touched) return;
        check(id);
        if (id === 'f-age') check('f-parent');
      }),
    );
  });

  // "If yes, when did you start?" only appears when it applies
  form.querySelectorAll('[name="takingClasses"]').forEach((radio) =>
    radio.addEventListener('change', () => {
      const yes = checked('takingClasses')[0] === 'Yes';
      startedField.hidden = !yes;
      if (!yes) {
        document.getElementById('f-started').value = '';
        showError('f-started', '');
      }
    }),
  );

  // Swap this for a real request when the backend exists
  async function sendInquiry(payload) {
    if (!CONFIG.endpoint) {
      console.info('Inquiry captured (no endpoint set, so nothing was sent):', payload);
      await new Promise((resolve) => setTimeout(resolve, 600));
      return;
    }
    const response = await fetch(CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  }

  const makeReference = () => {
    const now = new Date();
    const date = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    return `KV-${date}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  };

  function setBusy(busy) {
    submitButton.disabled = busy;
    submitButton.querySelector('span').textContent = busy ? 'Sending…' : 'Submit Inquiry';
  }

  function showSuccess(reference) {
    success.querySelector('[data-ref]').textContent = reference;
    form.hidden = true;
    success.hidden = false;
    success.focus();
    success.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth', block: 'center' });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    formNote.textContent = NOTE_DEFAULT;
    formNote.removeAttribute('role');

    const invalid = Object.keys(rules).filter((id) => check(id)); // check every field so all errors show at once
    if (invalid.length) {
      const target = document.getElementById(invalid[0]);
      (target.tagName === 'FIELDSET' ? target.querySelector('input') : target).focus();
      return;
    }

    // Hidden field that only bots fill in: pretend it worked and send nothing
    if (value('f-website')) return showSuccess(makeReference());

    const payload = {
      reference: makeReference(),
      submittedAt: new Date().toISOString(),
      studentName: value('f-student'),
      age: Number(value('f-age')),
      parentName: value('f-parent'),
      email: value('f-email'),
      phone: value('f-phone'),
      address: value('f-address'),
      categories: checked('category'),
      currentlyTakingClasses: checked('takingClasses')[0],
      startedOn: value('f-started'),
      proficiency: value('f-level'),
      comments: value('f-comments'),
      consent: true,
    };

    setBusy(true);
    try {
      await sendInquiry(payload);
      showSuccess(payload.reference);
    } catch (error) {
      console.error(error);
      formNote.textContent =
        'Something went wrong and your inquiry was not sent. Please try again or call (604) 803-9009.';
      formNote.setAttribute('role', 'alert');
    } finally {
      setBusy(false);
    }
  });

  document.getElementById('submitAnother').addEventListener('click', () => {
    form.reset();
    Object.keys(rules).forEach((id) => showError(id, ''));
    startedField.hidden = true;
    success.hidden = true;
    form.hidden = false;
    document.getElementById('f-student').focus();
  });
}

/* ---------- Footer social links ---------- */
function initSocial() {
  document.querySelectorAll('[data-social]').forEach((link) => {
    const url = CONFIG.social[link.dataset.social];
    if (!url) return link.closest('li').remove();
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
}

initHeader();
initReveal();
initNotes();
initCategories();
initForm();
initSocial();