/* project-filters.js — Tag filter chips for project grid */
(function () {
  const filterBar = document.getElementById('project-filters');
  const items = Array.from(document.querySelectorAll('.project-item[data-tags]'));
  const empty = document.getElementById('project-empty');
  if (!filterBar) return;

  function applyFilter(filter) {
    let shown = 0;
    items.forEach(function (item) {
      const tags = (item.getAttribute('data-tags') || '').split(/\s+/);
      const ok = filter === 'all' || tags.indexOf(filter) !== -1;
      item.hidden = !ok;
      if (ok) shown++;
    });
    if (empty) empty.hidden = shown > 0;
    filterBar.querySelectorAll('.filter-chip').forEach(function (chip) {
      chip.classList.toggle('is-active', chip.getAttribute('data-filter') === filter);
    });
  }

  filterBar.addEventListener('click', function (e) {
    const chip = e.target.closest('.filter-chip');
    if (!chip) return;
    applyFilter(chip.getAttribute('data-filter') || 'all');
  });
})();
