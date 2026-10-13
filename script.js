// Data game contoh. Ganti atau tambahkan data milikmu di array ini.
const games = [
  { id: 1, name: "Neon Drift", platform: "pc", genre: "Racing", description: "Balapan futuristik dengan nuansa neon.", symbol: "ND", status: "Contoh" },
  { id: 2, name: "Shadow Protocol", platform: "pc", genre: "Action", description: "Petualangan aksi dalam dunia cyber.", symbol: "SP", status: "Contoh" },
  { id: 3, name: "Mystic Realms", platform: "android", genre: "Adventure", description: "Jelajahi dunia fantasi yang misterius.", symbol: "MR", status: "Contoh" },
  { id: 4, name: "Turbo Circuit", platform: "android", genre: "Racing", description: "Kejar garis finis dan pecahkan rekor.", symbol: "TC", status: "Contoh" },
  { id: 5, name: "Galaxy Raiders", platform: "pc", genre: "Sci-Fi", description: "Hadapi tantangan di luar angkasa.", symbol: "GR", status: "Contoh" },
  { id: 6, name: "Arcane Clash", platform: "android", genre: "Strategy", description: "Susun strategi dan kuasai arena.", symbol: "AC", status: "Contoh" }
];

const gameGrid = document.getElementById("gameGrid");
const gameSearch = document.getElementById("gameSearch");
const emptyState = document.getElementById("emptyState");
const gameCount = document.getElementById("gameCount");
let activeFilter = "all";

function renderGames() {
  const term = gameSearch.value.trim().toLowerCase();
  const visibleGames = games.filter((game) => {
    const matchesPlatform = activeFilter === "all" || game.platform === activeFilter;
    const matchesSearch = [game.name, game.genre, game.description, game.platform]
      .some((value) => value.toLowerCase().includes(term));
    return matchesPlatform && matchesSearch;
  });

  gameCount.textContent = String(games.length).padStart(2, "0");
  gameGrid.innerHTML = visibleGames.map((game, index) => {
    const platformLabel = game.platform === "pc" ? "WINDOWS / PC" : "ANDROID";
    const coverClass = "cover-" + (((game.id - 1) % 6) + 1);
    return `
      <article class="game-card">
        <div class="game-cover ${coverClass}">
          <span class="platform-tag">${platformLabel}</span>
          <span class="status-tag">${escapeHtml(game.status)}</span>
          <span class="cover-symbol" aria-hidden="true">${escapeHtml(game.symbol)}</span>
        </div>
        <div class="game-info">
          <h3>${escapeHtml(game.name)}</h3>
          <p>${escapeHtml(game.description)}</p>
          <div class="game-meta">
            <span>${escapeHtml(game.genre)}</span>
            <span class="download-link disabled" aria-disabled="true">Unduhan segera hadir</span>
          </div>
        </div>
      </article>`;
  }).join("");

  emptyState.hidden = visibleGames.length > 0;
  gameGrid.hidden = visibleGames.length === 0;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

document.querySelectorAll(".filter-tab").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter-tab").forEach((tab) => {
      const selected = tab === button;
      tab.classList.toggle("selected", selected);
      tab.setAttribute("aria-pressed", String(selected));
    });
    renderGames();
  });
});

gameSearch.addEventListener("input", renderGames);

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelector(".nav-links");
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.getElementById("year").textContent = new Date().getFullYear();
renderGames();
