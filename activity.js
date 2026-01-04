/*
 - Name : Pongsakorn Srisakat
 - ID : 6802041510066
 */



// ============================
// Utilities
// ============================
function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

// ============================
// Ripple effect (buttons)
// ============================
function addRipple(e) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  const old = el.querySelector(".ripple");
  if (old) old.remove();

  el.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

qsa(".click-me, .btn, .pill, .chip, .icon-btn").forEach((b) => {
  b.addEventListener("click", addRipple);
});

// ============================
// Reveal on scroll
// ============================
const revealEls = qsa(".js-reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -80px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

// ============================
// 3D Tilt
// ============================
const tiltCards = qsa(".js-tilt");
function handleTiltMove(e) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const px = (x / rect.width) * 2 - 1;  // -1..1
  const py = (y / rect.height) * 2 - 1; // -1..1

  const maxRotate = 10;
  const rotateY = px * maxRotate;
  const rotateX = -py * maxRotate;

  card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
}
function handleTiltLeave(e) {
  e.currentTarget.style.transform = "";
}
tiltCards.forEach((card) => {
  card.addEventListener("mousemove", handleTiltMove);
  card.addEventListener("mouseleave", handleTiltLeave);
});

// ============================
// Filter system
// ============================
const filterBtns = qsa(".js-filter");
const cards = qsa(".js-card");
function setFilter(value) {
  filterBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.filter === value));

  cards.forEach((card) => {
    const cat = (card.dataset.cat || "").toLowerCase();
    const show = value === "all" || cat === value;
    card.style.display = show ? "" : "none";
  });
}
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => setFilter(btn.dataset.filter));
});

// ============================
// Density toggle
// ============================
const grid = qs(".js-grid");
const densityBtn = qs(".js-toggle-density");
let compact = false;

if (densityBtn && grid) {
  densityBtn.addEventListener("click", () => {
    compact = !compact;
    grid.classList.toggle("density-compact", compact);
    grid.classList.toggle("density-normal", !compact);
  });
}

// ============================
// Work modal
// ============================
const workModal = qs("#workModal");
const workOpeners = qsa(".js-open-work");
const workClosers = qsa(".js-close-work");

function openWorkModal({ title, desc, img, tags }) {
  if (!workModal) return;

  const titleEl = qs(".js-modal-title", workModal);
  const descEl = qs(".js-modal-desc", workModal);
  const imgEl = qs(".js-modal-img", workModal);
  const tagsEl = qs(".js-modal-tags", workModal);

  if (titleEl) titleEl.textContent = title || "Work";
  if (descEl) descEl.textContent = desc || "";
  if (imgEl && img) imgEl.src = img;

  if (tagsEl) {
    tagsEl.innerHTML = "";
    (tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => {
        const chip = document.createElement("span");
        chip.className = "tag";
        chip.textContent = t;
        tagsEl.appendChild(chip);
      });
  }

  workModal.classList.add("is-open");
  workModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeWorkModal() {
  if (!workModal) return;
  workModal.classList.remove("is-open");
  workModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

workOpeners.forEach((btn) => {
  btn.addEventListener("click", () => {
    openWorkModal({
      title: btn.dataset.title,
      desc: btn.dataset.desc,
      img: btn.dataset.img,
      tags: btn.dataset.tags
    });
  });
});

workClosers.forEach((el) => el.addEventListener("click", closeWorkModal));

// ============================
// Quick modal
// ============================
const quickModal = qs("#quickModal");
const quickOpeners = qsa(".js-open-quick");
const quickClosers = qsa(".js-close-quick");

function openQuick() {
  if (!quickModal) return;
  quickModal.classList.add("is-open");
  quickModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeQuick() {
  if (!quickModal) return;
  quickModal.classList.remove("is-open");
  quickModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

quickOpeners.forEach((b) => b.addEventListener("click", openQuick));
quickClosers.forEach((el) => el.addEventListener("click", closeQuick));

// ============================
// Escape key closes modals
// ============================
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeWorkModal();
    closeQuick();
  }
});

// ============================
// Random work
// ============================
function randomVisibleCard() {
  const visible = cards.filter((c) => c.style.display !== "none");
  if (!visible.length) return null;
  return visible[Math.floor(Math.random() * visible.length)];
}

qsa(".js-random").forEach((btn) => {
  btn.addEventListener("click", () => {
    closeQuick();
    const card = randomVisibleCard();
    if (!card) return;
    const opener = qs(".js-open-work", card);
    if (opener) opener.click();
  });
});

// ============================
// Newsletter (demo only)
// ============================
const newsletterForm = qs(".js-newsletter");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = qs('input[type="email"]', newsletterForm);
    const email = input ? input.value.trim() : "";
    if (!email) return;

    // You can replace this with real backend later
    openQuick();
    const desc = qs(".modal__desc", quickModal);
    if (desc) desc.textContent = `Subscribed: ${email}`;
    newsletterForm.reset();
  });
}

// ============================
// Count-up stats
// ============================
qsa(".js-count").forEach((el) => {
  const to = Number(el.dataset.to || "0");
  const duration = 900;
  const start = performance.now();

  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    el.textContent = Math.floor(t * to).toString();
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
});
// ============================
// FIX: auto-close modal when clicking links/buttons inside it
// ============================
function closeAllModals() {
  document.querySelectorAll(".modal.is-open").forEach((m) => {
    m.classList.remove("is-open");
    m.setAttribute("aria-hidden", "true");
  });
  document.body.style.overflow = "";
}

// 1) Close when clicking any normal link inside an open modal
document.addEventListener("click", (e) => {
  const modal = e.target.closest(".modal.is-open");
  if (!modal) return;

  const link = e.target.closest("a[href]");
  if (!link) return;

  // If open new tab, don't interfere
  if (link.target === "_blank") return;

  const href = link.getAttribute("href") || "";
  // Close modal first (important for in-page anchors)
  closeAllModals();

  // If it's an in-page anchor, do smooth scroll after closing (optional)
  if (href.startsWith("#")) {
    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;

    const navH = 80; // adjust if your navbar height differs
    const y = target.getBoundingClientRect().top + window.scrollY - (navH + 10);
    setTimeout(() => window.scrollTo({ top: y, behavior: "smooth" }), 0);
  }
}, true);

// 2) Close when clicking buttons that are meant to navigate/trigger actions
// (you can add more selectors here if you use different button classes)
document.addEventListener("click", (e) => {
  const modal = e.target.closest(".modal.is-open");
  if (!modal) return;

  const btn = e.target.closest("button");
  if (!btn) return;

  // If it's a close button, your existing handler already closes it — no need.
  if (btn.classList.contains("js-close-work") || btn.classList.contains("js-close-quick") || btn.classList.contains("js-close-about")) {
    return;
  }

  // If button behaves like navigation/action inside modal, close modal proactively
  // (safe default; comment out if you don't want it)
  if (btn.classList.contains("pill") || btn.classList.contains("click-me")) {
    closeAllModals();
  }
}, true);
