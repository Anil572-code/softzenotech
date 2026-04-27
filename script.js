/*
  JAVASCRIPT FILE GUIDE — Softzeno Tech Website
  ------------------------------------------------------------
  This file controls small interactive behavior only.
  It does not require a framework.

  Main features:
  1. Theme toggle:
     - Switches between light and dark mode.
     - Saves preference in localStorage.
  2. Mobile navigation:
     - Opens/closes the mobile menu.
     - Updates aria-expanded for accessibility.
  3. Scroll reveal:
     - Reveals sections/cards when they enter the viewport.
  4. Currency switch:
     - Changes pricing and budget dropdown labels between USD and NPR.
  5. Contact form:
     - Builds a mailto message from form values.
     - Provides WhatsApp fallback if email app does not open.
  6. Page transition:
     - Adds a small fade between internal pages.

  Editing tip:
  - Keep each feature inside its own (() => { ... }) block.
  - Avoid global variables unless the feature needs to share state.
*/


'use strict';

(() => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  const menuToggle = $('.menu-toggle');
  const navLinks = $('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });

    $$('.nav-links a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const themeToggle = $('.theme-toggle');
  const themeIcon = $('.theme-icon');

  function applyTheme(theme) {
    const dark = theme === 'dark';
    document.body.classList.toggle('dark-theme', dark);
    if (themeIcon) themeIcon.textContent = dark ? '☀' : '☾';
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      themeToggle.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
    }
    localStorage.setItem('softzeno-theme', theme);

    document.querySelectorAll('.theme-sensitive').forEach((img) => {
      const lightSrc = img.getAttribute('data-light-src');
      const darkSrc = img.getAttribute('data-dark-src');
      if (!lightSrc || !darkSrc) return;
      img.setAttribute('src', dark ? darkSrc : lightSrc);
    });
  }

  const savedTheme = localStorage.getItem('softzeno-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      applyTheme(document.body.classList.contains('dark-theme') ? 'light' : 'dark');
    });
  }

  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('in'));
  }

  const form = $('#contactForm');
  const status = $('#formStatus');

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        if (status) status.textContent = 'Please fill all required fields correctly.';
        return;
      }

      const name = document.getElementById('name')?.value || '';
      const email = document.getElementById('email')?.value || '';
      const service = document.getElementById('service')?.value || '';
      const budget = document.getElementById('budget')?.value || '';
      const message = document.getElementById('message')?.value || '';

      const bodyText =
        `Name: ${name}
Email: ${email}
Service: ${service}
Budget: ${budget}

Project Details:
${message}`;

      const subject = encodeURIComponent('New Project Inquiry - Softzeno Tech');
      const body = encodeURIComponent(bodyText);

      if (status) status.textContent = 'Opening your email app…';
      window.location.href = `mailto:softzenotech@gmail.com?subject=${subject}&body=${body}`;

      setTimeout(() => {
        if (status) status.innerHTML = 'Email app not opened? <a href="https://wa.me/9779865354410?text=' + body + '">Send the same inquiry on WhatsApp</a>.';
      }, 900);
    });
  }
})();


// PRICING CURRENCY SWITCH: updates package prices between USD and NPR.
(() => {
  const buttons = Array.from(document.querySelectorAll('.currency-btn'));
  const prices = Array.from(document.querySelectorAll('.price'));
  if (!buttons.length || !prices.length) return;

  const setCurrency = (currency) => {
    buttons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.currency === currency);
      btn.setAttribute('aria-pressed', String(btn.dataset.currency === currency));
    });

    prices.forEach((price) => {
      const value = price.dataset[currency];
      if (value) price.textContent = value;
    });

    localStorage.setItem('softzeno-currency', currency);
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => setCurrency(btn.dataset.currency));
  });

  const savedCurrency = localStorage.getItem('softzeno-currency') || 'usd';
  setCurrency(savedCurrency);
})();

