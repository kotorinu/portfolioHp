/* ============================================================
   Nagomi AI — app.js
   nav / scroll / FAQ / reveal / contact form / Tweaks
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll("#faqList .faq-item").forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    var ans = item.querySelector(".faq-a");
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll("#faqList .faq-item.open").forEach(function (o) {
        if (o !== item) {
          o.classList.remove("open");
          o.querySelector(".faq-a").style.maxHeight = null;
          o.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        }
      });
      if (isOpen) {
        item.classList.remove("open");
        ans.style.maxHeight = null;
        btn.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("open");
        ans.style.maxHeight = ans.scrollHeight + "px";
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Scroll reveal (robust: never leave content hidden) ---------- */
  var revealEls = [].slice.call(document.querySelectorAll(".reveal"));
  function revealAll() { revealEls.forEach(function (el) { el.classList.add("in"); }); }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });

    // Pass 1: reveal anything already in the viewport on load.
    function revealInView() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach(function (el) {
        if (el.classList.contains("in")) return;
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.96 && r.bottom > 0) { el.classList.add("in"); io.unobserve(el); }
      });
    }
    revealInView();
    window.addEventListener("load", revealInView);

    // Safety net: if the observer never fires (some embedded contexts),
    // guarantee everything is visible shortly after load.
    setTimeout(revealAll, 1200);
  } else {
    revealAll();
  }

  /* ---------- Contact form ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    var okMsg = document.getElementById("formOk");
    var badMsg = document.getElementById("formBad");
    var submit = document.getElementById("contactSubmit");

    function fieldValid(field) {
      var input = field.querySelector("input, textarea");
      if (!input) return true;
      var v = (input.value || "").trim();
      var ok = v.length > 0;
      if (ok && field.getAttribute("data-type") === "email") {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      }
      field.classList.toggle("invalid", !ok);
      return ok;
    }

    form.querySelectorAll(".field[data-required] input, .field[data-required] textarea").forEach(function (el) {
      el.addEventListener("input", function () {
        if (el.closest(".field").classList.contains("invalid")) fieldValid(el.closest(".field"));
      });
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      okMsg.classList.remove("show");
      badMsg.classList.remove("show");

      var fields = form.querySelectorAll(".field[data-required]");
      var allOk = true;
      fields.forEach(function (f) { if (!fieldValid(f)) allOk = false; });
      if (!allOk) {
        form.querySelector(".field.invalid input, .field.invalid textarea").focus();
        return;
      }

      var action = form.getAttribute("action") || "";
      var mail = "kotokoto.gaisya@gmail.com";

      submit.classList.add("is-sending");
      submit.disabled = true;

      if (!action || action.indexOf("REPLACE_WITH_GOOGLE_APPS_SCRIPT_WEB_APP_ID") !== -1) {
        submit.classList.remove("is-sending");
        submit.disabled = false;
        badMsg.querySelector("span").textContent =
          "フォーム連携の準備中です。送信できない場合は " + mail + " へ直接ご連絡ください。";
        badMsg.classList.add("show");
        return;
      }

      try {
        var data = new FormData(form);
        data.append("sourcePage", window.location.href);

        await fetch(action, {
          method: "POST",
          mode: "no-cors",
          body: data
        });
        submit.classList.remove("is-sending");
        submit.disabled = false;
        okMsg.querySelector("span").textContent =
          "お問い合わせありがとうございます。内容を確認してご返信します。";
        okMsg.classList.add("show");
        form.reset();
      } catch (err) {
        submit.classList.remove("is-sending");
        submit.disabled = false;
        badMsg.querySelector("span").textContent =
          "送信できない場合は " + mail + " へ直接ご連絡ください。";
        badMsg.classList.add("show");
      }
    });
  }

  /* ============================================================
     TWEAKS  — host protocol + live apply
     ============================================================ */
  var FONT_STACKS = {
    noto: '"Noto Sans JP", system-ui, sans-serif',
    zen: '"Zen Kaku Gothic New", "Noto Sans JP", system-ui, sans-serif',
    mplus: '"M PLUS 1", "Noto Sans JP", system-ui, sans-serif'
  };
  var FONT_HREF = {
    zen: "https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&display=swap",
    mplus: "https://fonts.googleapis.com/css2?family=M+PLUS+1:wght@400;500;700;800&display=swap"
  };
  var RADIUS = {
    sharp: { sm: "6px", r: "10px", lg: "14px" },
    default: { sm: "10px", r: "16px", lg: "24px" },
    round: { sm: "14px", r: "22px", lg: "32px" }
  };

  var state = Object.assign({}, (typeof TWEAK_DEFAULTS !== "undefined" ? TWEAK_DEFAULTS : {
    accent: "gradient", font: "noto", hero: "soft", radius: "default"
  }));

  function loadFont(key) {
    if (!FONT_HREF[key]) return;
    if (document.getElementById("font-" + key)) return;
    var l = document.createElement("link");
    l.id = "font-" + key;
    l.rel = "stylesheet";
    l.href = FONT_HREF[key];
    document.head.appendChild(l);
  }

  function apply(key, value) {
    if (key === "accent") {
      document.documentElement.setAttribute("data-accent", value);
    } else if (key === "font") {
      loadFont(value);
      document.documentElement.style.setProperty("--font", FONT_STACKS[value] || FONT_STACKS.noto);
      document.body.style.fontFamily = FONT_STACKS[value] || FONT_STACKS.noto;
    } else if (key === "hero") {
      var h = document.querySelector(".hero");
      if (h) h.style.setProperty("--hero-bg-display", value);
      var before = document.getElementById("heroPlainStyle");
      if (value === "plain") {
        if (!before) {
          var s = document.createElement("style");
          s.id = "heroPlainStyle";
          s.textContent = ".hero::before{display:none!important}";
          document.head.appendChild(s);
        }
      } else if (before) {
        before.remove();
      }
    } else if (key === "radius") {
      var r = RADIUS[value] || RADIUS.default;
      document.documentElement.style.setProperty("--r-sm", r.sm);
      document.documentElement.style.setProperty("--r", r.r);
      document.documentElement.style.setProperty("--r-lg", r.lg);
    }
  }

  function syncUI() {
    setActive("twAccent", "data-accent", state.accent);
    setActive("twFont", "data-font", state.font);
    setActive("twHero", "data-hero", state.hero);
    setActive("twRadius", "data-radius", state.radius);
  }
  function setActive(containerId, attr, value) {
    var c = document.getElementById(containerId);
    if (!c) return;
    c.querySelectorAll("button").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute(attr) === value);
    });
  }

  // Apply initial state
  Object.keys(state).forEach(function (k) { apply(k, state[k]); });
  syncUI();

  function set(key, value) {
    state[key] = value;
    apply(key, value);
    syncUI();
    try {
      var edits = {};
      edits[key] = value;
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits: edits }, "*");
    } catch (e) {}
  }

  function bind(containerId, attr, key) {
    var c = document.getElementById(containerId);
    if (!c) return;
    c.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () { set(key, b.getAttribute(attr)); });
    });
  }
  bind("twAccent", "data-accent", "accent");
  bind("twFont", "data-font", "font");
  bind("twHero", "data-hero", "hero");
  bind("twRadius", "data-radius", "radius");

  // ----- Host protocol: listener BEFORE announce -----
  var panel = document.getElementById("tweaks");
  var closeBtn = document.getElementById("twClose");

  window.addEventListener("message", function (e) {
    var d = e.data || {};
    if (d.type === "__activate_edit_mode") {
      if (panel) panel.classList.add("show");
    } else if (d.type === "__deactivate_edit_mode") {
      if (panel) panel.classList.remove("show");
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      if (panel) panel.classList.remove("show");
      try { window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*"); } catch (e) {}
    });
  }

  try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch (e) {}
})();
