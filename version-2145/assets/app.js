(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    };
    var next = function () {
      show(current + 1);
    };
    var prev = function () {
      show(current - 1);
    };
    var nextBtn = hero.querySelector('[data-hero-next]');
    var prevBtn = hero.querySelector('[data-hero-prev]');
    if (nextBtn) {
      nextBtn.addEventListener('click', next);
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', prev);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });
    window.setInterval(next, 5200);
  }

  document.querySelectorAll('[data-rail]').forEach(function (rail) {
    var section = rail.closest('section');
    if (!section) {
      return;
    }
    var left = section.querySelector('[data-rail-left]');
    var right = section.querySelector('[data-rail-right]');
    var move = function (dir) {
      rail.scrollBy({
        left: dir * 380,
        behavior: 'smooth'
      });
    };
    if (left) {
      left.addEventListener('click', function () {
        move(-1);
      });
    }
    if (right) {
      right.addEventListener('click', function () {
        move(1);
      });
    }
  });

  var input = document.querySelector('[data-search-input]');
  var region = document.querySelector('[data-region-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var applyFilter = function () {
    var query = input ? input.value.trim().toLowerCase() : '';
    var regionValue = region ? region.value : 'all';
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags')).toLowerCase();
      var cardRegion = card.getAttribute('data-region') || '';
      var queryOk = !query || text.indexOf(query) !== -1;
      var regionOk = regionValue === 'all' || cardRegion.indexOf(regionValue) !== -1;
      card.classList.toggle('hidden', !(queryOk && regionOk));
    });
  };
  if (input) {
    input.addEventListener('input', applyFilter);
  }
  if (region) {
    region.addEventListener('change', applyFilter);
  }

  var hlsLoading = false;
  var hlsReadyCallbacks = [];
  var runHlsCallbacks = function () {
    var callbacks = hlsReadyCallbacks.splice(0);
    callbacks.forEach(function (fn) {
      fn();
    });
  };
  var ensureHls = function (callback) {
    if (window.Hls) {
      callback();
      return;
    }
    hlsReadyCallbacks.push(callback);
    if (hlsLoading) {
      return;
    }
    hlsLoading = true;
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
    script.onload = runHlsCallbacks;
    script.onerror = function () {
      hlsReadyCallbacks = [];
    };
    document.head.appendChild(script);
  };
  var attachSource = function (video, source, container) {
    if (video.dataset.ready === '1') {
      video.play().catch(function () {});
      return;
    }
    var start = function () {
      video.dataset.ready = '1';
      container.classList.add('ready');
      video.play().catch(function () {});
    };
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      start();
      return;
    }
    ensureHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        start();
      }
    });
  };
  document.querySelectorAll('[data-player]').forEach(function (container) {
    var video = container.querySelector('video');
    var button = container.querySelector('[data-play-button]');
    if (!video || !button) {
      return;
    }
    var source = video.getAttribute('data-src');
    var play = function () {
      if (!source) {
        return;
      }
      attachSource(video, source, container);
    };
    button.addEventListener('click', play);
    video.addEventListener('click', play);
    video.addEventListener('play', function () {
      container.classList.add('ready');
    });
  });
})();
