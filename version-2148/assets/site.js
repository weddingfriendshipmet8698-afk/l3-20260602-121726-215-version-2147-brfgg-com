(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
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
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
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

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var panels = selectAll('[data-filter-panel]');

    panels.forEach(function (panel) {
      var scopeName = panel.getAttribute('data-filter-panel');
      var root = document.querySelector('[data-filter-scope="' + scopeName + '"]') || document;
      var cards = selectAll('[data-movie-card]', root);
      var searchInput = panel.querySelector('[data-search-input]');
      var selects = selectAll('[data-filter-field]', panel);
      var clear = panel.querySelector('[data-clear-filters]');
      var count = panel.querySelector('[data-result-count]');
      var empty = root.querySelector('[data-empty-state]');

      function valueOf(field) {
        var element = panel.querySelector('[data-filter-field="' + field + '"]');
        return element ? element.value : '';
      }

      function apply() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = valueOf('year');
        var region = valueOf('region');
        var type = valueOf('type');
        var genre = valueOf('genre');
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();

          var matched = true;
          matched = matched && (!keyword || haystack.indexOf(keyword) !== -1);
          matched = matched && (!year || card.getAttribute('data-year') === year);
          matched = matched && (!region || card.getAttribute('data-region') === region);
          matched = matched && (!type || card.getAttribute('data-type') === type);
          matched = matched && (!genre || (card.getAttribute('data-genre') || '').indexOf(genre) !== -1);

          card.classList.toggle('hidden-by-filter', !matched);

          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }

        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (searchInput) {
        searchInput.addEventListener('input', apply);
      }

      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });

      if (clear) {
        clear.addEventListener('click', function () {
          if (searchInput) {
            searchInput.value = '';
          }

          selects.forEach(function (select) {
            select.value = '';
          });

          apply();
        });
      }

      apply();
    });
  }

  window.initMoviePlayer = function (source, videoId, coverId) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var hlsInstance = null;
    var loaded = false;

    if (!video || !cover) {
      return;
    }

    function attachSource() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attachSource();
      cover.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');

      var result = video.play();

      if (result && result.catch) {
        result.catch(function () {
          cover.classList.remove('is-hidden');
        });
      }
    }

    cover.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
