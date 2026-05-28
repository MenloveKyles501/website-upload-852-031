(function () {
  var items = window.SEARCH_INDEX || [];
  var input = document.getElementById("searchText");
  var type = document.getElementById("searchType");
  var button = document.getElementById("searchButton");
  var results = document.getElementById("searchResults");
  var empty = document.getElementById("searchEmpty");
  function params() {
    return new URLSearchParams(window.location.search);
  }
  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }
  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }
  function card(item) {
    return [
      "<article class=\"movie-card-item\">",
      "<a class=\"poster-card\" href=\"" + escapeHtml(item.url) + "\" aria-label=\"" + escapeHtml(item.title) + "\">",
      "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\">",
      "<span class=\"card-badge\">精选</span>",
      "<span class=\"play-mark\">▶</span>",
      "</a>",
      "<h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>",
      "<p class=\"movie-meta\">" + escapeHtml(item.year) + " · " + escapeHtml(item.region) + " · " + escapeHtml(item.type) + "</p>",
      "<p class=\"movie-line\">" + escapeHtml(item.line) + "</p>",
      "</article>"
    ].join("");
  }
  function render() {
    var query = normalize(input && input.value);
    var selectedType = normalize(type && type.value);
    var matched = items.filter(function (item) {
      var words = [
        item.title,
        item.year,
        item.region,
        item.type,
        item.genre,
        (item.tags || []).join(" "),
        item.line
      ].join(" ");
      var textOk = !query || normalize(words).indexOf(query) !== -1;
      var typeOk = !selectedType || normalize(item.type) === selectedType;
      return textOk && typeOk;
    }).slice(0, 120);
    results.innerHTML = matched.map(card).join("");
    empty.classList.toggle("is-visible", matched.length === 0);
  }
  if (input) {
    var q = params().get("q") || "";
    input.value = q;
    input.addEventListener("input", render);
  }
  if (type) {
    type.addEventListener("change", render);
  }
  if (button) {
    button.addEventListener("click", render);
  }
  render();
}());
