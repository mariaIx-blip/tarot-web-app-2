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

// Load voices for SpeechSynthesis
let voices = [];
function loadVoices() {
  voices = speechSynthesis.getVoices();
  if (voices.length === 0) {
    speechSynthesis.onvoiceschanged = () => {
      voices = speechSynthesis.getVoices();
    };
  }
}
loadVoices();

// Pick a smooth female English voice
function getFemaleVoice() {
  return voices.find(
    (v) =>
      v.lang === "en-US" &&
      (v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("victoria") ||
        v.name.toLowerCase().includes("female"))
  );
}

// Speak message with toggle
function speakMessage(message, button) {
  if (!message) return;

  // Stop current speech
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    button.innerText = "🔉";
    return;
  }

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "en-US";
  utterance.pitch = 1;
  utterance.rate = 1;

  const voice = getFemaleVoice();
  if (voice) utterance.voice = voice;

  utterance.onend = () => {
    button.innerText = "🔉";
  };

  button.innerText = "⏸";
  speechSynthesis.speak(utterance);
}

// Step 2-6: drawCard function with thinking time
function drawCard() {
  const cardDiv = document.getElementById("cardDisplay");
  const button = document.getElementById("drawButton");

  button.disabled = true;

  // Show "Thinking..." with animated dots
  cardDiv.innerHTML = `
    <span style="font-size:1.2em; font-family:monospace;">
      <span class="thinking-word">Shuffling</span><span id="dots" class="dots"></span>
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
            <p id="card-meaning-text">${card.meaning}</p>
          </div>
        </div>
      `;

      // Add Read Out Loud button dynamically
      const cardMeaningDiv = cardDiv.querySelector(".card-meaning");
      if (cardMeaningDiv) {
        const readButton = document.createElement("button");
        readButton.id = "read-button";
        readButton.innerText = "🔉";
        cardMeaningDiv.appendChild(readButton);

        readButton.addEventListener("click", () => {
          const message =
            document.getElementById("card-meaning-text")?.textContent;
          speakMessage(message, readButton);
        });
      }

      // Fade-in effect
      const content = cardDiv.querySelector(".card-content");
      setTimeout(() => content.classList.add("show"), 50);

      // Scroll into view
      cardDiv.scrollIntoView({ behavior: "smooth", block: "start" });

      // Show promo text only on first draw
      const promoText = document.getElementById("promo-text");
      if (promoText && window.getComputedStyle(promoText).display === "none") {
        promoText.style.display = "block";
      }

      // Re-enable button
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
    // Use both click and touchstart for mobile
    drawButton.addEventListener("click", drawCard);
    drawButton.addEventListener("touchstart", drawCard);
  }
});
