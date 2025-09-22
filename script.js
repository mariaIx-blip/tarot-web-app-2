// Step 1: Fetch the tarot cards from JSON file and preload images
let tarotDeck = [];

fetch("./container.json")
  .then((response) => response.json())
  .then((data) => {
    tarotDeck = data.deck;

    // 🔮 Preload all images so they’re cached
    tarotDeck.forEach((card) => {
      const img = new Image();
      img.src = card.image;
    });

    console.log("Deck loaded:", tarotDeck.length, "cards");
  })
  .catch((error) => console.error("Error loading deck:", error));

// Step 2-6: drawCard function with thinking time
function drawCard() {
  const cardDiv = document.getElementById("cardDisplay");
  const button = document.getElementById("drawButton");

  button.disabled = true;

  // Show "Thinking..." with animated dots
  cardDiv.innerHTML = `
    <span style="font-size:1.2em; font-family:monospace;">
      <span class="thinking-word">Thinking</span><span id="dots" class="dots"></span>
    </span>
  `;
  const dotsSpan = document.getElementById("dots");
  let dotCount = 0;
  const dotInterval = setInterval(() => {
    dotCount = (dotCount + 1) % 4;
    dotsSpan.textContent = ".".repeat(dotCount);
  }, 500);

  // After 4 seconds, reveal the card
  setTimeout(() => {
    clearInterval(dotInterval);

    if (!tarotDeck || tarotDeck.length === 0) {
      cardDiv.innerHTML = `<p style="color: red;">Deck not loaded yet. Please try again.</p>`;
      button.disabled = false;
      return;
    }

    const randomIndex = Math.floor(Math.random() * tarotDeck.length);
    const card = tarotDeck[randomIndex];

    // Wait until the image is loaded before showing everything
    const img = new Image();
    img.src = card.image;

    img.onload = () => {
      cardDiv.innerHTML = `
        <div class="card-content">
          <div class="card-name">
            <h2>${card.name}</h2>
          </div>
          <img src="${card.image}" alt="${card.name}" class="card-image">
          <div class="card-meaning">
            <p>${card.meaning}</p>
          </div>
        </div>
      `;

      // Show promo text only on first draw
      const promoText = document.getElementById("promo-text");
      if (promoText && window.getComputedStyle(promoText).display === "none") {
        promoText.style.display = "block";
      }

      const content = cardDiv.querySelector(".card-content");

      // Fade-in effect
      setTimeout(() => content.classList.add("show"), 50);

      // Scroll into view
      cardDiv.scrollIntoView({ behavior: "smooth", block: "end" });

      // Re-enable button and update text
      button.innerText = "Draw again";
      button.disabled = false;
    };

    img.onerror = () => {
      cardDiv.innerHTML = `<p style="color:red;">Failed to load image for ${card.name}</p>`;
      button.disabled = false;
    };
  }, 4000);
}

// Attach event listener once DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const drawButton = document.getElementById("drawButton");
  if (drawButton) {
    drawButton.addEventListener("click", drawCard);
  }
});
