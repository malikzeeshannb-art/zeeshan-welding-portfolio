/* =====================================================================
   ZEESHAN HAFEEZ - WELDING PORTFOLIO  |  script.js
   Simple, one job per block. Each block is independent.
   ===================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. THEME TOGGLE (dark default <-> light) ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById("themeToggle");

  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
      themeBtn.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
    }
    try { localStorage.setItem("theme", theme); } catch (e) { /* storage blocked: ignore */ }
  }
  setTheme(root.getAttribute("data-theme") || "dark");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light");
    });
  }

  /* ---------- 2. CV DROPDOWN (View / Download) ---------- */
  var cvMenu = document.getElementById("cvMenu");
  var cvBtn = document.getElementById("cvBtn");
  function closeCv() {
    if (!cvMenu) return;
    cvMenu.classList.remove("is-open");
    cvBtn.setAttribute("aria-expanded", "false");
  }
  if (cvMenu && cvBtn) {
    cvBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = cvMenu.classList.toggle("is-open");
      cvBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", function (e) { if (!cvMenu.contains(e.target)) closeCv(); });
  }

  /* ---------- 3. MOBILE DRAWER (hamburger) ---------- */
  var sidebar = document.getElementById("sidebar");
  var backdrop = document.getElementById("backdrop");
  var menuBtn = document.getElementById("menuBtn");
  var closeBtn = document.getElementById("sidebarClose");

  function openDrawer() {
    sidebar.classList.add("is-open");
    backdrop.classList.add("is-open");
    menuBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    sidebar.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  if (menuBtn) menuBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeDrawer(); closeCv(); }
  });

  /* ---------- 4. SMOOTH SCROLL (slow start -> fast middle -> slow end) ---------- */
  function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function scrollToY(targetY) {
    if (reduceMotion) { window.scrollTo(0, targetY); return; }
    var startY = window.pageYOffset;
    var distance = targetY - startY;
    var duration = Math.min(1400, Math.max(600, Math.abs(distance) * 0.45)); // longer trip = longer time
    var startTime = null;
    function step(now) {
      if (startTime === null) startTime = now;
      var t = Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(t));
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeDrawer();
      var header = document.querySelector(".site-header");
      var offset = header ? header.offsetHeight : 0;
      scrollToY(target.getBoundingClientRect().top + window.pageYOffset - offset);
      history.replaceState(null, "", id);
    });
  });

  /* ---------- 5. ACTIVE LINK WHILE SCROLLING ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav-link[href^='#']");
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (l) {
          l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 6. SCROLL REVEAL (items glide in from left / right / below) ---------- */
  var revealItems = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var reveal = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealItems.forEach(function (el) { reveal.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- 7. TYPEWRITER HEADLINE ----------
     The phrases are NOT written here. They come from the active language
     file (lang/<code>.js, key "hero.typed" = an array of phrases) through
     I18N.t(). When the language changes, i18n.js fires "i18n:change" and
     the typing restarts with the new language. To edit the phrases, edit
     "hero.typed" in all 12 lang files. */
  var typedEl = document.getElementById("typedText");
  if (typedEl) {
    var fallbackText = typedEl.textContent;   // the text already in the HTML (used only if the dictionary fails)
    var runId = 0, timer = null;

    function getPhrases() {
      var list = window.I18N ? window.I18N.t("hero.typed") : null;
      return (Array.isArray(list) && list.length) ? list : [fallbackText];
    }

    // split a phrase into letters (not code units) so Hindi / Urdu / Arabic marks are never cut in half
    function toLetters(str) {
      try {
        if (window.Intl && Intl.Segmenter) {
          return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(str), function (s) { return s.segment; });
        }
      } catch (e) { /* use the simple split below */ }
      return Array.from(str);
    }

    function startTyping() {
      var myRun = ++runId;                    // a newer start cancels the older one
      clearTimeout(timer);
      var phrases = getPhrases().map(toLetters);
      var p = 0, c = 0, deleting = false;

      if (reduceMotion) {
        // no typing: just swap the phrase every 2.8 seconds
        typedEl.textContent = phrases[0].join("");
        (function swap() {
          timer = setTimeout(function () {
            if (myRun !== runId) return;
            p = (p + 1) % phrases.length;
            typedEl.textContent = phrases[p].join("");
            swap();
          }, 2800);
        })();
        return;
      }

      (function tick() {
        if (myRun !== runId) return;
        var word = phrases[p];
        var delay;
        if (!deleting) {
          c++;
          delay = 75;
          if (c >= word.length) { c = word.length; deleting = true; delay = 1500; }   // pause when phrase is complete
        } else {
          c--;
          delay = 38;
          if (c <= 0) { c = 0; deleting = false; p = (p + 1) % phrases.length; delay = 380; }
        }
        typedEl.textContent = word.slice(0, c).join("");
        timer = setTimeout(tick, delay);
      })();
    }

    startTyping();                                         // first run: language already chosen by i18n.js
    document.addEventListener("i18n:change", startTyping); // every later language switch
  }
})();

