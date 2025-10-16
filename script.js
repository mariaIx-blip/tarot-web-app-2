// Step 1: Fetch tarot cards and preload images
let tarotDeck = [];
let deckLoaded = false;

fetch("./container.json")
  .then((response) => response.json())
  .then((data) => {
    tarotDeck = data.deck;
    deckLoaded = true;

    // Preload all images
    tarotDeck.forEach((card) => {
      const img = new Image();
      img.src = card.image;
    });

    console.log("Deck loaded:", tarotDeck.length, "cards");
  })
  .catch((error) => console.error("Error loading deck:", error));

// === Speech synthesis setup ===
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

function getFemaleVoice() {
  return voices.find(
    (v) =>
      v.lang.startsWith("en") &&
      (v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("samantha") ||
        v.name.toLowerCase().includes("victoria") ||
        v.name.toLowerCase().includes("female"))
  );
}

function speakMessage(message, button) {
  if (!message) return;

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

// === Card draw logic ===
function drawCard(event) {
  event.preventDefault(); // Prevent double triggering
  const cardDiv = document.getElementById("cardDisplay");
  const button = document.getElementById("drawButton");

  // Block if deck not ready yet
  if (!deckLoaded) {
    cardDiv.innerHTML = `<p style="color:red;">Deck not loaded yet. Please wait a moment.</p>`;
    return;
  }

  button.disabled = true;

  // Shuffling animation
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

  // Reveal card after delay
  setTimeout(() => {
    clearInterval(dotInterval);

    const randomIndex = Math.floor(Math.random() * tarotDeck.length);
    const card = tarotDeck[randomIndex];

    const img = new Image();
    img.src = card.image;

    img.onload = () => {
      cardDiv.innerHTML = `
        <div class="card-content">
          <div class="card-name"><h2>${card.name}</h2></div>
          <img src="${card.image}" alt="${card.name}" class="card-image">
          <div class="card-meaning">
            <p id="card-meaning-text">${card.meaning}</p>
          </div>
        </div>
      `;

      // Add read button
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

      // Fade-in and scroll
      const content = cardDiv.querySelector(".card-content");
      setTimeout(() => content.classList.add("show"), 50);
      cardDiv.scrollIntoView({ behavior: "smooth", block: "start" });

      const promoText = document.getElementById("promo-text");
      if (promoText && promoText.style.display === "none") {
        promoText.style.display = "block";
      }

      button.innerText = "Draw again";
      button.disabled = false;
    };

    img.onerror = () => {
      cardDiv.innerHTML = `<p style="color:red;">Failed to load image for ${card.name}</p>`;
      button.disabled = false;
    };
  }, 4000);
}

// === Attach event listener ===
document.addEventListener("DOMContentLoaded", () => {
  const drawButton = document.getElementById("drawButton");
  if (drawButton) {
    // Use only one handler for both tap and click
    const handler = (event) => drawCard(event);

    drawButton.addEventListener("click", handler, { passive: true });
    drawButton.addEventListener("touchend", handler, { passive: true });
  }
});
