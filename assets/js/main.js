/*==============================================================
  Ijas Ahammed M — Portfolio scripts
==============================================================*/

/* ---------- Global actions (used by onclick handlers) ---------- */
function download() {
  Swal.fire({
    title: "Download my CV?",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Download",
    denyButtonText: "View"
  }).then((result) => {
    if (result.isConfirmed) {
      const a = document.createElement("a");
      a.href = "assets/cv/IJAS.pdf";
      a.download = "IJAS_AHAMMED_M_CV.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else if (result.isDenied) {
      window.open("assets/cv/IJAS.pdf", "_blank");
    }
  });
}

function contact() {
  const whatsappNumber = "971521233005";
  const message = encodeURIComponent("Hello!");
  window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
}

function validation() {
  const email = document.getElementById("email").value.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (emailRegex.test(email)) return true;
  Swal.fire({ title: "Please enter a valid email address", icon: "info", confirmButtonText: "Close" });
  return false;
}

function sendmail() {
  const mail = $("#email").val().trim();
  const name = $("#name").val().trim();
  const sub = $("#subject").val().trim();
  const message = $("#message").val().trim();

  if (!mail || !name || !sub || !message) {
    Swal.fire({ title: "Please fill in all fields", icon: "info", confirmButtonText: "Close" });
    return false;
  }
  if (!validation()) return false;

  $.ajax({
    type: "POST",
    contentType: "application/json; charset=utf-8",
    url: "Index.aspx/sendmail",
    data: JSON.stringify({ email: mail, name: name, subject: sub, message: message }),
    dataType: "json",
    success: () => {
      Swal.fire({ title: "Message sent", text: "Thanks, I'll get back to you soon.", icon: "success", confirmButtonText: "Close" });
      $("#name, #email, #subject, #message").val("");
    },
    error: (xhr, status, error) => {
      console.error(xhr, status, error);
      Swal.fire({ title: "Couldn't send the message", text: "Please email or WhatsApp me directly.", icon: "error", confirmButtonText: "Close" });
    }
  });
  return false;
}

/* ---------- Page behaviour ---------- */
(function () {
  "use strict";

  const $1 = (s, r = document) => r.querySelector(s);
  const $all = (s, r = document) => [...r.querySelectorAll(s)];
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const yearEl = $1("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Count-up */
  const countUp = (el) => {
    const target = +el.dataset.count;
    if (reduceMotion) { el.textContent = target; return; }
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 1400, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* Reveal on scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in-view");
      if (entry.target.matches(".count")) countUp(entry.target);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });

  $all(".tile").forEach((t, i) => t.style.setProperty("--i", i));

  /* Preloader -> start hero animation */
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    const pre = $1("#preloader");
    if (pre) {
      pre.classList.add("done");
      setTimeout(() => pre.remove(), 700);
    }
    body.classList.add("ready");
    $all(".reveal, .sec-head, .tiles, .count").forEach((el) => io.observe(el));
  };
  window.addEventListener("load", () => setTimeout(start, 300));
  setTimeout(start, 3500); // safety net if something is slow to load

  /* Header state, active link, back-to-top */
  const header = $1("#header");
  const toTop = $1(".to-top");
  const links = $all(".nav-link");
  const sections = links.map((l) => $1(l.getAttribute("href"))).filter(Boolean);

  /* About statement: words light up as you scroll */
  const statement = $1("[data-words]");
  let words = [];
  if (statement) {
    const highlight = new Set([".NET", "Developer", "deadline,", "shipped."]);
    const parts = statement.textContent.trim().split(/\s+/);
    statement.textContent = "";
    parts.forEach((w, i) => {
      const span = document.createElement("span");
      span.className = "w" + (highlight.has(w) ? " hl" : "");
      span.textContent = w;
      statement.appendChild(span);
      if (i < parts.length - 1) statement.appendChild(document.createTextNode(" "));
    });
    words = $all(".w", statement);
  }

  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 30);
    toTop.classList.toggle("show", y > 500);

    const mark = y + window.innerHeight * 0.4;
    let current = sections[0];
    sections.forEach((s) => { if (s.offsetTop <= mark) current = s; });
    links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + current.id));

    if (statement) {
      const r = statement.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.3), 0), 1);
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("on", i < lit));
    }
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();

  /* Mobile menu */
  const toggle = $1("#menuToggle");
  const setMenu = (open) => {
    body.classList.toggle("menu-open", open);
    body.classList.toggle("locked", open);
    toggle.setAttribute("aria-expanded", String(open));
  };
  toggle.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
  links.forEach((l) => l.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* Auto-update: if a newer version is published, refresh open pages.
     Checks when the tab comes back into view and every 3 minutes. */
  const versionMeta = $1('meta[name="site-version"]');
  if (versionMeta && location.protocol.startsWith("http")) {
    const current = versionMeta.content;
    const formHasText = () => $all(".contact-form input, .contact-form textarea").some((f) => f.value.trim());
    const checkVersion = async () => {
      try {
        const res = await fetch("version.json?t=" + Date.now(), { cache: "no-store" });
        if (!res.ok) return;
        const { version } = await res.json();
        if (!version || version === current) return;
        if (!formHasText()) {
          location.reload();
        } else if (!$1(".update-toast")) {
          const toast = document.createElement("button");
          toast.type = "button";
          toast.className = "update-toast";
          toast.innerHTML = '<i class="bi bi-arrow-clockwise"></i> New version available — tap to refresh';
          toast.addEventListener("click", () => location.reload());
          body.appendChild(toast);
        }
      } catch (err) { /* offline: try again later */ }
    };
    document.addEventListener("visibilitychange", () => { if (!document.hidden) checkVersion(); });
    setInterval(checkVersion, 3 * 60 * 1000);
  }

  /* Copy email */
  const copyBtn = $1("#copyMail");
  if (copyBtn) {
    const hint = $1(".copy-hint", copyBtn);
    copyBtn.addEventListener("click", async () => {
      const mail = copyBtn.dataset.mail;
      try {
        await navigator.clipboard.writeText(mail);
        hint.textContent = "Copied ✓";
        setTimeout(() => { hint.textContent = "Copy"; }, 2000);
      } catch (err) {
        window.location.href = "mailto:" + mail;
      }
    });
  }
})();
