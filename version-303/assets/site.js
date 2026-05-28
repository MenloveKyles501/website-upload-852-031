(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var siteNav = document.querySelector('[data-site-nav]');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
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

    function setHero(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function moveHero(step) {
      setHero(current + step);
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        moveHero(1);
      }, 5600);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        setHero(i);
        startHero();
      });
    });
    if (prev) prev.addEventListener('click', function () { moveHero(-1); startHero(); });
    if (next) next.addEventListener('click', function () { moveHero(1); startHero(); });
    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    setHero(0);
    startHero();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function cardText(card) {
    return normalize([
      card.dataset.title,
      card.dataset.region,
      card.dataset.type,
      card.dataset.genre,
      card.dataset.tags,
      card.dataset.year
    ].join(' '));
  }

  function applyFilters(scope) {
    var input = scope.querySelector('[data-filter-input]');
    var select = scope.querySelector('[data-filter-type]');
    var grid = document.querySelector('[data-card-grid]');
    var empty = scope.querySelector('[data-filter-empty]');
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var query = normalize(input && input.value);
    var selectedType = normalize(select && select.value);
    var shown = 0;
    cards.forEach(function (card) {
      var text = cardText(card);
      var typeOk = !selectedType || normalize(card.dataset.type) === selectedType;
      var queryOk = !query || text.indexOf(query) !== -1;
      var visible = typeOk && queryOk;
      card.style.display = visible ? '' : 'none';
      if (visible) shown += 1;
    });
    if (empty) empty.classList.toggle('is-visible', shown === 0);
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var select = scope.querySelector('[data-filter-type]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && input) input.value = q;
    if (input) input.addEventListener('input', function () { applyFilters(scope); });
    if (select) select.addEventListener('change', function () { applyFilters(scope); });
    applyFilters(scope);
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    if (!video || !button) return;
    var stream = video.getAttribute('data-stream');
    var loaded = false;
    var hlsInstance = null;

    function prepare() {
      if (loaded || !stream) return;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) return;
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      }
      loaded = true;
    }

    function playVideo() {
      prepare();
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    button.addEventListener('click', function () {
      playVideo();
    });

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) hlsInstance.destroy();
    });
  });
})();
