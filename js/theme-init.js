/* Apply theme before paint (blocking). light | dark | system */

(function () {
  try {
    var mode = localStorage.getItem('theme'); // light | dark | system | null
    var resolved;
    if (mode === 'light' || mode === 'dark') {
      resolved = mode;
    } else {
      mode = 'system';
      resolved = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.setAttribute('data-theme-mode', mode);
    document.documentElement.style.colorScheme = resolved;
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.setAttribute('data-theme-mode', 'system');
  }
})();
  
