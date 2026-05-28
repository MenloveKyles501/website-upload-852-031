(function () {
  function $(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function $all(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function createCard(item) {
    var tags = (item.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "" +
      "<article class=\"movie-card\">" +
        "<a class=\"movie-poster media-frame\" href=\"" + escapeHtml(item.url) + "\">" +
          "<img src=\"" + escapeHtml(item.cover) + "\" alt=\"" + escapeHtml(item.title) + "\" class=\"poster-image\" loading=\"lazy\" onerror=\"this.remove()\">" +
          "<span class=\"poster-shade\"></span>" +
          "<span class=\"play-mark\">▶</span>" +
        "</a>" +
        "<div class=\"movie-info\">" +
          "<div class=\"movie-meta-row\">" +
            "<span>" + escapeHtml(item.year) + "</span>" +
            "<span>" + escapeHtml(item.type) + "</span>" +
            "<span>" + escapeHtml(item.region) + "</span>" +
          "</div>" +
          "<h3><a href=\"" + escapeHtml(item.url) + "\">" + escapeHtml(item.title) + "</a></h3>" +
          "<p>" + escapeHtml(item.oneLine) + "</p>" +
          "<div class=\"tag-cloud small-tags\">" + tags + "</div>" +
        "</div>" +
      "</article>";
  }

  var toggle = $(".mobile-toggle");
  var mobileNav = $(".mobile-nav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = $("[data-hero]");
  if (hero) {
    var slides = $all(".hero-slide", hero);
    var dots = $all(".hero-dot", hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function start() {
      stop();
      timer = window.setInterval(next, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    var prevButton = $("[data-hero-prev]", hero);
    var nextButton = $("[data-hero-next]", hero);
    if (prevButton) {
      prevButton.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (nextButton) {
      nextButton.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });
    start();
  }

  var filterInput = $("[data-list-filter]");
  if (filterInput) {
    var cards = $all("[data-title]");
    filterInput.addEventListener("input", function () {
      var keyword = filterInput.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = (card.getAttribute("data-title") || "").toLowerCase();
        card.hidden = keyword && haystack.indexOf(keyword) === -1;
      });
    });
  }

  var results = $("#search-results");
  if (results && window.SEARCH_ITEMS) {
    var params = new URLSearchParams(window.location.search);
    var input = $("#search-input");
    var summary = $("#search-summary");
    var query = (params.get("q") || "").trim();
    if (input) {
      input.value = query;
    }
    var items = window.SEARCH_ITEMS;
    var matches = query ? items.filter(function (item) {
      var text = [item.title, item.region, item.type, item.year, item.genre, item.tags.join(" "), item.oneLine].join(" ").toLowerCase();
      return text.indexOf(query.toLowerCase()) !== -1;
    }) : items.slice(0, 24);
    if (summary) {
      summary.textContent = query ? "搜索“" + query + "”找到 " + matches.length + " 条内容" : "输入关键词后可搜索片库，以下为热门推荐";
    }
    results.innerHTML = matches.slice(0, 120).map(createCard).join("");
  }
})();
