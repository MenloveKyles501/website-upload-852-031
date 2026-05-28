(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupMobileMenu();
        setupHeroSlider();
        setupFilters();
        setupHomeSearchParameter();
    });

    function setupMobileMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
            button.classList.toggle('is-open');
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
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

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupHomeSearchParameter() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (!query) {
            return;
        }
        var searchInput = document.querySelector('[data-filter-search]');
        if (searchInput) {
            searchInput.value = query;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        scopes.forEach(function (scope) {
            var list = document.querySelector('[data-filter-list]');
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            var search = scope.querySelector('[data-filter-search]');
            var year = scope.querySelector('[data-filter-year]');
            var region = scope.querySelector('[data-filter-region]');
            var type = scope.querySelector('[data-filter-type]');
            var count = scope.querySelector('[data-filter-count]');
            var empty = document.querySelector('[data-empty-state]');

            function normalize(value) {
                return String(value || '').trim().toLowerCase();
            }

            function textOf(card) {
                return normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.textContent
                ].join(' '));
            }

            function apply() {
                var keyword = normalize(search && search.value);
                var selectedYear = year ? year.value : '';
                var selectedRegion = region ? region.value : '';
                var selectedType = type ? type.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var ok = true;
                    if (keyword && textOf(card).indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (selectedYear && card.getAttribute('data-year') !== selectedYear) {
                        ok = false;
                    }
                    if (selectedRegion && card.getAttribute('data-region') !== selectedRegion) {
                        ok = false;
                    }
                    if (selectedType && card.getAttribute('data-type') !== selectedType) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [search, year, region, type].forEach(function (control) {
                if (!control) {
                    return;
                }
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            });

            apply();
        });
    }
})();
