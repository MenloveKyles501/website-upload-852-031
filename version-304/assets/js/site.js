(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        var expanded = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!expanded));
        mobileNav.hidden = expanded;
      });
    }

    var slides = Array.prototype.slice.call(
      document.querySelectorAll(".hero-slide"),
    );
    var dots = Array.prototype.slice.call(
      document.querySelectorAll("[data-hero-dot]"),
    );
    var nextButton = document.querySelector("[data-hero-next]");
    var prevButton = document.querySelector("[data-hero-prev]");
    var activeSlide = 0;
    var timer = null;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }
      activeSlide = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeSlide);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeSlide);
      });
    }

    function startTimer() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        setSlide(activeSlide + 1);
      }, 5200);
    }

    function restartTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
      startTimer();
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restartTimer();
      });
    });

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        setSlide(activeSlide + 1);
        restartTimer();
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        setSlide(activeSlide - 1);
        restartTimer();
      });
    }

    setSlide(0);
    startTimer();

    var filterInputs = Array.prototype.slice.call(
      document.querySelectorAll(".js-card-search"),
    );
    var clearButtons = Array.prototype.slice.call(
      document.querySelectorAll(".clear-filter"),
    );
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q") || "";

    function normalize(value) {
      return String(value || "")
        .trim()
        .toLowerCase();
    }

    function applyFilter(input) {
      var panel = input.closest(".page-section") || document;
      var scope =
        panel.querySelector(".js-filter-scope") ||
        document.querySelector(".js-filter-scope") ||
        document;
      var cards = Array.prototype.slice.call(
        scope.querySelectorAll(".movie-card, .rank-item"),
      );
      var value = normalize(input.value);

      cards.forEach(function (card) {
        var haystack = normalize(
          card.getAttribute("data-index") || card.textContent,
        );
        card.classList.toggle(
          "is-hidden",
          value && haystack.indexOf(value) === -1,
        );
      });
    }

    filterInputs.forEach(function (input) {
      if (queryValue && !input.value) {
        input.value = queryValue;
      }
      input.addEventListener("input", function () {
        applyFilter(input);
      });
      if (input.value) {
        applyFilter(input);
      }
    });

    clearButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var panel = button.closest(".filter-panel");
        var input = panel ? panel.querySelector(".js-card-search") : null;
        if (input) {
          input.value = "";
          applyFilter(input);
          input.focus();
        }
      });
    });
  });
})();
