(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function readCSSNumber(name, fallback) {
    var raw = getComputedStyle(document.documentElement).getPropertyValue(name);
    var n = parseFloat(raw);
    return isNaN(n) ? fallback : n;
  }

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

  /* ---------- Hero stitch parallax on scroll ---------- */
  var stitchSignature = document.querySelector(".stitch-signature");
  var heroSection = document.getElementById("top");
  if (stitchSignature && heroSection && !prefersReducedMotion) {
    var PARALLAX_MAX = readCSSNumber("--parallax-stitch-max", 46);
    var parallaxTicking = false;

    var updateStitchParallax = function () {
      parallaxTicking = false;
      var rect = heroSection.getBoundingClientRect();
      var heroHeight = rect.height || 1;
      // 0 while the hero is fully in view, growing toward 1 as it scrolls past —
      // the stitch trails behind the rest of the content instead of moving 1:1 with it.
      var progress = Math.min(Math.max(-rect.top / heroHeight, 0), 1);
      stitchSignature.style.transform = "translateY(" + (progress * PARALLAX_MAX).toFixed(1) + "px)";
    };
    var onParallaxScroll = function () {
      if (!parallaxTicking) {
        parallaxTicking = true;
        requestAnimationFrame(updateStitchParallax);
      }
    };
    window.addEventListener("scroll", onParallaxScroll, { passive: true });
    updateStitchParallax();
  }

  /* ---------- 3D tilt on cards (services / gallery / payment) ---------- */
  var supportsHoverTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!prefersReducedMotion && supportsHoverTilt) {
    var tiltCards = document.querySelectorAll(
      ".service-card:not(.service-card-note), .payment-card, .texture-tile"
    );
    var TILT_MAX_DEG = readCSSNumber("--tilt-max-deg", 7);
    var TILT_LIFT = readCSSNumber("--tilt-lift", 10) + "px";

    tiltCards.forEach(function (card) {
      card.classList.add("tilt-card");
      var rafId = null;

      function resetTilt() {
        card.classList.remove("is-tilting");
        if (rafId) { cancelAnimationFrame(rafId); }
        card.style.setProperty("--tilt-rx", "0deg");
        card.style.setProperty("--tilt-ry", "0deg");
        card.style.setProperty("--tilt-tz", "0px");
        card.style.setProperty("--tilt-shadow-x", "0px");
        card.style.setProperty("--tilt-shadow-y", "10px");
        card.style.setProperty("--tilt-glare-o", "0");
      }

      card.addEventListener("mouseenter", function () {
        card.classList.add("is-tilting");
      });

      card.addEventListener("mousemove", function (event) {
        var rect = card.getBoundingClientRect();
        var px = (event.clientX - rect.left) / rect.width - 0.5;  // -0.5 .. 0.5
        var py = (event.clientY - rect.top) / rect.height - 0.5;  // -0.5 .. 0.5

        if (rafId) { cancelAnimationFrame(rafId); }
        rafId = requestAnimationFrame(function () {
          card.style.setProperty("--tilt-ry", (px * TILT_MAX_DEG * 2).toFixed(2) + "deg");
          card.style.setProperty("--tilt-rx", (-py * TILT_MAX_DEG * 2).toFixed(2) + "deg");
          card.style.setProperty("--tilt-tz", TILT_LIFT);
          card.style.setProperty("--tilt-shadow-x", (-px * 18).toFixed(1) + "px");
          card.style.setProperty("--tilt-shadow-y", (10 + py * 10).toFixed(1) + "px");
          card.style.setProperty("--tilt-glare-x", ((px + 0.5) * 100).toFixed(1) + "%");
          card.style.setProperty("--tilt-glare-y", ((py + 0.5) * 100).toFixed(1) + "%");
          card.style.setProperty("--tilt-glare-o", "1");
        });
      });

      card.addEventListener("mouseleave", resetTilt);
      card.addEventListener("blur", resetTilt, true);
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
