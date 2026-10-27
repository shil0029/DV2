/* Embed the standalone JSON files and connect the two useful page controls. */
(() => {
  'use strict';
  const assetVersion = '20261027c';
  const views = new Map();
  const errors = [];
  window.fishingPage = { views, errors, ready: false };
  const fetchJSON = async path => {
    const response = await fetch(`${path}?v=${assetVersion}`);
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.json();
  };
  const sizeFor = element => Math.max(260, Math.floor(element.getBoundingClientRect().width));
  async function render(element) {
    const name = element.dataset.spec;
    const accessibleDescription = element.getAttribute('aria-label');
    element.innerHTML = '<span class="chart-loading">Drawing the data…</span>';
    try {
      const spec = await fetchJSON(`specs/${name}.json`);
      spec.width = sizeFor(element);
      // Keep the labelled Sankey readable on narrow screens without horizontal scrolling.
      if (name === '09-catch-sankey' && spec.width < 450) spec.height = 470;
      const result = await vegaEmbed(element, spec, { actions: false, renderer: 'svg', tooltip: { theme: 'custom' } });
      // Vega-Embed supplies a generic label; retain the chart-specific description.
      if (accessibleDescription) element.setAttribute('aria-label', accessibleDescription);
      views.set(name, result.view);
      let previousWidth = spec.width;
      let timer;
      new ResizeObserver(() => {
        const width = sizeFor(element);
        if (Math.abs(previousWidth - width) < 2) return;
        previousWidth = width;
        clearTimeout(timer);
        timer = setTimeout(() => result.view.width(width).resize().runAsync().catch(report), 100);
      }).observe(element);
    } catch (error) {
      errors.push({ chart: name, message: error.message });
      element.replaceChildren();
      const message = document.createElement('p');
      message.className = 'chart-error';
      message.append('This chart could not load. Reload the page, or ');
      const link = document.createElement('a');
      link.href = `specs/${name}.json`;
      link.textContent = 'open its source specification';
      message.append(link, '.');
      element.append(message);
      console.error(name, error);
    }
  }
  function report(error) { errors.push({ message: error.message }); console.error(error); }
  async function start() {
    await document.fonts.ready;
    const [nsw, national] = await Promise.all([fetchJSON('data/nsw.json'), fetchJSON('data/national.json')]);
    const speciesSelect = document.getElementById('species-select');
    const species = [...new Set(nsw.catch.map(row => row.species))].sort();
    for (const name of species) speciesSelect.add(new Option(name, name));
    speciesSelect.value = 'Snapper';
    await Promise.all([...document.querySelectorAll('[data-spec]')].map(render));
    const updateCatchSummary = () => {
      const rows = nsw.catch.filter(row => row.species === speciesSelect.value).sort((a,b) => a.year.localeCompare(b.year));
      const first = rows[0], last = rows[rows.length - 1];
      const change = (last.total / first.total - 1) * 100;
      document.getElementById('catch-summary').textContent = `${speciesSelect.value}: an estimated ${last.total.toLocaleString('en-AU')} catches in 2023–24, compared with ${first.total.toLocaleString('en-AU')} in 2017–18. The later estimate is ${Math.abs(change).toFixed(0)}% ${change < 0 ? 'lower' : 'higher'}.`;
      document.getElementById('chart-08').setAttribute('aria-label', `Estimated ${speciesSelect.value} catch over four NSW surveys from 2017–18 to 2023–24. ${document.getElementById('catch-summary').textContent}`);
    };
    updateCatchSummary();
    speciesSelect.addEventListener('change', async () => {
      try {
        const view = views.get('08-catch-timeline');
        if (view) await view.signal('species', speciesSelect.value).runAsync();
        updateCatchSummary();
      } catch (error) { report(error); }
    });
    const originSelect = document.getElementById('origin-select');
    const updateSummary = () => {
      const rows = national.interstate_employment_flows.filter(row => row.origin === originSelect.value);
      const top = [...rows].sort((a,b) => b.fte_jobs - a.fte_jobs)[0];
      const name = originSelect.selectedOptions[0].textContent;
      const total = rows.reduce((sum, row) => sum + row.fte_jobs, 0);
      document.getElementById('flow-heading').textContent = `${name}’s spending reaches beyond ${name}.`;
      document.getElementById('flow-summary').textContent = `In the 2018–19 model, spending by these residents supported about ${total.toLocaleString('en-AU')} full-time equivalent jobs in other states and territories. ${top.destination} received the largest interstate contribution: ${top.fte_jobs.toLocaleString('en-AU')} FTE jobs.`;
      document.getElementById('chart-10').setAttribute('aria-label', `Employment supported outside ${name} by recreational fishing spending from its residents. ${document.getElementById('flow-summary').textContent}`);
    };
    updateSummary();
    originSelect.addEventListener('change', async () => {
      try {
        const view = views.get('10-economic-flow-map');
        if (view) await view.signal('origin', originSelect.value).runAsync();
        updateSummary();
      } catch (error) { report(error); }
    });
    window.fishingPage.ready = true;
  }
  start().catch(error => {
    report(error);
    document.querySelectorAll('.chart').forEach(element => {
      if (!element.hasChildNodes()) {
        element.textContent = 'Chart data could not load. Please use a local web server or the published GitHub Pages address.';
        element.classList.add('chart-error');
      }
    });
  });
})();
