// ============================
// Utilities
// ============================
function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

// ============================
// Ripple effect
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

qsa(".click-me, .pill, .icon-btn, .miniBtn").forEach((b) => {
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

  const px = (x / rect.width) * 2 - 1;
  const py = (y / rect.height) * 2 - 1;

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
// Smooth scroll helpers
// ============================
const scrollContactBtn = qs(".js-scroll-contact");
if (scrollContactBtn) {
  scrollContactBtn.addEventListener("click", () => {
    const target = qs("#contactInfo");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

// ============================
// Toast
// ============================
const toast = qs("#toast");
let toastTimer = null;

function showToast(text = "Copied") {
  if (!toast) return;
  const t = qs(".toast__text", toast);
  if (t) t.textContent = text;

  toast.classList.add("is-show");
  toast.setAttribute("aria-hidden", "false");

  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-show");
    toast.setAttribute("aria-hidden", "true");
  }, 1600);
}

// ============================
// Copy to clipboard
// ============================
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`Copied: ${text}`);
  } catch {
    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    showToast(`Copied: ${text}`);
  }
}

qsa(".js-copy").forEach((btn) => {
  btn.addEventListener("click", () => {
    const val = btn.dataset.copy || "";
    if (val) copyText(val);
  });
});

// ============================
// Modals (Quick + Success)
// ============================
const quickModal = qs("#quickModal");
const successModal = qs("#successModal");

function openModal(modal) {
  if (!modal) return;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

qsa(".js-open-quick").forEach((b) => b.addEventListener("click", () => openModal(quickModal)));
qsa(".js-close-quick").forEach((b) => b.addEventListener("click", () => closeModal(quickModal)));

qsa(".js-close-success").forEach((b) => b.addEventListener("click", () => closeModal(successModal)));

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal(quickModal);
    closeModal(successModal);
  }
});

// ============================
// Form validation (demo)
// ============================
const form = qs(".js-contact-form");
const clearBtn = qs(".js-clear");

function markInvalid(el, yes) {
  if (!el) return;
  el.classList.toggle("is-invalid", !!yes);
}

function validateField(el) {
  if (!el) return true;
  const ok = el.checkValidity();
  markInvalid(el, !ok);
  return ok;
}

if (form) {
  const fields = qsa(".field", form);

  fields.forEach((f) => {
    f.addEventListener("input", () => validateField(f));
    f.addEventListener("blur", () => validateField(f));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let ok = true;
    fields.forEach((f) => { if (!validateField(f)) ok = false; });

    if (!ok) {
      showToast("Please check the highlighted fields.");
      return;
    }

    // Demo success
    openModal(successModal);
    form.reset();
    fields.forEach((f) => markInvalid(f, false));
  });
}

if (clearBtn && form) {
  clearBtn.addEventListener("click", () => {
    form.reset();
    qsa(".field", form).forEach((f) => markInvalid(f, false));
    showToast("Cleared.");
  });
}

// ============================
// Newsletter (demo)
// ============================
const newsletter = qs(".js-newsletter");
if (newsletter) {
  newsletter.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = qs('input[type="email"]', newsletter);
    const email = input ? input.value.trim() : "";
    if (!email) return;
    showToast(`Subscribed: ${email}`);
    newsletter.reset();
  });
}

// ============================
// Count-up
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