const $ = (selector) => document.querySelector(selector);
let items = [];
let activeTag = "all";
function readStorage(key, fallback = null) {
  try { return localStorage.getItem(key) ?? fallback; }
  catch { return fallback; }
}

function writeStorage(key, value) {
  try { localStorage.setItem(key, value); return true; }
  catch { return false; }
}

let favourites = new Set();
try { favourites = new Set(JSON.parse(readStorage("pv-favs", "[]"))); }
catch { favourites = new Set(); }

const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

function saveFavourites() {
  writeStorage("pv-favs", JSON.stringify([...favourites]));
}

function updateThemeButton() {
  const light = document.body.classList.contains("light");
  $("#theme").setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
  $("#theme").textContent = light ? "☾" : "☼";
}

async function init() {
  $("#cards").setAttribute("aria-busy", "true");
  $("#cards").innerHTML = '<p class="empty" role="status">Loading the library…</p>';
  try {
    const response = await fetch("data/resources.json");
    if (!response.ok) throw new Error("Catalogue request failed (" + response.status + ")");
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Catalogue must be a JSON array");
    items = data;
    $("#download-catalogue").disabled = false;
    $("#cards").setAttribute("aria-busy", "false");
    $("#total").textContent = items.length;
    const categories = [...new Set(items.map((item) => item.category))].sort();
    $("#category").innerHTML = '<option value="all">All categories</option>' +
      categories.map((category) => '<option value="' + escapeHTML(category) + '">' + escapeHTML(category) + '</option>').join("");
    const collections = [...new Set(items.flatMap((item) => item.collections))].sort();
    $("#collection").innerHTML = '<option value="all">All collections</option>' +
      collections.map((name) => '<option value="' + escapeHTML(name) + '">' + escapeHTML(name) + '</option>').join("");
    restoreViewFromURL();
    render();
    const resourceId = new URLSearchParams(window.location.search).get("resource");
    if (resourceId && items.some((item) => item.id === resourceId)) {
      openDetail(resourceId);
    } else if (resourceId) {
      const params = new URLSearchParams(window.location.search);
      params.delete("resource");
      const query = params.toString();
      history.replaceState(null, "", window.location.pathname + (query ? "?" + query : "") + window.location.hash);
    }
  } catch (error) {
    $("#cards").setAttribute("aria-busy", "false");
    $("#cards").innerHTML = '<div class="empty" role="alert"><p>The catalogue could not be loaded.</p><button id="retry-load" type="button">Try again</button></div>';
    $("#retry-load").addEventListener("click", init);
    console.error(error);
  }
}

function restoreViewFromURL() {
  const params = new URLSearchParams(window.location.search);
  $("#search").value = params.get("q") || "";
  $("#type").value = ["all", "prompt", "skill"].includes(params.get("type")) ? params.get("type") : "all";
  $("#category").value = [...$("#category").options].some((option) => option.value === params.get("category")) ? params.get("category") : "all";
  $("#collection").value = [...$("#collection").options].some((option) => option.value === params.get("collection")) ? params.get("collection") : "all";
  $("#sort").value = ["featured", "az", "newest"].includes(params.get("sort")) ? params.get("sort") : "featured";
  $("#difficulty").value = ["all", "beginner", "intermediate", "advanced"].includes(params.get("difficulty")) ? params.get("difficulty") : "all";
  $("#favourites").checked = params.get("favourites") === "1";
  activeTag = params.get("tag") || "all";
  if (activeTag !== "all" && !items.some((item) => item.tags.includes(activeTag))) activeTag = "all";
}

function syncViewToURL() {
  const params = new URLSearchParams();
  if ($("#search").value.trim()) params.set("q", $("#search").value.trim());
  if ($("#type").value !== "all") params.set("type", $("#type").value);
  if ($("#category").value !== "all") params.set("category", $("#category").value);
  if ($("#collection").value !== "all") params.set("collection", $("#collection").value);
  if ($("#sort").value !== "featured") params.set("sort", $("#sort").value);
  if ($("#difficulty").value !== "all") params.set("difficulty", $("#difficulty").value);
  if ($("#favourites").checked) params.set("favourites", "1");
  if (activeTag !== "all") params.set("tag", activeTag);
  const resourceId = new URLSearchParams(window.location.search).get("resource");
  if (resourceId) params.set("resource", resourceId);
  const query = params.toString();
  history.replaceState(null, "", window.location.pathname + (query ? "?" + query : "") + "#library");
}

