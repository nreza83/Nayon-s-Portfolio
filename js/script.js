/* =========================================================
   Nothing here needs editing.
   All text, links, photos, videos and the CV are edited in
   the admin panel:  https://YOUR-SITE/admin/
   (the admin panel saves them into the /content folder)
   ========================================================= */
const CONFIG = { photoSeconds: 3.5 };
const FALLBACK_PHOTOS = ["assets/photo-1.jpg", "assets/photo-2.jpg", "assets/photo-3.jpg", "assets/photo-4.jpg", "assets/photo-5.jpg"];
const FALLBACK_CV = "assets/Nayon_Reza_CV.pdf";

document.documentElement.classList.add("js");
const $ = (id) => document.getElementById(id);
const rel = (p) => (p || "").replace(/^\//, "");   // "/assets/x.jpg" -> "assets/x.jpg"
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text) n.textContent = text;
  return n;
};

/* ---------- Visitor analytics (Google Analytics 4) ---------- */
const track = (name, params) => { if (window.gtag) window.gtag("event", name, params || {}); };
const startAnalytics = (id) => {
  if (!id) return;
  const s = el("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", id);
};

/* ---------- Light / dark mode (light is the default) ---------- */
const applyMode = (dark) => {
  document.body.classList.toggle("dark-mode", dark);
  $("themeIcon").textContent = dark ? "☀️" : "🌙";
};
let savedMode = null;
try { savedMode = localStorage.getItem("mode"); } catch {}
applyMode(savedMode === "dark");
$("themeToggle").addEventListener("click", () => {
  const dark = !document.body.classList.contains("dark-mode");
  applyMode(dark);
  try { localStorage.setItem("mode", dark ? "dark" : "light"); } catch {}
});

/* ---------- Mobile menu ---------- */
const menuToggle = $("menuToggle");
const navLinks = $("navLinks");
menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  })
);

/* ---------- Highlight the current section in the menu ---------- */
const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.querySelectorAll("a").forEach((a) =>
        a.classList.toggle("active", a.getAttribute("href") === `#${entry.target.id}`)
      );
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));

/* ---------- Reveal on scroll ---------- */
const reveal = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); reveal.unobserve(entry.target); }
    });
  },
  { threshold: 0.1 }
);
const observeReveals = () => document.querySelectorAll(".reveal:not(.visible)").forEach((n) => reveal.observe(n));

/* ---------- CV download buttons ---------- */
const setCv = (path) => {
  document.querySelectorAll(".js-cv").forEach((a) => {
    a.href = rel(path);
    a.addEventListener("click", () => track("cv_download"));
  });
};

/* ---------- Shuffling profile photos ---------- */
const startPhotos = (list) => {
  const frame = $("profilePhoto");
  const order = list.map(rel);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const imgs = [];
  order.forEach((src) => {
    const img = new Image();
    img.alt = document.querySelector("h1").textContent || "Profile photo";
    img.onload = () => {
      frame.appendChild(img);
      imgs.push(img);
      if (imgs.length === 1) img.classList.add("active");
    };
    img.src = src;
  });
  let current = 0;
  setInterval(() => {
    if (imgs.length < 2) return;
    imgs[current].classList.remove("active");
    current = (current + 1) % imgs.length;
    imgs[current].classList.add("active");
  }, CONFIG.photoSeconds * 1000);
};

/* ---------- Gallery photos + photo viewer ---------- */
const lightbox = $("lightbox");
const closeLightbox = () => { lightbox.hidden = true; };
$("lightboxClose").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