// --- final integrated hero tabs + budget currency ---
(() => {
  const data = {
    websites: {
      title: "Restaurant websites with premium clarity.",
      text: "From menu flow to mobile-first customer experience.",
      logo: "assets/images/projects/akbare-restro.png",
      logoAlt: "Akbare Restro logo",
      label: "Akbare Restro",
      metricOneValue: "Premium",
      metricOneLabel: "Restaurant website",
      metricTwoValue: "Mobile",
      metricTwoLabel: "Menu-first layout",
      highlightTitle: "Website + Menu + CTA Flow",
      highlightText: "A clean restaurant experience designed to help customers explore and take action."
    },
    marketing: {
      title: "Marketing that makes your brand easier to notice.",
      text: "From campaign direction to social creatives and lead-focused messaging.",
      logo: "assets/images/brand-icon.png",
      logoAlt: "Softzeno Tech logo",
      label: "Marketing Flow",
      metricOneValue: "3x",
      metricOneLabel: "Better creative direction",
      metricTwoValue: "60+",
      metricTwoLabel: "Content ideas",
      highlightTitle: "Ads + Content + Lead Strategy",
      highlightText: "Clear campaigns and visuals built to improve reach, trust and enquiries."
    },
    systems: {
      title: "Business systems that simplify operations.",
      text: "From POS workflows to QR menus and automation-ready business systems.",
      logo: "assets/images/logo.png",
      logoAlt: "Softzeno Tech logo",
      label: "Softzeno OS",
      metricOneValue: "Fast",
      metricOneLabel: "Billing workflow",
      metricTwoValue: "Live",
      metricTwoLabel: "Reports & tracking",
      highlightTitle: "POS + QR + Automation",
      highlightText: "Operational systems designed for modern restaurants and growing businesses."
    }
  };

  const card = document.getElementById("heroShowcaseCard");
  const tabs = Array.from(document.querySelectorAll(".hero-tab"));
  if (!card || !tabs.length) return;

  const title = document.getElementById("heroCardTitle");
  const text = document.getElementById("heroCardText");
  const logo = document.getElementById("heroCardLogo");
  const label = document.getElementById("heroCardLabel");
  const metricOneValue = document.getElementById("metricOneValue");
  const metricOneLabel = document.getElementById("metricOneLabel");
  const metricTwoValue = document.getElementById("metricTwoValue");
  const metricTwoLabel = document.getElementById("metricTwoLabel");
  const highlightTitle = document.getElementById("heroHighlightTitle");
  const highlightText = document.getElementById("heroHighlightText");

  const setTab = (key) => {
    const item = data[key];
    if (!item) return;

    card.classList.remove("hero-tab-fade");
    void card.offsetWidth;
    card.classList.add("hero-tab-fade");

    title.textContent = item.title;
    text.textContent = item.text;
    logo.src = item.logo;
    logo.alt = item.logoAlt;
    label.textContent = item.label;
    metricOneValue.textContent = item.metricOneValue;
    metricOneLabel.textContent = item.metricOneLabel;
    metricTwoValue.textContent = item.metricTwoValue;
    metricTwoLabel.textContent = item.metricTwoLabel;
    highlightTitle.textContent = item.highlightTitle;
    highlightText.textContent = item.highlightText;

    tabs.forEach((tab) => {
      const active = tab.dataset.tab === key;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => setTab(tab.dataset.tab));
  });

  setTab("websites");
})();

// CONTACT BUDGET CURRENCY SWITCH: updates the budget dropdown labels.
(() => {
  const buttons = Array.from(document.querySelectorAll(".budget-currency-btn"));
  const budget = document.getElementById("budget");
  if (!buttons.length || !budget) return;

  const setBudgetCurrency = (currency) => {
    buttons.forEach((button) => {
      const active = button.dataset.budgetCurrency === currency;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    const selectedIndex = budget.selectedIndex;
    budget.dataset.currency = currency;

    Array.from(budget.options).forEach((option) => {
      const text = option.dataset[currency];
      if (text) option.textContent = text;
    });

    budget.selectedIndex = selectedIndex;
    localStorage.setItem("softzeno-budget-currency", currency);
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => setBudgetCurrency(button.dataset.budgetCurrency));
  });

  setBudgetCurrency(localStorage.getItem("softzeno-budget-currency") || "usd");
})();


// --- smooth page transitions ---
// PAGE TRANSITION: adds a short fade when moving between internal pages.
(() => {
  document.documentElement.classList.add('page-ready');

  window.addEventListener('pageshow', () => {
    document.body.classList.remove('page-leaving');
  });

  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('https://wa.me') || link.target === '_blank') return;

    link.addEventListener('click', (event) => {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      event.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(() => {
        window.location.href = url.href;
      }, 180);
    });
  });
})();


// DARK ONLY LOCK
// Softzeno Tech is currently published as a dark-only premium website.
// This forces dark mode and disables theme-switching behavior.
(() => {
  document.documentElement.setAttribute('data-theme', 'dark');
  document.body.classList.add('dark-theme');
  localStorage.setItem('softzeno-theme', 'dark');

  document.querySelectorAll('.theme-toggle').forEach((button) => {
    button.setAttribute('hidden', 'true');
    button.setAttribute('aria-hidden', 'true');
  });
})();
