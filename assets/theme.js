  // Scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.step, .motto, .gallery-item, .feature-item, .product-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 1s ease, transform 1s ease';
    observer.observe(el);
  });

  // Metal picker — changes BOTH bracelet and ring at once
  const metalOptions = document.querySelectorAll('.metal-option');
  const metalImages = document.querySelectorAll('.metal-img');

  // Preload every metal variant so swapping src never shows a blank/decoding flash
  metalImages.forEach(img => {
    ['gold', 'rose', 'silver'].forEach(metal => {
      const src = img.dataset[metal];
      if (src) { const pre = new Image(); pre.src = src; }
    });
  });

  metalOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      const metal = btn.dataset.metal;
      metalOptions.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      metalImages.forEach(img => {
        img.classList.add('fading');
        setTimeout(() => {
          const newSrc = img.dataset[metal];
          if (newSrc) img.src = newSrc;
          img.classList.remove('fading');
        }, 400);
      });
    });
  });

  // Bit Bracelet carousel — arrows cycle, swatches jump directly
  // (guarded: this section isn't built yet on every page, so bail out cleanly if absent)
  if (document.querySelector('.bit-carousel')) {
    const bitImg = document.getElementById('bit-carousel-img');
    const bitSwatches = Array.from(document.querySelectorAll('.bit-swatch'));
    let bitIndex = 0;

    // Preload every colour so swapping src never shows a blank/decoding flash
    bitSwatches.forEach(s => { const pre = new Image(); pre.src = s.dataset.img; });

    function setBitIndex(i) {
      bitIndex = (i + bitSwatches.length) % bitSwatches.length;
      const swatch = bitSwatches[bitIndex];
      bitSwatches.forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      const label = swatch.querySelector('span').textContent;
      bitImg.classList.add('fading');
      setTimeout(() => {
        bitImg.src = swatch.dataset.img;
        bitImg.alt = 'The Bit Bracelet in ' + label;
        bitImg.classList.remove('fading');
      }, 350);
    }

    bitSwatches.forEach((swatch, i) => {
      swatch.addEventListener('click', () => setBitIndex(i));
    });
    document.querySelector('.bit-carousel-prev').addEventListener('click', () => setBitIndex(bitIndex - 1));
    document.querySelector('.bit-carousel-next').addEventListener('click', () => setBitIndex(bitIndex + 1));
  }

  // ====== CAR-STYLE CONFIGURATOR ======
  // (guarded: the whole block only runs on the page that has the configurator markup)
  if (document.getElementById('c-main-img')) {
  const cs = { step: 1, piece: null, metal: null, horseName: '', privateDate: '', size: '', price: 0 };
  const stepNames = ['Choose your piece', 'Choose your metal', 'Your engravings', 'Your wrist size', 'Your details'];
  const previewImgs = {
    bracelet: { gold: 'images/bracelet_gold.webp', rose: 'images/353F50A1-7131-4613-8A3C-58659B543D8D.webp', silver: 'images/E7299DC7-2C97-4A62-A340-B658DA111EEE.webp' },
    ring:     { gold: 'images/ring_gold.webp',     rose: 'images/ring_rose.webp',     silver: 'images/ring_silver.webp' },
    both:     { gold: 'images/bracelet_gold.webp', rose: 'images/353F50A1-7131-4613-8A3C-58659B543D8D.webp', silver: 'images/E7299DC7-2C97-4A62-A340-B658DA111EEE.webp' }
  };
  const pieceLabels = { bracelet: 'Memento Bracelet', ring: 'Memento Ring', both: 'Memento Set' };
  const metalLabels = { gold: '18kt Yellow Gold', rose: '18kt Rose Gold', silver: '925 Sterling Silver' };

  // Preload every piece/metal combo used by the configurator preview
  Object.values(previewImgs).forEach(metals => {
    Object.values(metals).forEach(src => { const pre = new Image(); pre.src = src; });
  });

  function setMainImg(src) {
    const img = document.getElementById('c-main-img');
    img.classList.add('fading');
    setTimeout(() => { img.src = src; img.classList.remove('fading'); }, 350);
  }

  function updateMainVisual() {
    if (!cs.piece && !cs.metal) return;
    const piece = cs.piece || 'bracelet';
    const metal = cs.metal || 'gold';
    const src = previewImgs[piece]?.[metal];
    if (src) setMainImg(src);
    const parts = [pieceLabels[cs.piece], metalLabels[cs.metal]].filter(Boolean);
    document.getElementById('c-main-label').textContent = parts.join(' · ');
  }

  function renderEngravingCanvas() {
    const canvas = document.getElementById('c-canvas');
    const img = document.getElementById('c-main-img');
    if (!canvas || !img) return;

    const name = cs.horseName.trim();
    const date = cs.privateDate.trim();
    const card = document.getElementById('c-engraving-card');

    if (!name && !date) {
      canvas.style.opacity = '0';
      img.style.opacity = '1';
      if (card) card.classList.remove('visible');
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const css = 320;
    canvas.width = css * dpr;
    canvas.height = css * dpr;
    canvas.style.width = css + 'px';
    canvas.style.height = css + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Cream background matching page
    ctx.fillStyle = '#f8f3e8';
    ctx.fillRect(0, 0, css, css);

    // Multi-stop gradients simulating polished curved metal surface
    // (bright central highlight = peak reflection on rounded bangle)
    const metals = {
      gold: {
        stops: [
          [0,    '#5a3e08'], [0.04, '#d4a030'],
          [0.16, '#b08828'], [0.34, '#e0bc48'],
          [0.48, '#f8e870'], [0.54, '#fffacc'],
          [0.62, '#e0bc48'], [0.80, '#b08828'],
          [0.94, '#886018'], [1,    '#3c2804']
        ],
        engrave: 'rgba(38, 20, 2, 0.72)',
        hi: 'rgba(255, 254, 220, 0.88)'
      },
      rose: {
        stops: [
          [0,    '#5a2810'], [0.04, '#d09060'],
          [0.16, '#b07050'], [0.34, '#e0a880'],
          [0.48, '#f8c8a0'], [0.54, '#ffeedd'],
          [0.62, '#e0a880'], [0.80, '#b07050'],
          [0.94, '#885038'], [1,    '#3c1c0c']
        ],
        engrave: 'rgba(40, 16, 6, 0.70)',
        hi: 'rgba(255, 236, 218, 0.88)'
      },
      silver: {
        stops: [
          [0,    '#303038'], [0.04, '#c8c8d4'],
          [0.16, '#9898a8'], [0.34, '#d4d4e0'],
          [0.48, '#f4f4f8'], [0.54, '#ffffff'],
          [0.62, '#d4d4e0'], [0.80, '#9898a8'],
          [0.94, '#606070'], [1,    '#202028']
        ],
        engrave: 'rgba(16, 16, 24, 0.68)',
        hi: 'rgba(255, 255, 255, 0.92)'
      }
    };
    const p = metals[cs.metal || 'gold'];

    // Band: full-width, tall — like a close-up of a bangle face
    const bx = 0, by = Math.round(css * 0.14);
    const bw = css,  bh = Math.round(css * 0.72);
    const br = 10; // subtle corner radius only

    function bandPath() {
      ctx.beginPath();
      ctx.moveTo(bx + br, by);
      ctx.lineTo(bx + bw - br, by);
      ctx.arcTo(bx + bw, by, bx + bw, by + br, br);
      ctx.arcTo(bx + bw, by + bh, bx + bw - br, by + bh, br);
      ctx.lineTo(bx + br, by + bh);
      ctx.arcTo(bx, by + bh, bx, by + bh - br, br);
      ctx.arcTo(bx, by, bx + br, by, br);
      ctx.closePath();
    }

    // --- Main metal fill ---
    ctx.save();
    bandPath();
    const grad = ctx.createLinearGradient(0, by, 0, by + bh);
    p.stops.forEach(([pos, col]) => grad.addColorStop(pos, col));
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();

    // --- Inner bevel: thin bright line near top and dark line near bottom ---
    ctx.save();
    bandPath();
    ctx.clip();
    // top sheen strip
    const topSheen = ctx.createLinearGradient(0, by, 0, by + bh * 0.07);
    topSheen.addColorStop(0, p.hi);
    topSheen.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = topSheen;
    ctx.fillRect(0, by, css, bh * 0.07);
    // bottom shadow strip
    const btmShad = ctx.createLinearGradient(0, by + bh * 0.93, 0, by + bh);
    btmShad.addColorStop(0, 'rgba(0,0,0,0)');
    btmShad.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = btmShad;
    ctx.fillRect(0, by + bh * 0.93, css, bh * 0.07);
    ctx.restore();

    // --- Edge stroke ---
    ctx.save();
    bandPath();
    ctx.strokeStyle = p.stops[p.stops.length - 1][1];
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // --- Engraving text (clipped to band) ---
    ctx.save();
    bandPath();
    ctx.clip();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const cx = css / 2;
    const nameY = by + bh * 0.5 + (name && date ? -11 : 0);

    if (name) {
      const fs = Math.min(28, Math.max(15, Math.floor(bw * 0.082)));
      ctx.font = `italic 500 ${fs}px "Cormorant Garamond", serif`;
      // Highlight pass first (top edge of groove catches light)
      ctx.fillStyle = p.hi;
      ctx.fillText(name, cx, nameY - 1.8, bw - 28);
      // Dark groove (the cut into the metal)
      ctx.fillStyle = p.engrave;
      ctx.fillText(name, cx, nameY, bw - 28);
    }

    if (date) {
      const dateY = by + bh * 0.5 + (name ? 22 : 0);
      const dfs = Math.min(15, Math.max(11, Math.floor(bw * 0.044)));
      ctx.font = `italic 400 ${dfs}px "Cormorant Garamond", serif`;
      ctx.fillStyle = p.hi;
      ctx.fillText(date, cx, dateY - 1.2, bw - 50);
      ctx.fillStyle = p.engrave.replace('0.72', '0.52').replace('0.70', '0.48').replace('0.68', '0.45');
      ctx.fillText(date, cx, dateY, bw - 50);
    }

    ctx.restore();

    // Fade out photo, fade in render
    img.style.opacity = '0';
    canvas.style.opacity = '1';

    if (card) {
      card.classList.add('visible');
      document.getElementById('ec-name').textContent = name || 'Your horse\'s name';
      document.getElementById('ec-date').textContent = date;
    }
  }

  function updateProgress() {
    document.querySelectorAll('.c-progress-dot').forEach((d, i) => d.classList.toggle('active', i < cs.step));
    document.getElementById('c-current-step').textContent = cs.step;
    document.getElementById('c-step-name').textContent = stepNames[cs.step - 1];
    document.getElementById('c-btn-back').style.display = cs.step > 1 ? 'block' : 'none';
    document.getElementById('c-btn-next').textContent = cs.step === 5 ? 'Reserve my piece →' : 'Continue →';
  }

  function updateSummary() {
    const pNames = { bracelet: 'The Bracelet', ring: 'The Ring', both: 'Bracelet + Ring' };
    const mNames = { gold: '18kt Gold', rose: 'Rose Gold', silver: 'Silver' };
    document.getElementById('s-piece').textContent = cs.piece ? pNames[cs.piece] : '—';
    document.getElementById('s-metal').textContent = cs.metal ? mNames[cs.metal] : '—';
    document.getElementById('s-engraving').textContent = cs.horseName || '—';
    document.getElementById('c-summary-price').textContent = cs.price ? '€' + cs.price.toLocaleString() : '—';
  }

  function goToStep(n) {
    document.querySelectorAll('.c-step').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('c-step-' + n);
    if (el) el.classList.add('active');
    cs.step = n;
    updateProgress();
    updateSummary();

    const title = el && el.querySelector('.c-step-title-center');
    if (title) title.focus();

    const canvas = document.getElementById('c-canvas');
    const img = document.getElementById('c-main-img');
    if (n === 3) {
      if (cs.horseName || cs.privateDate) renderEngravingCanvas();
    } else {
      if (canvas) canvas.style.opacity = '0';
      if (img) img.style.opacity = '1';
    }

    const card = document.getElementById('c-engraving-card');
    if (card) {
      card.classList.toggle('visible', n === 3 && (cs.horseName.length > 0 || cs.privateDate.length > 0));
    }
  }

  function canProceed() {
    if (cs.step === 1) return cs.piece !== null;
    if (cs.step === 2) return cs.metal !== null;
    if (cs.step === 3) return cs.horseName.trim().length > 0;
    if (cs.step === 4) return true;
    if (cs.step === 5) {
      const n = document.getElementById('c-name').value.trim();
      const e = document.getElementById('c-email').value.trim();
      return n.length > 0 && e.includes('@');
    }
    return true;
  }

  // Step 1: piece selection
  document.querySelectorAll('#c-step-1 .c-opt-card').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#c-step-1 .c-opt-card').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      cs.piece = btn.dataset.value;
      cs.price = parseInt(btn.dataset.price);
      updateMainVisual();
      updateSummary();
    });
  });

  // Step 2: metal selection
  document.querySelectorAll('#c-step-2 .c-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#c-step-2 .c-swatch').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      cs.metal = btn.dataset.value;
      updateMainVisual();
      updateSummary();
    });
  });

  // Step 3: engravings with live canvas preview
  document.getElementById('c-horse-name').addEventListener('input', e => {
    cs.horseName = e.target.value;
    updateSummary();
    renderEngravingCanvas();
  });
  document.getElementById('c-private-date').addEventListener('input', e => {
    cs.privateDate = e.target.value;
    renderEngravingCanvas();
  });
  document.getElementById('c-size').addEventListener('input', e => { cs.size = e.target.value; });

  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mykqlvzp';

  function showSubmitError(message) {
    let el = document.getElementById('c-submit-error');
    if (!el) {
      el = document.createElement('p');
      el.id = 'c-submit-error';
      el.className = 'c-submit-error';
      document.getElementById('c-nav').insertAdjacentElement('beforebegin', el);
    }
    el.textContent = message;
  }

  document.getElementById('c-btn-next').addEventListener('click', async () => {
    if (!canProceed()) return;
    if (cs.step === 5) {
      const btn = document.getElementById('c-btn-next');
      const pNames = { bracelet: 'The Bracelet', ring: 'The Ring', both: 'Bracelet + Ring' };
      const mNames = { gold: '18kt Gold', rose: 'Rose Gold', silver: 'Silver' };
      const payload = {
        piece: cs.piece ? pNames[cs.piece] : '',
        metal: cs.metal ? mNames[cs.metal] : '',
        horseName: cs.horseName,
        privateDate: cs.privateDate,
        wristSize: cs.size,
        price: cs.price ? ('€' + cs.price.toLocaleString()) : '',
        name: document.getElementById('c-name').value.trim(),
        email: document.getElementById('c-email').value.trim(),
      };
      btn.disabled = true;
      btn.textContent = 'Sending…';
      showSubmitError('');
      try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Submit failed');
        document.querySelectorAll('.c-step').forEach(s => s.classList.remove('active'));
        document.getElementById('c-success').style.display = 'block';
        document.getElementById('c-nav').style.display = 'none';
        document.querySelector('.c-step-indicator').style.display = 'none';
        document.querySelector('.c-progress-bar').style.display = 'none';
      } catch (err) {
        showSubmitError('Something went wrong sending your reservation. Please try again, or email us directly.');
        btn.disabled = false;
        btn.textContent = 'Reserve my piece →';
      }
      return;
    }
    goToStep(cs.step + 1);
  });

  document.getElementById('c-btn-back').addEventListener('click', () => { if (cs.step > 1) goToStep(cs.step - 1); });

  updateProgress(); updateSummary();
  } // end configurator guard
