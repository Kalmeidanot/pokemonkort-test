const params = new URLSearchParams(window.location.search);
const cardId = params.get("id");
const requestedVariant = params.get("variant");
const detail = document.getElementById("card-detail");

if (!cardId) {
  detail.innerHTML = "<p class='error-text'>Ingen kort valgt.</p>";
} else {
  fetch("https://api.pokemontcg.io/v2/cards/" + cardId)
    .then(res => res.json())
    .then(data => renderCard(data.data))
    .catch(() => {
      detail.innerHTML = "<p class='error-text'>Kunne ikke laste kortet. Prøv igjen.</p>";
    });
}

const TYPE_NAMES = {
  Darkness: "Dark",
  Colorless: "Normal",
};

const TYPE_FILES = {
  Fire:      "fire",
  Water:     "water",
  Grass:     "grass",
  Lightning: "lightning",
  Psychic:   "psychic",
  Fighting:  "fighting",
  Darkness:  "dark",
  Metal:     "metal",
  Dragon:    "dragon",
  Colorless: "normal",
  Fairy:     "fairy",
};

// --- localStorage helpers ---
function getList(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}
function saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}
function isInList(key, id) {
  return getList(key).some(c => c.id === id);
}
function getQuantityInList(key, id) {
  const card = getList(key).find(c => c.id === id);
  return card ? (Number(card.quantity) || 1) : 0;
}
function addToList(key, cardData) {
  const list = getList(key);
  const idx  = list.findIndex(c => c.id === cardData.id);
  if (idx >= 0) {
    list[idx].quantity = (Number(list[idx].quantity) || 1) + 1;
  } else {
    list.push({ ...cardData, quantity: 1 });
  }
  saveList(key, list);
  return idx >= 0 ? list[idx].quantity : 1;
}
function decreaseInList(key, id) {
  const list = getList(key);
  const idx = list.findIndex(c => c.id === id);
  if (idx < 0) return 0;

  const quantity = (Number(list[idx].quantity) || 1) - 1;
  if (quantity <= 0) {
    list.splice(idx, 1);
  } else {
    list[idx].quantity = quantity;
  }
  saveList(key, list);
  return quantity > 0 ? quantity : 0;
}

function getSetConfig(card) {
  const sets = window.KORTKAMMER_SETS || [];
  return sets.find(set => card.set && set.apiId === card.set.id) || null;
}

function getCardVariantOptions(card) {
  const setConfig = getSetConfig(card);
  return setConfig?.variants || [];
}

function getRequestedVariant(variants) {
  return variants.find(variant => variant.id === requestedVariant) || variants[0] || null;
}

function getCardAppId(card, variant) {
  return variant ? card.id + '-' + variant.id : card.id;
}

