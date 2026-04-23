const grid = document.getElementById("card-grid");

fetch("https://api.pokemontcg.io/v2/cards?q=set.id:sv3pt5&orderBy=number&pageSize=250")
  .then(res => res.json())
  .then(data => {
    grid.innerHTML = "";
    data.data.forEach(card => {
      const a = document.createElement("a");
      a.href = "card.html?id=" + card.id;
      a.className = "pokemon-card";
      a.innerHTML =
        '<img src="' + card.images.small + '" alt="' + card.name + '" />' +
        '<p class="pokemon-card-name">' + card.name + "</p>" +
        '<p class="pokemon-card-number">' + card.number + "/" + card.set.printedTotal + "</p>";
      grid.appendChild(a);
    });
  })
  .catch(() => {
    grid.innerHTML = "<p class='error-text'>Kunne ikke laste kortene. Sjekk internettforbindelsen og prøv igjen.</p>";
  });
