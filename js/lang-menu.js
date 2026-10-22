/* =====================================================================
   LANGUAGE DROPDOWN  |  js/lang-menu.js
   Builds the list from I18N.langs (js/i18n.js), opens/closes it, and
   keeps the button (flag + code) in sync with the chosen language.
   Clicking an item is handled by i18n.js through  data-set-lang="xx".
   Keyboard: Enter/Space/ArrowDown opens, arrows move, Home/End jump,
   Esc closes and returns focus to the button.
   ===================================================================== */
(function () {
  "use strict";
  var menu = document.getElementById("langMenu");
  if (!menu || !window.I18N) return;
  var btn = document.getElementById("langBtn");
  var list = document.getElementById("langList");
  var flag = document.getElementById("langFlag");
  var code = document.getElementById("langCode");
  var items = [];

  /* ---- build the 12 items (names are written in their own language) ---- */
  window.I18N.langs.forEach(function (l) {
    var li = document.createElement("li");
    var b = document.createElement("button");
    b.type = "button";
    b.className = "lang-menu__item";
    b.setAttribute("data-set-lang", l.code);
    var f = document.createElement("span");
    f.className = "fi fi-" + l.flag + " lang-flag";
    f.setAttribute("aria-hidden", "true");
    var n = document.createElement("span");
    n.className = "lang-menu__name";
    n.textContent = l.name;
    n.setAttribute("lang", l.code);                     // right font + shaping; the row itself follows the page direction
    var c = document.createElement("i");
    c.className = "fa-solid fa-check lang-menu__check";
    c.setAttribute("aria-hidden", "true");
    b.appendChild(f); b.appendChild(n); b.appendChild(c);
    li.appendChild(b); list.appendChild(li);
    items.push(b);
  });

  /* ---- button shows the current language ---- */
  function refresh() {
    var cur = window.I18N.info(document.documentElement.getAttribute("lang")) || window.I18N.info("en");
    flag.className = "fi fi-" + cur.flag + " lang-flag";
    code.textContent = cur.code.toUpperCase();
    items.forEach(function (b) {
      var on = b.getAttribute("data-set-lang") === cur.code;
      if (on) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });
  }

  /* ---- open / close ---- */
  function isOpen() { return menu.classList.contains("is-open"); }
  function open(focusItem) {
    menu.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    if (focusItem) {
      void list.offsetWidth;                            // apply "visible" now: a hidden list cannot take focus
      var cur = list.querySelector("[aria-current]") || items[0];
      cur.focus();
      if (cur.scrollIntoView) cur.scrollIntoView({ block: "nearest" });
    }
  }
  function close(returnFocus) {
    menu.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    if (returnFocus) btn.focus();
  }

  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (isOpen()) close(); else open(false);
  });
  btn.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); e.stopPropagation(); open(true); }
  });
  list.addEventListener("click", function () { close(true); });   // pick = switch (i18n.js) + close
  document.addEventListener("click", function (e) { if (!menu.contains(e.target)) close(); });
  menu.addEventListener("keydown", function (e) {
    if (!isOpen()) return;
    var i = items.indexOf(document.activeElement);
    if (e.key === "Escape") { e.preventDefault(); close(true); }
    else if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    else if (e.key === "Home") { e.preventDefault(); items[0].focus(); }
    else if (e.key === "End") { e.preventDefault(); items[items.length - 1].focus(); }
    else if (e.key === "Tab") { close(); }
  });

  document.addEventListener("i18n:change", refresh);
  refresh();
})();
