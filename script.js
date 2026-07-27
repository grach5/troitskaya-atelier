(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header scroll shadow ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 8) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  navToggle.addEventListener("click", function () {
    var isOpen = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    navToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  });
  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mainNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Открыть меню");
    });
  });

  /* ---------- Hero signature stitch animation ---------- */
  var stitchPath = document.querySelector(".stitch-path");
  if (stitchPath && !prefersReducedMotion) {
    // Trigger the draw-in animation once, after paint.
    requestAnimationFrame(function () {
      stitchPath.classList.add("animate");
    });
  }

  /* ---------- Reveal-on-scroll ---------- */
  var revealTargets = document.querySelectorAll(
    ".service-card, .texture-tile, .trust-item, .payment-card, .section-heading"
  );
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });

  if (prefersReducedMotion) {
    // Respect the user's preference: show everything immediately, no animation.
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  } else if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Booking form -> WhatsApp ---------- */
  var WHATSAPP_NUMBER = "79852108806"; // +7 985 210-88-06, digits only
  var form = document.getElementById("bookingForm");
  var status = document.getElementById("formStatus");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = document.getElementById("clientName").value.trim();
    var phone = document.getElementById("clientPhone").value.trim();
    var comment = document.getElementById("clientComment").value.trim();

    if (!name || !phone) {
      status.textContent = "Пожалуйста, укажите имя и телефон.";
      return;
    }

    var lines = [
      "Здравствуйте! Хочу записаться в Портновский дом Троицкой.",
      "Имя: " + name,
      "Телефон: " + phone
    ];
    if (comment) {
      lines.push("Комментарий: " + comment);
    }
    var message = lines.join("\n");

    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
    window.open(url, "_blank");

    status.textContent = "Открываем WhatsApp — отправьте подготовленное сообщение.";
    form.reset();
  });
})();
