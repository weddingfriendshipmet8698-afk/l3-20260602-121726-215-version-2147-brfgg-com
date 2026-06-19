(function () {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-toggle');

  if (mobileToggle && header) {
    mobileToggle.addEventListener('click', function () {
      header.classList.toggle('nav-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  const prev = document.querySelector('.hero-prev');
  const next = document.querySelector('.hero-next');
  let currentSlide = 0;
  let slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  function restartSlider() {
    if (!slides.length) {
      return;
    }
    window.clearInterval(slideTimer);
    slideTimer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.dataset.slide || 0));
      restartSlider();
    });
  });

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      restartSlider();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      restartSlider();
    });
  }

  restartSlider();

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.querySelectorAll('.inline-filter').forEach(function (form) {
    const scopeId = form.dataset.filterScope;
    const scope = document.getElementById(scopeId);
    const input = form.querySelector('input[type="search"]');
    const select = form.querySelector('select');

    function applyFilter() {
      if (!scope) {
        return;
      }
      const keyword = normalize(input ? input.value : '');
      const year = select ? select.value : '';
      const items = scope.querySelectorAll('.movie-card, .ranking-row');
      items.forEach(function (item) {
        const haystack = normalize([
          item.dataset.title,
          item.dataset.region,
          item.dataset.type,
          item.dataset.genre,
          item.dataset.year
        ].join(' '));
        const matchedKeyword = !keyword || haystack.includes(keyword);
        const matchedYear = !year || String(item.dataset.year) === year;
        item.classList.toggle('is-filter-hidden', !(matchedKeyword && matchedYear));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (select) {
      select.addEventListener('change', applyFilter);
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });
  });

  const globalForm = document.querySelector('.global-search');
  const globalInput = document.getElementById('globalSearchInput');
  const panel = document.getElementById('searchPanel');
  const results = document.getElementById('searchResults');
  const closePanel = document.getElementById('closeSearchPanel');
  let searchIndex = [];

  function openPanel() {
    if (panel) {
      panel.hidden = false;
    }
  }

  function closePanelFn() {
    if (panel) {
      panel.hidden = true;
    }
  }

  function renderResults(keyword) {
    if (!results) {
      return;
    }
    const kw = normalize(keyword);
    if (!kw) {
      results.innerHTML = '<p>请输入影片标题、地区、年份或类型关键词。</p>';
      return;
    }
    const matched = searchIndex.filter(function (item) {
      return normalize(item.title + ' ' + item.year + ' ' + item.region + ' ' + item.type + ' ' + item.genre + ' ' + item.tags).includes(kw);
    }).slice(0, 24);

    if (!matched.length) {
      results.innerHTML = '<p>没有找到匹配影片，可以换一个关键词。</p>';
      return;
    }

    results.innerHTML = matched.map(function (item) {
      return [
        '<a class="search-item" href="./' + item.url + '">',
        '<img src="./' + item.cover + '" alt="' + item.title + '封面" loading="lazy" onerror="this.style.display=\'none\';">',
        '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></span>',
        '</a>'
      ].join('');
    }).join('');
  }

  if (globalForm && globalInput) {
    fetch('./assets/search-index.json')
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        searchIndex = Array.isArray(data) ? data : [];
      })
      .catch(function () {
        searchIndex = [];
      });

    globalForm.addEventListener('submit', function (event) {
      event.preventDefault();
      openPanel();
      renderResults(globalInput.value);
    });

    globalInput.addEventListener('input', function () {
      if (globalInput.value.trim().length >= 2) {
        openPanel();
        renderResults(globalInput.value);
      }
    });
  }

  if (closePanel) {
    closePanel.addEventListener('click', closePanelFn);
  }

  document.querySelectorAll('.js-play').forEach(function (button) {
    button.addEventListener('click', function () {
      const wrapper = button.closest('.player-card');
      const video = wrapper ? wrapper.querySelector('.js-video') : document.querySelector('.js-video');
      const status = wrapper ? wrapper.querySelector('.js-player-status') : document.querySelector('.js-player-status');
      const source = button.dataset.src;

      if (!video || !source) {
        if (status) {
          status.textContent = '未找到可用播放源';
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        const hls = new window.Hls({ enableWorker: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
        hls.on(window.Hls.Events.ERROR, function () {
          if (status) {
            status.textContent = '播放源加载异常，请稍后重试';
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
      } else {
        video.src = source;
        video.play().catch(function () {});
      }

      button.classList.add('is-hidden');
      if (status) {
        status.textContent = '正在加载播放源';
      }
    });
  });
})();
