/* =====================================================================
   i18n ENGINE  |  js/i18n.js
   ---------------------------------------------------------------------
   HOW IT WORKS
   - Page text stays in the HTML in English (good for Google + no blank
     flash). Elements carry a key:
        data-i18n="key"            -> replaces the text
        data-i18n-html="key"       -> replaces the HTML (gold spans, <br>, links)
        data-i18n-attr="aria-label:key;title:key2"  -> replaces attributes
   - Texts live in lang/<code>.js. English (lang/en.js) is always loaded
     and is the fallback for any missing key. Other languages are loaded
     only when chosen.
   - The choice is saved in localStorage ("lang"). A link can force a
     language with  ?lang=de  (not saved until the visitor picks one).
   - Language buttons: any element with  data-set-lang="de"  works, or call
     I18N.setLang("de").   Event "i18n:change" fires after every switch.
   ===================================================================== */
(function () {
  "use strict";

  /* code, native name, text direction, flag (country code for the flag icons) */
  var LANGS = [
    { code: "en", name: "English",    dir: "ltr", flag: "gb" },
    { code: "ar", name: "العربية",     dir: "rtl", flag: "sa" },
    { code: "ur", name: "اردو",        dir: "rtl", flag: "pk" },
    { code: "pl", name: "Polski",     dir: "ltr", flag: "pl" },
    { code: "no", name: "Norsk",      dir: "ltr", flag: "no" },
    { code: "ro", name: "Română",     dir: "ltr", flag: "ro" },
    { code: "de", name: "Deutsch",    dir: "ltr", flag: "de" },
    { code: "it", name: "Italiano",   dir: "ltr", flag: "it" },
    { code: "hi", name: "हिन्दी",       dir: "ltr", flag: "in" },
    { code: "fr", name: "Français",   dir: "ltr", flag: "fr" },
    { code: "es", name: "Español",    dir: "ltr", flag: "es" },
    { code: "ru", name: "Русский",    dir: "ltr", flag: "ru" }
  ];
  var DEFAULT = "en", STORE_KEY = "lang";

  /* Fonts for scripts the main fonts do not have. Loaded ONLY when that
     language is chosen (English visitors never download them).
     Arabic/Urdu: Noto Sans Arabic + a calligraphic font for the slogan.
     Hindi: Noto Sans Devanagari + Kalam (handwriting) for the slogan.   */
  var FONTS = {
    ar: "family=Noto+Sans+Arabic:wght@400;500;600;700&family=Aref+Ruqaa:wght@700",
    ur: "family=Noto+Sans+Arabic:wght@400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;700",
    hi: "family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Kalam:wght@700"
  };
  function loadFont(code) {
    if (!FONTS[code] || document.getElementById("i18n-font-" + code)) return;
    var link = document.createElement("link");
    link.id = "i18n-font-" + code;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?" + FONTS[code] + "&display=swap";
    document.head.appendChild(link);
  }
  var root = document.documentElement;
  var DICT = (window.I18N_DICT = window.I18N_DICT || {});
  var current = DEFAULT, token = 0;

  // folder of this script -> lang files live in ../lang/
  var here = document.currentScript && document.currentScript.src;
  function langUrl(code) {
    return here ? new URL("../lang/" + code + ".js", here).href : "lang/" + code + ".js";
  }

  function info(code) {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return LANGS[i];
    return null;
  }

  /* ---------- text lookup ---------- */
  function fill(str, vars) {
    if (typeof str !== "string" || !vars) return str;
    return str.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
  }
  function t(key, vars) {
    var d = DICT[current], v = d && d[key];
    if (v == null) v = DICT[DEFAULT] && DICT[DEFAULT][key];
    if (v == null) return key;                      // visible hint: key is missing everywhere
    return fill(v, vars);
  }
  // plural: tn("gal.count.photos", 3, {n:3}) -> uses key.one / key.few / key.many / key.other ...
  function tn(key, n, vars) {
    var rule = "other";
    try { rule = new Intl.PluralRules(current).select(n); } catch (e) {}
    vars = vars || {}; if (vars.n == null) vars.n = n;
    var d = DICT[current] || {};
    var k = (d[key + "." + rule] != null) ? key + "." + rule
          : (d[key + ".other"] != null) ? key + ".other"
          : (DICT[DEFAULT][key + "." + rule] != null) ? key + "." + rule : key + ".other";
    return t(k, vars);
  }

  /* ---------- apply to the page ---------- */
  function apply(scope) {
    scope = scope || document;
    var i, n, list;
    list = scope.querySelectorAll("[data-i18n]");
    for (i = 0; i < list.length; i++) list[i].textContent = t(list[i].getAttribute("data-i18n"));
    list = scope.querySelectorAll("[data-i18n-html]");
    for (i = 0; i < list.length; i++) list[i].innerHTML = t(list[i].getAttribute("data-i18n-html"));
    list = scope.querySelectorAll("[data-i18n-attr]");
    for (i = 0; i < list.length; i++) {
      var pairs = list[i].getAttribute("data-i18n-attr").split(";");
      for (n = 0; n < pairs.length; n++) {
        var cut = pairs[n].indexOf(":");
        if (cut > 0) list[i].setAttribute(pairs[n].slice(0, cut), t(pairs[n].slice(cut + 1)));
      }
    }
  }

  /* ---------- load a dictionary file ---------- */
  function load(code, done) {
    if (DICT[code]) return done(true);
    var s = document.createElement("script");
    s.src = langUrl(code);
    s.onload = function () { done(!!DICT[code]); };
    s.onerror = function () { s.remove(); done(false); };
    document.head.appendChild(s);
  }

  function setAttrs(code) {
    var l = info(code);
    root.setAttribute("lang", code);
    root.setAttribute("dir", l.dir);
    root.setAttribute("data-lang", code);
    loadFont(code);
  }

  /* ---------- switch language ---------- */
  // opts.save (default true): remember the choice.  opts.initial: first run.
  function setLang(code, opts) {
    opts = opts || {};
    var l = info(code);
    if (!l) return false;
    var mine = ++token;
    load(code, function (ok) {
      if (mine !== token) return;                       // a newer click won
      if (!ok) {
        // file missing/blocked: stay (or go back) to English, do NOT save
        console.warn("[i18n] lang/" + code + ".js not found - showing English.");
        if (current !== DEFAULT || root.getAttribute("lang") !== DEFAULT) { current = DEFAULT; setAttrs(DEFAULT); apply(); fire(); }
        return;
      }
      var changed = current !== code;
      current = code;
      setAttrs(code);
      if (changed || !opts.initial) apply();            // initial English: HTML already English
      if (opts.save !== false) {
        try { localStorage.setItem(STORE_KEY, code); } catch (e) { /* storage blocked */ }
        dropUrlParam();
      }
      if (changed || !opts.initial) fire();
    });
    return true;
  }
  function fire() {
    document.dispatchEvent(new CustomEvent("i18n:change", { detail: { lang: current, dir: info(current).dir } }));
  }
  function dropUrlParam() {
    try {
      var u = new URL(location.href);
      if (u.searchParams.has("lang")) { u.searchParams.delete("lang"); history.replaceState(null, "", u.pathname + u.search + u.hash); }
    } catch (e) {}
  }

  /* ---------- first language: ?lang= > saved > English ---------- */
  function startLang() {
    var q = null, saved = null;
    try { q = new URL(location.href).searchParams.get("lang"); } catch (e) {}
    try { saved = localStorage.getItem(STORE_KEY); } catch (e) {}
    if (q && info(q)) return { code: q, save: false };
    if (saved && info(saved)) return { code: saved, save: false };
    return { code: DEFAULT, save: false };
  }

  /* ---------- buttons: <button data-set-lang="de"> ---------- */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-set-lang]");
    if (b) { e.preventDefault(); setLang(b.getAttribute("data-set-lang")); }
  });

  window.I18N = {
    t: t, tn: tn, apply: apply, setLang: setLang,
    langs: LANGS, info: info,
    getLang: function () { return current; },
    isRTL: function () { return info(current).dir === "rtl"; }
  };

  var s = startLang();
  setLang(s.code, { save: s.save, initial: true });
})();