function render() {
  const query = $("#search").value.trim().toLowerCase();
  const type = $("#type").value;
  const category = $("#category").value;
  const collection = $("#collection").value;
  const sort = $("#sort").value;
  const difficulty = $("#difficulty").value;
  const onlyFavourites = $("#favourites").checked;

  const list = items.filter((item) =>
    (type === "all" || item.type === type) &&
    (category === "all" || item.category === category) &&
    (collection === "all" || item.collections.includes(collection)) &&
    (difficulty === "all" || item.difficulty === difficulty) &&
    (activeTag === "all" || item.tags.includes(activeTag)) &&
    (!onlyFavourites || favourites.has(item.id)) &&
    [item.title, item.description, item.category, item.type, item.difficulty, ...item.collections, item.content, item.review_status, ...item.tags].join(" ").toLowerCase().includes(query)
  );

  if (sort === "featured" && query) {
    const relevance = (item) => {
      const title = item.title.toLowerCase();
      const description = item.description.toLowerCase();
      const tags = item.tags.join(" ").toLowerCase();
      const metadata = [item.category, item.type, item.difficulty, ...item.collections, item.review_status].join(" ").toLowerCase();
      const content = item.content.toLowerCase();
      return (title.includes(query) ? 16 : 0) +
        (description.includes(query) ? 8 : 0) +
        (tags.includes(query) ? 6 : 0) +
        (metadata.includes(query) ? 3 : 0) +
        (content.includes(query) ? 1 : 0);
    };
    list.sort((a, b) => relevance(b) - relevance(a));
  }
  if (sort === "az") list.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "newest") list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  $("#count").textContent = list.length + " of " + items.length + " shown";
  syncViewToURL();
  $("#cards").innerHTML = list.map((item) => {
    const isFavourite = favourites.has(item.id);
    return '<article class="card"><div class="cardtop"><span class="kind">' +
      escapeHTML(item.type) + " · " + escapeHTML(item.category) + " · " + escapeHTML(item.difficulty) + " · " + escapeHTML(item.review_status) +
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

function getFilledContent(item) {
  let content = item.content;
  const variables = $("#variables");
  if (!variables) return content;
  variables.querySelectorAll("[data-variable]").forEach((field) => {
    const token = "[" + field.dataset.variable + "]";
    const value = field.value.trim();
    if (value) content = content.split(token).join(value);
  });
  return content;
}

function getRelatedResources(item) {
  return items
    .filter((candidate) => candidate.id !== item.id)
    .map((candidate) => ({
      item: candidate,
      score: candidate.collections.filter((name) => item.collections.includes(name)).length * 3 +
        candidate.tags.filter((tag) => item.tags.includes(tag)).length
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, 3)
    .map((entry) => entry.item);
}

function openDetail(id) {
  const item = items.find((entry) => entry.id === id);
  if (!item) return;
  const variables = [...new Set([...item.content.matchAll(/\[([A-Z][A-Z0-9 _/-]{1,40})\]/g)].map((match) => match[1]))];
  const variableMarkup = variables.length
    ? '<div id="variables" class="variables">' + variables.map((name, index) =>
        '<label for="variable-' + index + '">' + escapeHTML(name.replace(/[_-]/g, " ")) + '</label>' +
        '<textarea id="variable-' + index + '" data-variable="' + escapeHTML(name) +
        '" rows="2" placeholder="Enter ' + escapeHTML(name.toLowerCase().replace(/[_-]/g, " ")) + '"></textarea>'
      ).join("") + '</div>'
    : '<p class="detailmeta">This resource has no fill-in fields.</p>';

  $("#detailBody").innerHTML = '<p class="eyebrow">' + escapeHTML(item.type) + " / " +
    escapeHTML(item.category) + " / " + escapeHTML(item.difficulty) + " / Review: " + escapeHTML(item.review_status) +
    '</p><h2 id="detailTitle">' + escapeHTML(item.title) +
    '</h2><p class="detailmeta">' + escapeHTML(item.description) +
    '</p><div class="chips">' + item.tags.map((tag) => "<span>" + escapeHTML(tag) + "</span>").join("") +
    '</div><div class="collection-list">' + item.collections.map((name) => '<span>' + escapeHTML(name) + '</span>').join("") + '</div><h3>Personalise this resource</h3>' + variableMarkup +
    '<h3>Ready-to-use preview</h3><div class="detailtext" id="resourceText">' +
    escapeHTML(item.content) + '</div><div class="detail-actions"><button class="copy" id="copy">Copy ' +
    escapeHTML(item.type) + '</button><button class="copy-link" id="share-resource">Copy resource link</button>' +
    '<button class="copy-link" id="download-resource">Download .txt</button></div>';

  const related = getRelatedResources(item);
  if (related.length) {
    $("#detailBody").insertAdjacentHTML("beforeend",
      '<section class="related"><h3>Related resources</h3><div class="related-list">' +
      related.map((entry) => '<button type="button" data-related-open="' + escapeHTML(entry.id) +
        '"><span>' + escapeHTML(entry.title) + '</span><small>' + escapeHTML(entry.type) +
        ' · ' + escapeHTML(entry.category) + '</small></button>').join("") +
      '</div></section>');
  }

  const detailParams = new URLSearchParams(window.location.search);
  detailParams.set("resource", item.id);
  history.replaceState(null, "", window.location.pathname + "?" + detailParams.toString() + "#library");
  $("#detail").showModal();
  $("#copy").focus();
  $("#copy").onclick = async () => {
    const button = $("#copy");
    try {
      await copyText(getFilledContent(item));
      button.textContent = "Copied ✓";
    } catch (error) {
      button.textContent = "Copy unavailable — select the preview above";
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

["search", "type", "category", "collection", "sort", "difficulty", "favourites"].forEach((id) => {
  const control = $("#" + id);
  control.addEventListener(id === "search" ? "input" : "change", render);
});

$("#close").onclick = () => $("#detail").close();
$("#detail").addEventListener("close", () => {
  const params = new URLSearchParams(window.location.search);
  params.delete("resource");
  history.replaceState(null, "", window.location.pathname + (params.toString() ? "?" + params.toString() : "") + "#library");
});
$("#detail").addEventListener("click", (event) => {
  if (event.target === $("#detail")) $("#detail").close();
});
$("#theme").onclick = () => {
  document.body.classList.toggle("light");
  writeStorage("pv-theme", document.body.classList.contains("light") ? "light" : "dark");
  updateThemeButton();
};

const savedTheme = readStorage("pv-theme");
if (savedTheme === "light" || (!savedTheme && window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches)) {
  document.body.classList.add("light");
}
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
  setTimeout(() => URL.revokeObjectURL(url), 1000);
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

$("#detailBody").addEventListener("input", (event) => {
  if (!event.target.matches("[data-variable]")) return;
  const itemId = new URLSearchParams(window.location.search).get("resource");
  const item = items.find((entry) => entry.id === itemId);
  if (item) $("#resourceText").textContent = getFilledContent(item);
});

$("#detailBody").addEventListener("click", async (event) => {
  const relatedButton = event.target.closest("[data-related-open]");
  if (relatedButton) {
    openDetail(relatedButton.dataset.relatedOpen);
    return;
  }
  if (event.target.id === "share-resource") {
    const button = event.target;
    try { await copyText(window.location.href); button.textContent = "Link copied ✓"; }
    catch (error) { button.textContent = "Could not copy link"; console.warn(error); }
  }
  if (event.target.id === "download-resource") {
    const itemId = new URLSearchParams(window.location.search).get("resource");
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return;
    const content = item.title + "\n\n" + getFilledContent(item) + "\n";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = item.id + ".txt";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    event.target.textContent = "Downloaded ✓";
  }
});

$("#download-catalogue").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "prompt-vault-catalogue.json";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

$("#clear-filters").addEventListener("click", () => {
  $("#search").value = "";
  $("#type").value = "all";
  $("#category").value = "all";
  $("#collection").value = "all";
  $("#difficulty").value = "all";
  $("#favourites").checked = false;
  activeTag = "all";
  render();
});

$("#share-view").addEventListener("click", async () => {
  const button = $("#share-view");
  try { await copyText(window.location.href); button.textContent = "Link copied ✓"; }
  catch (error) { button.textContent = "Could not copy link"; console.warn(error); }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => console.warn("Offline support could not be enabled.", error));
  });
}

function updateNetworkStatus() {
  const status = $("#network-status");
  const offline = !navigator.onLine;
  status.hidden = !offline;
  status.textContent = offline ? "Offline mode" : "";
}
window.addEventListener("online", updateNetworkStatus);
window.addEventListener("offline", updateNetworkStatus);
updateNetworkStatus();
