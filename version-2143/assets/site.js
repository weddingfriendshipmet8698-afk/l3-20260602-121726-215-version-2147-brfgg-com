(function () {
  var header = document.querySelector('[data-header]');
  var menu = document.querySelector('[data-menu]');
  var menuButton = document.querySelector('[data-menu-button]');

  function updateHeader() {
    if (!header) {
      return;
    }

    if (window.scrollY > 20 || header.classList.contains('solid')) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
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
    }

    function move(step) {
      show(index + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        move(1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        move(1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    start();
  });

  function bindScrollButton(selector, direction) {
    document.querySelectorAll(selector).forEach(function (button) {
      button.addEventListener('click', function () {
        var targetName = button.getAttribute(direction > 0 ? 'data-scroll-right' : 'data-scroll-left');
        var target = document.querySelector('[data-scroll="' + targetName + '"]');
        if (target) {
          target.scrollBy({ left: 420 * direction, behavior: 'smooth' });
        }
      });
    });
  }

  bindScrollButton('[data-scroll-left]', -1);
  bindScrollButton('[data-scroll-right]', 1);

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    var form = root.querySelector('[data-filter-form]');
    var searchInput = root.querySelector('[data-search-input]');
    var categoryFilter = root.querySelector('[data-category-filter]');
    var yearFilter = root.querySelector('[data-year-filter]');
    var regionFilter = root.querySelector('[data-region-filter]');
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-filter-item]'));

    function textOf(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
    }

    function applyFilters() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var category = categoryFilter ? categoryFilter.value : '';
      var year = yearFilter ? yearFilter.value : '';
      var region = regionFilter ? regionFilter.value : '';

      cards.forEach(function (card) {
        var matched = true;
        if (keyword && textOf(card).indexOf(keyword) === -1) {
          matched = false;
        }
        if (category && card.getAttribute('data-category') !== category) {
          matched = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          matched = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          matched = false;
        }
        card.classList.toggle('is-hidden', !matched);
      });
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
      });
      form.addEventListener('input', applyFilters);
      form.addEventListener('change', applyFilters);
    }
  });

  window.initMoviePlayer = function (streamUrl) {
    var shell = document.querySelector('[data-player]');
    if (!shell) {
      return;
    }

    var video = shell.querySelector('video');
    var cover = shell.querySelector('[data-player-cover]');
    var attached = false;
    var instance = null;

    function attachStream() {
      if (attached || !video) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({ enableWorker: true });
        instance.loadSource(streamUrl);
        instance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      attached = true;
    }

    function begin() {
      attachStream();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.controls = true;
      var playing = video.play();
      if (playing && typeof playing.catch === 'function') {
        playing.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', begin);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });

    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (instance) {
        instance.destroy();
      }
    });
  };
})();
