/* Apply theme before paint. Paper notebook unless a choice is stored. */

(function () {
  try {
    var mode = localStorage.getItem('theme'); // light | dark | system | null
    var resolved;
    if (mode === 'light' || mode === 'dark') {
      resolved = mode;
    } else if (mode === 'system') {
      resolved = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      mode = 'light';
      resolved = 'light';
    }
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.setAttribute('data-theme-mode', mode);
    document.documentElement.style.colorScheme = resolved;
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('data-theme-mode', 'light');
  }
})();
