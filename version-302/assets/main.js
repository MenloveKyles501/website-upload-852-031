(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileMenu = document.querySelector(".mobile-menu");
  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      mobileMenu.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var activeIndex = 0;
  function setHero(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  }
  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var index = Number(dot.getAttribute("data-hero-index"));
      setHero(index);
    });
  });
  if (slides.length > 1) {
    window.setInterval(function () {
      setHero(activeIndex + 1);
    }, 5000);
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterType = document.querySelector("[data-filter-type]");
  var filterYear = document.querySelector("[data-filter-year]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var empty = document.querySelector("[data-filter-empty]");
  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }
  function applyFilter() {
    if (!cards.length) {
      return;
    }
    var text = normalize(filterInput && filterInput.value);
    var type = normalize(filterType && filterType.value);
    var year = normalize(filterYear && filterYear.value);
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-type"),
        card.getAttribute("data-tags"),
        card.textContent
      ].join(" "));
      var matchText = !text || haystack.indexOf(text) !== -1;
      var matchType = !type || normalize(card.getAttribute("data-type")) === type;
      var matchYear = !year || normalize(card.getAttribute("data-year")) === year;
      var show = matchText && matchType && matchYear;
      card.style.display = show ? "" : "none";
      if (show) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }
  [filterInput, filterType, filterYear].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilter);
      control.addEventListener("change", applyFilter);
    }
  });
}());
