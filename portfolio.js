function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

/* Ripple effect */
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
qsa(".click-me, .pill").forEach((b) => b.addEventListener("click", addRipple));

/* Typed text (light) */
const typed = qs(".js-typed");
if (typed) {
  const text = typed.dataset.text || "";
  typed.textContent = "";
  typed.style.borderRight = "2px solid rgba(133,100,199,0.9)";
  let i = 0;

  function step() {
    if (i < text.length) {
      typed.textContent += text.charAt(i);
      i += 1;
      setTimeout(step, 38);
    } else {
      setTimeout(() => (typed.style.borderRight = "none"), 420);
    }
  }
  setTimeout(step, 300);
}

/* Count-up */
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

/* Modals: About + Quick */
const aboutModal = qs("#aboutModal");
const quickModal = qs("#quickModal");

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

qsa(".js-open-about").forEach((b) => b.addEventListener("click", () => openModal(aboutModal)));
qsa(".js-close-about").forEach((b) => b.addEventListener("click", () => closeModal(aboutModal)));

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal(quickModal);
    closeModal(aboutModal);
  }
});

/* Newsletter toast */
const toast = qs("#toast");
let toastTimer = null;

function showToast(text = "Done") {
  if (!toast) return;
  const t = qs(".toast__text", toast);
  if (t) t.textContent = text;

  toast.classList.add("is-show");
  toast.setAttribute("aria-hidden", "false");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("is-show");
    toast.setAttribute("aria-hidden", "true");
  }, 1600);
}

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

/* FIX: auto-close modal when clicking links inside it */
function closeAllModals() {
  document.querySelectorAll(".modal.is-open").forEach((m) => {
    m.classList.remove("is-open");
    m.setAttribute("aria-hidden", "true");
  });
  document.body.style.overflow = "";
}

document.addEventListener("click", (e) => {
  const modal = e.target.closest(".modal.is-open");
  if (!modal) return;

  const link = e.target.closest("a[href]");
  if (!link) return;

  if (link.target === "_blank") return;

  closeAllModals();
}, true);
