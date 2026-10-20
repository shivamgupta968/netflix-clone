// Demo video: every title plays this sample file, since we have no real movies.
const SAMPLE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

// Your movie/series data. Add or change titles here.
// Optional: add image: "me.jpg" (or your own poster URL) to any title to show a real poster.
const movies = [
  { id: 1, title: "Neon Horizon", type: "Movies", genre: "Sci-Fi", year: 2025, rating: "16+", badge: "New", featured: true,
    desc: "In a city powered by light, a young engineer finds a signal that should not exist.",
    colors: ["#0f2027", "#2c5364"] },
  { id: 2, title: "The Last Signal", type: "Series", genre: "Sci-Fi", year: 2024, rating: "13+", badge: "",
    desc: "A radio operator at a remote station picks up messages from the future.",
    colors: ["#360033", "#0b8793"] },
  { id: 3, title: "Midnight Kitchen", type: "Movies", genre: "Comedy", year: 2023, rating: "13+", badge: "",
    desc: "Four strangers share one restaurant kitchen on the worst night of the year.",
    colors: ["#f7971e", "#ffd200"] },
  { id: 4, title: "Silent Lanes", type: "Series", genre: "Thriller", year: 2025, rating: "16+", badge: "Top 10",
    desc: "A detective follows a trail of missing couriers through a sleepless city.",
    colors: ["#232526", "#414345"] },
  { id: 5, title: "Paper Kingdoms", type: "Movies", genre: "Action", year: 2024, rating: "16+", badge: "",
    desc: "Rival clans fight over a map that can redraw the borders of a fictional empire.",
    colors: ["#8e2de2", "#4a00e0"] },
  { id: 6, title: "River of Glass", type: "Movies", genre: "Drama", year: 2022, rating: "13+", badge: "",
    desc: "A widowed fisherman and his daughter try to save the village they grew up in.",
    colors: ["#134e5e", "#71b280"] },
  { id: 7, title: "Code Breakers", type: "Series", genre: "Thriller", year: 2024, rating: "16+", badge: "",
    desc: "Three hackers stumble upon a plot that reaches into the highest offices.",
    colors: ["#3a1c71", "#d76d77"] },
  { id: 8, title: "Monsoon Road", type: "Movies", genre: "Action", year: 2025, rating: "18+", badge: "New",
    desc: "A truck driver must deliver his cargo before the storm closes the only highway.",
    colors: ["#c31432", "#240b36"] },
  { id: 9, title: "Office Hours", type: "Series", genre: "Comedy", year: 2025, rating: "13+", badge: "New",
    desc: "A new team lead tries to fix a startup that is running on coffee and chaos.",
    colors: ["#00b09b", "#96c93d"] },
  { id: 10, title: "Ghost of Jaipur", type: "Movies", genre: "Thriller", year: 2023, rating: "18+", badge: "",
    desc: "A photographer captures an image of a face that was not there when the shutter closed.",
    colors: ["#642b73", "#c6426e"] },
  { id: 11, title: "Stars and Strings", type: "Movies", genre: "Drama", year: 2021, rating: "U", badge: "",
    desc: "A street musician and a retired conductor build an orchestra from nothing.",
    colors: ["#1d976c", "#93f9b9"] },
  { id: 12, title: "Pixel Pirates", type: "Series", genre: "Action", year: 2024, rating: "13+", badge: "",
    desc: "A band of game testers discovers that their favorite game is hiding a real treasure.",
    colors: ["#ff512f", "#dd2476"] },
];

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const rowsEl = $("#rows");
const heroEl = $("#hero");
let currentFilter = "Home";
let searchTerm = "";
let myList = JSON.parse(localStorage.getItem("myList")) || [];

const findMovie = (id) => movies.find((m) => m.id === Number(id));
const gradient = (m) => `linear-gradient(135deg, ${m.colors[0]}, ${m.colors[1]})`;
// Use the poster image if the title has one, otherwise the colour gradient
const bg = (m) => (m.image ? `url('${m.image}') center / cover no-repeat` : gradient(m));
const saveList = () => localStorage.setItem("myList", JSON.stringify(myList));

// ---------- Rendering ----------
function renderHero() {
  const featured = movies.find((m) => m.featured) || movies[0];
  heroEl.style.background = bg(featured);
  heroEl.innerHTML = `
    <div class="hero-content">
      <h1>${featured.title}</h1>
      <p class="hero-meta">${featured.year} · ${featured.genre} · ${featured.rating}</p>
      <p class="desc">${featured.desc}</p>
      <button class="btn play" data-action="play" data-id="${featured.id}">▶ Play</button>
      <button class="btn" data-action="info" data-id="${featured.id}">ⓘ More Info</button>
    </div>`;
}

function cardHTML(m) {
  return `
    <div class="card" data-action="info" data-id="${m.id}" style="background:${bg(m)}">
      ${m.badge ? `<span class="badge">${m.badge}</span>` : ""}
      <div class="card-info">
        <strong>${m.title}</strong>
        <span>${m.genre} · ${m.year}</span>
      </div>
    </div>`;
}

