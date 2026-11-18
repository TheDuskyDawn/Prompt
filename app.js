const $ = (selector) => document.querySelector(selector);
let items = [];
let activeTag = "all";
let favourites = new Set();
try {
  favourites = new Set(JSON.parse(localStorage.getItem("pv-favs") || "[]"));
} catch {
  localStorage.removeItem("pv-favs");
}

const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

function saveFavourites() {
  localStorage.setItem("pv-favs", JSON.stringify([...favourites]));
}

function updateThemeButton() {
  const light = document.body.classList.contains("light");
  $("#theme").setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
  $("#theme").textContent = light ? "☾" : "☼";
}

async function init() {
  try {
    const response = await fetch("data/resources.json");
    if (!response.ok) throw new Error("Catalogue request failed (" + response.status + ")");
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Catalogue must be a JSON array");
    items = data;
    $("#total").textContent = items.length;
    const categories = [...new Set(items.map((item) => item.category))].sort();
    $("#category").innerHTML = '<option value="all">All categories</option>' +
      categories.map((category) => '<option value="' + escapeHTML(category) + '">' + escapeHTML(category) + '</option>').join("");
    render();
  } catch (error) {
    $("#cards").innerHTML = '<p class="empty" role="alert">The catalogue could not be loaded. Please refresh or try again later.</p>';
    console.error(error);
  }
}

function render() {
  const query = $("#search").value.trim().toLowerCase();
  const type = $("#type").value;
  const category = $("#category").value;
  const sort = $("#sort").value;
  const onlyFavourites = $("#favourites").checked;

  const list = items.filter((item) =>
    (type === "all" || item.type === type) &&
    (category === "all" || item.category === category) &&
    (activeTag === "all" || item.tags.includes(activeTag)) &&
    (!onlyFavourites || favourites.has(item.id)) &&
    [item.title, item.description, item.category, item.content, ...item.tags].join(" ").toLowerCase().includes(query)
  );

  if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "newest") list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  $("#count").textContent = list.length + " of " + items.length + " shown";
  $("#cards").innerHTML = list.map((item) => {
    const isFavourite = favourites.has(item.id);
    return '<article class="card"><div class="cardtop"><span class="kind">' +
      escapeHTML(item.type) + " · " + escapeHTML(item.category) +
      '</span><button class="fav ' + (isFavourite ? "on" : "") + '" data-fav="' +
      escapeHTML(item.id) + '" aria-label="' + (isFavourite ? "Remove " : "Add ") +
      escapeHTML(item.title) + ' ' + (isFavourite ? "from" : "to") +
      ' favourites" aria-pressed="' + isFavourite + '">' + (isFavourite ? "★" : "☆") +
      '</button></div><h3>' + escapeHTML(item.title) + '</h3><p>' +
      escapeHTML(item.description) + '</p><div class="cardbottom"><div class="chips">' +
      item.tags.slice(0, 3).map((tag) => "<span>" + escapeHTML(tag) + "</span>").join("") +
      '</div><button class="open" data-open="' + escapeHTML(item.id) + '">View →</button></div></article>';
  }).join("");

  $("#empty").hidden = list.length > 0;
  const tags = [...new Set(items.flatMap((item) => item.tags))].sort();
  $("#tags").innerHTML = '<button class="tag ' + (activeTag === "all" ? "active" : "") +
    '" data-tag="all" aria-pressed="' + (activeTag === "all") + '">All tags</button>' +
    tags.map((tag) => '<button class="tag ' + (activeTag === tag ? "active" : "") +
      '" data-tag="' + escapeHTML(tag) + '" aria-pressed="' + (activeTag === tag) +
      '">' + escapeHTML(tag) + "</button>").join("");
}

async function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const temporary = document.createElement("textarea");
  temporary.value = text;
  temporary.setAttribute("readonly", "");
  temporary.style.position = "fixed";
  temporary.style.opacity = "0";
  document.body.append(temporary);
  temporary.select();
  const copied = document.execCommand("copy");
  temporary.remove();
  if (!copied) throw new Error("Clipboard permission unavailable");
}

function openDetail(id) {
  const item = items.find((entry) => entry.id === id);
  if (!item) return;
  $("#detailBody").innerHTML = '<p class="eyebrow">' + escapeHTML(item.type) + " / " +
    escapeHTML(item.category) + '</p><h2 id="detailTitle">' + escapeHTML(item.title) +
    '</h2><p class="detailmeta">' + escapeHTML(item.description) +
    '</p><div class="chips">' + item.tags.map((tag) => "<span>" + escapeHTML(tag) + "</span>").join("") +
    '</div><h3>Content</h3><div class="detailtext" id="resourceText">' +
    escapeHTML(item.content) + '</div><button class="copy" id="copy">Copy ' +
    escapeHTML(item.type) + "</button>";
  $("#detail").showModal();
  $("#copy").focus();
  $("#copy").onclick = async () => {
    const button = $("#copy");
    try {
      await copyText(item.content);
      button.textContent = "Copied ✓";
    } catch (error) {
      button.textContent = "Copy unavailable — select the text above";
      console.warn(error);
    }
  };
}

$("#cards").addEventListener("click", (event) => {
  const favouriteButton = event.target.closest("[data-fav]");
  const openButton = event.target.closest("[data-open]");
  if (favouriteButton) {
    const id = favouriteButton.dataset.fav;
    favourites.has(id) ? favourites.delete(id) : favourites.add(id);
    saveFavourites();
    render();
  }
  if (openButton) openDetail(openButton.dataset.open);
});

$("#tags").addEventListener("click", (event) => {
  const tagButton = event.target.closest("[data-tag]");
  if (tagButton) {
    activeTag = tagButton.dataset.tag;
    render();
  }
});

["search", "type", "category", "sort", "favourites"].forEach((id) => {
  const control = $("#" + id);
  control.addEventListener(id === "search" ? "input" : "change", render);
});

$("#close").onclick = () => $("#detail").close();
$("#detail").addEventListener("click", (event) => {
  if (event.target === $("#detail")) $("#detail").close();
});
$("#theme").onclick = () => {
  document.body.classList.toggle("light");
  localStorage.setItem("pv-theme", document.body.classList.contains("light") ? "light" : "dark");
  updateThemeButton();
};

if (localStorage.getItem("pv-theme") === "light") document.body.classList.add("light");
updateThemeButton();
init();


$("#export-favourites").addEventListener("click", () => {
  const payload = {
    format: "prompt-vault-favourites",
    version: 1,
    exportedAt: new Date().toISOString(),
    favourites: [...favourites]
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "prompt-vault-favourites.json";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});

$("#import-favourites").addEventListener("click", () => $("#favourites-file").click());

$("#favourites-file").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;
  if (file.size > 100000) {
    alert("That backup file is too large to import.");
    return;
  }
  try {
    const backup = JSON.parse(await file.text());
    if (backup.format !== "prompt-vault-favourites" || backup.version !== 1 ||
        !Array.isArray(backup.favourites) ||
        !backup.favourites.every((id) => typeof id === "string")) {
      throw new Error("This is not a supported Prompt Vault favourites backup.");
    }
    const validIds = new Set(items.map((item) => item.id));
    favourites = new Set(backup.favourites.filter((id) => validIds.has(id)));
    saveFavourites();
    render();
    alert("Favourites imported successfully.");
  } catch (error) {
    alert(error.message || "Could not read that backup file.");
  }
});
