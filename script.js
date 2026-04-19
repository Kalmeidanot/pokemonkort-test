document.getElementById("cta-btn").addEventListener("click", () => {
  document.getElementById("products").scrollIntoView({
    behavior: "smooth"
  });
});

// Kjøp-knapper
const buttons = document.querySelectorAll(".card-item button");

buttons.forEach(button => {
  button.addEventListener("click", () => {
    alert("Takk for interessen! Vi tar kontakt med deg.");
  });
});