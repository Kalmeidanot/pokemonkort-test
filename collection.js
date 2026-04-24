function renderCollection() {
  const grid = document.getElementById('card-grid');

  let cards;
  try { cards = JSON.parse(localStorage.getItem('kortkammer_collection')) || []; }
  catch { cards = []; }

  if (cards.length === 0) {
    grid.innerHTML =
      '<div class="empty-state">' +
      '<svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">' +
      '<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>' +
      '</svg>' +
      '<p class="empty-state-title">Samlingen er tom</p>' +
      '<p class="empty-state-desc">Legg til kort fra kortdetaljsiden.</p>' +
      '<a href="set.html" class="btn btn-primary">Se alle kort</a>' +
      '</div>';
    return;
  }

  grid.innerHTML = '';
  cards.forEach(card => {
    const a = document.createElement('a');
    a.href = 'card.html?id=' + card.id;
    a.className = 'pokemon-card';
    a.innerHTML =
      '<img src="' + card.image + '" alt="' + card.name + '" loading="lazy" />' +
      '<p class="pokemon-card-name">' + card.name + '</p>' +
      '<p class="pokemon-card-number">' + card.number + '</p>';
    grid.appendChild(a);
  });
}

document.addEventListener('DOMContentLoaded', renderCollection);
