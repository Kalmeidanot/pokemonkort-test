const params = new URLSearchParams(window.location.search);
const cardId = params.get("id");
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
function toggleInList(key, cardData) {
  const list = getList(key);
  const idx  = list.findIndex(c => c.id === cardData.id);
  if (idx >= 0) { list.splice(idx, 1); } else { list.push(cardData); }
  saveList(key, list);
  return idx < 0; // true = lagt til, false = fjernet
}

function getLocalCardImage(card) {
  const numStr = card.number.replace(/[^0-9]/g, '');
  const padded = numStr && parseInt(numStr) > 0
    ? String(parseInt(numStr)).padStart(3, '0')
    : card.number.toLowerCase().replace(/[^a-z0-9]/g, '');
  const name = card.name
    .toLowerCase()
    .replace(/[''']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return 'images/cards/sv151/large/' + padded + '-' + name + '.png';
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
    "<button class='btn btn-primary btn-collection'>Legg til i samling</button>" +
    "<button class='btn btn-secondary btn-wishlist'>Legg til ønskeliste</button>" +
    "</div>";

  const localSrc    = getLocalCardImage(card);
  const fallbackSrc = card.images.large || card.images.small;

  detail.innerHTML =
    "<div class='card-detail-left'>" +
    "<div class='card-detail-image'><img src='" + localSrc + "' onerror=\"this.onerror=null;this.src='" + fallbackSrc + "'\" alt='" + card.name + "' /></div>" +
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

  // Kortdata som lagres
  const cardData = {
    id:      card.id,
    name:    card.name,
    number:  card.number,
    setName: card.set ? card.set.name : "",
    image:   card.images.small,
    types:   card.types || []
  };

  const collBtn = detail.querySelector('.btn-collection');
  const wishBtn = detail.querySelector('.btn-wishlist');

  // Sett initial tilstand
  if (isInList('kortkammer_collection', card.id)) {
    collBtn.textContent = 'I samling';
    collBtn.classList.add('btn-active');
  }
  if (isInList('kortkammer_wishlist', card.id)) {
    wishBtn.textContent = 'I ønskeliste';
    wishBtn.classList.add('btn-active');
  }

  collBtn.addEventListener('click', () => {
    const added = toggleInList('kortkammer_collection', cardData);
    collBtn.textContent = added ? 'I samling' : 'Legg til i samling';
    collBtn.classList.toggle('btn-active', added);
  });

  wishBtn.addEventListener('click', () => {
    const added = toggleInList('kortkammer_wishlist', cardData);
    wishBtn.textContent = added ? 'I ønskeliste' : 'Legg til ønskeliste';
    wishBtn.classList.toggle('btn-active', added);
  });
}
