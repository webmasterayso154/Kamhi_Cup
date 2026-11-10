/**
 * ============================================================================
 * FILE: js/app.js
 * PROJECT: 2026 1st Annual Cypress Kamhi Cup All-Star Invitational
 *          AYSO Region 154 Cypress
 * ----------------------------------------------------------------------------
 * 1. KAMHI_CUP_DATA - every fact shown on the page. Sourced from the official
 *                     PDFs in ./docs/. Edit here; the page re-renders from it.
 * 2. KAMHI_DOCS     - the official downloads.
 * 3. App            - small, dependency-free rendering + countdown + nav.
 *
 * Optional: set KAMHI_CUP_DATA.source.endpoint to an Apps Script / Google
 * Sheet JSON URL. Any top-level keys it returns replace the bundled data.
 * ============================================================================
 */

/* ==========================================================================
   1. TOURNAMENT DATA
   ========================================================================== */
const KAMHI_CUP_DATA = {
  source: { endpoint: "" },

  tournament: {
    title: "The Kamhi Cup 2026",
    fullName: "2026 1st Annual Cypress Kamhi Cup All-Star Invitational",
    host: "AYSO Region 154 Cypress",
    timeZone: "America/Los_Angeles",
    startsAt: "2026-12-12T00:00:00-08:00",   // kickoff time TBD; countdown runs to Saturday
    endsAt: "2026-12-13T18:00:00-08:00",
    lastUpdated: "2026-11-10"
  },

  registration: {
    status: "open",                           // "open" | "closed"
    rsvpUrl: "https://docs.google.com/forms/d/e/1FAIpQLSepSrYrav5oJeieJrlPkTBBe2OT1oFQxnCTUNWbiBb9-2yCLA/viewform",
    email: "tournamentayso154@gmail.com"
  },

  /** Key dates. `date` is YYYY-MM-DD; `dateEnd` for ranges; `approx` prefixes "~". */
  dates: [
    { label: "Registration open",        date: "2026-11-10", openNow: true },
    { label: "Full-refund cutoff",       date: "2026-11-15" },
    { label: "Application deadline",     date: "2026-11-30" },
    { label: "Schedules released",       date: "2026-12-05", approx: true },
    { label: "Tournament weekend",       date: "2026-12-12", dateEnd: "2026-12-13", highlight: true },
    { label: "Rainout dates",            date: "2026-12-19", dateEnd: "2026-12-20" }
  ],

  /** How to register. `docs` are KAMHI_DOCS ids; `action` is "rsvp" | "email". */
  steps: [
    { title: "Submit the online RSVP form", text: "This starts your application.", action: "rsvp" },
    { title: "Complete the Team Application", text: "Signed by your Head Coach and Regional Commissioner.", docs: ["team-app"] },
    { title: "Prepare your roster", text: "Signed by your Regional Commissioner (Sports Connect roster accepted). Add a Guest Player Form for any guests.", docs: ["guest"] },
    { title: "Pay the $750 entry fee online", text: "Payment details are in the Team Application." },
    { title: "Email your application & roster", text: "Applications are accepted first-come. Teams are notified within 48 hours.", action: "email" }
  ],

  /** Headline tournament parameters. */
  structure: [
    { icon: "calendar", label: "Format", value: "3 games guaranteed", text: "Pool play on Saturday. Top teams advance to the Sunday medal rounds." },
    { icon: "card", label: "Entry fee", value: "$750 per team", text: "Payable online. Full refund if you withdraw by Nov 15, 2026." },
    { icon: "users", label: "Guest players", value: "Up to 3 per team", text: "Must be registered Fall 2026 AYSO players, approved on the Guest Player Form." },
    { icon: "trophy", label: "Awards", value: "1st–4th place medals", text: "For all qualifying flights, plus tournament swag for players and 2 coaches per team." }
  ],

  /** Divisions (Boys & Girls). */
  divisions: [
    { age: "U14", format: "11v11", maxPlayers: 15, gameMins: 60, halfMins: 30 },
    { age: "U12", format: "9v9",   maxPlayers: 12, gameMins: 50, halfMins: 25 },
    { age: "U10", format: "7v7",   maxPlayers: 10, gameMins: 40, halfMins: 20 }
  ],

  /**
   * Board operations panels. `status` shows as a pill.
   * `items` render as a bullet list; `emphasis` items are highlighted in red.
   */
  board: [
    {
      id: "schedules", icon: "calendar", title: "Match Schedules & Brackets", status: "Coming Early December",
      text: "Game schedules and bracket assignments will be released following the November 30 registration cutoff."
    },
    {
      id: "fields", icon: "pin", title: "Fields & Venue Guidelines", status: "Map Coming Soon",
      text: "Lexington Junior High School & Lexington Park, Cypress, CA. The field layout and parking map will be posted here.",
      items: [
        { text: "STRICTLY NO PETS ALLOWED ON PREMISES", emphasis: true },
        { text: "NO SMOKING OR VAPING", emphasis: true },
        { text: "Check in 1 hour before your first game on Saturday. The check-in location will be emailed within 1 week of the tournament." },
        { text: "Please clean up all trash in your team area before leaving." }
      ],
      mapPlaceholder: true
    },
    {
      id: "concessions", icon: "food", title: "Concessions & Event Merchandise", status: "TBD",
      text: "Food truck lineups, snack bar hours, and commemorative shirt sales to be announced."
    }
  ],

  sponsor: {
    title: "Sponsor the Kamhi Cup",
    text: "The Kamhi Cup is a Region 154 fundraiser supporting the development of soccer fields in the City of Cypress.",
    href: "mailto:tournamentayso154@gmail.com?subject=Kamhi%20Cup%20Sponsorship%20Inquiry"
  },

  contacts: [
    { role: "Tournament Director", email: "tournamentayso154@gmail.com" },
    { role: "Webmaster & Tech Ops", email: "webmasterayso154@gmail.com" }
  ],
  mailingAddress: ["AYSO Region 154", "ATTN: Cypress Kamhi Cup", "PO Box 999", "Cypress, California 90630"]
};

