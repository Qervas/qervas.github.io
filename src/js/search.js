/* search.js — client-side filter over posts + projects (synced inputs) */
(function () {
  const inputs = Array.from(document.querySelectorAll('.site-search-input'));
  const hint = document.getElementById('site-search-hint');
  if (!inputs.length) return;

  const items = Array.from(document.querySelectorAll('.post, .project-item, .posts-card, .posts-article'));
  if (!items.length) return;

  let lastScroll = 0;

  function normalize(s) {
    return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function apply(q, source) {
    const query = normalize(q);

    // Keep inputs in sync
    inputs.forEach(function (inp) {
      if (inp !== source && inp.value !== q) inp.value = q;
    });

    document.body.classList.toggle('is-searching', query.length > 0);

    if (!query) {
      items.forEach(function (el) {
        el.classList.remove('is-search-hit', 'is-search-miss');
      });
      if (hint) {
        hint.hidden = true;
        hint.textContent = '';
      }
      return;
    }

    let hits = 0;
    let first = null;
    items.forEach(function (el) {
      const text = normalize(el.textContent);
      const match = text.indexOf(query) !== -1;
      el.classList.toggle('is-search-hit', match);
      el.classList.toggle('is-search-miss', !match);
      if (match) {
        hits++;
        if (!first) first = el;
      }
    });

    if (hint) {
      hint.hidden = false;
      hint.textContent = hits
        ? hits + ' match' + (hits === 1 ? '' : 'es')
        : 'No matches';
    }

    if (first) {
      const now = Date.now();
      if (now - lastScroll > 280) {
        lastScroll = now;
        const top = first.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    }
  }

  inputs.forEach(function (input) {
    let t = null;
    input.addEventListener('input', function () {
      clearTimeout(t);
      const val = input.value;
      t = setTimeout(function () { apply(val, input); }, 120);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        input.value = '';
        apply('', input);
        input.blur();
      }
    });
  });
})();