const renderGallery = (items) => {
  const grid = $("galleryGrid");
  items.filter((it) => it && it.image).forEach((it) => {
    const fig = el("figure", "gallery-item");
    const btn = el("button");
    btn.type = "button";
    btn.setAttribute("aria-label", `Open photo${it.caption ? ": " + it.caption : ""}`);
    const img = el("img");
    img.src = rel(it.image);
    img.alt = it.caption || "Gallery photo";
    img.loading = "lazy";
    img.decoding = "async";
    btn.appendChild(img);
    btn.addEventListener("click", () => {
      $("lightboxImg").src = img.src;
      $("lightboxImg").alt = img.alt;
      $("lightboxCap").textContent = it.caption || "";
      lightbox.hidden = false;
    });
    fig.appendChild(btn);
    if (it.caption) fig.appendChild(el("figcaption", "", it.caption));
    grid.appendChild(fig);
  });
  if (!grid.children.length) grid.appendChild(el("p", "empty-note", "Photos will appear here soon."));
};

/* ---------- Videos (play + download) ---------- */
const youtubeId = (url) => {
  const m = (url || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
};
const renderVideos = (items) => {
  const grid = $("videoGrid");
  items.filter((v) => v && (v.file || v.link)).forEach((v) => {
    const card = el("article", "video-card");
    if (v.file) {
      const video = el("video");
      video.src = rel(v.file);
      video.controls = true;
      video.preload = "metadata";
      video.playsInline = true;
      card.appendChild(video);
    } else {
      const id = youtubeId(v.link);
      if (id) {
        const frame = el("iframe");
        frame.src = `https://www.youtube-nocookie.com/embed/${id}`;
        frame.title = v.title || "Video";
        frame.loading = "lazy";
        frame.allow = "accelerometer; encrypted-media; gyroscope; picture-in-picture";
        frame.allowFullscreen = true;
        card.appendChild(frame);
      }
    }
    const body = el("div", "video-body");
    body.appendChild(el("h4", "", v.title || "Video"));
    if (v.description) body.appendChild(el("p", "", v.description));
    const a = el("a", "btn btn-secondary btn-small");
    if (v.file) {
      a.href = rel(v.file);
      a.setAttribute("download", "");
      a.textContent = "Download video ↓";
      a.addEventListener("click", () => track("video_download", { video_title: v.title || "" }));
    } else {
      a.href = v.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "Open video ↗";
    }
    body.appendChild(a);
    card.appendChild(body);
    grid.appendChild(card);
  });
  $("videoBlock").hidden = !grid.children.length;
};

/* =========================================================
   Text content: everything below is filled from the /content
   files that the admin panel edits. If a file cannot be
   loaded, the text already written in index.html stays.
   ========================================================= */
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = (u) => (/^(https?:|mailto:|tel:)/i.test(u || "") ? u : "#");
const num = (i) => String(i + 1).padStart(2, "0");
const list = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);
const headingHtml = (title, accent) => `${esc(title)} <span class="gradient-text">${esc(accent)}</span>`;
const linkHtml = (it) => (it.link ? `<a class="text-link" href="${esc(safeUrl(it.link))}" target="_blank" rel="noopener noreferrer">${esc(it.link_text || "Open link")} ↗</a>` : "");
const boldLead = (s) => {            // "Term — detail"  ->  <strong>Term</strong> — detail
  const i = String(s).indexOf(" — ");
  return i > 0 ? `<strong>${esc(s.slice(0, i))}</strong>${esc(s.slice(i))}` : esc(s);
};
const setHtml = (id, html) => { const n = $(id); if (n) n.innerHTML = html; };

const renderHead = (key, d, prefix = "") => {
  const box = document.querySelector(`[data-head="${key}"]`);
  if (!box || !d || !d[prefix + "title"]) return;
  const text = prefix ? "" : d.text;
  box.innerHTML = `<span class="eyebrow">${esc(d[prefix + "eyebrow"])}</span>
    <h2>${headingHtml(d[prefix + "title"], d[prefix + "title_accent"])}</h2>${text ? `<p>${esc(text)}</p>` : ""}`;
};

