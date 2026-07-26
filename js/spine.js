/* spine.js — Three-spine focus deck */
(function () {
  const cards = Array.from(document.querySelectorAll('.spine-card[data-spine]'));
  const allBtn = document.getElementById('spine-all');
  if (!cards.length) return;
  let focus = 'all';

  function setFocus(next) {
    focus = next;
    if (next === 'all') {
      document.body.removeAttribute('data-spine-focus');
      cards.forEach(function (c) {
        c.classList.add('is-active');
        c.classList.remove('is-dim');
        c.setAttribute('aria-pressed', 'true');
      });
      if (allBtn) {
        allBtn.classList.add('is-active');
        allBtn.setAttribute('aria-pressed', 'true');
      }
      return;
    }
    document.body.setAttribute('data-spine-focus', next);
    cards.forEach(function (c) {
      const s = c.getAttribute('data-spine');
      const on = s === next;
      c.classList.toggle('is-active', on);
      c.classList.toggle('is-dim', !on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (allBtn) {
      allBtn.classList.remove('is-active');
      allBtn.setAttribute('aria-pressed', 'false');
    }
    const fw = document.getElementById('featured-work');
    if (fw) fw.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      const s = card.getAttribute('data-spine');
      setFocus(focus === s ? 'all' : s);
    });
  });
  if (allBtn) {
    allBtn.addEventListener('click', function () { setFocus('all'); });
  }
  setFocus('all');
})();
