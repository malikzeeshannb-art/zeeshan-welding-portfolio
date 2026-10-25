/* =====================================================================
   GALLERY PAGES (photos.html + videos.html)  |  gallery.js
   Reads the lists in js/gallery-data.js and builds the grid.
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

    /* --- the video frame follows each video's own shape (no fixed 16:9 box) --- */
    var DEFAULT_RATIO = 16 / 9, known = {}, pending = {}, activeId = null;

    function parseRatio(v) {                 // 1.777  |  "16/9"  |  "9:16"  |  "4x3"
      if (typeof v === "number") return v > 0 ? v : 0;
      var m = /^\s*(\d+(?:\.\d+)?)\s*[:\/x]\s*(\d+(?:\.\d+)?)\s*$/i.exec(v || "");
      return m && +m[2] > 0 ? +m[1] / +m[2] : 0;
    }
    function setRatio(r) { frameWrap.style.setProperty("--vratio", String(Math.min(3, Math.max(0.3, r)))); }
    function ratioNow(item) { return parseRatio(item.ratio) || known[item.id] || DEFAULT_RATIO; }

    // asks YouTube (oEmbed) for the video's real width and height. Any problem -> normal 16:9.
    // Optional manual override in gallery-data.js:  { id: "...", ratio: "9/16", ... }
    function ratioFor(item) {
      var manual = parseRatio(item.ratio);
      if (manual) return Promise.resolve(manual);
      if (known[item.id]) return Promise.resolve(known[item.id]);
      if (pending[item.id]) return pending[item.id];
      if (!window.fetch) return Promise.resolve(DEFAULT_RATIO);
      pending[item.id] = new Promise(function (resolve) {
        var ctl = window.AbortController ? new AbortController() : null;
        var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 5000);
        var url = "https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + item.id);
        fetch(url, { signal: ctl ? ctl.signal : undefined, credentials: "omit" })
          .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
          .then(function (d) {
            if (!(d.width > 0 && d.height > 0)) return Promise.reject();
            known[item.id] = d.width / d.height;
            resolve(known[item.id]);
          })
          .catch(function () { resolve(DEFAULT_RATIO); })
          .then(function () { clearTimeout(timer); delete pending[item.id]; });
      });
      return pending[item.id];
    }
    list.forEach(function (item) { ratioFor(item); });      // look every shape up now, so it is ready when a video is opened

    function open(item) {
      lastFocus = document.activeElement;
      activeId = item.id;
      setRatio(ratioNow(item));
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
      ratioFor(item).then(function (r) { if (activeId === item.id) setRatio(r); });   // the lookup finished late: fix the shape
    }
    function close() {
      activeId = null;
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

/* ---------- 11. UI SOUND EFFECTS ----------
   One click listener for the whole page (it also catches buttons that are
   created later, like the photo lightbox). Sound files live in assets/sounds/.
   NOTE: this same block is at the end of js/script.js (index.html) and at the
   end of js/gallery.js (photos.html + videos.html). Keep both copies identical.

   - Only ONE sound plays at a time: a new click stops the previous sound, and
     clicking the same thing quickly just restarts its sound (no stacking).
   - If a sound file is missing or the browser blocks audio, nothing happens
     (no errors, the page works as normal).
   - A link that opens another page in the SAME tab (.gcard, the Back button,
     "View my certificate") waits a moment so you can hear the sound before the
     next page loads. Set NAV_WAIT_MS to 0 to turn that wait off. */
(function () {
  "use strict";

  var BASE = "assets/sounds/";
  var VOLUME = 1;          // 0 = silent ... 1 = full volume
  var NAV_WAIT_MS = 350;   // longest wait before a same-tab link opens (0 = never wait)

  // the first path that exists is used; the others are only a fallback
  var FILES = {
    click:   [BASE + "click-specfic/click-sound.mp3", BASE + "click-sound.mp3"],
    launch:  [BASE + "page-launcher.mp3"],
    back:    [BASE + "back.mp3"],
    open:    [BASE + "open.mp3"],
    opening: [BASE + "opning.mp3"],
    copied:  [BASE + "coppied.mp3"]
  };

  // Which click plays which sound. The FIRST matching line wins, so one click = one sound.
  var onSubpage = !!document.body.getAttribute("data-page");     // photos.html / videos.html
  var RULES = onSubpage ? [
    { sound: "back", sel: ".lightbox__btn, .btn" },
    { sound: "open", sel: ".lang-menu, .theme-toggle" }
  ] : [
    { sound: "copied",  sel: "#certIdNumber" },
    { sound: "launch",  sel: ".gcard" },
    { sound: "open",    sel: ".lang-menu, .theme-toggle" },
    { sound: "opening", sel: ".btn--primary" },
    { sound: "click",   sel: ".sidebar .nav-link, .hero__social, .chip, .social, .text-link, .contact-link" }
  ];

  var sounds = {}, current = null, navigating = false;

  function create(name) {
    var s = { srcs: FILES[name], i: 0, dead: false, el: new Audio() };
    function load() {
      if (s.i >= s.srcs.length) { s.dead = true; return; }
      s.el.src = s.srcs[s.i];
    }
    s.el.preload = "auto";
    s.el.volume = VOLUME;
    s.el.addEventListener("error", function () { s.i++; load(); });   // missing file -> try the next path
    load();
    return s;
  }
  function get(name) { return sounds[name] || (sounds[name] = create(name)); }

  // start downloading the sounds on the first touch / key press (also unlocks audio on phones)
  var warmed = false;
  function warm() {
    if (warmed) return;
    warmed = true;
    RULES.forEach(function (r) { get(r.sound); });
  }
  ["pointerdown", "keydown", "touchstart"].forEach(function (ev) {
    document.addEventListener(ev, warm, { passive: true });
  });

  // resolves true if the sound started, false if it could not play
  function play(s) {
    if (current && current !== s) {                 // stop the previous sound: no overlapping
      try { current.el.pause(); current.el.currentTime = 0; } catch (e) { /* not loaded yet */ }
    }
    current = s;
    try { s.el.currentTime = 0; } catch (e) { /* not loaded yet */ }
    var p;
    try { p = s.el.play(); } catch (e) { return Promise.resolve(false); }
    return (p && p.then) ? p.then(function () { return true; }, function () { return false; }) : Promise.resolve(true);
  }

  // true when this click would load another page in the same tab
  function leavesPage(a, e) {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return false;
    if (a.hasAttribute("download")) return false;
    if (a.target && a.target !== "_self") return false;
    if ((a.getAttribute("href") || "").charAt(0) === "#") return false;     // scroll inside the page
    return /^(https?|file):$/.test(a.protocol);                              // mailto: / tel: stay on the page
  }

  function react(name, target, e) {
    var s = get(name);
    if (s.dead) return;
    var link = NAV_WAIT_MS > 0 ? target.closest("a[href]") : null;
    if (link && leavesPage(link, e)) {
      e.preventDefault();                           // let the sound start, then open the page
      navigating = true;
      var href = link.href, done = false;
      var go = function () { if (done) return; done = true; window.location.href = href; };
      play(s).then(function (ok) { if (!ok) go(); });
      s.el.addEventListener("ended", go, { once: true });
      setTimeout(go, NAV_WAIT_MS);
      return;
    }
    play(s);
  }

  // capture phase: still works for buttons that stop the click from bubbling (language menu, CV menu)
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (navigating || !t || !t.closest) return;
    for (var i = 0; i < RULES.length; i++) {
      if (t.closest(RULES[i].sel)) { react(RULES[i].sound, t, e); return; }
    }
  }, true);

  // coming back with the browser Back button: allow clicks again
  window.addEventListener("pageshow", function () { navigating = false; });
})();
