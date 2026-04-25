let allCards = [];
let activeCards = [];
let visibleCardCount = 40;
let currentSet = null;

const CARDS_PER_PAGE = 40;

function getSelectedSet() {
  const params = new URLSearchParams(window.location.search);
  const requestedSet = params.get('set') || 'sv151';
  const sets = window.KORTKAMMER_SETS || [];
  return sets.find(set => set.id === requestedSet) ||
    sets.find(set => set.id === 'sv151') ||
    {
      id: 'sv151',
      apiId: 'sv3pt5',
      name: 'Scarlet & Violet 151',
      logo: 'https://images.pokemontcg.io/sv3pt5/logo.png',
      imageFolder: 'images/cards/sv151/large',
      cacheKey: 'kortkammer_cards_sv151',
      cacheTimeKey: 'kortkammer_cards_sv151_cached_at'
    };
}

function initSetHeader() {
  document.title = currentSet.name + ' – KortKammer';

  const logo = document.getElementById('set-logo');
  if (logo) {
    logo.src = currentSet.logo;
    logo.alt = currentSet.name;
  }
}

function getStoredIds(key) {
  try { return (JSON.parse(localStorage.getItem(key)) || []).map(c => c.id); }
  catch { return []; }
}

function getLocalCardImage(card) {
  const numStr   = card.number.replace(/[^0-9]/g, '');
  const padded   = numStr && parseInt(numStr) > 0
    ? String(parseInt(numStr)).padStart(3, '0')
    : card.number.toLowerCase().replace(/[^a-z0-9]/g, '');
  const name = card.name
    .toLowerCase()
    .replace(/[''']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return currentSet.imageFolder + '/' + padded + '-' + name + '.png';
}

function readCachedCards() {
  try {
    const cached = localStorage.getItem(currentSet.cacheKey);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function writeCachedCards(cards) {
  try {
    localStorage.setItem(currentSet.cacheKey, JSON.stringify(cards));
    localStorage.setItem(currentSet.cacheTimeKey, new Date().toISOString());
  } catch {
    // Cache failures should not block the live API result from rendering.
  }
}

async function fetchCardsFromApi() {
  const res = await fetch('https://api.pokemontcg.io/v2/cards?q=set.id:' + currentSet.apiId + '&orderBy=number&pageSize=250');
  const data = await res.json();
  return data.data;
}

async function loadCards() {
  const grid = document.getElementById('card-grid');
  if (!grid) return;

  const cachedCards = readCachedCards();
  if (Array.isArray(cachedCards) && cachedCards.length > 0) {
    allCards = cachedCards;
    renderCards(allCards);
  }

  try {
    const freshCards = await fetchCardsFromApi();
    const freshJson = JSON.stringify(freshCards);
    const cachedJson = cachedCards ? JSON.stringify(cachedCards) : null;

    writeCachedCards(freshCards);

    if (freshJson !== cachedJson) {
      allCards = freshCards;
      if (cachedCards) {
        applyFilters();
      } else {
        renderCards(allCards);
      }
    }
  } catch (err) {
    if (!cachedCards) {
      grid.innerHTML = '<p class="error-text">Kunne ikke laste kortene. Sjekk internettforbindelsen og prøv igjen.</p>';
    }
  }
}

function getLoadMoreButton() {
  const grid = document.getElementById('card-grid');
  if (!grid) return null;

  let wrap = document.getElementById('load-more-wrap');
  let btn = document.getElementById('load-more-btn');

  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'load-more-wrap';
    wrap.className = 'load-more-wrap';
    grid.insertAdjacentElement('afterend', wrap);
  }

  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'load-more-btn';
    btn.className = 'btn btn-secondary';
    btn.type = 'button';
    btn.textContent = 'Vis flere kort';
    btn.addEventListener('click', () => {
      visibleCardCount += CARDS_PER_PAGE;
      renderCards(activeCards, false);
    });
    wrap.appendChild(btn);
  }

  return btn;
}

function updateLoadMoreButton(totalCards) {
  const btn = getLoadMoreButton();
  const wrap = document.getElementById('load-more-wrap');
  if (!btn || !wrap) return;

  const hasMore = visibleCardCount < totalCards;
  wrap.hidden = !hasMore;
  btn.disabled = !hasMore;
}

function renderCards(cards, resetPage = true) {
  const grid = document.getElementById('card-grid');
  grid.innerHTML = '';

  activeCards = cards;
  if (resetPage) visibleCardCount = CARDS_PER_PAGE;

  if (cards.length === 0) {
    grid.innerHTML = '<p class="loading-text">Ingen kort matchet søket.</p>';
    updateLoadMoreButton(cards.length);
    return;
  }

  const collKey = getUserStorageKey('collection');
  const wishKey = getUserStorageKey('wishlist');
  const collIds = collKey ? getStoredIds(collKey) : [];
  const wishIds = wishKey ? getStoredIds(wishKey) : [];

  cards.slice(0, visibleCardCount).forEach(card => {
    let badge = '';
    if (collIds.includes(card.id)) {
      badge = '<span class="card-status-badge card-status-collection">✓ I samling</span>';
    } else if (wishIds.includes(card.id)) {
      badge = '<span class="card-status-badge card-status-wishlist">♡ Ønsket</span>';
    }

    const localSrc = getLocalCardImage(card);
    const a = document.createElement('a');
    a.href = `card.html?id=${card.id}`;
    a.className = 'pokemon-card';
    a.dataset.cardId = card.id;
    a.innerHTML =
      badge +
      `<img src="${localSrc}" onerror="this.onerror=null;this.src='${card.images.large}'" alt="${card.name}" loading="lazy" decoding="async" />
      <p class="pokemon-card-name">${card.name}</p>
      <p class="pokemon-card-number">${card.number}/${card.set.printedTotal}</p>`;
    grid.appendChild(a);
  });

  updateLoadMoreButton(cards.length);
}

function updateCardBadges() {
  const collKey = getUserStorageKey('collection');
  const wishKey = getUserStorageKey('wishlist');
  const collIds = collKey ? getStoredIds(collKey) : [];
  const wishIds = wishKey ? getStoredIds(wishKey) : [];

  document.querySelectorAll('.pokemon-card[data-card-id]').forEach(el => {
    const id = el.dataset.cardId;
    const existing = el.querySelector('.card-status-badge');
    if (existing) existing.remove();
    if (collIds.includes(id)) {
      const span = document.createElement('span');
      span.className = 'card-status-badge card-status-collection';
      span.textContent = '✓ I samling';
      el.prepend(span);
    } else if (wishIds.includes(id)) {
      const span = document.createElement('span');
      span.className = 'card-status-badge card-status-wishlist';
      span.textContent = '♡ Ønsket';
      el.prepend(span);
    }
  });
}

function applyFilters() {
  const search = document.getElementById('search-input')?.value.toLowerCase() ?? '';
  const type   = document.getElementById('type-dropdown')?.dataset.value ?? '';
  const sort   = document.getElementById('sort-select')?.value ?? '';

  let filtered = allCards.filter(card => {
    const matchSearch = card.name.toLowerCase().includes(search);
    const matchType   = !type || (card.types && card.types.includes(type));
    return matchSearch && matchType;
  });

  if (sort === 'name') {
    filtered.sort((a, b) => a.name.localeCompare(b.name, 'no'));
  } else if (sort === 'number') {
    filtered.sort((a, b) => parseInt(a.number) - parseInt(b.number));
  }

  renderCards(filtered);
}

function resetFilters() {
  document.getElementById('search-input').value = '';
  document.getElementById('sort-select').value  = '';

  const dropdown = document.getElementById('type-dropdown');
  const label    = document.querySelector('#type-dropdown-btn .type-dropdown-label');
  if (dropdown) dropdown.dataset.value = '';
  if (label)    label.textContent = 'Alle typer';
  document.querySelectorAll('.type-option').forEach(o => o.classList.remove('selected'));
  const allOpt = document.querySelector('.type-option[data-value=""]');
  if (allOpt) allOpt.classList.add('selected');

  renderCards(allCards);
}

function initTypeDropdown() {
  const dropdown = document.getElementById('type-dropdown');
  const btn      = document.getElementById('type-dropdown-btn');
  const menu     = document.getElementById('type-dropdown-menu');
  if (!dropdown || !btn || !menu) return;

  const label = btn.querySelector('.type-dropdown-label');

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = menu.classList.contains('open');
    menu.classList.toggle('open', !isOpen);
    btn.classList.toggle('open', !isOpen);
  });

  menu.addEventListener('click', e => {
    const option = e.target.closest('.type-option');
    if (!option) return;

    dropdown.dataset.value = option.dataset.value;

    const optImg  = option.querySelector('img');
    const optText = option.querySelector('span')?.textContent || option.textContent.trim();

    if (optImg) {
      label.innerHTML =
        "<img src='" + optImg.getAttribute('src') + "' class='type-icon' alt='' aria-hidden='true' />" +
        "<span>" + optText + "</span>";
    } else {
      label.textContent = optText;
    }

    menu.querySelectorAll('.type-option').forEach(o => o.classList.remove('selected'));
    option.classList.add('selected');
    menu.classList.remove('open');
    btn.classList.remove('open');

    applyFilters();
  });

  document.addEventListener('click', () => {
    menu.classList.remove('open');
    btn.classList.remove('open');
  });
}

window.addEventListener('storage', (event) => {
  const collKey = getUserStorageKey('collection');
  const wishKey = getUserStorageKey('wishlist');
  if (event.key === collKey || event.key === wishKey) {
    updateCardBadges();
  }
});

window.addEventListener('kortkammerUpdated', updateCardBadges);

document.addEventListener('DOMContentLoaded', () => {
  currentSet = getSelectedSet();
  initSetHeader();
  loadCards();
  initTypeDropdown();

  document.getElementById('search-input')?.addEventListener('input', applyFilters);
  document.getElementById('sort-select')?.addEventListener('change', applyFilters);
  document.getElementById('reset-btn')?.addEventListener('click', resetFilters);
});
