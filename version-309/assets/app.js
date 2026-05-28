(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = document.body.classList.toggle("menu-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("active", idx === current);
      });
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        showSlide(idx);
      });
    });

    if (slides.length > 1) {
      showSlide(0);
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    document.querySelectorAll(".filter-scope").forEach(function (scope) {
      var input = scope.querySelector(".js-filter-input");
      var selects = Array.prototype.slice.call(scope.querySelectorAll(".js-filter-select"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

      if (input && query) {
        input.value = query;
      }

      function applyFilter() {
        var value = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-keywords") || "").toLowerCase();
          var matched = !value || text.indexOf(value) !== -1;
          selects.forEach(function (select) {
            var key = select.getAttribute("data-key");
            var selected = select.value;
            if (selected && (card.getAttribute("data-" + key) || "") !== selected) {
              matched = false;
            }
          });
          card.classList.toggle("hidden-card", !matched);
        });
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", applyFilter);
      });
      applyFilter();
    });

    document.querySelectorAll(".player-box").forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".player-cover");
      var source = player.getAttribute("data-source");
      var started = false;
      var hlsInstance = null;

      function start() {
        if (!video || !source) {
          return;
        }
        player.classList.add("is-playing");
        video.setAttribute("controls", "controls");
        if (!started) {
          started = true;
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = source;
            video.play().catch(function () {});
          }
        } else {
          video.play().catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            start();
          }
        });
        video.addEventListener("ended", function () {
          if (hlsInstance) {
            hlsInstance.stopLoad();
          }
        });
      }
    });
  });
})();
