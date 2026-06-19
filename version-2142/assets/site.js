document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-mobile-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var prev = document.querySelector("[data-hero-prev]");
  var next = document.querySelector("[data-hero-next]");
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function moveSlide(step) {
    showSlide(current + step);
  }

  function startHero() {
    if (timer || slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      moveSlide(1);
    }, 5000);
  }

  function restartHero() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }

    startHero();
  }

  if (prev) {
    prev.addEventListener("click", function () {
      moveSlide(-1);
      restartHero();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      moveSlide(1);
      restartHero();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
      restartHero();
    });
  });

  showSlide(0);
  startHero();

  document.querySelectorAll("[data-scroll-control]").forEach(function (button) {
    button.addEventListener("click", function () {
      var targetId = button.getAttribute("data-scroll-control");
      var direction = button.getAttribute("data-direction") === "left" ? -1 : 1;
      var rail = document.getElementById(targetId);

      if (rail) {
        rail.scrollBy({
          left: direction * 420,
          behavior: "smooth"
        });
      }
    });
  });

  var searchInput = document.querySelector("[data-movie-search]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var empty = document.querySelector("[data-empty-state]");
  var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter-group]"));
  var activeFilters = {};

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function getCardText(card) {
    return normalize([
      card.getAttribute("data-title"),
      card.getAttribute("data-region"),
      card.getAttribute("data-year"),
      card.getAttribute("data-category"),
      card.getAttribute("data-tags")
    ].join(" "));
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(searchInput ? searchInput.value : "");
    var visible = 0;

    cards.forEach(function (card) {
      var text = getCardText(card);
      var matched = !keyword || text.indexOf(keyword) !== -1;

      Object.keys(activeFilters).forEach(function (group) {
        var value = activeFilters[group];

        if (value && value !== "all") {
          matched = matched && normalize(card.getAttribute("data-" + group)) === normalize(value);
        }
      });

      card.classList.toggle("hidden", !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("show", visible === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  filters.forEach(function (button) {
    button.addEventListener("click", function () {
      var group = button.getAttribute("data-filter-group");
      var value = button.getAttribute("data-filter-value");

      filters.forEach(function (item) {
        if (item.getAttribute("data-filter-group") === group) {
          item.classList.remove("active");
        }
      });

      button.classList.add("active");
      activeFilters[group] = value;
      applyFilters();
    });
  });

  applyFilters();
});
