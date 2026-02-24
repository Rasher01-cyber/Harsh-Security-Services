document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const sections = Array.from(document.querySelectorAll(".section"));
  const nav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));

  const getHeaderOffset = () => (header ? header.offsetHeight + 14 : 100);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { threshold: 0.18 }
  );
  sections.forEach((section) => observer.observe(section));

  const setActiveNav = () => {
    const fromTop = window.scrollY + getHeaderOffset();
    let activeId = "home";

    for (const section of sections) {
      if (section.offsetTop <= fromTop) activeId = section.id;
    }

    navLinks.forEach((link) => {
      const id = link.getAttribute("href")?.slice(1);
      link.classList.toggle("is-active", id === activeId);
    });
  };

  const closeMenu = () => {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Smooth scroll with header offset
  document.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
    if (!target) return;
    const href = target.getAttribute("href");
    if (!href || href === "#") return;

    const el = document.querySelector(href);
    if (!(el instanceof HTMLElement)) return;

    e.preventDefault();
    closeMenu();

    const top = el.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
    window.scrollTo({ top, behavior: "smooth" });

    // If clicking enquiry buttons, focus the requirements textarea.
    if (href === "#requirements") {
      window.setTimeout(() => {
        const req = document.getElementById("requirements");
        if (req instanceof HTMLTextAreaElement) req.focus({ preventScroll: true });
      }, 450);
    }
  });

  // Industry sector pills -> append choices into the requirements textarea
  const sectorPills = Array.from(document.querySelectorAll(".sector-pill"));
  const requirementsField = document.getElementById("requirements");
  const selectedSectors = new Set();

  const updateRequirementsFromSectors = () => {
    if (!(requirementsField instanceof HTMLTextAreaElement)) return;

    let base = requirementsField.value;
    const marker = "Selected facilities:";
    const idx = base.indexOf(marker);

    if (idx !== -1) {
      base = base.slice(0, idx).trimEnd();
    } else {
      base = base.trimEnd();
    }

    const names = Array.from(selectedSectors);
    if (!names.length) {
      requirementsField.value = base;
      return;
    }

    const label = "Selected facilities: ";
    const prefix = base ? `${base}\n\n${label}` : label;
    requirementsField.value = `${prefix}${names.join(", ")}`;
  };

  if (sectorPills.length && requirementsField instanceof HTMLElement) {
    sectorPills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const name = pill.textContent ? pill.textContent.trim().replace(/\s+/g, " ") : "";
        if (!name) return;

        if (selectedSectors.has(name)) {
          selectedSectors.delete(name);
          pill.classList.remove("is-selected");
        } else {
          selectedSectors.add(name);
          pill.classList.add("is-selected");
        }

        updateRequirementsFromSectors();

        if (requirementsField instanceof HTMLTextAreaElement) {
          requirementsField.scrollIntoView({ behavior: "smooth", block: "center" });
          requirementsField.focus({ preventScroll: true });
        }
      });
    });
  }

  // Enquiry form implementation (mailto fallback + simple validation)
  const form = document.getElementById("enquiry-form");
  const status = document.getElementById("form-status");

  if (form instanceof HTMLFormElement) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const phone = String(fd.get("phone") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const location = String(fd.get("location") || "").trim();
      const requirements = String(fd.get("requirements") || "").trim();

      const errors = [];
      if (!name) errors.push("Enter your name.");
      if (!phone) errors.push("Enter your phone number.");
      if (!requirements) errors.push("Enter your requirements.");

      if (errors.length) {
        if (status) status.textContent = errors[0];
        return;
      }

      if (status) status.textContent = "Opening Gmail with your enquiry…";

      const subject = encodeURIComponent("Security Enquiry – Harsh Security Services");
      const body = encodeURIComponent(
        [
          `Name: ${name}`,
          `Phone: ${phone}`,
          `Email: ${email || "-"}`,
          `Location: ${location || "-"}`,
          "",
          "Requirements:",
          requirements,
        ].join("\n")
      );

      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=hrshscrtsrvcs@gmail.com&su=${subject}&body=${body}`;

      window.open(gmailUrl, "_blank", "noopener,noreferrer");
      form.reset();
      if (status) {
        status.textContent = "Gmail opened. Please review and send your enquiry.";
      }
    });
  }

  setActiveNav();
  window.addEventListener("scroll", setActiveNav, { passive: true });
});

