/* Dashboard bootstrapper: builds layout and embeds the Vega-Lite spec */
(function() {
  const hasVega = () => typeof window.vegaEmbed === 'function';
  const el = { header: null, controls: null, intro: null, content: null, grid: null, leftCard: null, rightCol: null };

  function ensureLibs(callback) {
    if (hasVega()) return callback();
    const head = document.head || document.getElementsByTagName('head')[0];
    const scripts = [
      'https://cdn.jsdelivr.net/npm/vega@5',
      'https://cdn.jsdelivr.net/npm/vega-lite@5',
      'https://cdn.jsdelivr.net/npm/vega-embed@6'
    ];
    let loaded = 0;
    scripts.forEach(src => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => { loaded += 1; if (loaded === scripts.length) callback(); };
      s.onerror = () => console.warn('Failed to load', src);
      head.appendChild(s);
    });
  }

  function injectBaseStyles() {
    if (document.getElementById('dashboard-base-styles')) return;
    const style = document.createElement('style');
    style.id = 'dashboard-base-styles';
    style.textContent = `
      html, body { height: 100%; }
      body { margin: 0; overflow: hidden; }
      :root { --gap: 16px; --gap-lg: 20px; --card-bg: #ffffff; --muted: #64748b; }
      * { box-sizing: border-box; }
      body { margin: 0; font-family: Segoe UI, Roboto, Inter, system-ui, -apple-system, Arial, sans-serif; background:#f7fafc; color:#0f172a; }
      .page { display:flex; flex-direction:column; min-height:100vh; }
      .header { padding: 16px 20px; background:#ffffff; border-bottom:1px solid #e5e7eb; }
      .header h1 { margin:0; font-size:24px; font-weight:700; }
      .controls { display:flex; flex-wrap:wrap; gap: var(--gap); padding: 12px 20px; background:#ffffff; border-bottom:1px solid #e5e7eb; align-items:center; }
      .controls label { font-weight:600; color:#334155; margin-right:6px; }
      .content { padding: var(--gap-lg); max-width: 1320px; width: 100%; margin: 0 auto; }
      .viz-card { background: var(--card-bg); border:1px solid #e5e7eb; border-radius: 10px; box-shadow: 0 1px 2px rgba(16,24,40,.04); padding: var(--gap); }
      .grid { display:grid; grid-template-columns: 1fr; gap: var(--gap-lg); align-items:start; justify-items:center; }
      .right { display:grid; grid-template-rows: auto auto; gap: var(--gap-lg); }
      .muted { color: var(--muted); font-size: 12px; }
  #viz-map { min-height: 0; margin: 0 auto; }
      #viz-map .vega-embed { width: 100%; height: 100%; }
      #viz-map svg, #viz-map canvas { max-width: 100%; }
      @media (max-width: 1200px) { .grid { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(style);
  }

  function buildLayout() {
    const root = document.getElementById('app') || document.body;

    const page = document.createElement('div');
    page.className = 'page';

  const header = document.createElement('header');
  header.className = 'header';
  header.innerHTML = '<h1>Queensland Crashes Dashboard</h1>';
  el.header = header;

  const controls = document.createElement('section');
  controls.className = 'controls';
    const controlsMount = document.createElement('div');
    controlsMount.id = 'controls';
    controls.appendChild(controlsMount);
  el.controls = controls;

  const content = document.createElement('main');
  content.className = 'content';
  el.content = content;

    const intro = document.createElement('div');
    intro.className = 'viz-card';
    intro.id = 'intro-card';
    intro.style.marginBottom = 'var(--gap-lg)';
    intro.innerHTML = `
      <p><strong>Why:</strong> This dashboard helps uncover where and when crashes occur, and which crash patterns are most prevalent. It supports targeting safety interventions and monitoring outcomes.</p>
      <p><strong>What:</strong> Use the controls to focus by Severity, LGA, crash Type/Nature, Years, and Casualties. The map highlights hotspots; the monthly bars reveal seasonality; the matrix shows high-risk Type × Nature combinations.</p>
    `;
    el.intro = intro;

  const grid = document.createElement('div');
  grid.className = 'grid';
  el.grid = grid;

  const leftCard = document.createElement('div');
  leftCard.className = 'viz-card';
  leftCard.id = 'viz-map';
  el.leftCard = leftCard;

  const rightCol = document.createElement('div');
  rightCol.className = 'right';
  el.rightCol = rightCol;

    const topCard = document.createElement('div');
    topCard.className = 'viz-card';
    topCard.id = 'viz-monthly';

    const bottomCard = document.createElement('div');
    bottomCard.className = 'viz-card';
    bottomCard.id = 'viz-heatmap';

  rightCol.appendChild(topCard);
    rightCol.appendChild(bottomCard);

  grid.appendChild(leftCard);
    grid.appendChild(rightCol);

  content.appendChild(intro);
  content.appendChild(grid);

    page.appendChild(header);
    page.appendChild(controls);
    page.appendChild(content);

    // Clear and mount
    root.innerHTML = '';
    root.appendChild(page);

    // Apply explicit dimensions from HTML data attributes if provided
    const vw = parseInt(root.getAttribute('data-viewer-width'), 10);
    const vh = parseInt(root.getAttribute('data-viewer-height'), 10);
    if (!isNaN(vw)) {
      leftCard.style.width = vw + 'px';
      grid.style.gridTemplateColumns = '1fr';
    }
    if (!isNaN(vh)) {
      leftCard.style.height = vh + 'px';
    }
  }

  function computeNaturalSize(spec) {
    try {
      const spacing = (spec.config && spec.config.concat && spec.config.concat.spacing) ? Number(spec.config.concat.spacing) : 16;
      if (Array.isArray(spec.hconcat) && spec.hconcat.length >= 2) {
        const left = spec.hconcat[0];
        const right = spec.hconcat[1];
        const leftW = Number(left.width || 0);
        const leftH = Number(left.height || 0);
        let rightW = 0, rightH = 0;
        if (Array.isArray(right.vconcat) && right.vconcat.length >= 1) {
          rightW = Number(right.vconcat[0].width || 0);
          rightH = right.vconcat.reduce((sum, vc, idx) => sum + Number(vc.height || 0) + (idx > 0 ? spacing : 0), 0);
        } else {
          rightW = Number(right.width || 0);
          rightH = Number(right.height || 0);
        }
        return {
          width: leftW + spacing + rightW,
          height: Math.max(leftH, rightH),
          parts: { leftW, leftH, rightW, rightH, spacing }
        };
      }
    } catch {}
    return { width: 1200, height: 800, parts: { leftW: 600, leftH: 600, rightW: 600, rightH: 600, spacing: 16 } };
  }

  function fitSpecToViewport(spec) {
    const content = el.content;
    const headerH = el.header ? el.header.offsetHeight : 0;
    const controlsH = el.controls ? el.controls.offsetHeight : 0;
    const introH = el.intro ? el.intro.offsetHeight : 0;
    const styles = window.getComputedStyle(content);
    const padV = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    const padH = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);

    const availH = Math.max(300, window.innerHeight - headerH - controlsH - introH - padV - 8);
    const availW = Math.max(320, (content.clientWidth || window.innerWidth) - padH);

    const nat = computeNaturalSize(spec);
    const scale = Math.min(availW / nat.width, availH / nat.height, 1);

    // Scale parts
    if (Array.isArray(spec.hconcat) && spec.hconcat.length >= 2) {
      const left = spec.hconcat[0];
      const right = spec.hconcat[1];
      if (nat.parts.leftW) left.width = Math.max(200, Math.floor(nat.parts.leftW * scale));
      if (nat.parts.leftH) left.height = Math.max(200, Math.floor(nat.parts.leftH * scale));
      if (Array.isArray(right.vconcat) && right.vconcat.length >= 1) {
        right.vconcat.forEach((vc, idx) => {
          if (nat.parts.rightW) vc.width = Math.max(200, Math.floor(nat.parts.rightW * scale));
          if (vc.height) vc.height = Math.max(160, Math.floor(Number(vc.height) * scale));
        });
      } else {
        if (nat.parts.rightW) right.width = Math.max(200, Math.floor(nat.parts.rightW * scale));
        if (nat.parts.rightH) right.height = Math.max(160, Math.floor(nat.parts.rightH * scale));
      }
    }

    // Set container size to scaled total
    const scaledW = Math.floor(nat.width * scale);
    const scaledH = Math.floor(nat.height * scale);
    el.leftCard.style.width = scaledW + 'px';
    el.leftCard.style.height = scaledH + 'px';
    return { scaledW, scaledH, scale };
  }

  async function embedSpec() {
    const specUrl = 'combined_dashboard.json';
    try {
      const res = await fetch(specUrl);
      if (!res.ok) throw new Error('Failed to load spec');
      const spec = await res.json();

      // Hide the right placeholders to maximize space and avoid horizontal scroll
      if (el.rightCol) el.rightCol.style.display = 'none';
      if (el.grid) el.grid.style.gridTemplateColumns = '1fr';

      // Fit spec to viewport and embed
      fitSpecToViewport(spec);
      await window.vegaEmbed('#viz-map', spec, { actions: false, renderer: 'canvas' });

      // Refit on resize (debounced)
      let tid;
      window.addEventListener('resize', () => {
        clearTimeout(tid);
        tid = setTimeout(async () => {
          const res2 = await fetch(specUrl);
          const fresh = await res2.json();
          fitSpecToViewport(fresh);
          await window.vegaEmbed('#viz-map', fresh, { actions: false, renderer: 'canvas' });
        }, 200);
      });
    } catch (err) {
      console.error(err);
      const error = document.createElement('div');
      error.textContent = 'Error loading dashboard.';
      document.getElementById('viz-map').appendChild(error);
    }
  }

  ensureLibs(() => {
    injectBaseStyles();
    buildLayout();
    embedSpec();
  });
})();