/* ==========================================================================
   2. OFFICIAL DOWNLOADS (./docs/)
   ========================================================================== */
const KAMHI_DOCS_BASE = "./docs/";

const KAMHI_DOCS = [
  { id: "invitation", title: "Tournament Invitation & Overview",    desc: "Dates, divisions, format, fees, refunds, and awards.",               file: "kamhi cup invitation application 2026.pdf", size: "414 KB" },
  { id: "team-app",   title: "Official Team Application Form",      desc: "Instructions and the form for your Head Coach and RC to sign.",       file: "kamhi cup team application 2026.pdf",       size: "409 KB" },
  { id: "rules",      title: "Official Tournament Rules & Scoring", desc: "Eligibility, game lengths, standings points, tiebreakers, conduct.", file: "kamhi cup rules 2026.pdf",                  size: "164 KB" },
  { id: "guest",      title: "Guest Player Approval Form",          desc: "Up to 3 guests, approved by both Regional Commissioners.",           file: "guest_player_form 2026.pdf",                size: "121 KB" }
];

/* ==========================================================================
   3. APP
   ========================================================================== */
(() => {
  "use strict";

  const DATA = KAMHI_CUP_DATA;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const esc = (v) =>
    String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const fmt = (date, opts) => new Intl.DateTimeFormat("en-US", { timeZone: DATA.tournament.timeZone, ...opts }).format(date);

  /* ---------- Icons ---------- */
  const svg = (body, size = 20, sw = 2) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const ICONS = {
    calendar: svg('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
    card: svg('<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/>'),
    users: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>'),
    trophy: svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/>'),
    pin: svg('<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>'),
    food: svg('<path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-2 2-3 4.5-3 7h3v11"/>'),
    star: svg('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>'),
    mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>', 18),
    download: svg('<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>', 18, 2.2),
    view: svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', 18),
    external: svg('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>', 16, 2.2),
    chevron: svg('<path d="M6 9l6 6 6-6"/>', 22, 2.5),
    ball: svg('<circle cx="12" cy="12" r="9"/><path d="m12 7 4 3-1.5 4.5h-5L8 10zM12 7V3.5M16 10l3.5-1.5M14.5 14.5l2 3.5M9.5 14.5l-2 3.5M8 10 4.5 8.5"/>'),
    ban: svg('<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>', 18)
  };

  /* ---------- Docs ---------- */
  // Encode each path segment so spaces become %20 (e.g. ./docs/kamhi%20cup%20rules%202026.pdf).
  const docUrl = (file) => "./" + KAMHI_DOCS_BASE.replace(/^\.\//, "").split("/").filter(Boolean).concat(file).map(encodeURIComponent).join("/");
  const docExt = (file) => (file.split(".").pop() || "").toUpperCase();
  const docById = (id) => KAMHI_DOCS.find((d) => d.id === id);

  /* ---------- Dates ---------- */
  const parseDay = (ymd) => new Date(`${ymd}T12:00:00-08:00`);
  const todayNoon = () => {
    const [m, d, y] = fmt(new Date(), { year: "numeric", month: "2-digit", day: "2-digit" }).split("/");
    return new Date(`${y}-${m}-${d}T12:00:00-08:00`);
  };
  const daysUntil = (ymd) => Math.round((parseDay(ymd) - todayNoon()) / 86400000);
  const fmtShort = (ymd) => fmt(parseDay(ymd), { month: "short", day: "numeric" });
  const fmtRange = (d) => {
    if (!d.date) return "TBD";
    if (!d.dateEnd) return `${d.approx ? "~" : ""}${fmtShort(d.date)}`;
    const same = d.date.slice(0, 7) === d.dateEnd.slice(0, 7);
    return `${fmtShort(d.date)}–${same ? Number(d.dateEnd.slice(8)) : fmtShort(d.dateEnd)}`;
  };
  const whenText = (d) => {
    if (!d.date) return "Date TBD";
    const n = daysUntil(d.date);
    const end = daysUntil(d.dateEnd || d.date);
    if (d.openNow && n <= 0) return "Open now";
    if (end < 0) return "Passed";
    if (n <= 0) return "Today";
    if (n === 1) return "Tomorrow";
    return `${d.approx ? "About " : "In "}${n} days`;
  };

  /* ==========================================================================
     RENDERERS
     ========================================================================== */
  function renderHeroLinks() {
    const r = DATA.registration;
    $$("[data-rsvp]").forEach((a) => {
      a.href = r.rsvpUrl;
      a.target = "_blank";
      a.rel = "noopener";
    });
    const badge = $("#status-badge");
    const closed = r.status === "closed";
    badge.dataset.state = closed ? "closed" : "open";
    $(".status-badge__text", badge).textContent = closed ? "Registration Closed" : "Registration Open";
  }

  function renderDates() {
    $("#dates-list").innerHTML = DATA.dates
      .map((d) => {
        const end = d.date ? daysUntil(d.dateEnd || d.date) : null;
        const cls = !d.date ? "is-tbd" : d.openNow && daysUntil(d.date) <= 0 ? "is-open" : end < 0 ? "is-past" : "";
        return `<li class="timeline__item ${cls}${d.highlight ? " is-highlight" : ""}">
          <span class="timeline__date">${esc(fmtRange(d))}</span>
          <span class="timeline__label">${esc(d.label)}</span>
          <span class="timeline__when">${esc(whenText(d))}</span>
        </li>`;
      })
      .join("");
  }

  function docChip(d) {
    return `<a class="doc-chip" href="${esc(docUrl(d.file))}" download>
      <span class="file-badge file-badge--sm">${esc(docExt(d.file))}</span>
      <span class="doc-chip__title">${esc(d.title)}</span>${ICONS.download}
    </a>`;
  }

  function stepAction(s) {
    const r = DATA.registration;
    if (r.status === "closed" && s.action) return "";
    if (s.action === "rsvp") {
      return `<a class="btn btn--red btn--block" href="${esc(r.rsvpUrl)}" target="_blank" rel="noopener">${ICONS.ball}<span>Open the RSVP form</span>${ICONS.external}</a>`;
    }
    if (s.action === "email") {
      const subject = encodeURIComponent("Kamhi Cup 2026 Team Application");
      const body = encodeURIComponent("Team name:\nRegion #:\nDivision (U10 / U12 / U14, Boys / Girls):\nHead Coach:\n\nAttached:\n- Signed Team Application\n- RC-signed roster\n- Guest Player Forms (if any)\n");
      return `<a class="btn btn--block" href="mailto:${esc(r.email)}?subject=${subject}&body=${body}">${ICONS.mail}<span>Email ${esc(r.email)}</span></a>`;
    }
    return "";
  }

  function renderSteps() {
    $("#steps-list").innerHTML = DATA.steps
      .map((s, i) => {
        const docs = (s.docs || []).map(docById).filter(Boolean);
        return `<li class="step">
          <span class="step__num" aria-hidden="true">${i + 1}</span>
          <div class="step__body">
            <h3 class="step__title">${esc(s.title)}</h3>
            ${s.text ? `<p class="step__text">${esc(s.text)}</p>` : ""}
            ${docs.length ? `<div class="doc-chips">${docs.map(docChip).join("")}</div>` : ""}
            ${stepAction(s)}
          </div>
        </li>`;
      })
      .join("");
  }

  function renderStructure() {
    $("#structure-grid").innerHTML = DATA.structure
      .map(
        (f) => `<article class="card fact">
          <span class="fact__icon">${ICONS[f.icon] || ""}</span>
          <div>
            <div class="fact__label">${esc(f.label)}</div>
            <div class="fact__value">${esc(f.value)}</div>
            <p class="fact__text">${esc(f.text)}</p>
          </div>
        </article>`
      )
      .join("");

    $("#division-grid").innerHTML = DATA.divisions
      .map(
        (d) => `<article class="card division">
          <div class="division__head">
            <span class="division__age">${esc(d.age)}</span>
            <span class="division__sub">Boys &amp; Girls</span>
          </div>
          <dl class="division__facts">
            <div><dt>Format</dt><dd>${esc(d.format)}</dd></div>
            <div><dt>Roster</dt><dd>Max ${esc(d.maxPlayers)}</dd></div>
            <div><dt>Games</dt><dd>${esc(d.gameMins)} min</dd></div>
            <div><dt>Halves</dt><dd>${esc(d.halfMins)} min</dd></div>
          </dl>
        </article>`
      )
      .join("");
  }

  function renderDocs() {
    $("#doc-grid").innerHTML = KAMHI_DOCS.map((d) => {
      const href = esc(docUrl(d.file));
      const ext = esc(docExt(d.file));
      return `<article class="card doc">
        <div class="doc__top">
          <span class="file-badge" aria-hidden="true">${ext}</span>
          <div class="doc__info">
            <h3 class="doc__title">${esc(d.title)}</h3>
            <p class="doc__desc">${esc(d.desc)}</p>
            <p class="doc__meta">${ext} &middot; ${esc(d.size)}</p>
          </div>
        </div>
        <div class="doc__actions">
          <a class="btn btn--navy" href="${href}" download aria-label="Download ${esc(d.title)} (${ext}, ${esc(d.size)})">${ICONS.download}<span>Download</span></a>
          <a class="btn" href="${href}" target="_blank" rel="noopener" aria-label="View ${esc(d.title)} in a new tab">${ICONS.view}<span>View</span></a>
        </div>
      </article>`;
    }).join("");
  }

  function renderBoard() {
    const panels = DATA.board
      .map((b, i) => {
        const items = (b.items || [])
          .map((it) => `<li class="${it.emphasis ? "is-emphasis" : ""}">${it.emphasis ? ICONS.ban : ""}<span>${esc(it.text)}</span></li>`)
          .join("");
        return `<details class="card panel"${i === 0 ? " open" : ""}>
          <summary class="panel__summary">
            <span class="panel__icon">${ICONS[b.icon] || ""}</span>
            <span class="panel__title">${esc(b.title)}</span>
            <span class="pill pill--soon">${esc(b.status)}</span>
            <span class="panel__chev">${ICONS.chevron}</span>
          </summary>
          <div class="panel__body">
            <p>${esc(b.text)}</p>
            ${items ? `<ul class="rule-list">${items}</ul>` : ""}
            ${b.mapPlaceholder ? `<div class="map-placeholder" role="img" aria-label="Field map coming soon">${ICONS.pin}<span>Lexington Junior High &amp; Lexington Park field map coming soon</span></div>` : ""}
          </div>
        </details>`;
      })
      .join("");

    const s = DATA.sponsor;
    const sponsor = `<article class="card sponsor">
      <span class="panel__icon panel__icon--gold">${ICONS.star}</span>
      <div class="sponsor__body">
        <h3 class="sponsor__title">${esc(s.title)}</h3>
        <p class="sponsor__text">${esc(s.text)}</p>
      </div>
      <a class="btn btn--gold" href="${esc(s.href)}">${ICONS.mail}<span>Sponsorship Inquiry</span></a>
    </article>`;

    $("#board-list").innerHTML = panels + sponsor;
  }

  function renderContacts() {
    const people = DATA.contacts
      .map(
        (c) => `<li class="card contact">
          <div><div class="contact__role">${esc(c.role)}</div><div class="contact__detail">${esc(c.email)}</div></div>
          <a class="btn" href="mailto:${esc(c.email)}" aria-label="Email the ${esc(c.role)}">${ICONS.mail}<span>Email</span></a>
        </li>`
      )
      .join("");
    const mail = DATA.mailingAddress
      ? `<li class="card contact"><div><div class="contact__role">Mailing address</div><address class="contact__detail">${DATA.mailingAddress.map(esc).join("<br>")}</address></div></li>`
      : "";
    $("#contact-list").innerHTML = people + mail;
    $("#updated").textContent = DATA.tournament.lastUpdated;
  }

  /* ---------- Countdown ---------- */
  function tickCountdown() {
    const el = $("#countdown");
    const diff = new Date(DATA.tournament.startsAt) - new Date();
    if (diff <= 0) {
      el.hidden = true;
      return;
    }
    const s = Math.floor(diff / 1000);
    const parts = { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), mins: Math.floor((s % 3600) / 60), secs: s % 60 };
    Object.entries(parts).forEach(([k, v]) => {
      $(`[data-unit="${k}"]`, el).textContent = String(v).padStart(2, "0");
    });
    el.hidden = false;
    setTimeout(tickCountdown, 1000);
  }

  /* ---------- Sticky bar + scroll-spy ---------- */
  function syncStickyHeight() {
    const bar = $("#sticky-bar");
    if (bar) document.documentElement.style.setProperty("--sticky-h", `${bar.offsetHeight}px`);
  }

  function initScrollSpy() {
    const links = $$(".tabs__link, .fab__link");
    if (!("IntersectionObserver" in window)) return;
    const sections = [...new Set(links.map((l) => l.getAttribute("href")))].map((h) => $(h)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          links.forEach((l) => {
            const on = l.getAttribute("href") === `#${e.target.id}`;
            l.classList.toggle("is-active", on);
            if (on) l.setAttribute("aria-current", "true");
            else l.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    sections.forEach((s) => io.observe(s));
  }

  /* ---------- Optional remote data ---------- */
  async function syncRemote() {
    if (!DATA.source.endpoint) return;
    try {
      const res = await fetch(DATA.source.endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const remote = await res.json();
      Object.keys(remote).forEach((k) => {
        if (k in DATA) DATA[k] = remote[k];
      });
      renderAll();
    } catch (err) {
      console.warn("[Kamhi Cup] Remote data sync failed; showing bundled data.", err);
    }
  }

  /* ---------- Init ---------- */
  function renderAll() {
    renderHeroLinks();
    renderDates();
    renderSteps();
    renderStructure();
    renderDocs();
    renderBoard();
    renderContacts();
  }

  renderAll();
  tickCountdown();
  syncStickyHeight();
  initScrollSpy();
  window.addEventListener("resize", syncStickyHeight);
  syncRemote();
})();
