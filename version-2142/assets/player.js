document.addEventListener("DOMContentLoaded", function () {
  var shell = document.querySelector("[data-player]");

  if (!shell) {
    return;
  }

  var video = shell.querySelector("video");
  var cover = shell.querySelector("[data-player-cover]");
  var button = shell.querySelector("[data-player-button]");
  var stream = shell.getAttribute("data-stream");
  var initialized = false;
  var hls = null;

  function prepareVideo() {
    if (!video || !stream || initialized) {
      return;
    }

    initialized = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      return;
    }

    video.src = stream;
  }

  function hideCover() {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  }

  function playVideo() {
    prepareVideo();

    if (!video) {
      return;
    }

    var result = video.play();
    hideCover();

    if (result && typeof result.catch === "function") {
      result.catch(function () {
        hideCover();
      });
    }
  }

  if (cover) {
    cover.addEventListener("click", playVideo);
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      playVideo();
    });
  }

  if (video) {
    video.addEventListener("play", hideCover);
  }

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
    }
  });
});
