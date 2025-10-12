// Embed the Vega-Lite spec into #map
(async () => {
  const mapSpecUrl = 'w9.json';
  const mapTarget = document.getElementById('map');
  const monthlyTarget = document.getElementById('monthly');

  const opts = {
    actions: { export: true, source: true, compiled: false, editor: true },
    renderer: 'canvas'
  };

  try {
    await vegaEmbed(mapTarget, mapSpecUrl, opts);
  } catch (err) {
    console.error('Failed to render map spec:', err);
    mapTarget.innerHTML = '<p style="color:#ef4444">Failed to load map. Check console for details.</p>';
  }

  if (monthlyTarget) {
    try {
      await vegaEmbed(monthlyTarget, 'monthly_crashes.json', opts);
    } catch (err) {
      console.error('Failed to render monthly chart:', err);
      monthlyTarget.innerHTML = '<p style="color:#ef4444">Failed to load monthly chart. Check console for details.</p>';
    }
  }
})();
