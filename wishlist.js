function renderWishlist() {
  const grid = document.getElementById('card-grid');

  let cards;
  try { cards = JSON.parse(localStorage.getItem('kortkammer_wishlist')) || []; }
  catch { cards = []; }

  if (cards.length === 0) {
    grid.innerHTML =
      '<div class="empty-state">' +
      '<svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' +
      '</svg>' +
      '<p class="empty-state-title">Ønskelisten er tom</p>' +
      '<p class="empty-state-desc">Legg til kort du ønsker deg fra kortdetaljsiden.</p>' +
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

document.addEventListener('DOMContentLoaded', renderWishlist);