function getLocalCardImage(card, variant) {
  const setConfig = getSetConfig(card);
  const imageFolder = variant?.imageFolder || setConfig?.imageFolder || 'images/cards/sv151/large';
  const numStr = card.number.replace(/[^0-9]/g, '');
  const padded = numStr && parseInt(numStr) > 0
    ? String(parseInt(numStr)).padStart(3, '0')
    : card.number.toLowerCase().replace(/[^a-z0-9]/g, '');
  const name = card.name
    .toLowerCase()
    .replace(/[''']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return imageFolder + '/' + padded + '-' + name + '.png';
}

function getStoredCardData(card, variant) {
  const appId = getCardAppId(card, variant);
  const cardData = {
    id:      appId,
    name:    card.name,
    number:  card.number,
    setName: card.set ? card.set.name : "",
    image:   variant ? getLocalCardImage(card, variant) : card.images.small,
    types:   card.types || [],
    quantity: 1
  };

  if (variant) {
    cardData.appId = appId;
    cardData.apiId = card.id;
    cardData.variant = variant.id;
    cardData.setId = card.set ? card.set.id : "";
  }

  return cardData;
}

function typeBadge(t) {
  const name = TYPE_NAMES[t] || t;
  const file = TYPE_FILES[t] || t.toLowerCase();
  return "<span class='type-badge'>" +
    "<img src='images/types/" + file + ".png' alt='' aria-hidden='true' class='type-icon' />" +
    "<span>" + name + "</span>" +
    "</span>";
}

function costIcons(cost) {
  if (!cost || cost.length === 0) return "";
  return "<div class='attack-cost'>" +
    cost.map(c => {
      const file = TYPE_FILES[c] || c.toLowerCase();
      return "<img src='images/types/" + file + ".png' alt='" + (TYPE_NAMES[c] || c) + "' class='attack-cost-icon' />";
    }).join("") +
    "</div>";
}

function renderCard(card) {
  const variantOptions = getCardVariantOptions(card);
  let currentVariant = getRequestedVariant(variantOptions);

  // Types (høyre side)
  let typesHtml = "";
  if (card.types && card.types.length > 0) {
    typesHtml = "<div class='card-types'>" + card.types.map(typeBadge).join("") + "</div>";
  }

  // Info-panel under kortet (venstre side)
  let panelRows = "";
  if (card.set && card.set.name) {
    panelRows += "<div class='card-info-row'><span class='card-info-label'>Sett</span><span class='card-info-value'>" + card.set.name + "</span></div>";
  }
  if (card.number) {
    const total = (card.set && card.set.printedTotal) ? card.set.printedTotal : "?";
    panelRows += "<div class='card-info-row'><span class='card-info-label'>Nummer</span><span class='card-info-value'>" + card.number + "/" + total + "</span></div>";
  }
  if (card.rarity) {
    panelRows += "<div class='card-info-row'><span class='card-info-label'>Rarity</span><span class='card-info-value'>" + card.rarity + "</span></div>";
  }
  if (card.types && card.types.length > 0) {
    panelRows += "<div class='card-info-row card-info-row--type'><span class='card-info-label'>Type</span><div class='card-info-types'>" + card.types.map(typeBadge).join("") + "</div></div>";
  }
  const infoPanelHtml = panelRows
    ? "<div class='card-info-panel'>" + panelRows + "</div>"
    : "";

  // Angrep
  let attacksHtml = "";
  if (card.attacks && card.attacks.length > 0) {
    attacksHtml = "<div class='card-attacks'><h3>Angrep</h3>";
    card.attacks.forEach(attack => {
      attacksHtml +=
        "<div class='attack'>" +
        "<div class='attack-header'>" +
        "<div class='attack-left'>" +
        costIcons(attack.cost) +
        "<span class='attack-name'>" + attack.name + "</span>" +
        "</div>" +
        (attack.damage ? "<span class='attack-damage'>" + attack.damage + "</span>" : "") +
        "</div>" +
        (attack.text ? "<p class='attack-text'>" + attack.text + "</p>" : "") +
        "</div>";
    });
    attacksHtml += "</div>";
  }

  // Smakstekst
  const flavorHtml = card.flavorText
    ? "<div class='card-flavor'><h3>Om kortet</h3><p class='flavor-text'>" + card.flavorText + "</p></div>"
    : "";

  const actionsHtml =
    "<div class='card-actions'>" +
    "<div class='card-action-group'>" +
    "<button class='btn btn-primary btn-collection'>Legg til i samling</button>" +
    "<div class='quantity-control card-quantity-control' data-list='collection' hidden>" +
    "<button class='quantity-control-btn quantity-decrease' type='button' aria-label='Reduser antall i samling'>-</button>" +
    "<span class='quantity-control-value'>0</span>" +
    "<button class='quantity-control-btn quantity-increase' type='button' aria-label='Øk antall i samling'>+</button>" +
    "</div>" +
    "</div>" +
    "<div class='card-action-group'>" +
    "<button class='btn btn-secondary btn-wishlist'>Legg til ønskeliste</button>" +
    "<div class='quantity-control card-quantity-control' data-list='wishlist' hidden>" +
    "<button class='quantity-control-btn quantity-decrease' type='button' aria-label='Reduser antall i ønskeliste'>-</button>" +
    "<span class='quantity-control-value'>0</span>" +
    "<button class='quantity-control-btn quantity-increase' type='button' aria-label='Øk antall i ønskeliste'>+</button>" +
    "</div>" +
    "</div>" +
    "</div>";

  const variantHtml = variantOptions.length
    ? "<div class='card-info-panel card-variant-panel'>" +
      "<label class='card-info-row card-variant-row' for='card-variant-select'>" +
      "<span class='card-info-label'>Variant</span>" +
      "<select id='card-variant-select' class='sort-select'>" +
      variantOptions.map(variant => "<option value='" + variant.id + "'>" + variant.name + "</option>").join("") +
      "</select>" +
      "</label>" +
      "</div>"
    : "";

  const localSrc    = getLocalCardImage(card, currentVariant);
  const fallbackSrc = card.images.large || card.images.small;

  detail.innerHTML =
    "<div class='card-detail-left'>" +
    "<div class='card-detail-image'><img id='card-detail-img' src='" + localSrc + "' alt='" + card.name + "' /></div>" +
    variantHtml +
    infoPanelHtml +
    "</div>" +
    "<div class='card-detail-info'>" +
    "<h2 class='card-detail-name'>" + card.name + "</h2>" +
    (card.hp ? "<p class='card-hp'>HP <strong>" + card.hp + "</strong></p>" : "") +
    typesHtml +
    attacksHtml +
    flavorHtml +
    actionsHtml +
    "</div>";

  const cardImage = detail.querySelector('#card-detail-img');
  function updateCardImage() {
    if (!cardImage) return;
    cardImage.onerror = function() {
      this.onerror = null;
      this.src = fallbackSrc;
    };
    cardImage.src = getLocalCardImage(card, currentVariant);
  }
  updateCardImage();

  const variantSelect = detail.querySelector('#card-variant-select');
  let updateActionButtons = function() {};
  if (variantSelect) {
    variantSelect.value = currentVariant.id;
    variantSelect.addEventListener('change', () => {
      currentVariant = variantOptions.find(variant => variant.id === variantSelect.value) || variantOptions[0];
      updateCardImage();
      updateActionButtons();
    });
  }

  const collKey = getUserStorageKey('collection');
  const wishKey = getUserStorageKey('wishlist');

  if (!collKey || !wishKey) {
    detail.querySelector('.card-actions').innerHTML =
      '<p class="card-login-prompt">Logg inn for å bruke samling og ønskeliste</p>' +
      '<button class="btn btn-primary" onclick="login()">Logg inn</button>';
    return;
  }

  const collBtn = detail.querySelector('.btn-collection');
  const wishBtn = detail.querySelector('.btn-wishlist');
  const collControl = detail.querySelector('.quantity-control[data-list="collection"]');
  const wishControl = detail.querySelector('.quantity-control[data-list="wishlist"]');

  updateActionButtons = function() {
    const appId = getCardAppId(card, currentVariant);
    const collectionQty = getQuantityInList(collKey, appId);
    const wishlistQty = getQuantityInList(wishKey, appId);

    collBtn.textContent = collectionQty > 0 ? 'I samling (' + collectionQty + ')' : 'Legg til i samling';
    collBtn.classList.toggle('btn-active', collectionQty > 0);
    wishBtn.textContent = wishlistQty > 0 ? 'I ønskeliste (' + wishlistQty + ')' : 'Legg til ønskeliste';
    wishBtn.classList.toggle('btn-active', wishlistQty > 0);
    updateQuantityControl(collControl, collectionQty);
    updateQuantityControl(wishControl, wishlistQty);
  };
  updateActionButtons();

  collBtn.addEventListener('click', () => {
    if (getQuantityInList(collKey, getCardAppId(card, currentVariant)) === 0) {
      addToList(collKey, getStoredCardData(card, currentVariant));
      updateActionButtons();
      window.dispatchEvent(new Event('kortkammerUpdated'));
    }
  });

  wishBtn.addEventListener('click', () => {
    if (getQuantityInList(wishKey, getCardAppId(card, currentVariant)) === 0) {
      addToList(wishKey, getStoredCardData(card, currentVariant));
      updateActionButtons();
      window.dispatchEvent(new Event('kortkammerUpdated'));
    }
  });

  collControl?.querySelector('.quantity-increase')?.addEventListener('click', () => {
    addToList(collKey, getStoredCardData(card, currentVariant));
    updateActionButtons();
    window.dispatchEvent(new Event('kortkammerUpdated'));
  });

  collControl?.querySelector('.quantity-decrease')?.addEventListener('click', () => {
    decreaseInList(collKey, getCardAppId(card, currentVariant));
    updateActionButtons();
    window.dispatchEvent(new Event('kortkammerUpdated'));
  });

  wishControl?.querySelector('.quantity-increase')?.addEventListener('click', () => {
    addToList(wishKey, getStoredCardData(card, currentVariant));
    updateActionButtons();
    window.dispatchEvent(new Event('kortkammerUpdated'));
  });

  wishControl?.querySelector('.quantity-decrease')?.addEventListener('click', () => {
    decreaseInList(wishKey, getCardAppId(card, currentVariant));
    updateActionButtons();
    window.dispatchEvent(new Event('kortkammerUpdated'));
  });
}

function updateQuantityControl(control, quantity) {
  if (!control) return;
  control.hidden = quantity <= 0;
  const value = control.querySelector('.quantity-control-value');
  if (value) value.textContent = quantity;
}
