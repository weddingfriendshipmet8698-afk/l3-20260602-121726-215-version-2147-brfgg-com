(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupNavigation() {
        var button = document.querySelector(".mobile-toggle");
        if (!button) {
            return;
        }
        button.addEventListener("click", function () {
            var open = document.body.classList.toggle("nav-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
        document.querySelectorAll(".mobile-nav a").forEach(function (link) {
            link.addEventListener("click", function () {
                document.body.classList.remove("nav-open");
                button.setAttribute("aria-expanded", "false");
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector(".hero-carousel");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero='prev']");
        var next = hero.querySelector("[data-hero='next']");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                var active = slideIndex === index;
                slide.classList.toggle("is-active", active);
                slide.setAttribute("aria-hidden", active ? "false" : "true");
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var panel = document.querySelector(".filter-panel");
        if (!panel) {
            return;
        }
        var input = panel.querySelector(".movie-search");
        var selects = Array.prototype.slice.call(panel.querySelectorAll(".movie-filter"));
        var reset = panel.querySelector(".filter-reset");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-row"));
        var empty = document.querySelector(".empty-filter");

        function matchCard(card) {
            var q = input ? input.value.trim().toLowerCase() : "";
            var text = (card.getAttribute("data-title") || "").toLowerCase();
            var visible = !q || text.indexOf(q) !== -1;
            selects.forEach(function (select) {
                var value = select.value.trim().toLowerCase();
                var field = select.getAttribute("data-filter") || "";
                var cardValue = (card.getAttribute("data-" + field) || "").toLowerCase();
                if (value && cardValue.indexOf(value) === -1 && text.indexOf(value) === -1) {
                    visible = false;
                }
            });
            return visible;
        }

        function apply() {
            var count = 0;
            cards.forEach(function (card) {
                var visible = matchCard(card);
                card.classList.toggle("is-hidden", !visible);
                if (visible) {
                    count += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", count === 0);
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", apply);
        });
        if (reset) {
            reset.addEventListener("click", function () {
                if (input) {
                    input.value = "";
                }
                selects.forEach(function (select) {
                    select.value = "";
                });
                apply();
            });
        }
        apply();
    }

    function initPlayer(source) {
        var video = document.getElementById("moviePlayer");
        var button = document.getElementById("playerButton");
        if (!video || !source) {
            return;
        }
        var attached = false;
        var manifestReady = false;
        var pendingPlay = false;
        var hlsInstance = null;

        function attemptPlay() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    pendingPlay = false;
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.load();
                manifestReady = true;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    manifestReady = true;
                    if (pendingPlay) {
                        attemptPlay();
                    }
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
                video.load();
                manifestReady = true;
            }
        }

        function play() {
            attach();
            pendingPlay = true;
            if (button) {
                button.classList.add("is-hidden");
            }
            if (manifestReady) {
                attemptPlay();
            }
        }

        attach();
        if (button) {
            button.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            pendingPlay = false;
            if (button) {
                button.classList.add("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            if (button) {
                button.classList.remove("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        setupNavigation();
        setupHero();
        setupFilters();
    });

    window.SitePlayer = {
        init: initPlayer
    };
})();