/* ---------- 8. COPY CERTIFICATE NUMBER + TOP TOAST ---------- */
(function () {
  "use strict";
  var badge = document.getElementById("certIdNumber");
  var toast = document.getElementById("copyToast");
  if (!badge || !toast) return;

  var timer;
  var SHOW_MS = 3000;                      // how long the popup stays visible

  function showToast() {
    clearTimeout(timer);
    toast.classList.add("show");
    timer = setTimeout(function () { toast.classList.remove("show"); }, SHOW_MS);
  }

  // old-browser / non-https fallback
  function fallbackCopy(text) {
    var box = document.createElement("textarea");
    box.value = text;
    box.setAttribute("readonly", "");
    box.style.position = "fixed";
    box.style.opacity = "0";
    document.body.appendChild(box);
    box.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(box);
    return ok;
  }

  badge.addEventListener("click", function () {
    var text = badge.textContent.trim();
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(showToast, function () {
        if (fallbackCopy(text)) showToast();
      });
    } else if (fallbackCopy(text)) {
      showToast();
    }
  });
})();

/* ---------- 9. GALLERY CARD PREVIEWS (first photo / first video of the lists) ---------- */
(function () {
  "use strict";
  var photoBox = document.getElementById("photosPreview");
  var videoBox = document.getElementById("videosPreview");

  if (photoBox && typeof PHOTOS !== "undefined" && PHOTOS.length) {
    var p = PHOTOS[0];
    var img = new Image();
    img.src = p.thumb || p.src;
    img.alt = p.title || "Welding photo";
    img.loading = "lazy";
    img.onload = function () { photoBox.classList.add("has-image"); };
    photoBox.appendChild(img);
  }

  if (videoBox && typeof VIDEOS !== "undefined" && VIDEOS.length) {
    var v = VIDEOS[0];
    var thumb = new Image();
    thumb.src = v.thumb || ("https://i.ytimg.com/vi/" + v.id + "/hqdefault.jpg");
    thumb.alt = v.title || "Welding video";
    thumb.loading = "lazy";
    thumb.onload = function () { videoBox.classList.add("has-image"); };
    videoBox.insertBefore(thumb, videoBox.firstChild);
  }
})();

/* ---------- 10. CONTACT POPUP (WhatsApp / Local call) ---------- */
(function () {
  "use strict";
  var modal = document.getElementById("contactModal");
  if (!modal) return;
  var openers = document.querySelectorAll("[data-contact-open]");
  var closers = modal.querySelectorAll("[data-contact-close]");
  var lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () { modal.classList.add("is-open"); });
    var first = modal.querySelector("a, button");
    if (first) first.focus();
  }
  function closeModal() {
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(function () { modal.hidden = true; }, 350);
    if (lastFocus) lastFocus.focus();
  }

  openers.forEach(function (b) { b.addEventListener("click", openModal); });
  closers.forEach(function (b) { b.addEventListener("click", closeModal); });
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });
})();

/* ---------- 11. UI SOUND EFFECTS ----------
   One click listener for the whole page (it also catches buttons that are
   created later, like the photo lightbox). Sound files live in assets/sounds/.
   NOTE: the same sound engine is at the end of js/gallery.js (photos.html +
   videos.html). Only the RULES list below is different on each page.

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
    click2:  [BASE + "click-sound-2.mp3"],
    click3:  [BASE + "click-3.mp3"],
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
    { sound: "back",    sel: ".modal__close, .sidebar__close, [data-contact-close]" },     // every close (X) button
    { sound: "click",   sel: "#langList, #cvList, .modal__actions, .contact-grid, .footer__social .social, .fab-whatsapp" },                       // choices inside menus and popups
    { sound: "launch",  sel: ".gcard" },
    { sound: "open",    sel: ".lang-menu, .theme-toggle, .menu-btn" },
    { sound: "opening", sel: ".btn--primary" },
    { sound: "click2",  sel: ".top-nav .nav-link" },                                       // header menu only
    { sound: "click",   sel: ".sidebar .nav-link, .hero__social, .chip, .text-link, .contact-link" }
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

/* ---------- 12. HERO BACKGROUND VIDEO (768px and up) ----------
   The <video class="hero__video"> is in index.html and styled in css/style.css.
   Here: it loads and plays only on wide screens (and not for people who asked their
   device for less motion), so phones never download the file. It pauses when the window
   gets narrow, and the class "has-video" is set while it is really playing, so the CSS
   hides the still picture only then. The file path is in index.html (data-src). */
(function () {
  "use strict";
  var video = document.querySelector(".hero__video");
  if (!video) return;
  var box = video.closest(".hero__media");
  var wide = window.matchMedia("(min-width: 768px)");
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)");

  function allowed() { return wide.matches && !calm.matches; }

  function sync() {
    if (allowed()) {
      if (!video.getAttribute("src") && video.getAttribute("data-src")) video.src = video.getAttribute("data-src");   // first time only
      var p = video.play();
      if (p && p.catch) p.catch(function () { /* blocked by the browser: the picture stays */ });
    } else {
      video.pause();
      if (box) box.classList.remove("has-video");
    }
  }

  video.addEventListener("playing", function () { if (box && allowed()) box.classList.add("has-video"); });
  [wide, calm].forEach(function (mq) {
    if (mq.addEventListener) mq.addEventListener("change", sync); else mq.addListener(sync);
  });
  sync();
})();
