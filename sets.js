function renderSets() {
  const list = document.getElementById('sets-list');
  const sort = document.getElementById('sets-sort')?.value || 'oldest';
  if (!list || !window.KORTKAMMER_SETS) return;

  const sets = [...window.KORTKAMMER_SETS].sort((a, b) => {
    return sort === 'newest'
      ? b.releaseYear - a.releaseYear
      : a.releaseYear - b.releaseYear;
  });

  list.innerHTML = '';
  sets.forEach(set => {
    const a = document.createElement('a');
    a.href = set.href;
    a.className = 'set-card';
    a.innerHTML =
      '<div class="set-card-logo">' +
        '<img src="' + set.logo + '" alt="' + set.name + '" />' +
      '</div>' +
      '<div class="set-card-info">' +
        '<p class="set-card-name">' + set.name + '</p>' +
        '<p class="set-card-count">' + set.printedTotal + ' kort · ' + set.releaseYear + '</p>' +
        '<span class="set-card-cta">Se samling →</span>' +
      '</div>';
    list.appendChild(a);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderSets();
  document.getElementById('sets-sort')?.addEventListener('change', renderSets);
});
