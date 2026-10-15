/* Bakes by Chanda – site scripts (no libraries needed) */

/* >>> Business contact details live here. Change once, used by the order form. <<< */
const CONTACT = {
  whatsapp: "27818689118",              // country code + number, no "+" or spaces
  email: "bakesbychanda@gmail.com",
};

/* ---------- Mobile navigation ---------- */
(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
})();

/* ---------- Hero slideshow ---------- */
(function () {
  const root = document.querySelector("[data-slideshow]");
  if (!root) return;
  const slides = [...root.querySelectorAll(".slide")];
  const dotsBox = document.querySelector(".slide-dots");
  const caption = document.querySelector(".slide-caption");
  const prev = document.querySelector(".slide-prev");
  const next = document.querySelector(".slide-next");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let index = 0;
  let timer = null;

  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "slide-dot";
    b.setAttribute("aria-label", "Show photo " + (i + 1));
    b.addEventListener("click", () => { show(i); restart(); });
    dotsBox.appendChild(b);
    return b;
  });

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => {
      const active = n === index;
      s.classList.toggle("is-active", active);
      s.setAttribute("aria-hidden", String(!active));
    });
    dots.forEach((d, n) => d.setAttribute("aria-current", String(n === index)));
    caption.textContent = slides[index].dataset.caption || "";
  }
  function start() {
    if (reduceMotion || timer) return;
    timer = setInterval(() => show(index + 1), 4500);
  }
  function stop() { clearInterval(timer); timer = null; }
  function restart() { stop(); start(); }

  prev.addEventListener("click", () => { show(index - 1); restart(); });
  next.addEventListener("click", () => { show(index + 1); restart(); });
  const area = root.closest(".hero-art");
  area.addEventListener("mouseenter", stop);
  area.addEventListener("mouseleave", start);
  area.addEventListener("focusin", stop);
  area.addEventListener("focusout", start);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  show(0);
  start();
})();

/* ---------- Gallery: filters + lightbox ---------- */
(function () {
  const grid = document.querySelector("[data-gallery]");
  if (!grid) return;
  const items = [...grid.querySelectorAll(".g-item")];
  const chips = [...document.querySelectorAll("[data-filter]")];

  function applyFilter(cat) {
    items.forEach((it) => { it.hidden = !(cat === "all" || it.dataset.cat === cat); });
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === cat)));
  }
  chips.forEach((c) => c.addEventListener("click", () => {
    applyFilter(c.dataset.filter);
    history.replaceState(null, "", c.dataset.filter === "all" ? "gallery.html" : "#" + c.dataset.filter);
  }));
  const fromHash = location.hash.replace("#", "");
  applyFilter(chips.some((c) => c.dataset.filter === fromHash) ? fromHash : "all");

  const box = document.getElementById("lightbox");
  const lbImg = box.querySelector("img");
  const lbCap = box.querySelector(".lb-caption");
  let current = 0;
  const visible = () => items.filter((i) => !i.hidden);

  function open(i) {
    const list = visible();
    current = (i + list.length) % list.length;
    const img = list[current].querySelector("img");
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = img.alt;
    if (!box.open) box.showModal();
  }
  items.forEach((it) => it.querySelector("button").addEventListener("click", () => open(visible().indexOf(it))));
  box.querySelector(".lb-close").addEventListener("click", () => box.close());
  box.querySelector(".lb-prev").addEventListener("click", () => open(current - 1));
  box.querySelector(".lb-next").addEventListener("click", () => open(current + 1));
  box.addEventListener("click", (e) => { if (e.target === box || e.target.classList.contains("lb-inner")) box.close(); });
  box.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") open(current - 1);
    if (e.key === "ArrowRight") open(current + 1);
  });
})();

