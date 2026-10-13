// Game Hub public catalog. Configure Supabase values to show games managed in admin.html.
const SUPABASE_URL = "PASTE_SUPABASE_PROJECT_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_SUPABASE_ANON_OR_PUBLISHABLE_KEY_HERE";

const sampleGames = [
  { id: 1, name: "Neon Drift", platform: "pc", genre: "Racing", description: "Balapan futuristik dengan nuansa neon.", symbol: "ND", status: "Contoh" },
  { id: 2, name: "Shadow Protocol", platform: "pc", genre: "Action", description: "Petualangan aksi dalam dunia cyber.", symbol: "SP", status: "Contoh" },
  { id: 3, name: "Mystic Realms", platform: "android", genre: "Adventure", description: "Jelajahi dunia fantasi yang misterius.", symbol: "MR", status: "Contoh" },
  { id: 4, name: "Turbo Circuit", platform: "android", genre: "Racing", description: "Kejar garis finis dan pecahkan rekor.", symbol: "TC", status: "Contoh" },
  { id: 5, name: "Galaxy Raiders", platform: "pc", genre: "Sci-Fi", description: "Hadapi tantangan di luar angkasa.", symbol: "GR", status: "Contoh" },
  { id: 6, name: "Arcane Clash", platform: "android", genre: "Strategy", description: "Susun strategi dan kuasai arena.", symbol: "AC", status: "Contoh" }
];
let games = [...sampleGames];

const gameGrid = document.getElementById("gameGrid");
const gameSearch = document.getElementById("gameSearch");
const emptyState = document.getElementById("emptyState");
const gameCount = document.getElementById("gameCount");
let activeFilter = "all";

function safeWebUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function renderGames() {
  const term = gameSearch.value.trim().toLowerCase();
  const visibleGames = games.filter((game) => {
    const matchesPlatform = activeFilter === "all" || game.platform === activeFilter;
    const matchesSearch = [game.name, game.genre, game.description, game.platform]
      .some((value) => String(value || "").toLowerCase().includes(term));
    return matchesPlatform && matchesSearch;
  });

  gameCount.textContent = String(games.length).padStart(2, "0");
  gameGrid.innerHTML = visibleGames.map((game, index) => {
    const platformLabel = game.platform === "pc" ? "WINDOWS / PC" : "ANDROID";
    const coverClass = "cover-" + ((index % 6) + 1);
    const downloadUrl = safeWebUrl(game.download_url);
    const coverImage = safeWebUrl(game.image_url);
    const coverStyle = coverImage ? ` style="background-image:linear-gradient(#090b1444,#090b1444),url('${escapeHtml(coverImage)}');background-size:cover;background-position:center"` : "";
    const downloadControl = downloadUrl
      ? `<a class="download-link" href="${escapeHtml(downloadUrl)}" target="_blank" rel="noopener noreferrer">Unduh game ↗</a>`
      : '<span class="download-link disabled" aria-disabled="true">Unduhan segera hadir</span>';
    return `
      <article class="game-card">
        <div class="game-cover ${coverClass}"${coverStyle}>
          <span class="platform-tag">${platformLabel}</span>
          <span class="status-tag">${escapeHtml(game.status || "Tersedia")}</span>
          <span class="cover-symbol" aria-hidden="true">${escapeHtml(game.symbol || "GH")}</span>
        </div>
        <div class="game-info">
          <h3>${escapeHtml(game.name)}</h3>
          <p>${escapeHtml(game.description || "")}</p>
          <div class="game-meta">
            <span>${escapeHtml(game.genre || "Umum")}</span>
            ${downloadControl}
          </div>
        </div>
      </article>`;
  }).join("");

  emptyState.hidden = visibleGames.length > 0;
  gameGrid.hidden = visibleGames.length === 0;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
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

async function loadPublicGames() {
  const configured = SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("PASTE_") &&
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_ANON_KEY.includes("PASTE_");
  if (configured && window.supabase) {
    try {
      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data, error } = await client.from("games")
        .select("id,name,platform,genre,description,symbol,download_url,image_url,is_published")
        .eq("is_published", true).order("created_at", { ascending: false });
      if (!error && Array.isArray(data)) {
        games = data.map(game => ({ ...game, status: "Tersedia" }));
      }
    } catch (error) {
      console.warn("Katalog online belum tersedia; menampilkan data contoh.", error);
    }
  }
  renderGames();
}

document.getElementById("year").textContent = new Date().getFullYear();
renderGames();
loadPublicGames();
