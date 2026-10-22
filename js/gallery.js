/* =====================================================================
   GALLERY PAGES (photos.html + videos.html)  |  gallery.js
   Reads the lists in js/gallery-data.js and builds the grid.
   You never need to edit this file to add photos or videos.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- theme toggle (same as the main page) ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById("themeToggle");
  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
      themeBtn.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
    }
    try { localStorage.setItem("theme", theme); } catch (e) { /* ignore */ }
  }
  setTheme(root.getAttribute("data-theme") || "dark");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    setTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
  });

  /* ---------- small helper: make an element ---------- */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  var grid = document.getElementById("mediaGrid");
  var countLine = document.getElementById("countLine");
  var page = document.body.getAttribute("data-page");
  var lastFocus = null;

  function emptyState(icon, message) {
    var box = el("div", "empty-state");
    var i = el("i", "fa-solid " + icon);
    box.appendChild(i);
    box.appendChild(el("p", "", message));
    grid.appendChild(box);
  }

  /* =================== PHOTOS =================== */
  function buildPhotos() {
    var list = (typeof PHOTOS !== "undefined") ? PHOTOS : [];
    if (!list.length) { emptyState("fa-images", "Photos are coming soon."); return; }
    countLine.textContent = list.length + (list.length === 1 ? " photo" : " photos");

    // lightbox (full-screen viewer)
    var box = el("div", "lightbox");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Photo viewer");
    var bigImg = el("img", "lightbox__img");
    var cap = el("p", "lightbox__caption");
    var btnClose = el("button", "lightbox__btn lightbox__close");
    btnClose.type = "button"; btnClose.setAttribute("aria-label", "Close");
    btnClose.appendChild(el("i", "fa-solid fa-xmark"));
    var btnPrev = el("button", "lightbox__btn lightbox__prev");
    btnPrev.type = "button"; btnPrev.setAttribute("aria-label", "Previous photo");
    btnPrev.appendChild(el("i", "fa-solid fa-chevron-left"));
    var btnNext = el("button", "lightbox__btn lightbox__next");
    btnNext.type = "button"; btnNext.setAttribute("aria-label", "Next photo");
    btnNext.appendChild(el("i", "fa-solid fa-chevron-right"));
    box.appendChild(bigImg); box.appendChild(cap);
    box.appendChild(btnClose); box.appendChild(btnPrev); box.appendChild(btnNext);
    document.body.appendChild(box);

    var index = 0;
    function show(i) {
      index = (i + list.length) % list.length;
      bigImg.src = list[index].src;
      bigImg.alt = list[index].title || "Welding photo";
      var text = (list[index].title || "") + (list[index].caption ? " - " + list[index].caption : "");
      cap.textContent = text;
    }
    function open(i) { lastFocus = document.activeElement; show(i); box.classList.add("is-open"); document.body.style.overflow = "hidden"; btnClose.focus(); }
    function close() { box.classList.remove("is-open"); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }

    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", function () { show(index - 1); });
    btnNext.addEventListener("click", function () { show(index + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });

    list.forEach(function (item, i) {
      var tile = el("button", "mtile");
      tile.type = "button";
      tile.setAttribute("aria-label", "Open photo: " + (item.title || "Welding photo"));
      var img = el("img");
      img.src = item.thumb || item.src;
      img.alt = item.title || "Welding photo";
      img.loading = "lazy";
      tile.appendChild(img);
      if (item.illustration) tile.appendChild(el("span", "mtile__badge", "Illustration"));
      var label = el("span", "mtile__label");
      label.appendChild(el("strong", "", item.title || ""));
      if (item.caption) label.appendChild(el("small", "", item.caption));
      tile.appendChild(label);
      tile.addEventListener("click", function () { open(i); });
      grid.appendChild(tile);
    });
  }

  /* =================== VIDEOS (YouTube unlisted) =================== */
  function buildVideos() {
    var list = (typeof VIDEOS !== "undefined") ? VIDEOS : [];
    if (!list.length) { emptyState("fa-circle-play", "Videos are coming soon."); return; }
    countLine.textContent = list.length + (list.length === 1 ? " video" : " videos");

    var modal = el("div", "lightbox vmodal");
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Video player");
    var frameWrap = el("div", "vmodal__frame");
    var cap = el("p", "lightbox__caption");
    var btnClose = el("button", "lightbox__btn lightbox__close");
    btnClose.type = "button"; btnClose.setAttribute("aria-label", "Close");
    btnClose.appendChild(el("i", "fa-solid fa-xmark"));
    modal.appendChild(frameWrap); modal.appendChild(cap); modal.appendChild(btnClose);
    document.body.appendChild(modal);

    function open(item) {
      lastFocus = document.activeElement;
      frameWrap.textContent = "";
      var frame = document.createElement("iframe");
      frame.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(item.id) + "?autoplay=1&rel=0";
      frame.title = item.title || "Welding video";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
      frame.setAttribute("allowfullscreen", "");
      frameWrap.appendChild(frame);
      cap.textContent = (item.title || "") + (item.caption ? " - " + item.caption : "");
      modal.classList.add("is-open");
      document.body.style.overflow = "hidden";
      btnClose.focus();
    }
    function close() {
      modal.classList.remove("is-open");
      frameWrap.textContent = "";            // removing the iframe stops the video
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }
    btnClose.addEventListener("click", close);
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && modal.classList.contains("is-open")) close(); });

    list.forEach(function (item) {
      var tile = el("button", "mtile mtile--video");
      tile.type = "button";
      tile.setAttribute("aria-label", "Play video: " + (item.title || "Welding video"));
      var img = el("img");
      img.src = item.thumb || ("https://i.ytimg.com/vi/" + item.id + "/hqdefault.jpg");
      img.alt = item.title || "Welding video";
      img.loading = "lazy";
      tile.appendChild(img);
      var play = el("span", "mtile__play");
      play.appendChild(el("i", "fa-solid fa-play"));
      tile.appendChild(play);
      var label = el("span", "mtile__label");
      label.appendChild(el("strong", "", item.title || ""));
      if (item.caption) label.appendChild(el("small", "", item.caption));
      tile.appendChild(label);
      tile.addEventListener("click", function () { open(item); });
      grid.appendChild(tile);
    });
  }

  if (page === "videos") buildVideos(); else buildPhotos();
})();
