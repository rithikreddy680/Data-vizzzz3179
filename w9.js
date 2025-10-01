// Embed the Vega-Lite spec into #map
(async () => {
  const specUrl = 'w9.json';
  const embedTarget = document.getElementById('map');

  const opts = {
    actions: { export: true, source: true, compiled: false, editor: true },
    renderer: 'canvas'
  };

  try {
    await vegaEmbed(embedTarget, specUrl, opts);
  } catch (err) {
    console.error('Failed to render spec:', err);
    embedTarget.innerHTML = '<p style="color:#ef4444">Failed to load map. Check console for details.</p>';
  }
})();
