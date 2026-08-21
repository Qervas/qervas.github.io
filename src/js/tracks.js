/* tracks.js — segmented "What I build" filter.
 * Sets body[data-track-focus]; tracks.css does the rest. */
(function () {
  const filter = document.getElementById('track-filter');
  if (!filter) return;

  const buttons = Array.from(filter.querySelectorAll('button[data-track]'));
  if (!buttons.length) return;

  function setFocus(next) {
    if (next === 'all') {
      document.body.removeAttribute('data-track-focus');
    } else {
      document.body.setAttribute('data-track-focus', next);
    }
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-track') === next ? 'true' : 'false');
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const next = btn.getAttribute('data-track');
      // clicking the live filter again clears it
      setFocus(btn.getAttribute('aria-pressed') === 'true' ? 'all' : next);
    });
  });

  setFocus('all');
})();
