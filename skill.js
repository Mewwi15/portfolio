// ============================
// Utilities
// ============================
function qs(sel, root = document) {
  return root.querySelector(sel);
}
function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

// ============================
// Ripple effect (all buttons with .click-me + icon-btn)
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

  // remove old ripple
  const old = el.querySelector(".ripple");
  if (old) old.remove();

  el.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

qsa(".click-me, .icon-btn").forEach((btn) => {
  btn.addEventListener("click", addRipple);
});

// ============================
// Modal
// ============================
const modal = qs("#modal");
const openModalButtons = qsa(".js-open-modal");
const closeModalTargets = qsa(".js-close-modal");

function openModal() {
  if (!modal) return;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

openModalButtons.forEach((btn) => btn.addEventListener("click", openModal));
closeModalTargets.forEach((el) => el.addEventListener("click", closeModal));

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ============================
// Scroll reveal
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
  // fallback
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

// ============================
// 3D Tilt on skill cards
// ============================
const tiltCards = qsa(".js-tilt");

function handleTiltMove(e) {
  const card = e.currentTarget;
  const rect = card.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const px = (x / rect.width) * 2 - 1;  // -1..1
  const py = (y / rect.height) * 2 - 1; // -1..1

  const maxRotate = 10; // degrees
  const rotateY = px * maxRotate;
  const rotateX = -py * maxRotate;

  card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
}

function handleTiltLeave(e) {
  const card = e.currentTarget;
  card.style.transform = "";
}

tiltCards.forEach((card) => {
  card.addEventListener("mousemove", handleTiltMove);
  card.addEventListener("mouseleave", handleTiltLeave);
});

// ============================
// Slider (fade + dots + autoplay)
// ============================
const slidesWrap = qs(".js-slides");
const slides = qsa(".slide", slidesWrap || document);
const dotsWrap = qs(".js-dots");
const prevBtn = qs(".js-prev");
const nextBtn = qs(".js-next");

let current = 0;
let timer = null;
const AUTOPLAY_MS = 4500;

function setActiveSlide(index) {
  if (!slides.length) return;

  current = (index + slides.length) % slides.length;

  slides.forEach((s, i) => s.classList.toggle("is-active", i === current));
  const dots = qsa(".dot", dotsWrap || document);
  dots.forEach((d, i) => d.classList.toggle("is-active", i === current));
}

function buildDots() {
  if (!dotsWrap || !slides.length) return;
  dotsWrap.innerHTML = "";

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dot.addEventListener("click", () => {
      stopAutoplay();
      setActiveSlide(i);
      startAutoplay();
    });
    dotsWrap.appendChild(dot);
  });
}

function next() {
  setActiveSlide(current + 1);
}

function prev() {
  setActiveSlide(current - 1);
}

function startAutoplay() {
  if (!slides.length) return;
  stopAutoplay();
  timer = window.setInterval(next, AUTOPLAY_MS);
}

function stopAutoplay() {
  if (timer) {
    window.clearInterval(timer);
    timer = null;
  }
}

if (slides.length) {
  buildDots();
  setActiveSlide(0);
  startAutoplay();

  if (nextBtn) nextBtn.addEventListener("click", () => { stopAutoplay(); next(); startAutoplay(); });
  if (prevBtn) prevBtn.addEventListener("click", () => { stopAutoplay(); prev(); startAutoplay(); });

  // pause on hover (desktop)
  const sliderRegion = qs(".slider");
  if (sliderRegion) {
    sliderRegion.addEventListener("mouseenter", stopAutoplay);
    sliderRegion.addEventListener("mouseleave", startAutoplay);
  }
}

// ============================
// Newsletter (demo: modal + reset)
// ============================
const newsletterForm = qs(".js-newsletter");
if (newsletterForm) {
  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = qs('input[type="email"]', newsletterForm);
    const email = input ? input.value.trim() : "";

    if (!email) return;

    // quick feedback
    openModal();

    // optional: change modal text dynamically
    const modalText = qs(".modal__text");
    if (modalText) {
      modalText.textContent = `Subscribed successfully! We'll notify: ${email}`;
    }

    newsletterForm.reset();
  });
}

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
