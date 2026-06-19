(function () {
  var header = document.querySelector('[data-header]');
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 20) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-scroll-row]').forEach(function (row) {
    var section = row.closest('.section');
    if (!section) return;
    var left = section.querySelector('[data-scroll-left]');
    var right = section.querySelector('[data-scroll-right]');
    if (left) {
      left.addEventListener('click', function () {
        row.scrollBy({ left: -420, behavior: 'smooth' });
      });
    }
    if (right) {
      right.addEventListener('click', function () {
        row.scrollBy({ left: 420, behavior: 'smooth' });
      });
    }
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function showHero(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function startHero() {
      timer = window.setInterval(function () {
        showHero(index + 1);
      }, 5000);
    }

    function restartHero() {
      if (timer) window.clearInterval(timer);
      startHero();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showHero(index - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showHero(index + 1);
        restartHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        restartHero();
      });
    });

    startHero();
  }

  document.querySelectorAll('[data-search-input]').forEach(function (input) {
    var scope = input.closest('main') || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('is-hidden', value && text.indexOf(value) === -1);
      });
    });
  });

  var player = document.getElementById('moviePlayer');
  var playButton = document.getElementById('playButton');

  if (player && playButton) {
    var stream = player.getAttribute('data-stream');
    var attached = false;

    function attachAndPlay() {
      if (!stream) return;
      if (!attached) {
        if (player.canPlayType('application/vnd.apple.mpegurl')) {
          player.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(player);
        } else {
          player.src = stream;
        }
        attached = true;
      }
      playButton.classList.add('hidden');
      var attempt = player.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          playButton.classList.remove('hidden');
        });
      }
    }

    playButton.addEventListener('click', attachAndPlay);
    player.addEventListener('click', function () {
      if (player.paused) attachAndPlay();
    });
    player.addEventListener('play', function () {
      playButton.classList.add('hidden');
    });
  }
})();
