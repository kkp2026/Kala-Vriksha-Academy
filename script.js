/* ---- Edit these placeholders when real details are ready ---- */
const CONFIG = {
  email: 'hello@kalavriksha.example',
  whatsapp: 'https://wa.me/16040000000',
  instagram: 'https://instagram.com/kalavriksha',
  facebook: 'https://facebook.com/kalavriksha',
  youtube: 'https://youtube.com/@kalavriksha',
  announce: '2026-10-20T00:00:00-07:00', // Oct 20, 2026, midnight Vancouver (PDT)
};

(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BG = { 1: '#EDE3CB', 2: '#061A1B', 3: '#FFFFFF', 4: '#F2F2EE', 5: '#F0BC5C' };
  if ('IntersectionObserver' in window) root.classList.add('js');

  /* ---------- Theme ---------- */
  var palette = [];
  function readPalette() {
    var cs = getComputedStyle(root);
    palette = ['--n1', '--n2', '--n3', '--n4'].map(function (v) {
      return cs.getPropertyValue(v).trim() || '#888';
    });
  }
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    document.querySelectorAll('.themebar button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.t === t));
    });
    document.querySelector('meta[name=theme-color]').content = BG[t];
    try {
      localStorage.setItem('kv-theme', t);
    } catch (e) {}
    readPalette();
    if (reduce) drawStatic();
  }
  var saved = null;
  try {
    saved = localStorage.getItem('kv-theme');
  } catch (e) {}
  document.querySelectorAll('.themebar button').forEach(function (b) {
    b.addEventListener('click', function () {
      setTheme(b.dataset.t);
    });
  });

  /* ---------- Links ---------- */
  document.querySelectorAll('[data-k]').forEach(function (a) {
    a.href = CONFIG[a.dataset.k];
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });

  /* ---------- Headline word reveal ---------- */
  var h1 = document.getElementById('h1'),
    txt = h1.textContent.trim();
  h1.setAttribute('aria-label', txt);
  h1.innerHTML = txt
    .split(' ')
    .map(function (w, i) {
      return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + w + '</span></span>';
    })
    .join(' ');

  /* ---------- Fixed header state + scroll reveal ---------- */
  var hdr = document.getElementById('hdr');
  function onScroll() {
    hdr.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (root.classList.contains('js')) {
    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    document.querySelectorAll('.rv').forEach(function (el) {
      io.observe(el);
    });
  }

  /* ---------- Countdown (digits animate when they change) ---------- */
  var target = new Date(CONFIG.announce).getTime();
  var els = ['d', 'h', 'm', 's'].map(function (i) {
    return document.getElementById(i);
  });
  var box = document.getElementById('count'),
    done = document.getElementById('done'),
    timer;
  function pad(n) {
    return n < 10 ? '0' + n : String(n);
  }
  function put(el, v) {
    if (el.textContent !== v) {
      el.textContent = v;
      el.classList.remove('tick');
      void el.offsetWidth;
      el.classList.add('tick');
    }
  }
  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) {
      box.hidden = true;
      done.hidden = false;
      clearInterval(timer);
      return;
    }
    var s = Math.floor(diff / 1000);
    put(els[0], pad(Math.floor(s / 86400)));
    put(els[1], pad(Math.floor((s % 86400) / 3600)));
    put(els[2], pad(Math.floor((s % 3600) / 60)));
    put(els[3], pad(s % 60));
  }
  tick();
  timer = setInterval(tick, 1000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) tick();
  });

  /* ---------- Notify form (opens the visitor's email app until a backend exists) ---------- */
  var form = document.getElementById('f'),
    em = document.getElementById('em'),
    st = document.getElementById('st');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = em.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      st.textContent = 'Enter a valid email address, for example name@example.com.';
      em.focus();
      return;
    }
    st.textContent = 'Thank you! Your email app should open with a message ready to send.';
    window.location.href =
      'mailto:' +
      CONFIG.email +
      '?subject=' +
      encodeURIComponent('Notify me about the Kala Vriksha announcement') +
      '&body=' +
      encodeURIComponent('Please add this address to the announcement list: ' + v);
    form.reset();
  });

  /* ---------- Flying music notes (drawn as vector shapes, so they look the same on every device) ---------- */
  var cv = document.getElementById('notes'),
    ctx = cv.getContext('2d');
  var P = (function () {
    var quarter = new Path2D();
    quarter.ellipse(0, 0, 0.64, 0.44, -0.4, 0, 6.2832);
    quarter.rect(0.52, -3.2, 0.13, 3.2);
    var eighth = new Path2D();
    eighth.addPath(quarter);
    eighth.moveTo(0.65, -3.2);
    eighth.bezierCurveTo(1.7, -2.6, 1.9, -1.6, 1.3, -0.8);
    eighth.bezierCurveTo(1.6, -1.7, 1.1, -2.2, 0.65, -2.45);
    eighth.closePath();
    var beamed = new Path2D();
    beamed.ellipse(0, 0, 0.64, 0.44, -0.4, 0, 6.2832);
    beamed.ellipse(1.9, -0.25, 0.64, 0.44, -0.4, 0, 6.2832);
    beamed.rect(0.52, -3.2, 0.13, 3.2);
    beamed.rect(2.42, -3.45, 0.13, 3.2);
    beamed.moveTo(0.52, -3.2);
    beamed.lineTo(2.55, -3.45);
    beamed.lineTo(2.55, -2.9);
    beamed.lineTo(0.52, -2.65);
    beamed.closePath();
    var sharp = new Path2D();
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
    var flat = new Path2D();
    flat.rect(-0.35, -2.3, 0.12, 2.7);
    flat.moveTo(-0.23, 0.4);
    flat.bezierCurveTo(0.75, -0.05, 1.0, -0.95, 0.25, -1.2);
    flat.bezierCurveTo(0.75, -0.7, 0.35, -0.4, -0.23, -0.3);
    flat.closePath();
    return [quarter, eighth, beamed, sharp, flat];
  })();
  var W = 0,
    H = 0,
    dpr = 1,
    notes = [],
    mx = -9999,
    my = -9999,
    raf = 0,
    running = false;
  var small = window.matchMedia('(max-width: 700px)');
  function rnd(a, b) {
    return a + Math.random() * (b - a);
  }
  function build() {
    var n = small.matches ? 14 : 26;
    notes = [];
    for (var i = 0; i < n; i++)
      notes.push({
        p: P[Math.floor(Math.random() * P.length)],
        c: Math.floor(Math.random() * 4),
        x: rnd(0, W),
        y: rnd(0, H),
        vx: rnd(0.25, 0.8),
        amp: rnd(18, 50),
        f: rnd(0.004, 0.011),
        ph: rnd(0, 6.28),
        s: rnd(7, 15),
        rot: rnd(-0.5, 0.5),
        rs: rnd(-0.004, 0.004),
        a: rnd(0.22, 0.5),
        depth: rnd(0.05, 0.3),
        ox: 0,
        oy: 0,
      });
  }
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = window.innerWidth,
      h = window.innerHeight;
    if (w === W && Math.abs(h - H) < 120) return;
    W = w;
    H = h;
    cv.width = W * dpr;
    cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!notes.length) build();
  }
  function paint(n, cy) {
    ctx.save();
    ctx.translate(n.x + n.ox, cy + n.oy);
    ctx.rotate(n.rot);
    ctx.scale(n.s, n.s);
    ctx.globalAlpha = n.a;
    ctx.fillStyle = palette[n.c];
    ctx.fill(n.p);
    ctx.restore();
  }
  function drawStatic() {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    notes.slice(0, 12).forEach(function (n) {
      paint(n, n.y);
    });
  }
  var hl = document.getElementById('heroLogo'),
    px = 0,
    py = 0;
  function frame() {
    ctx.clearRect(0, 0, W, H);
    var sy = window.scrollY;
    for (var i = 0; i < notes.length; i++) {
      var n = notes[i];
      n.x += n.vx;
      n.ph += n.f;
      n.rot += n.rs;
      if (n.x > W + 60) {
        n.x = -60;
        n.y = rnd(0, H);
      }
      var cy = (((n.y - sy * n.depth + Math.sin(n.ph) * n.amp) % H) + H) % H;
      var dx = n.x - mx,
        dy = cy - my,
        d = Math.sqrt(dx * dx + dy * dy),
        tx = 0,
        ty = 0;
      if (d < 140) {
        var k = (1 - d / 140) * 70;
        tx = (dx / d) * k;
        ty = (dy / d) * k;
      }
      n.ox += (tx - n.ox) * 0.08;
      n.oy += (ty - n.oy) * 0.08;
      paint(n, cy);
    }
    if (mx > -9000) {
      px += ((mx / W - 0.5) * 16 - px) * 0.06;
      py += ((my / H - 0.5) * 12 - py) * 0.06;
      hl.style.setProperty('--px', px.toFixed(2) + 'px');
      hl.style.setProperty('--py', py.toFixed(2) + 'px');
    }
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (!running && !reduce) {
      running = true;
      raf = requestAnimationFrame(frame);
    }
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }
  window.addEventListener(
    'pointermove',
    function (e) {
      if (e.pointerType === 'mouse') {
        mx = e.clientX;
        my = e.clientY;
      }
    },
    { passive: true },
  );
  document.addEventListener('visibilitychange', function () {
    document.hidden ? stop() : start();
  });
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      size();
      if (reduce) drawStatic();
    }, 150);
  });
  small.addEventListener &&
    small.addEventListener('change', function () {
      build();
    });

  size();
  if (/^[1-5]$/.test(saved)) setTheme(saved);
  else readPalette();
  if (reduce) drawStatic();
  else start();
})();
