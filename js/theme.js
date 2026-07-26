/* Theme cycle: light → dark → system */

// Theme: cycle light → dark → system (system follows OS).
(function () {
  const KEY = 'theme';
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const ORDER = ['light', 'dark', 'system'];

  function systemTheme() {
    return mq.matches ? 'dark' : 'light';
  }

  function getMode() {
    try {
      const t = localStorage.getItem(KEY);
      if (t === 'light' || t === 'dark' || t === 'system') return t;
    } catch (e) { /* private mode */ }
    return 'system';
  }

  function resolve(mode) {
    return mode === 'system' ? systemTheme() : mode;
  }

  function apply(mode) {
    const theme = resolve(mode);
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-theme-mode', mode);
    root.style.colorScheme = theme;
    if (!btn) return;
    const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    btn.setAttribute('aria-label', 'Theme mode: ' + mode + '. Click for ' + next);
    btn.title = 'Theme: ' + mode + (mode === 'system' ? ' → ' + theme : '') + ' · click → ' + next;
  }

  function setMode(mode) {
    try { localStorage.setItem(KEY, mode); } catch (e) { /* ignore */ }
    apply(mode);
  }

  apply(getMode());

  if (btn) {
    btn.addEventListener('click', function () {
      const mode = getMode();
      setMode(ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length]);
    });
  }

  const onSystemChange = function () {
    if (getMode() === 'system') apply('system');
  };
  if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onSystemChange);
  else if (typeof mq.addListener === 'function') mq.addListener(onSystemChange);
})();
  