/* ---------- Order form -> WhatsApp / email ---------- */
(function () {
  const form = document.getElementById("order-form");
  if (!form) return;

  const FLAVOURS = {
    standard: ["Vanilla", "Chocolate", "Marble (Choc & Vanilla)"],
    bento: ["Vanilla", "Chocolate"],
    cupcakes: ["Vanilla", "Chocolate", "Marble (Choc & Vanilla)", "Oreo"],
    custom: ["Vanilla", "Chocolate", "Marble (Choc & Vanilla)"],
  };
  const NOTICE_DAYS = { standard: 3, bento: 3, cupcakes: 3, custom: 7 };
  const LABEL = {
    standard: "Standard cake",
    bento: "Bento (mini) cake",
    cupcakes: "Cupcakes (per dozen)",
    custom: "Custom cake",
  };

  const product = form.elements.product;
  const flavour = form.elements.flavour;
  const date = form.elements.date;
  const notice = document.getElementById("notice");

  // Pre-select a product when arriving from the menu (order.html?item=bento)
  const wanted = new URLSearchParams(location.search).get("item");
  if (wanted && FLAVOURS[wanted]) product.value = wanted;

  // Don't allow dates in the past
  const today = new Date();
  date.min = today.toISOString().slice(0, 10);

  function fillFlavours() {
    flavour.innerHTML = "";
    FLAVOURS[product.value].forEach((f) => flavour.add(new Option(f, f)));
  }

  function checkNotice() {
    if (!date.value) { notice.hidden = true; return; }
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const needed = new Date(date.value + "T00:00:00");
    const days = Math.round((needed - start) / 86400000);
    const required = NOTICE_DAYS[product.value];
    if (days < required) {
      const noun = product.value === "custom" ? "custom orders" : "standard orders";
      notice.textContent =
        "Heads up: " + noun + " need " + required + " days' notice. Orders with less notice may carry an express charge. Send your details and we'll confirm.";
      notice.hidden = false;
    } else {
      notice.hidden = true;
    }
  }

  function buildMessage() {
    const d = new FormData(form);
    const nice = date.value
      ? new Date(date.value + "T00:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "Not sure yet";
    const lines = [
      "Hi Bakes by Chanda, I'd like to place an order.",
      "",
      "Name: " + (d.get("name") || ""),
      "Event type: " + d.get("event"),
      "Ordering: " + LABEL[d.get("product")],
      "Flavour: " + d.get("flavour"),
      "Date needed: " + nice,
      "Collection or delivery: " + d.get("handover"),
      "",
      "Description / theme:",
      (d.get("description") || "").trim() || "(I'll send details and a photo idea)",
    ];
    return lines.join("\n");
  }

  product.addEventListener("change", () => { fillFlavours(); checkNotice(); });
  date.addEventListener("change", checkNotice);
  fillFlavours();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const msg = buildMessage();
    const via = e.submitter ? e.submitter.value : "whatsapp";
    if (via === "email") {
      const subject = "Cake order: " + form.elements.event.value + " – " + LABEL[product.value];
      location.href = "mailto:" + CONTACT.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(msg);
    } else {
      window.open("https://wa.me/" + CONTACT.whatsapp + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
    }
  });
})();

/* ---------- Footer year ---------- */
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

/* ---------- Floating "Ask Chanda" inquire button (opens WhatsApp) ---------- */
(function () {
  const msg = encodeURIComponent("Hi Bakes by Chanda! \uD83E\uDDC1 I have a question:");
  const a = document.createElement("a");
  a.className = "inquire";
  a.href = "https://wa.me/" + CONTACT.whatsapp + "?text=" + msg;
  a.target = "_blank";
  a.rel = "noopener";
  a.setAttribute("aria-label", "Ask a question on WhatsApp (opens in a new tab)");
  a.innerHTML =
    '<span class="inquire-bubble" aria-hidden="true">Ask me anything \u2661</span>' +
    '<span class="inquire-icon" aria-hidden="true">' +
      '<svg viewBox="0 0 48 48" width="34" height="34" focusable="false">' +
        '<path d="M13 28h22l-2.6 13.2a2 2 0 0 1-2 1.6H17.6a2 2 0 0 1-2-1.6z" fill="#e8cd8f" stroke="#b8924a" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<path d="M18 29l1.2 13M24 29v13.5M30 29l-1.2 13" stroke="#b8924a" stroke-width="1.2" stroke-linecap="round"/>' +
        '<path d="M10 28.5c0-4.4 3.6-7 8-7 .6-3.8 3.4-6.2 6-6.2s5.4 2.4 6 6.2c4.4 0 8 2.6 8 7z" fill="#f7b5c8" stroke="#c23b66" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<circle cx="24" cy="11" r="2.6" fill="#c23b66"/>' +
        '<path d="M24 8.4c.2-2 1.2-3.2 3-3.8" stroke="#85621f" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
      '</svg>' +
    '</span>' +
    '<span class="inquire-text"><small>Got a question?</small><strong>Ask Chanda</strong></span>';
  document.body.appendChild(a);
  // Peek the little speech bubble a few seconds after the page loads
  setTimeout(() => a.classList.add("show-bubble"), 2500);
  setTimeout(() => a.classList.remove("show-bubble"), 9000);
})();
