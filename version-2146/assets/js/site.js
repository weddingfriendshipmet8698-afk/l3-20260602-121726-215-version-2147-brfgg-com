(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
            return;
        }
        callback();
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-site-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var next = hero.querySelector("[data-hero-next]");
        var prev = hero.querySelector("[data-hero-prev]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
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
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupRows() {
        document.querySelectorAll(".horizontal-wrap").forEach(function (wrap) {
            var row = wrap.querySelector("[data-scroll-row]");
            var left = wrap.querySelector("[data-scroll-left]");
            var right = wrap.querySelector("[data-scroll-right]");
            if (!row) {
                return;
            }
            if (left) {
                left.addEventListener("click", function () {
                    row.scrollBy({ left: -420, behavior: "smooth" });
                });
            }
            if (right) {
                right.addEventListener("click", function () {
                    row.scrollBy({ left: 420, behavior: "smooth" });
                });
            }
        });
    }

    function getSearchParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var list = document.querySelector("[data-filter-list]");
        if (!panel || !list) {
            return;
        }
        var queryInput = panel.querySelector("[data-filter-query]");
        var categorySelect = panel.querySelector("[data-filter-category]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

        if (queryInput && getSearchParam("q")) {
            queryInput.value = getSearchParam("q");
        }

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function apply() {
            var query = normalize(queryInput ? queryInput.value : "");
            var category = categorySelect ? categorySelect.value : "";
            var year = yearSelect ? Number(yearSelect.value || 0) : 0;
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.textContent
                ].join(" "));
                var cardCategory = card.getAttribute("data-category") || "";
                var cardYear = Number(card.getAttribute("data-year") || 0);
                var matched = true;
                if (query && text.indexOf(query) === -1) {
                    matched = false;
                }
                if (category && category !== cardCategory) {
                    matched = false;
                }
                if (year && cardYear < year) {
                    matched = false;
                }
                card.classList.toggle("is-hidden", !matched);
            });
        }

        [queryInput, categorySelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    function setupPlayer() {
        var stage = document.querySelector("[data-player-stage]");
        if (!stage) {
            return;
        }
        var video = stage.querySelector("video");
        var button = stage.querySelector("[data-play-button]");
        var message = stage.querySelector("[data-player-message]");
        var url = stage.getAttribute("data-video-url") || "";
        var prepared = false;
        var hls = null;

        if (!video || !url) {
            return;
        }

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function play() {
            prepare();
            stage.classList.add("is-playing");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (message) {
                        message.textContent = "播放暂时不可用，请稍后再试。";
                    }
                    stage.classList.remove("is-playing");
                });
            }
        }

        if (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }

        video.addEventListener("play", function () {
            stage.classList.add("is-playing");
            if (message) {
                message.textContent = "";
            }
        });

        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                stage.classList.remove("is-playing");
            }
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupRows();
        setupFilters();
        setupPlayer();
    });
})();
