(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function setupMobileNav() {
        var toggle = document.querySelector('.mobile-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var prev = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
                start();
            });
        });
        start();
    }

    function setupFilters() {
        var grid = document.querySelector('.searchable-grid');
        var input = document.getElementById('movieFilter');
        if (!grid || !input) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var selects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
        var empty = document.querySelector('.empty-state');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            input.value = query;
        }
        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }
        function apply() {
            var keyword = normalize(input.value);
            var filters = {};
            selects.forEach(function (select) {
                filters[select.getAttribute('data-filter')] = select.value;
            });
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.textContent
                ].join(' '));
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                Object.keys(filters).forEach(function (key) {
                    if (filters[key] && card.getAttribute('data-' + key) !== filters[key]) {
                        matched = false;
                    }
                });
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        input.addEventListener('input', apply);
        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });
        apply();
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('.video-shell'));
        shells.forEach(function (shell) {
            var video = shell.querySelector('video');
            var overlay = shell.querySelector('.player-overlay');
            if (!video || !overlay) {
                return;
            }
            var stream = video.getAttribute('data-stream');
            function attach() {
                if (video.getAttribute('data-ready') === '1') {
                    return;
                }
                video.setAttribute('data-ready', '1');
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video._hls = hls;
                    return;
                }
                video.src = stream;
            }
            function play() {
                attach();
                shell.classList.add('is-playing');
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {});
                }
            }
            overlay.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.getAttribute('data-ready') !== '1' || video.paused) {
                    play();
                }
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
        });
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
