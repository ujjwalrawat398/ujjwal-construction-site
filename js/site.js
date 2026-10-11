/* Ujjwal Construction — site interactions */
(function () {
  "use strict";

  window.__reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 10);
    var btt = document.querySelector(".back-to-top");
    if (btt) btt.classList.toggle("show", window.scrollY > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- Dropdown / mega menus ---------- */
  document.querySelectorAll(".nav-item.has-mega > .nav-link").forEach(function (link) {
    link.addEventListener("click", function (e) {
      var item = link.parentElement;
      var isMobile = window.matchMedia("(max-width: 991.98px)").matches;
      if (isMobile) {
        e.preventDefault();
        var wasOpen = item.classList.contains("open");
        document.querySelectorAll(".nav-item.open").forEach(function (n) { n.classList.remove("open"); });
        if (!wasOpen) item.classList.add("open");
      }
    });
    link.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        link.parentElement.classList.toggle("open");
      }
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav-item")) {
      document.querySelectorAll(".nav-item.open").forEach(function (n) { n.classList.remove("open"); });
    }
  });

  /* ---------- Count-up stats ---------- */
  function animateValue(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var decimals = (el.getAttribute("data-count").split(".")[1] || "").length;
    if (window.__reducedMotion) {
      el.textContent = prefix + (decimals ? target.toFixed(decimals) : target.toLocaleString("en-GB")) + suffix;
      return;
    }
    var start = 0;
    var duration = 1600;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = start + (target - start) * eased;
      el.textContent = prefix + (decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-GB")) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + (decimals ? target.toFixed(decimals) : target.toLocaleString("en-GB")) + suffix;
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateValue(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (c) { io.observe(c); });
  } else {
    counters.forEach(animateValue);
  }

  /* ---------- Accordion ---------- */
  document.querySelectorAll(".accordion-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".accordion-item");
      var panel = item.querySelector(".accordion-panel");
      var isOpen = item.classList.contains("open");

      var group = btn.closest(".accordion");
      if (group && group.hasAttribute("data-single")) {
        group.querySelectorAll(".accordion-item.open").forEach(function (other) {
          if (other !== item) {
            other.classList.remove("open");
            other.querySelector(".accordion-panel").style.maxHeight = null;
            other.querySelector(".accordion-btn").setAttribute("aria-expanded", "false");
          }
        });
      }

      item.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", !isOpen ? "true" : "false");
      panel.style.maxHeight = !isOpen ? panel.scrollHeight + "px" : null;
    });
  });

  /* ---------- Cookie bar ---------- */
  var cookieBar = document.querySelector(".cookie-bar");
  if (cookieBar) {
    try {
      if (localStorage.getItem("br-cookies") !== null) cookieBar.classList.add("hidden");
    } catch (e) { /* storage unavailable */ }
    cookieBar.querySelectorAll("[data-cookie]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        try { localStorage.setItem("br-cookies", btn.getAttribute("data-cookie")); } catch (e) {}
        cookieBar.classList.add("hidden");
      });
    });
  }

  /* ---------- Back to top ---------- */
  var btt = document.querySelector(".back-to-top");
  if (btt) {
    btt.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: window.__reducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Contact form: email (Web3Forms) + WhatsApp ---------- */
  var form = document.querySelector("[data-demo-form]");
  if (form) {
    var statusBox = form.querySelector(".form-success");
    var submitBtn = form.querySelector("button[type=submit]");

    function showStatus(text, isError) {
      if (!statusBox) return;
      statusBox.textContent = text;
      statusBox.classList.toggle("is-error", !!isError);
      statusBox.classList.add("show");
      statusBox.scrollIntoView({ behavior: window.__reducedMotion ? "auto" : "smooth", block: "center" });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.elements.botcheck && form.elements.botcheck.checked) return; /* spam bot */

      var fd = new FormData(form);
      var data = {
        name: (fd.get("name") || "").toString().trim(),
        email: (fd.get("email") || "").toString().trim(),
        phone: (fd.get("phone") || "").toString().trim(),
        topic: (fd.get("topic") || "General enquiry").toString().trim(),
        message: (fd.get("message") || "").toString().trim()
      };
      var key = (fd.get("access_key") || "").toString();
      var waNumber = form.getAttribute("data-whatsapp") || "917618248729";

      var lines = [
        "New enquiry - Ujjwal Construction",
        "Name: " + data.name,
        "Email: " + data.email,
        "Phone: " + data.phone,
        "Enquiry type: " + data.topic,
        "Message: " + data.message
      ];
      var waUrl = "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(lines.join("\n"));

      /* Open WhatsApp first, inside the click, so mobile browsers do not block it */
      window.open(waUrl, "_blank", "noopener");

      var fallbackText = "We could not send the email just now. Your WhatsApp message is ready - please tap Send there, or call us on +91 76182 48729.";

      if (!key || key.indexOf("YOUR_") === 0) {
        if (window.console) console.warn("Web3Forms access key is not set in contact.html");
        showStatus(fallbackText, true);
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      var payload = {
        access_key: key,
        subject: "New enquiry - Ujjwal Construction website",
        from_name: "Ujjwal Construction website",
        name: data.name,
        email: data.email,
        phone: data.phone,
        topic: data.topic,
        message: data.message
      };

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (json && json.success) {
            showStatus("Thank you - your enquiry has been emailed to our team. WhatsApp has also opened; please tap Send there so we can reply faster.", false);
            form.reset();
          } else {
            showStatus(fallbackText, true);
          }
        })
        .catch(function () { showStatus(fallbackText, true); })
        .then(function () { if (submitBtn) submitBtn.disabled = false; });
    });
  }

  /* ---------- Video placeholders ---------- */
  document.querySelectorAll(".play-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var url = btn.getAttribute("data-video");
      if (url) window.open(url, "_blank", "noopener");
    });
  });

  /* ---------- Footer year ---------- */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