const timelineHtml = (items) => list(items).map((it) => `
  <article class="timeline-item reveal"><span class="timeline-dot"></span>
    <div class="timeline-content">
      <div class="education-heading-row">
        ${it.badge ? `<span class="education-logo">${esc(it.badge)}</span>` : ""}
        <div><span class="date">${esc(it.date)}</span><h3>${esc(it.title)}</h3></div>
      </div>
      ${it.institution ? `<p><strong>${esc(it.institution)}</strong></p>` : ""}
      ${it.text ? `<p>${esc(it.text)}</p>` : ""}
      ${list(it.points).length ? `<ul>${list(it.points).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
      ${linkHtml(it)}
    </div>
  </article>`).join("");

const applyText = (c) => {
  /* simple one-line texts: <… data-bind="file.field"> */
  document.querySelectorAll("[data-bind]").forEach((n) => {
    const [file, field] = n.dataset.bind.split(".");
    const v = c[file] && c[file][field];
    if (v) n.textContent = v;
  });

  const { hero, about, research, education, experience, skills, media, contact } = c;

  if (hero && hero.tagline) setHtml("heroTagline", headingHtml(hero.tagline, hero.tagline_accent));
  if (about) {
    renderHead("about", about);
    setHtml("aboutGrid", list(about.cards).map((card, i) => `
      <article class="glass-card reveal${i === 0 ? " about-main" : ""}">
        <span class="card-number">${num(i)}</span><h3>${esc(card.title)}</h3>
        ${card.text ? `<p>${esc(card.text)}</p>` : ""}
        ${list(card.items).length ? `<ul class="interest-list">${list(card.items).map((x) => `<li>${boldLead(x)}</li>`).join("")}</ul>` : ""}
        ${card.note ? `<div class="quote-line">${esc(card.note)}</div>` : ""}
      </article>`).join(""));
  }
  if (research) {
    renderHead("research", research);
    setHtml("researchGrid", list(research.items).map((it, i) => `
      <article class="service-card reveal">
        <span>${num(i)} · ${esc(it.label)}</span><h3>${esc(it.title)}</h3>
        ${it.source ? `<p class="source">${esc(it.source)}</p>` : ""}
        ${it.text ? `<p>${esc(it.text)}</p>` : ""}
        ${linkHtml(it)}
      </article>`).join(""));
  }
  if (education) {
    renderHead("education", education);
    renderHead("certifications", education, "cert_");
    setHtml("educationList", timelineHtml(education.items));
    setHtml("certList", timelineHtml(education.certifications));
  }
  if (experience) {
    renderHead("experience", experience);
    setHtml("experienceList", timelineHtml(experience.items));
  }
  if (skills) {
    renderHead("skills", skills);
    setHtml("skillsGrid", list(skills.items).map((it, i) => `
      <article class="glass-card reveal">
        <span class="card-number">${num(i)}</span><h3>${esc(it.title)}</h3>
        <div class="pill-list">${list(it.tags).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      </article>`).join(""));
  }
  if (media) renderHead("media", media);
  if (contact) {
    if (contact.title) setHtml("contactTitle", headingHtml(contact.title, contact.title_accent));
    setHtml("contactLines", [contact.email && `<span>✉ ${esc(contact.email)}</span>`, contact.phone && `<span>☎ ${esc(contact.phone)}</span>`].filter(Boolean).join(""));
    if (contact.email) $("emailBtn").href = `mailto:${contact.email}`;
    const links = {
      linkedinLink: contact.linkedin,
      researchgateLink: contact.researchgate,
      whatsappLink: contact.whatsapp ? `https://wa.me/${String(contact.whatsapp).replace(/\D/g, "")}` : "",
    };
    Object.entries(links).forEach(([id, url]) => {
      const a = $(id);
      if (a && url && safeUrl(url) !== "#") { a.href = url; a.hidden = false; }
    });
    startAnalytics(contact.ga_id);
  }
};

/* ---------- Load everything the admin manages ---------- */
const FILES = ["hero", "about", "research", "education", "experience", "skills", "media", "contact"];
const load = (name) =>
  fetch(`content/${name}.json`, { cache: "no-cache" })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

