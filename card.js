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

function renderCard(card) {
  let typesHtml = "";
  if (card.types && card.types.length > 0) {
    typesHtml =
      "<div class='card-types'>" +
      card.types.map(t => "<span class='type-badge'>" + t + "</span>").join("") +
      "</div>";
  }

  let attacksHtml = "";
  if (card.attacks && card.attacks.length > 0) {
    attacksHtml = "<div class='card-attacks'><h3>Angrep</h3>";
    card.attacks.forEach(attack => {
      attacksHtml +=
        "<div class='attack'>" +
        "<div class='attack-header'>" +
        "<span class='attack-name'>" + attack.name + "</span>" +
        (attack.damage ? "<span class='attack-damage'>" + attack.damage + "</span>" : "") +
        "</div>" +
        (attack.text ? "<p class='attack-text'>" + attack.text + "</p>" : "") +
        "</div>";
    });
    attacksHtml += "</div>";
  }

  const imgSrc = card.images.large || card.images.small;

  detail.innerHTML =
    "<div class='card-detail-image'>" +
    "<img src='" + imgSrc + "' alt='" + card.name + "' />" +
    "</div>" +
    "<div class='card-detail-info'>" +
    "<h2 class='card-detail-name'>" + card.name + "</h2>" +
    (card.hp ? "<p class='card-hp'>HP <strong>" + card.hp + "</strong></p>" : "") +
    typesHtml +
    attacksHtml +
    "</div>";
}
