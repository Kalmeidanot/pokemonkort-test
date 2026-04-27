let currentFilter = 'all';

function renderWishlist() {
  const grid = document.getElementById('card-grid');
  const key  = getUserStorageKey('wishlist');

  if (!key) {
    updateSetFilter([]);
    grid.innerHTML =
      '<div class="empty-state">' +
      '<p class="empty-state-title">Logg inn for å se ønskelisten din</p>' +
      '<p class="empty-state-desc">Ønskelisten er knyttet til brukerkontoen din.</p>' +
      '<button class="btn btn-primary" onclick="login()">Logg inn</button>' +
      '</div>';
    return;
  }

  let cards;
  try { cards = JSON.parse(localStorage.getItem(key)) || []; }
  catch { cards = []; }

  updateSetFilter(cards);

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

  const visibleCards = currentFilter === 'all'
    ? cards
    : cards.filter(card => getStoredCardSetId(card) === currentFilter);

  grid.innerHTML = '';
  if (visibleCards.length === 0) {
    grid.innerHTML =
      '<div class="empty-state">' +
      '<p class="empty-state-title">Ingen kort i dette settet</p>' +
      '<p class="empty-state-desc">Velg et annet sett eller vis alle kort.</p>' +
      '</div>';
    return;
  }

  visibleCards.forEach(card => {
    const apiId = getStoredCardApiId(card);
    const href = card.variant
      ? 'card.html?id=' + encodeURIComponent(apiId) + '&variant=' + encodeURIComponent(card.variant)
      : 'card.html?id=' + encodeURIComponent(apiId);
    const image = getStoredCardImage(card);
    const fallback = getStoredCardFallbackImage(card);
    const el = document.createElement('div');
    el.className = 'pokemon-card';
    el.innerHTML =
      '<a href="' + href + '" class="pokemon-card-link">' +
      '<img src="' + image + '" onerror="this.onerror=null;this.src=\'' + fallback + '\'" alt="' + card.name + '" loading="lazy" />' +
      '<p class="pokemon-card-name">' + card.name + '</p>' +
      getVariantLabelHtml(card) +
      '<p class="pokemon-card-number">' + card.number + '</p>' +
      '</a>' +
      '<div class="pokemon-card-quantity-row" aria-label="Antall">' +
      '<span class="pokemon-card-quantity-label">Antall:</span>' +
      '<div class="quantity-control">' +
      '<button class="quantity-control-btn quantity-decrease" type="button" data-card-id="' + card.id + '" aria-label="Reduser antall">-</button>' +
      '<span class="quantity-control-value">' + getCardQuantity(card) + '</span>' +
      '<button class="quantity-control-btn quantity-increase" type="button" data-card-id="' + card.id + '" aria-label="Øk antall">+</button>' +
      '</div>' +
      '</div>';
    grid.appendChild(el);
  });

  grid.querySelectorAll('.quantity-decrease').forEach(btn => {
    btn.addEventListener('click', () => {
      decreaseQuantity(key, btn.dataset.cardId);
      renderWishlist();
    });
  });
  grid.querySelectorAll('.quantity-increase').forEach(btn => {
    btn.addEventListener('click', () => {
      increaseQuantity(key, btn.dataset.cardId);
      renderWishlist();
    });
  });
}

function getCardQuantity(card) {
  return Number(card.quantity) || 1;
}

function updateSetFilter(cards) {
  const select = document.getElementById('set-filter');
  if (!select) return;

  const setIds = [...new Set(cards.map(getStoredCardSetId).filter(Boolean))].sort();
  if (currentFilter !== 'all' && !setIds.includes(currentFilter)) {
    currentFilter = 'all';
  }

  select.innerHTML =
    '<option value="all">Alle sett</option>' +
    setIds.map(setId => '<option value="' + setId + '">' + getSetDisplayName(setId) + '</option>').join('');
  select.value = currentFilter;
  select.hidden = cards.length === 0;
}

function getSetDisplayName(setId) {
  const sets = window.KORTKAMMER_SETS || [];
  const set = sets.find(item => item.apiId === setId);
  return set ? set.name : setId;
}

function getStoredCardSetId(card) {
  if (card.setId) return card.setId;

  const apiId = getStoredCardApiId(card);
  const dashIndex = apiId.indexOf('-');
  return dashIndex > 0 ? apiId.slice(0, dashIndex) : '';
}

function decreaseQuantity(key, cardId) {
  let cards;
  try { cards = JSON.parse(localStorage.getItem(key)) || []; }
  catch { cards = []; }

  const idx = cards.findIndex(card => card.id === cardId);
  if (idx < 0) return;

  const quantity = getCardQuantity(cards[idx]) - 1;
  if (quantity <= 0) {
    cards.splice(idx, 1);
  } else {
    cards[idx].quantity = quantity;
  }
  localStorage.setItem(key, JSON.stringify(cards));
}

function increaseQuantity(key, cardId) {
  let cards;
  try { cards = JSON.parse(localStorage.getItem(key)) || []; }
  catch { cards = []; }

  const idx = cards.findIndex(card => card.id === cardId);
  if (idx < 0) return;

  cards[idx].quantity = getCardQuantity(cards[idx]) + 1;
  localStorage.setItem(key, JSON.stringify(cards));
}

function getVariantLabelHtml(card) {
  const names = {
    unlimited: 'Unlimited',
    shadowless: 'Shadowless',
    '1st-edition': '1st Edition'
  };
  return card.variant
    ? '<p class="pokemon-card-variant">' + (names[card.variant] || card.variant) + '</p>'
    : '';
}

function getStoredCardImage(card) {
  return card.image || buildLocalVariantImage(card) || getStoredCardFallbackImage(card);
}

function getStoredCardApiId(card) {
  if (card.apiId) return card.apiId;
  if (card.variant && card.id && card.id.endsWith('-' + card.variant)) {
    return card.id.slice(0, -1 * ('-' + card.variant).length);
  }
  return card.id;
}

function getStoredCardFallbackImage(card) {
  const apiId = getStoredCardApiId(card);
  const parts = apiId.split('-');
  return parts.length >= 2
    ? 'https://images.pokemontcg.io/' + parts[0] + '/' + parts[1] + '.png'
    : '';
}

function buildLocalVariantImage(card) {
  if (!card.setId || !card.variant || !card.number || !card.name) return '';

  const numStr = card.number.replace(/[^0-9]/g, '');
  const padded = numStr && parseInt(numStr) > 0
    ? String(parseInt(numStr)).padStart(3, '0')
    : card.number.toLowerCase().replace(/[^a-z0-9]/g, '');
  const name = card.name
    .toLowerCase()
    .replace(/[''']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return 'images/cards/' + card.setId + '/' + card.variant + '/' + padded + '-' + name + '.png';
}

document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('set-filter');
  if (select) {
    select.addEventListener('change', () => {
      currentFilter = select.value;
      renderWishlist();
    });
  }
  renderWishlist();
});
