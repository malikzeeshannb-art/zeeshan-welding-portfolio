# Zeeshan Hafeez — Multilingual Pipe Welder Portfolio (6G SMAW | ASME IX)

[![Live Site](https://img.shields.io/badge/Live%20Site-GitHub%20Pages-D4A017?style=for-the-badge&logo=github&logoColor=white)](https://malikzeeshannb-art.github.io/zeeshan-welding-portfolio/)
![Languages](https://img.shields.io/badge/Languages-12-blue?style=for-the-badge)
![Stack](https://img.shields.io/badge/HTML%20%7C%20CSS%20%7C%20Vanilla%20JS-no%20frameworks-lightgrey?style=for-the-badge)

**Live site:** https://malikzeeshannb-art.github.io/zeeshan-welding-portfolio/

A personal portfolio website that presents my welding credentials, pipeline site experience and technical skills to recruiters and employers in their own language. I designed and built it myself, step by step, with plain HTML, CSS and JavaScript.

---

## Project Overview

I am a certified **6G SMAW open-root pipe welder** (ASME Section IX) with 5+ years of arc welding experience in Pakistan and Saudi Arabia. This portfolio exists to show that work clearly to international recruiters and clients:

- My **6G SMAW welder performance qualification** (ASME Section IX), with a link to verify it online
- My **pipeline and site experience**, including welding and installation work on a 300+ meter pipeline section
- My **skills, photos and videos** of real welding work
- Easy ways to **contact me** straight away

Because employers come from many countries, the whole site is available in **12 languages**, including right-to-left layouts for Arabic and Urdu.

---

## Key Features

### Custom i18n engine (12 languages)
- Languages: **English, Arabic, Urdu, German, French, Spanish, Italian, Polish, Norwegian, Romanian, Russian, Hindi** (`EN AR UR DE FR ES IT PL NO RO RU HI`)
- One small custom engine (`js/i18n.js`) drives everything. Page text carries `data-i18n`, `data-i18n-html` and `data-i18n-attr` keys, and each language has its own dictionary file in `lang/`.
- English is the always-loaded fallback. Other dictionaries load only when chosen, so the page stays light.
- The visitor's choice is saved in `localStorage`, and a link can force a language with `?lang=de`.
- **Full RTL support** for Arabic and Urdu (page direction is applied before first paint, so there is no layout jump).
- **Font switching** per script: Noto Sans Arabic, Noto Nastaliq Urdu and Noto Sans Devanagari are downloaded only when needed.
- **Dynamic typewriter headline:** the hero phrases come from the active language dictionary and restart automatically on every language switch.
- Language switcher in the navbar with flag icons.

### Design and UX
- **Light / dark theme toggle** with the choice remembered in `localStorage` and applied before first paint (no flash)
- **Responsive layout** with a mobile drawer menu and a permanent sidebar on large screens
- **Media gallery:** photo lightbox viewer and a YouTube video player modal, with preview cards on the home page
- **Floating contact actions:** WhatsApp button, direct call, email and a contact pop-up
- Click-to-copy certificate ID with a toast notification
- Scroll-reveal animations, active-section highlighting and smooth scrolling (all respect `prefers-reduced-motion`)
- CV dropdown with *View* and *Download* options

### SEO and optimization
- **Schema.org JSON-LD** structured data: `Person`, `Occupation` and `EducationalOccupationalCredential`
- Canonical URL, **Open Graph** and Twitter card meta tags
- `sitemap.xml` and `robots.txt`
- Optimized images with `srcset`, WebP/JPG variants and lazy loading
- Semantic HTML with accessibility in mind (skip link, ARIA labels, translated `aria-label`s)

---

## Tech Stack and Architecture

| Layer | Details |
|---|---|
| **HTML5** | Semantic, accessibility-first markup |
| **CSS3** | Flexbox, CSS Grid, CSS Variables, light/dark theme switching |
| **JavaScript** | Vanilla JS only: custom i18n engine, DOM manipulation, lightbox modal, typewriter effect |
| **Icons and fonts** | Font Awesome, flag-icons, Google Fonts |
| **Version control and hosting** | Git and GitHub Pages |

No frameworks and no build step. The site is plain static files.

---

## Project Directory Structure

```text
zeeshan-welding-portfolio/
├── index.html          # Main page (home, about, experience, certificate, skills, gallery, contact)
├── photos.html         # Photo gallery page
├── videos.html         # Video gallery page
├── sitemap.xml
├── robots.txt
├── .gitignore
├── README.md
│
├── assets/
│   ├── images/         # Hero, profile, certificate preview, backgrounds, gallery photos
│   └── icons/          # Favicon and icons
│
├── css/
│   └── style.css       # All styles, theme variables, responsive rules
│
├── js/
│   ├── i18n.js         # Custom i18n engine (language loading, RTL, fonts)
│   ├── lang-menu.js    # Navbar language switcher
│   ├── script.js       # Theme toggle, menus, scroll effects, typewriter, copy toast, contact pop-up
│   ├── gallery.js      # Photo lightbox and YouTube video modal
│   └── gallery-data.js # Photo and video lists
│
└── lang/
    ├── en.js  ar.js  ur.js  de.js
    ├── fr.js  es.js  it.js  pl.js
    └── no.js  ro.js  ru.js  hi.js
```

---

## Development Process and My Journey

I work full time as an arc pipe welder, and I am teaching myself frontend web development alongside that work (HTML, CSS and JavaScript). This portfolio is my biggest project so far, and I built it step by step:

1. **Content first:** I wrote the copy from my real certificate, work history and site experience.
2. **Layout and design:** I built the page structure, the dark and light themes, and the responsive layout in HTML and CSS.
3. **Behavior:** I added the menus, theme toggle, gallery and contact features with vanilla JavaScript.
4. **Multilingual support:** I designed the translation system, with a key for every piece of text and one dictionary file per language.
5. **SEO and launch:** I added structured data, meta tags, a sitemap, tested everything and deployed to GitHub Pages.

I used **Claude (an AI assistant from Anthropic)** as a pair-programming helper. Whenever I got stuck, I asked it for help with troubleshooting, with keeping translation keys in sync across all 12 dictionary files, with drafting the language translations, and with testing edge cases (for example RTL behavior and language switching). I made the decisions, wrote and edited the project files, and checked the result myself. The project, its content and its direction are mine.

---

## Author and Contact

**Zeeshan Hafeez** — 6G SMAW Pipe Welder and Self-taught Web Developer
Madinah, Saudi Arabia

- WhatsApp: [+966 578 449 807](https://wa.me/966578449807)
- LinkedIn: [zeeshan-hafeez-6g-smaw-pipe-welder](https://www.linkedin.com/in/zeeshan-hafeez-6g-smaw-pipe-welder)
- GitHub: [malikzeeshannb-art](https://github.com/malikzeeshannb-art)
- Email: [malikzeeshannb@gmail.com](mailto:malikzeeshannb@gmail.com)
- Online CV: [pipeline-welder-cv](https://malikzeeshannb-art.github.io/pipeline-welder-cv/)

Employers and recruiters with a relevant pipe welding opportunity in Saudi Arabia are welcome to get in touch.

---

&copy; 2026 Zeeshan Hafeez. All rights reserved.