function rowHTML(title, list) {
  return `
    <section class="row">
      <h2>${title}</h2>
      <div class="row-wrap">
        <button class="arrow left" data-scroll="-1">‹</button>
        <div class="slider">${list.map(cardHTML).join("")}</div>
        <button class="arrow right" data-scroll="1">›</button>
      </div>
    </section>`;
}

function getFiltered() {
  let list = movies;
  if (currentFilter === "Movies") list = list.filter((m) => m.type === "Movies");
  if (currentFilter === "Series") list = list.filter((m) => m.type === "Series");
  if (currentFilter === "MyList") list = list.filter((m) => myList.includes(m.id));
  if (searchTerm) {
    list = list.filter(
      (m) => m.title.toLowerCase().includes(searchTerm) || m.genre.toLowerCase().includes(searchTerm)
    );
  }
  return list;
}

function renderRows() {
  const list = getFiltered();

  if (searchTerm) {
    rowsEl.innerHTML = list.length
      ? rowHTML(`Results for "${searchTerm}"`, list)
      : `<p class="empty">No titles found.</p>`;
    return;
  }

  if (currentFilter === "MyList") {
    rowsEl.innerHTML = list.length
      ? rowHTML("My List", list)
      : `<p class="empty">Your list is empty. Open a title and click "+ My List".</p>`;
    return;
  }

  // Home: a Trending row first, then one row per genre. Movies/Series: genre rows only.
  const trending = currentFilter === "Home" ? rowHTML("Trending Now", list) : "";
  const genres = [...new Set(list.map((m) => m.genre))];
  rowsEl.innerHTML =
    trending + genres.map((g) => rowHTML(g, list.filter((m) => m.genre === g))).join("");
}

// ---------- Popup and player ----------
function openInfo(id) {
  const m = findMovie(id);
  $("#modal-art").style.background = bg(m);
  $("#modal-title").textContent = m.title;
  $("#modal-meta").textContent = `${m.year} · ${m.type} · ${m.genre} · ${m.rating}`;
  $("#modal-desc").textContent = m.desc;
  $("#modal-play").dataset.id = m.id;
  $("#modal-list").dataset.id = m.id;
  updateListButton(m.id);
  $("#modal").classList.remove("hidden");
}

function updateListButton(id) {
  $("#modal-list").textContent = myList.includes(Number(id)) ? "✓ In My List" : "+ My List";
}

function toggleList(id) {
  id = Number(id);
  myList = myList.includes(id) ? myList.filter((x) => x !== id) : [...myList, id];
  saveList();
  updateListButton(id);
  renderRows();
}

function playMovie(id) {
  const m = findMovie(id);
  const video = $("#video");
  video.src = SAMPLE_VIDEO;
  $("#player-title").textContent = m.title;
  $("#player").classList.remove("hidden");
  $("#modal").classList.add("hidden");
  video.play().catch(() => {}); // browsers may block autoplay; user can press play
}

function closePlayer() {
  const video = $("#video");
  video.pause();
  video.removeAttribute("src");
  video.load();
  $("#player").classList.add("hidden");
}

// ---------- Events ----------
// Profile picker: open the main app
document.querySelectorAll(".profile").forEach((btn) => {
  btn.addEventListener("click", () => {
    $("#profile-screen").classList.add("hidden");
    $("#app").classList.remove("hidden");
    renderHero();
    renderRows();
  });
});

// Navbar links
document.querySelectorAll("nav a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll("nav a").forEach((a) => a.classList.remove("active"));
    link.classList.add("active");
    currentFilter = link.dataset.filter;
    renderRows();
  });
});

// Search
$("#search").addEventListener("input", (e) => {
  searchTerm = e.target.value.trim().toLowerCase();
  renderRows();
});

// Navbar background change on scroll
window.addEventListener("scroll", () => {
  $("#navbar").classList.toggle("scrolled", window.scrollY > 50);
});

// Cards, hero buttons and row arrows (event delegation)
document.addEventListener("click", (e) => {
  const scrollBtn = e.target.closest("[data-scroll]");
  if (scrollBtn) {
    const slider = scrollBtn.parentElement.querySelector(".slider");
    slider.scrollBy({ left: Number(scrollBtn.dataset.scroll) * 700, behavior: "smooth" });
    return;
  }

  const actionEl = e.target.closest("[data-action]");
  if (!actionEl) return;
  const { action, id } = actionEl.dataset;
  if (action === "play") playMovie(id);
  if (action === "info") openInfo(id);
});

// Popup buttons
$("#close-modal").addEventListener("click", () => $("#modal").classList.add("hidden"));
$("#modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") $("#modal").classList.add("hidden");
});
$("#modal-play").addEventListener("click", () => playMovie($("#modal-play").dataset.id));
$("#modal-list").addEventListener("click", () => toggleList($("#modal-list").dataset.id));

// Player
$("#close-player").addEventListener("click", closePlayer);
