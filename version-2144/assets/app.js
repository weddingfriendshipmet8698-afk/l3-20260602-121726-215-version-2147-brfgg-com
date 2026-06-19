(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
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

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  });

  document.querySelectorAll('[data-filter-block]').forEach(function (block) {
    var input = block.querySelector('[data-filter-input]');
    var yearSelect = block.querySelector('[data-filter-year]');
    var sortSelect = block.querySelector('[data-filter-sort]');
    var grid = block.querySelector('[data-card-grid]');
    var emptyState = block.querySelector('[data-empty-state]');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

    function textValue(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category')
      ].join(' ').toLowerCase();
    }

    function numberValue(card, name) {
      if (name === 'year') {
        return Number(card.getAttribute('data-year') || 0);
      }
      if (name === 'heat') {
        return Number(card.getAttribute('data-heat') || 0);
      }
      if (name === 'score') {
        return Number(card.getAttribute('data-score') || 0);
      }
      return 0;
    }

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = [];

      cards.forEach(function (card) {
        var matchedText = !keyword || textValue(card).indexOf(keyword) !== -1;
        var matchedYear = !year || card.getAttribute('data-year') === year;
        var matched = matchedText && matchedYear;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible.push(card);
        }
      });

      var sortType = sortSelect ? sortSelect.value : '';
      if (sortType) {
        visible.sort(function (a, b) {
          return numberValue(b, sortType) - numberValue(a, sortType);
        });
        visible.forEach(function (card) {
          grid.appendChild(card);
        });
      }

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible.length === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', applyFilter);
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', applyFilter);
    }

    applyFilter();
  });
}());
