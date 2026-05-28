(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const show = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    const run = function () {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5600);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        run();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        run();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        run();
      });
    });

    show(0);
    run();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    const scope = panel.parentElement;
    const list = scope.querySelector('[data-card-list]');
    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll('.movie-card'));
    const searchInput = panel.querySelector('[data-search-input]');
    const kindFilter = panel.querySelector('[data-kind-filter]');
    const yearFilter = panel.querySelector('[data-year-filter]');

    const matchYear = function (value, year) {
      const numericYear = parseInt(year, 10);
      if (value === 'all') {
        return true;
      }
      if (value === 'classic') {
        return !numericYear || numericYear < 2000;
      }
      return numericYear && numericYear >= parseInt(value, 10);
    };

    const apply = function () {
      const keyword = (searchInput && searchInput.value ? searchInput.value : '').trim().toLowerCase();
      const kind = kindFilter ? kindFilter.value : 'all';
      const year = yearFilter ? yearFilter.value : 'all';

      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.year
        ].join(' ').toLowerCase();
        const kindOk = kind === 'all' || card.dataset.kind === kind;
        const yearOk = matchYear(year, card.dataset.year);
        const keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
        card.hidden = !(kindOk && yearOk && keywordOk);
      });
    };

    [searchInput, kindFilter, yearFilter].forEach(function (el) {
      if (el) {
        el.addEventListener('input', apply);
        el.addEventListener('change', apply);
      }
    });
  });
})();

function initPlayer(streamUrl) {
  const video = document.getElementById('moviePlayer');
  const button = document.getElementById('playButton');
  if (!video || !button || !streamUrl) {
    return;
  }

  let started = false;
  let hls = null;

  const start = function () {
    if (started) {
      video.play().catch(function () {});
      return;
    }

    started = true;
    button.classList.add('is-hidden');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch(function () {
        button.classList.remove('is-hidden');
        started = false;
      });
      return;
    }

    if (window.Hls && Hls.isSupported()) {
      hls = new Hls({
        maxBufferLength: 30,
        backBufferLength: 30
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {
          button.classList.remove('is-hidden');
          started = false;
        });
      });
      hls.on(Hls.Events.ERROR, function () {
        if (hls) {
          hls.recoverMediaError();
        }
      });
      return;
    }

    video.src = streamUrl;
    video.play().catch(function () {
      button.classList.remove('is-hidden');
      started = false;
    });
  };

  button.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (!started) {
      start();
    }
  });
}
