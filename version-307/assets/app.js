(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function refreshHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 18);
  }

  refreshHeader();
  window.addEventListener('scroll', refreshHeader, { passive: true });

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function playSlides() {
      stopSlides();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopSlides() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        playSlides();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        playSlides();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        playSlides();
      });
    });

    showSlide(0);
    playSlides();
  }

  var filterRoots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
  filterRoots.forEach(function (root) {
    var input = root.querySelector('[data-filter-input]');
    var page = root.closest('main') || document;
    var list = page.querySelector('[data-filter-list]');
    var empty = page.querySelector('[data-empty-state]');
    if (!input || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

    function applyFilter(value) {
      var keyword = String(value || '').trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matched = !keyword || text.indexOf(keyword) > -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    input.addEventListener('input', function () {
      applyFilter(input.value);
    });

    root.querySelectorAll('[data-filter-key]').forEach(function (button) {
      button.addEventListener('click', function () {
        input.value = button.getAttribute('data-filter-key') || '';
        applyFilter(input.value);
      });
    });

    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) {
      input.value = params.get('q');
      applyFilter(input.value);
    }
  });
})();

function initPlayer(source) {
  var root = document.querySelector('[data-player]');
  if (!root) {
    return;
  }

  var video = root.querySelector('video');
  var cover = root.querySelector('.player-cover');
  var started = false;
  var hlsInstance = null;

  function beginPlayback() {
    if (!video || started) {
      return;
    }
    started = true;
    if (cover) {
      cover.classList.add('is-hidden');
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = source;
    video.play().catch(function () {});
  }

  if (cover) {
    cover.addEventListener('click', beginPlayback);
  }

  video.addEventListener('click', function () {
    if (!started) {
      beginPlayback();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
