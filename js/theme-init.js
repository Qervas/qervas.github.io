/* Apply theme before paint. Prefer dark (X aesthetic) when unset. */

(function () {
  try {
    var mode = localStorage.getItem('theme'); // light | dark | system | null
    var resolved;
    if (mode === 'light' || mode === 'dark') {
      resolved = mode;
    } else if (mode === 'system') {
      resolved = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      // First visit: dark-first for X shell
      mode = 'dark';
      resolved = 'dark';
    }
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.setAttribute('data-theme-mode', mode);
    document.documentElement.style.colorScheme = resolved;
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.setAttribute('data-theme-mode', 'dark');
  }
})();
