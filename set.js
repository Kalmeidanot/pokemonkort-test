let allCards = [];

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
  return 'images/cards/sv151/large/' + padded + '-' + name + '.png';
}

async function loadCards() {
  const grid = document.getElementById('card-grid');
  if (!grid) return;

  try {
    const res = await fetch('https://api.pokemontcg.io/v2/cards?q=set.id:sv3pt5&orderBy=number&pageSize=250');
    const data = await res.json();
    allCards = data.data;
    renderCards(allCards);
  } catch (err) {
    grid.innerHTML = '<p class="error-text">Kunne ikke laste kortene. Sjekk internettforbindelsen og prøv igjen.</p>';
  }
}

function renderCards(cards) {
  const grid = document.getElementById('card-grid');
  grid.innerHTML = '';

  if (cards.length === 0) {
    grid.innerHTML = '<p class="loading-text">Ingen kort matchet søket.</p>';
    return;
  }

  const collIds = getStoredIds('kortkammer_collection');
  const wishIds = getStoredIds('kortkammer_wishlist');

  cards.forEach(card => {
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
    a.innerHTML =
      badge +
      `<img src="${localSrc}" onerror="this.onerror=null;this.src='${card.images.large}'" alt="${card.name}" loading="lazy" decoding="async" />
      <p class="pokemon-card-name">${card.name}</p>
      <p class="pokemon-card-number">${card.number}/${card.set.printedTotal}</p>`;
    grid.appendChild(a);
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

document.addEventListener('DOMContentLoaded', () => {
  loadCards();
  initTypeDropdown();

  document.getElementById('search-input')?.addEventListener('input', applyFilters);
  document.getElementById('sort-select')?.addEventListener('change', applyFilters);
  document.getElementById('reset-btn')?.addEventListener('click', resetFilters);
});
