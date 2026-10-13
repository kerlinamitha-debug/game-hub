/*
 * SETUP REQUIRED:
 * 1. Create a Supabase project.
 * 2. Replace the three values below with your project URL, anon/publishable key,
 *    and the email address you use for the one admin account.
 * 3. Run supabase_setup.sql in Supabase SQL Editor.
 * Never put a Supabase service_role key or your GitHub password in this file.
 */
const SUPABASE_URL = "PASTE_SUPABASE_PROJECT_URL_HERE";
const SUPABASE_ANON_KEY = "PASTE_SUPABASE_ANON_OR_PUBLISHABLE_KEY_HERE";
const ADMIN_EMAIL = "PASTE_YOUR_ADMIN_EMAIL_HERE";

const loginPanel = document.getElementById("loginPanel");
const dashboardPanel = document.getElementById("dashboardPanel");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const gameForm = document.getElementById("gameForm");
const gameMessage = document.getElementById("gameMessage");
const gameList = document.getElementById("adminGameList");
let supabaseClient = null;
let currentGames = [];

function setMessage(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle("error", isError);
}
function configured() {
  return SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("PASTE_") &&
    SUPABASE_ANON_KEY.length > 20 &&
    !SUPABASE_ANON_KEY.includes("PASTE_") &&
    ADMIN_EMAIL.includes("@") &&
    !ADMIN_EMAIL.includes("PASTE_");
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[char]);
}
function showDashboard(user) {
  loginPanel.hidden = true;
  dashboardPanel.hidden = false;
  document.getElementById("signedInAs").textContent = "Masuk sebagai " + user.email;
}
function showLogin() {
  loginPanel.hidden = false;
  dashboardPanel.hidden = true;
}
function resetGameForm() {
  gameForm.reset();
  document.getElementById("gameId").value = "";
  document.getElementById("gamePublished").checked = true;
  document.getElementById("saveGameButton").textContent = "Simpan game";
  setMessage(gameMessage, "");
}
function readGameForm() {
  return {
    name: document.getElementById("gameName").value.trim(),
    platform: document.getElementById("gamePlatform").value,
    genre: document.getElementById("gameGenre").value.trim() || "Umum",
    symbol: document.getElementById("gameSymbol").value.trim() || "GH",
    description: document.getElementById("gameDescription").value.trim(),
    download_url: document.getElementById("gameDownload").value.trim() || null,
    image_url: document.getElementById("gameImage").value.trim() || null,
    is_published: document.getElementById("gamePublished").checked
  };
}
async function loadGames() {
  gameList.innerHTML = '<div class="admin-empty">Memuat katalog...</div>';
  const { data, error } = await supabaseClient.from("games").select("*").order("created_at", { ascending: false });
  if (error) {
    gameList.innerHTML = "";
    setMessage(gameMessage, "Gagal memuat game: " + error.message, true);
    return;
  }
  currentGames = data || [];
  if (!currentGames.length) {
    gameList.innerHTML = '<div class="admin-empty">Belum ada game tersimpan. Tambahkan game pertama lewat formulir di atas.</div>';
    return;
  }
  gameList.innerHTML = currentGames.map(game => `
    <article class="admin-game-item">
      <div><h4>${escapeHtml(game.name)}</h4><p>${game.platform === "pc" ? "Windows / PC" : "Android"} · ${escapeHtml(game.genre || "Umum")} · <span class="admin-status ${game.is_published ? "" : "draft"}">${game.is_published ? "Tampil di website" : "Draft / tersembunyi"}</span></p></div>
      <div class="admin-game-actions"><button class="admin-secondary" type="button" data-edit="${game.id}">Edit</button><button class="admin-secondary" type="button" data-delete="${game.id}">Hapus</button></div>
    </article>`).join("");
}
loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!configured()) {
    setMessage(loginMessage, "Panel belum dikonfigurasi. Ikuti panduan Supabase_SETUP.md di repositori GitHub dan isi pengaturan di admin.js.", true);
    return;
  }
  if (!supabaseClient) supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  setMessage(loginMessage, "Sedang masuk...");
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: document.getElementById("loginEmail").value.trim(),
    password: document.getElementById("loginPassword").value
  });
  if (error) {
    setMessage(loginMessage, "Login gagal: " + error.message, true);
    return;
  }
  if ((data.user?.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    await supabaseClient.auth.signOut();
    setMessage(loginMessage, "Akun ini tidak diizinkan menjadi admin.", true);
    return;
  }
  setMessage(loginMessage, "");
  showDashboard(data.user);
  await loadGames();
});
gameForm.addEventListener("submit", async event => {
  event.preventDefault();
  const sessionResult = await supabaseClient.auth.getUser();
  const user = sessionResult.data.user;
  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    setMessage(gameMessage, "Sesi admin tidak valid. Silakan masuk kembali.", true);
    showLogin();
    return;
  }
  const payload = readGameForm();
  if (!payload.name) {
    setMessage(gameMessage, "Nama game wajib diisi.", true);
    return;
  }
  const id = document.getElementById("gameId").value;
  const request = id
    ? supabaseClient.from("games").update(payload).eq("id", id)
    : supabaseClient.from("games").insert(payload);
  const { error } = await request;
  if (error) {
    setMessage(gameMessage, "Gagal menyimpan: " + error.message, true);
    return;
  }
  setMessage(gameMessage, id ? "Perubahan game berhasil disimpan." : "Game berhasil ditambahkan.");
  resetGameForm();
  await loadGames();
});
gameList.addEventListener("click", async event => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");
  if (editButton) {
    const game = currentGames.find(item => item.id === editButton.dataset.edit);
    if (!game) return;
    document.getElementById("gameId").value = game.id;
    document.getElementById("gameName").value = game.name || "";
    document.getElementById("gamePlatform").value = game.platform || "pc";
    document.getElementById("gameGenre").value = game.genre || "";
    document.getElementById("gameSymbol").value = game.symbol || "";
    document.getElementById("gameDescription").value = game.description || "";
    document.getElementById("gameDownload").value = game.download_url || "";
    document.getElementById("gameImage").value = game.image_url || "";
    document.getElementById("gamePublished").checked = Boolean(game.is_published);
    document.getElementById("saveGameButton").textContent = "Simpan perubahan";
    setMessage(gameMessage, "Sedang mengedit: " + game.name);
    gameForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (deleteButton) {
    const game = currentGames.find(item => item.id === deleteButton.dataset.delete);
    if (!game || !window.confirm('Hapus "' + game.name + '" dari katalog?')) return;
    const { error } = await supabaseClient.from("games").delete().eq("id", game.id);
    if (error) {
      setMessage(gameMessage, "Gagal menghapus: " + error.message, true);
      return;
    }
    setMessage(gameMessage, "Game berhasil dihapus.");
    await loadGames();
  }
});
document.getElementById("cancelEditButton").addEventListener("click", resetGameForm);
document.getElementById("refreshButton").addEventListener("click", loadGames);
document.getElementById("logoutButton").addEventListener("click", async () => {
  if (supabaseClient) await supabaseClient.auth.signOut();
  showLogin();
  resetGameForm();
  setMessage(loginMessage, "Kamu sudah keluar dari dashboard.");
});
if (!configured()) {
  setMessage(loginMessage, "Langkah berikutnya: buat project Supabase, jalankan supabase_setup.sql, lalu isi tiga pengaturan di admin.js.", true);
} else {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  supabaseClient.auth.getSession().then(async ({ data }) => {
    const user = data.session?.user;
    if (user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      showDashboard(user);
      await loadGames();
    } else if (user) {
      await supabaseClient.auth.signOut();
    }
  });
}