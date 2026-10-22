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

  /* ---------- 7. TYPEWRITER HEADLINE ---------- */
  var typedEl = document.getElementById("typedText");
  if (typedEl) {
    var phrases = ["I'm a pipe welder", "I'm a SMAW welder", "I'm ASME Sec IX certified", "I'm ARC welder"];
    var p = 0, c = 0, deleting = false;

    if (reduceMotion) {
      // no typing: just swap the phrase every 2.8 seconds
      typedEl.textContent = phrases[0];
      setInterval(function () { p = (p + 1) % phrases.length; typedEl.textContent = phrases[p]; }, 2800);
    } else {
      (function tick() {
        var word = phrases[p];
        var delay;
        if (!deleting) {
          c++;
          delay = 75;
          if (c === word.length) { deleting = true; delay = 1500; }   // pause when phrase is complete
        } else {
          c--;
          delay = 38;
          if (c === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 380; }
        }
        typedEl.textContent = word.slice(0, c);
        setTimeout(tick, delay);
      })();
    }
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