Promise.all(FILES.map(load)).then((results) => {
  const c = {};
  FILES.forEach((name, i) => { c[name] = results[i]; });
  try { applyText(c); } catch (e) { console.error(e); }
  const m = c.media || {};
  setCv(m.cv || FALLBACK_CV);
  startPhotos(list(m.profile_photos).length ? m.profile_photos : FALLBACK_PHOTOS);
  renderGallery(list(m.gallery));
  renderVideos(list(m.videos));
  observeReveals();
});

/* ---------- Floating background: organisms + lab instruments ---------- */
const SHAPES = [
  '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><rect x="14" y="22" width="36" height="20" rx="10"/><path d="M50 32c5-6 7 6 12 0M14 32c-5 6-7-6-12 0M24 22v-7M40 22v-7M24 42v7M40 42v7"/><circle cx="26" cy="32" r="2" fill="currentColor"/><circle cx="38" cy="32" r="2" fill="currentColor"/></svg>',
  '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="32" cy="32" r="14"/><path d="M32 18V8M32 56V46M18 32H8M56 32H46M22 22l-7-7M49 49l-7-7M42 22l7-7M15 49l7-7"/><circle cx="27" cy="29" r="2.5" fill="currentColor"/><circle cx="37" cy="36" r="2.5" fill="currentColor"/></svg>',
  '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M20 4c0 14 24 14 24 28S20 46 20 60"/><path d="M44 4c0 14-24 14-24 28s24 14 24 28"/><path d="M24 12h16M23 22h18M23 42h18M24 52h16" stroke-width="2"/></svg>',
  '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3"><circle cx="22" cy="22" r="9"/><circle cx="42" cy="24" r="9"/><circle cx="32" cy="42" r="9"/></svg>',
  '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3"><circle cx="32" cy="32" r="24"/><circle cx="32" cy="32" r="18" stroke-width="1.5"/><circle cx="26" cy="27" r="3" fill="currentColor"/><circle cx="39" cy="33" r="4" fill="currentColor"/><circle cx="29" cy="41" r="2.5" fill="currentColor"/></svg>',
  // Erlenmeyer flask
  '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M25 6h14M27 6v18L12 52a4 4 0 0 0 4 6h32a4 4 0 0 0 4-6L37 24V6"/><path d="M19 42h26" stroke-width="2"/><circle cx="28" cy="49" r="2" fill="currentColor"/><circle cx="37" cy="46" r="1.5" fill="currentColor"/></svg>',
  // test tube
  '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 6h20M25 6v42a7 7 0 0 0 14 0V6"/><path d="M25 30h14" stroke-width="2"/><circle cx="32" cy="42" r="2" fill="currentColor"/></svg>',
  // microscope
  '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M28 8l10 4-8 22-10-4z"/><path d="M24 33l-3 7M14 58h36M22 58v-8h12"/><path d="M38 22a18 18 0 0 1 4 36"/><path d="M16 44h16"/></svg>',
  // pipette / dropper
  '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M44 8a6 6 0 0 1 9 9l-7 7-9-9z"/><path d="M39 17L16 40l-3 9 9-3 23-23"/><path d="M11 53l-3 4" /></svg>',
  // round-bottom flask
  '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M26 6h12M28 6v16a18 18 0 1 0 8 0V6"/><path d="M16 40h32" stroke-width="2"/></svg>',
];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (min, max) => min + Math.random() * (max - min);
const count = reduceMotion ? 0 : window.innerWidth < 700 ? 14 : 30;
for (let i = 0; i < count; i++) {
  const p = el("span", "anim-particle");
  p.innerHTML = SHAPES[i % SHAPES.length];
  p.style.left = `${rand(0, 96)}%`;
  p.style.top = `${rand(0, 94)}%`;
  p.style.setProperty("--size", `${rand(22, 46)}px`);
  p.style.setProperty("--duration", `${rand(24, 42)}s`);
  p.style.setProperty("--dx", `${rand(-90, 90)}px`);
  p.style.setProperty("--dy", `${rand(40, 130)}px`);
  p.style.animationDelay = `${-rand(0, 30)}s`;
  $("animationCanvas").appendChild(p);
}

/* ---------- Footer year ---------- */
$("year").textContent = new Date().getFullYear();
