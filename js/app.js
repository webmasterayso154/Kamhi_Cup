/**
 * ============================================================================
 * FILE: js/app.js
 * PROJECT: Kamhi Cup 2026 All-Stars Tournament Hub | AYSO Region 154 Cypress
 * ----------------------------------------------------------------------------
 * 1. KAMHI_CUP_DATA  - all mock schedule / standings / division metadata.
 *                      Kept as plain JSON-compatible data so it can be swapped
 *                      for a Google Sheet / Apps Script endpoint (see
 *                      KAMHI_CUP_DATA.source.endpoint).
 * 2. App logic       - rendering, filtering, accordion, calendar export.
 *
 * Expected endpoint payload: any subset of the top-level keys below
 * (meta, tournament, links, divisions, fields, games, standings, rules).
 * Keys that are present replace the bundled sample data.
 * ============================================================================
 */

/* ==========================================================================
   1. DATA
   --------------------------------------------------------------------------
   Facts below come from the official 2026 invitation, team application and
   rules PDFs in docs/. Anything still being decided is marked TBD.
   ========================================================================== */
const KAMHI_CUP_DATA = {
  /**
   * SITE PHASE SWITCH
   * "registration" = Phase 1: announcement, registration checklist, downloads, FAQ.
   * "gameday"      = Phase 2: schedule, standings, field map. Load `games` and
   *                  `standings` below (or from the Sheet feed) before switching.
   * "auto"         = registration until `gameDayFrom`, then gameday.
   * Board members can preview either phase with ?phase=gameday or ?phase=registration.
   */
  site: {
    phase: "registration",
    gameDayFrom: "2026-12-11T18:00:00-08:00",
    allowUrlPreview: true,
    nav: {
      registration: [
        { label: "Register", href: "#register" },
        { label: "Key Dates", href: "#dates" },
        { label: "Downloads", href: "#documents" },
        { label: "FAQ", href: "#info" }
      ],
      gameday: [
        { label: "Schedule", href: "#schedule" },
        { label: "Standings", href: "#standings" },
        { label: "Rules & Field Map", href: "#rules" },
        { label: "Downloads", href: "#documents" }
      ],
      fab: {
        registration: [
          { short: "Register", href: "#register", icon: "clipboard" },
          { short: "Docs", href: "#documents", icon: "file" },
          { short: "FAQ", href: "#info", icon: "help" },
          { short: "Contact", href: "#contact", icon: "mail" }
        ],
        gameday: [
          { short: "Schedule", href: "#schedule", icon: "calendar" },
          { short: "Standings", href: "#standings", icon: "chart" },
          { short: "Docs", href: "#documents", icon: "file" },
          { short: "Map", href: "#rules", icon: "pin", openDrawer: "marshals" }
        ]
      }
    }
  },

  registration: {
    status: "open",                    // "open" | "closed"
    fee: "$750",
    rsvpUrl: "https://docs.google.com/forms/d/e/1FAIpQLSepSrYrav5oJeieJrlPkTBBe2OT1oFQxnCTUNWbiBb9-2yCLA/viewform",
    paymentUrl: "",                    // StackPay portal link, once available
    submitEmail: "tournamentayso154@gmail.com",
    submitSubject: "Kamhi Cup 2026 Team Application"
  },

  contacts: [
    { role: "Tournament Director", name: "Cypress Kamhi Cup", email: "tournamentayso154@gmail.com" },
    { role: "Webmaster & Tech Ops", name: "Bryan Nim", email: "webmasterayso154@gmail.com" }
  ],
  mailingAddress: ["AYSO Region 154", "ATTN: Cypress Kamhi Cup", "PO Box 999", "Cypress, California 90630"],

  meta: {
    isSample: false,
    lastUpdated: "2026-11-10"
  },

  /** Set `endpoint` to a deployed Apps Script web-app URL (returns JSON) to go live. */
  source: {
    endpoint: "",
    refreshSeconds: 60
  },

  tournament: {
    name: "Kamhi Cup 2026",
    title: "The Kamhi Cup 2026",
    fullName: "2026 1st Annual Cypress Kamhi Cup All-Star Invitational",
    dates: "Sat–Sun, Dec 12–13, 2026",
    dayLong: "Saturday & Sunday, December 12–13, 2026",
    venue: "Lexington Junior High School & Lexington Park",
    city: "Cypress, CA",
    rainout: "Dec 19–20, 2026",
    host: "AYSO Region 154 Cypress",
    timeZone: "America/Los_Angeles",
    // Kickoff time is TBD, so the countdown runs to the start of Saturday.
    startsAt: "2026-12-12T00:00:00-08:00",
    endsAt: "2026-12-13T18:00:00-08:00",
    kickoffTimeKnown: false,
    statusOverride: "",                // game day only: "", "live" or "complete" forces the hero badge
    advancePerPool: 1,                 // pool winners (plus wildcards) advance to the medal round
    checkInMinutes: 60,
    awards: "Medals for 1st–4th place in every division (3rd/4th only when a division has more than 4 teams). Tournament swag for every player and 2 coaches per team."
  },

  links: {
    fieldMap: "",                      // image / PDF URL; blank = jump to Field Marshal drawer
    rulesPdf: "docs/kamhi%20cup%20rules%202026.pdf",
    standings: "#standings",
    schedule: "#schedule"
  },

  /** Official divisions (Boys & Girls). Half lengths: pool play / medal rounds. */
  divisions: [
    { id: "U10B", label: "U10 Boys",  format: "7v7",   roster: 10, poolHalf: 20, medalHalf: 25 },
    { id: "U10G", label: "U10 Girls", format: "7v7",   roster: 10, poolHalf: 20, medalHalf: 25 },
    { id: "U12B", label: "U12 Boys",  format: "9v9",   roster: 12, poolHalf: 25, medalHalf: 30 },
    { id: "U12G", label: "U12 Girls", format: "9v9",   roster: 12, poolHalf: 25, medalHalf: 30 },
    { id: "U14B", label: "U14 Boys",  format: "11v11", roster: 15, poolHalf: 30, medalHalf: 35 },
    { id: "U14G", label: "U14 Girls", format: "11v11", roster: 15, poolHalf: 30, medalHalf: 35 }
  ],

  /* ---------------- Phase 2 data (empty until schedules are drawn) ---------------- */
  fields: [],                          // { id, name, venue, address, marshal }
  games: [],                           // { match, division, pool, round: "pool" | "final", start, field, home, away, status, homeScore, awayScore }
  standings: {},                       // standings[divisionId][poolId] = [{ team, gp, w, l, t, gf, ga, pts, fp }]

  /** Game-day Rules & Field Map drawers. Types: "steps" | "bullets" | "scoring" | "stations". */
  rules: [
    {
      id: "check-in", icon: "clipboard", title: "Check-in Protocol", type: "steps",
      intro: "Teams check in 1 hour before their first game on Saturday, December 12.",
      items: [
        "Bring your roster signed by your Regional Commissioner (if not already provided).",
        "Bring Medical Release Forms for every player.",
        "Bring 4–6 completed game cards listing your entire roster.",
        "Pick up your team mementos at check-in."
      ],
      note: "The check-in location will be emailed to all teams within 1 week of the tournament."
    },
    {
      id: "rules", icon: "trophy", title: "Scoring & Tiebreakers", type: "scoring",
      intro: "Pool play standings use the ten-point system.",
      scoring: [
        { label: "Win", value: "6" },
        { label: "Tie", value: "3" },
        { label: "Loss", value: "0" },
        { label: "Per goal (max 3)", value: "+1" },
        { label: "Shutout (incl. 0-0)", value: "+1" },
        { label: "Forfeit win (1-0)", value: "8" },
        { label: "Red card / ejection", value: "-2", negative: true },
        { label: "3 yellows in a match", value: "-1", negative: true }
      ],
      tiebreakersTitle: "Tiebreakers, in order",
      tiebreakers: [
        "Head-to-head result",
        "Fewest goals allowed (max 3 per game)",
        "Most goals for (max 3 per game)",
        "Kicks from the mark"
      ],
      note: "The official rules PDF is the final authority."
    },
    {
      id: "marshals", icon: "pin", title: "Field Map & Stations", type: "stations",
      intro: "Lexington Junior High School & Lexington Park, Cypress, CA."
    },
    {
      id: "parking", icon: "car", title: "Facility Rules", type: "bullets",
      items: [
        "No pets or animals at any field.",
        "No smoking at any field.",
        "Spectators stay behind the control line, between the 18-yard lines, on their team's side.",
        "Clean up all trash in your area before leaving."
      ]
    }
  ],

  /* ---------------- Phase 1 content ---------------- */

  /** Key dates. `date` is YYYY-MM-DD; add `dateEnd` for ranges; `approx` shows "~". */
  dates: [
    { id: "open",    label: "Registration open",          date: "2026-11-10", openNow: true },
    { id: "refund",  label: "Full-refund withdrawal cutoff", date: "2026-11-15" },
    { id: "apps",    label: "Application deadline",       date: "2026-11-30" },
    { id: "sched",   label: "Schedules posted",           date: "2026-12-05", approx: true },
    { id: "day",     label: "Tournament weekend",         date: "2026-12-12", dateEnd: "2026-12-13", highlight: true },
    { id: "rainout", label: "Rainout dates",              date: "2026-12-19", dateEnd: "2026-12-20" }
  ],

  /**
   * Registration checklist. `docs` are KAMHI_DOCS ids; `due` is a dates id.
   * `action`: "rsvp" (Google Form), "pay" (payment portal), "submit" (email packet).
   */
  checklists: [
    {
      id: "coach", label: "Coach / Manager",
      steps: [
        { title: "Submit the online RSVP", text: "This starts your application.", action: "rsvp", due: "apps" },
        { title: "Read the invitation & rules", docs: ["invitation", "rules"] },
        { title: "Complete the Team Application", text: "Signed by your Head Coach and Regional Commissioner.", docs: ["team-app"], due: "apps" },
        { title: "Prepare your roster", text: "Signed by your Regional Commissioner (Sports Connect roster accepted). Using guest players? Up to 3, each approved on the Guest Player Form.", docs: ["guest"] },
        { title: "Pay the $750 entry fee", text: "Payable online through the StackPay portal.", action: "pay" },
        { title: "Email your application & roster", text: "Teams are notified of their status within 48 hours.", action: "submit", due: "apps" }
      ]
    }
  ],

  /** Info Hub by topic. Mark an answer `tbd: true` while the board is still deciding. */
  info: [
    {
      id: "registration", label: "Registration", title: "Registration & Team Coordination", icon: "clipboard",
      docs: ["invitation", "team-app", "guest"], contact: "Tournament Director",
      faqs: [
        { q: "Who can enter?", a: "AYSO All-Star teams from all Sections, Boys & Girls, in U10, U12 and U14. Players must be registered Fall AYSO 2026 players." },
        { q: "How much is it, and what's the refund policy?", a: "$750 per team, payable online. Withdraw by November 15, 2026 for a full refund. After that, refunds are given only if a replacement team is found. If the tournament is canceled and can't be rescheduled, all teams get a full refund." },
        { q: "When is the deadline?", a: "Applications are due November 30, 2026. Teams are accepted first-come based on a completed application and are notified within 48 hours. Teams not accepted can join the waiting list." },
        { q: "What makes an application complete?", a: "The online RSVP, a Team Application signed by the Head Coach and Regional Commissioner, a roster signed by your Regional Commissioner, and the $750 entry fee." },
        { q: "How many players and guests can we bring?", a: "Roster limits: U10 10 players, U12 12 players, U14 15 players. Up to 3 guest players per team, approved by both the guest's Regional Commissioner and your Regional Commissioner on the Guest Player Form, and listed on your roster." },
        { q: "Can we change our roster?", a: "Yes, until team check-in, with your Regional Commissioner's written approval. Changes after December 5 must be brought to check-in." }
      ]
    },
    {
      id: "format", label: "Format & Scoring", title: "Format, Scoring & Awards", icon: "trophy",
      docs: ["rules"], contact: "Tournament Director",
      faqs: [
        { q: "How many games are guaranteed?", a: "Every team plays at least 3 pool play games. Pool winners (and in some cases wildcard teams) advance to the medal round on Sunday afternoon." },
        { q: "How long are the games?", a: "Pool, quarter and semi-final rounds: U10 20-minute halves, U12 25, U14 30. Championship games are full length: U10 25-minute halves, U12 30, U14 35. Pool play games may end in a tie; medal-round ties go straight to kicks from the mark." },
        { q: "How are standings scored?", a: "Win 6, tie 3, loss 0. +1 per goal (max 3 per game) and +1 for a shutout, including a 0-0 tie. A forfeit counts as an 8-point 1-0 win. -2 for each red card or ejection, and -1 for 3 yellow cards in a match." },
        { q: "How are ties in the standings broken?", a: "Head-to-head, then fewest goals allowed (max 3 per game), then most goals for (max 3 per game), then kicks from the mark." },
        { q: "What are the awards?", a: "Medals for 1st through 4th place in U10, U12 and U14 (no 3rd/4th medals if a division has only 4 teams). Every player and 2 coaches per team receive tournament swag." }
      ]
    },
    {
      id: "referees", label: "Referees", title: "Referees & Game Operations", icon: "whistle",
      docs: ["rules"], contact: "Tournament Director",
      faqs: [
        { q: "Do we need to bring referees?", a: "No. The tournament provides all referees, and referee fees are included in your entry fee. There is no referee requirement and no referee deposit." },
        { q: "Can referee decisions be protested?", a: "No. Referee judgment calls are not subject to dispute or protest." },
        { q: "What do coaches need to bring?", a: "A set of pinnies in case of a color conflict, a first aid kit and ice packs. Each team has two coaches (Head and Assistant), both listed on the official roster, AYSO trained and Safe Haven certified." }
      ]
    },
    {
      id: "fields", label: "Fields", title: "Fields & Facilities", icon: "pin",
      docs: [], contact: "Tournament Director",
      faqs: [
        { q: "Where are the games?", a: "Lexington Junior High School & Lexington Park in Cypress, California." },
        { q: "Where do we park?", a: "The field layout and parking map are coming soon.", tbd: true },
        { q: "Are pets allowed?", a: "No pets or animals are allowed at any field. Teams with a pet at the field may be asked to leave or forfeit a game. Smoking is also prohibited." }
      ]
    },
    {
      id: "safety", label: "Safety", title: "Safety, Check-in & Weather", icon: "shield",
      docs: ["rules"], contact: "Tournament Director",
      faqs: [
        { q: "How does check-in work?", a: "Check in 1 hour before your first game on Saturday, December 12, with your RC-signed roster, Medical Release Forms, and 4–6 completed game cards. The check-in location will be emailed within 1 week of the tournament." },
        { q: "Is there first aid on site?", a: "Yes. There will be a First Aid station at the main tent. For serious injuries, Tournament Staff will call 911." },
        { q: "What if it rains?", a: "The tournament plays rain or shine when conditions are safe. Rainout dates are December 19–20, 2026, and accepted teams are expected to return on those dates if needed." }
      ]
    },
    {
      id: "volunteers", label: "Volunteers", title: "Volunteers & Staffing", icon: "users",
      docs: [], contact: "Tournament Director",
      faqs: [
        { q: "How can I help?", a: "Fields are set up and taken down by tournament staff and Region 154 teams. Email the Tournament Director to volunteer." },
        { q: "Is there volunteer credit?", a: "Volunteer details will be announced.", tbd: true }
      ]
    }
  ],

  /** Low-profile placeholders for modules the board is still finalizing. */
  comingSoon: [
    { id: "schedule", icon: "calendar", title: "Match Schedules & Pool Brackets", pill: "Coming Early December", text: "Schedules are being drawn after the Nov 30 application cutoff and will be published here 1 week prior to kickoff." },
    { id: "fieldmap", icon: "pin", title: "Field Maps & Parking Guides", pill: "Coming Late November / TBD", text: "Lexington Junior High & Park field layout and parking map coming soon." },
    { id: "vendors", icon: "food", title: "Concessions & Event Vendors", pill: "Coming Late November / TBD", text: "Food trucks, tournament merchandise, and snack bar details to be announced." }
  ],

  sponsors: {
    inquiryEmail: "tournamentayso154@gmail.com",
    text: "The Kamhi Cup is a Region 154 fundraiser supporting the development of soccer fields in the City of Cypress.",
    partners: []                       // { name, logo, url }
  }
};

/* ==========================================================================
   1b. OFFICIAL DOWNLOADS
   --------------------------------------------------------------------------
   `file` is relative to KAMHI_DOCS_BASE (URL-encoded automatically).
   ========================================================================== */
const KAMHI_DOCS_BASE = "docs/";

const KAMHI_DOCS = [
  { id: "invitation", title: "Tournament Invitation & Overview",   desc: "Dates, divisions, format, fees, refunds, and awards.",                  file: "kamhi cup invitation application 2026.pdf", size: "414 KB" },
  { id: "team-app",   title: "Official Team Application Form",     desc: "Application instructions and the form for your Head Coach and RC to sign.", file: "kamhi cup team application 2026.pdf",       size: "409 KB" },
  { id: "rules",      title: "Official Tournament Rules & Scoring", desc: "Eligibility, game lengths, standings points, tiebreakers, and conduct.",  file: "kamhi cup rules 2026.pdf",                  size: "164 KB" },
  { id: "guest",      title: "Guest Player Approval Form",         desc: "Up to 3 guest players, approved by both Regional Commissioners.",          file: "guest_player_form 2026.pdf",                size: "121 KB" }
];

/* ==========================================================================
   2. APP
   ========================================================================== */
(() => {
  "use strict";

  const DATA = KAMHI_CUP_DATA;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const state = {
    division: "all",       // global division filter
    status: "all",         // schedule status filter
    pool: "A",             // standings pool toggle
    standingsDivision: "", // standings dropdown (used when global filter is "all")
    phase: "registration", // resolved site phase
    role: "coach",         // registration checklist role
    infoTab: ""            // active Info Hub pillar
  };

  // Browser storage is a per-device convenience only; it can be unavailable.
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } }
  };

  /* ---------- Helpers ---------- */
  const esc = (v) =>
    String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const tz = () => DATA.tournament.timeZone || "America/Los_Angeles";
  const fmt = (date, opts) => new Intl.DateTimeFormat("en-US", { timeZone: tz(), ...opts }).format(date);
  const fmtTime = (iso) => fmt(new Date(iso), { hour: "numeric", minute: "2-digit" });
  const fmtDay = (iso) => fmt(new Date(iso), { weekday: "long", month: "long", day: "numeric" });
  const dayKey = (iso) => fmt(new Date(iso), { year: "numeric", month: "2-digit", day: "2-digit" });

  const divisionById = (id) => DATA.divisions.find((d) => d.id === id);
  const fieldById = (id) => DATA.fields.find((f) => f.id === id);
  const mapsUrl = (field) =>
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(`${field.venue || ""} ${field.name || ""} ${field.address || ""}`.trim());

  const ICONS = {
    pin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    calendar: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4"/></svg>',
    clock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    chevron: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    clipboard: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 2h6v4H9zM9 12l2 2 4-4"/></svg>',
    trophy: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/></svg>',
    download: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>',
    link: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
    check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    help: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/></svg>',
    star: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
    file: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6"/></svg>',
    mail: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    chart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 21V10M12 21V4M19 21v-7"/></svg>',
    whistle: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="14" r="5"/><path d="M12.5 10.5 21 7v4l-6.5 1.5M9 14h.01"/></svg>',
    shield: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="M12 9v6M9 12h6"/></svg>',
    users: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/></svg>',
    food: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-2 2-3 4.5-3 7h3v11"/></svg>',
    external: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    ball: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m12 7 4 3-1.5 4.5h-5L8 10zM12 7V3.5M16 10l3.5-1.5M14.5 14.5l2 3.5M9.5 14.5l-2 3.5M8 10 4.5 8.5"/></svg>',
    card: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/></svg>',
    car: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 17h14M3 13l2-6h14l2 6v4H3zM7 17v2M17 17v2"/><circle cx="7.5" cy="13.5" r=".8"/><circle cx="16.5" cy="13.5" r=".8"/></svg>'
  };

  const STATUS_LABEL = { upcoming: "Upcoming", live: "In-Progress", final: "Final" };

  /* ---------- Site phase (registration vs game day) ---------- */
  function resolveSitePhase(now = new Date()) {
    const site = DATA.site || {};
    if (site.allowUrlPreview) {
      const q = new URLSearchParams(location.search).get("phase");
      if (q === "gameday" || q === "registration") return q;
    }
    if (site.phase === "gameday" || site.phase === "registration") return site.phase;
    return site.gameDayFrom && now >= new Date(site.gameDayFrom) ? "gameday" : "registration";
  }

  /* ---------- Hero status & countdown ---------- */
  function currentStatus(now = new Date()) {
    const t = DATA.tournament;
    const start = new Date(t.startsAt);
    const end = new Date(t.endsAt);

    if (state.phase === "registration") {
      return DATA.registration.status === "closed"
        ? { key: "closed", label: "Registration Closed" }
        : { key: "open", label: "Registration Open" };
    }
    if (t.statusOverride === "live") return { key: "live", label: "Tournament Live" };
    if (t.statusOverride === "complete") return { key: "complete", label: "Tournament Complete" };
    if (now > end) return { key: "complete", label: "Tournament Complete" };
    if (DATA.games.some((g) => g.status === "live")) return { key: "live", label: "Tournament Live" };
    return { key: "gameday", label: now < start ? "Kickoff Tomorrow" : "Tournament Weekend" };
  }

  function renderStatus() {
    const status = currentStatus();
    const badge = $("#status-badge");
    const countdown = $("#countdown");
    const meta = $("#status-meta");
    const t = DATA.tournament;
    const start = new Date(t.startsAt);
    const now = new Date();

    badge.dataset.phase = status.key;
    $(".status-badge__text", badge).textContent = status.label;

    if (now < start) {
      const s = Math.floor(Math.max(0, start - now) / 1000);
      const parts = { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), mins: Math.floor((s % 3600) / 60), secs: s % 60 };
      countdown.hidden = false;
      Object.entries(parts).forEach(([k, v]) => {
        const el = $(`[data-unit="${k}"]`, countdown);
        if (el) el.textContent = String(v).padStart(2, "0");
      });
      meta.textContent = t.kickoffTimeKnown
        ? `Kickoff ${fmt(start, { weekday: "long", hour: "numeric", minute: "2-digit" })}. Check in 1 hour before your first game.`
        : "Until kickoff weekend. Check in 1 hour before your first game; schedules post ~1 week prior.";
    } else {
      countdown.hidden = true;
      const live = DATA.games.filter((g) => g.status === "live").length;
      const done = DATA.games.filter((g) => g.status === "final").length;
      meta.textContent = `${live} match${live === 1 ? "" : "es"} in progress, ${done} final.`;
    }
    return now < start ? "countdown" : status.key;
  }

  function startStatusLoop() {
    let timer;
    const tick = () => {
      const key = renderStatus();
      timer = setTimeout(tick, key === "countdown" ? 1000 : 30000);
    };
    clearTimeout(timer);
    tick();
  }

  /* ---------- Division pills ---------- */
  function renderDivisionPills() {
    const host = $("#division-pills");
    const items = [{ id: "all", label: "All Divisions" }, ...DATA.divisions];
    host.innerHTML = items
      .map(
        (d) =>
          `<button type="button" class="pill-btn" data-division="${esc(d.id)}" aria-pressed="${d.id === state.division}" ${d.id !== "all" ? `title="${esc(d.label)}"` : ""}>${esc(d.id === "all" ? d.label : d.id)}</button>`
      )
      .join("");
  }

  function syncDivisionPills() {
    $$("#division-pills .pill-btn").forEach((b) => {
      const active = b.dataset.division === state.division;
      b.setAttribute("aria-pressed", String(active));
      if (active) b.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    });
  }

  /* ---------- Schedule ---------- */
  function gameCard(g) {
    const div = divisionById(g.division);
    const field = fieldById(g.field) || { name: g.field || "TBD", venue: "", address: "Cypress, CA" };
    const isFinal = g.status === "final";
    const showScore = g.status !== "upcoming";
    const homeWin = isFinal && g.homeScore > g.awayScore;
    const awayWin = isFinal && g.awayScore > g.homeScore;
    const isTbd = (n) => /winner|tbd/i.test(n);

    const teamRow = (name, score, win, role) => `
      <div class="team-row${win ? " is-winner" : ""}${isTbd(name) ? " is-tbd" : ""}">
        <div class="team-row__name"><span class="team-row__role">${role}</span>${esc(name)}</div>
        <div class="team-row__score" aria-label="${showScore ? `Score ${esc(score)}` : "No score yet"}">${showScore ? esc(score ?? 0) : "–"}</div>
      </div>`;

    const roundLabel = g.round === "final" ? "Division Final" : g.pool ? `Pool ${esc(g.pool)}` : "";

    return `
      <article class="card game-card" data-status="${esc(g.status)}" data-round="${esc(g.round)}" data-division="${esc(g.division)}">
        <header class="game-card__head">
          <span class="game-card__match">Match #${esc(g.match)}</span>
          <span class="badge badge--division" title="${esc(div ? div.label : g.division)}">${esc(g.division)}</span>
          <span class="badge badge--${esc(g.status)}">${g.status === "live" ? '<span class="dot"></span>' : ""}${esc(STATUS_LABEL[g.status] || g.status)}</span>
        </header>
        <div class="matchup">
          ${teamRow(g.home, g.homeScore, homeWin, "Home")}
          ${teamRow(g.away, g.awayScore, awayWin, "Away")}
        </div>
        <ul class="game-meta">
          <li>${ICONS.clock}<strong>${esc(fmtTime(g.start))}</strong></li>
          <li>${ICONS.pin}<strong>${esc(field.name)}</strong></li>
          ${roundLabel ? `<li>${roundLabel}</li>` : ""}
          ${div ? `<li>${esc(div.format)}</li>` : ""}
        </ul>
        <div class="game-card__actions">
          <a class="action-btn action-btn--pin" href="${esc(mapsUrl(field))}" target="_blank" rel="noopener" aria-label="Navigate to ${esc(field.name)}">${ICONS.pin}<span>Navigate</span></a>
          <button type="button" class="action-btn" data-calendar="${esc(g.match)}" aria-label="Add match ${esc(g.match)} to calendar">${ICONS.calendar}<span>Add to Calendar</span></button>
        </div>
      </article>`;
  }

  function filteredGames() {
    return DATA.games
      .filter((g) => (state.division === "all" || g.division === state.division) && (state.status === "all" || g.status === state.status))
      .sort((a, b) => new Date(a.start) - new Date(b.start) || a.match - b.match);
  }

  function renderSchedule() {
    const host = $("#schedule-list");
    const games = filteredGames();
    $("#result-count").textContent = `${games.length} match${games.length === 1 ? "" : "es"}`;

    if (!games.length) {
      host.innerHTML = DATA.games.length
        ? `<div class="empty">No matches found for this filter. Try another division or status.</div>`
        : `<div class="empty">Schedules will be published here 1 week prior to kickoff.</div>`;
      return;
    }

    const byDay = new Map();
    games.forEach((g) => {
      const k = dayKey(g.start);
      if (!byDay.has(k)) byDay.set(k, []);
      byDay.get(k).push(g);
    });

    host.innerHTML = [...byDay.values()]
      .map((list) => `<h3 class="day-heading">${esc(fmtDay(list[0].start))}</h3><div class="game-grid">${list.map(gameCard).join("")}</div>`)
      .join("");
  }

  /* ---------- Calendar (.ics) ---------- */
  const icsDate = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const icsEscape = (s) => String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

  function downloadIcs(match) {
    const g = DATA.games.find((x) => String(x.match) === String(match));
    if (!g) return;
    const div = divisionById(g.division);
    const field = fieldById(g.field) || { name: g.field, venue: "", address: "Cypress, CA" };
    const start = new Date(g.start);
    const mins = ((div && div.halfMins) || 25) * 2 + 10;
    const end = new Date(start.getTime() + mins * 60000);

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AYSO Region 154//Kamhi Cup 2026//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:kamhi2026-match-${g.match}@ayso154`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${icsEscape(`Kamhi Cup ${g.division}: ${g.home} vs ${g.away}`)}`,
      `LOCATION:${icsEscape(`${field.name}, ${field.venue ? field.venue + ", " : ""}${field.address}`)}`,
      `DESCRIPTION:${icsEscape(`Match #${g.match}. Check in ${DATA.tournament.checkInMinutes} minutes before your first match.`)}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT60M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Kamhi Cup match in 60 minutes",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kamhi-cup-match-${g.match}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---------- Standings ---------- */
  function activeStandingsDivision() {
    return state.division !== "all" ? state.division : state.standingsDivision || DATA.divisions[0].id;
  }

  const signed = (n) => (n > 0 ? `<span class="pos">+${n}</span>` : n < 0 ? `<span class="neg">${n}</span>` : "0");

  function renderStandings() {
    const divId = activeStandingsDivision();
    const div = divisionById(divId);
    const pools = (DATA.standings && DATA.standings[divId]) || {};
    const rows = (pools[state.pool] || []).map((r) => ({ ...r, gd: r.gf - r.ga, total: r.pts + (r.fp || 0) }));
    const cutoff = DATA.tournament.advancePerPool;

    // Sort: total pts, then fewest GA, then GD (mirrors the published tiebreaker order).
    rows.sort((a, b) => b.total - a.total || a.ga - b.ga || b.gd - a.gd);

    const select = $("#standings-division");
    select.value = divId;

    $$("#pool-toggle button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pool === state.pool)));

    const host = $("#standings-table");
    if (!rows.length) {
      host.innerHTML = `<div class="empty" style="margin:16px">Standings for ${esc(div ? div.label : divId)} Pool ${esc(state.pool)} are not available yet.</div>`;
      return;
    }

    host.innerHTML = `
      <div class="standings__scroll" tabindex="0" role="region" aria-label="${esc(div ? div.label : divId)} Pool ${esc(state.pool)} standings, scrollable">
        <table class="table">
          <caption>${esc(div ? div.label : divId)} &middot; Pool ${esc(state.pool)}</caption>
          <thead>
            <tr>
              <th scope="col" class="col-team">Team</th>
              <th scope="col"><abbr title="Games played">GP</abbr></th>
              <th scope="col"><abbr title="Wins">W</abbr></th>
              <th scope="col"><abbr title="Losses">L</abbr></th>
              <th scope="col"><abbr title="Ties">T</abbr></th>
              <th scope="col"><abbr title="Goals for">GF</abbr></th>
              <th scope="col"><abbr title="Goals against">GA</abbr></th>
              <th scope="col"><abbr title="Goal difference">GD</abbr></th>
              <th scope="col"><abbr title="Fair play / referee points">Fair Play</abbr></th>
              <th scope="col" class="col-pts"><abbr title="Total points">PTS</abbr></th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map((r, i) => {
                const adv = i < cutoff;
                const cut = i === cutoff - 1 && rows.length > cutoff;
                return `<tr class="${adv ? "is-advancing" : ""}${cut ? " is-cutoff" : ""}">
                  <th scope="row" class="col-team"><span class="col-rank">${i + 1}</span>${esc(r.team)}</th>
                  <td>${esc(r.gp)}</td><td>${esc(r.w)}</td><td>${esc(r.l)}</td><td>${esc(r.t)}</td>
                  <td>${esc(r.gf)}</td><td>${esc(r.ga)}</td><td>${signed(r.gd)}</td>
                  <td>${r.fp ? `<span class="neg">${esc(r.fp)}</span>` : "0"}</td>
                  <td class="col-pts">${esc(r.total)}</td>
                </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="legend">
        <span class="legend__item"><span class="swatch"></span>Top ${esc(cutoff)} advance to the finals</span>
        <span class="legend__item"><span class="swatch swatch--cut"></span>Advancement cutoff</span>
        <span class="legend__item">Order: points, then fewest GA, then GD</span>
      </div>`;
  }

  function renderStandingsControls() {
    const select = $("#standings-division");
    select.innerHTML = DATA.divisions.map((d) => `<option value="${esc(d.id)}">${esc(d.label)}</option>`).join("");
  }

  /* ---------- Rules hub accordion ---------- */
  function drawerBody(item) {
    const intro = item.intro ? `<p>${esc(item.intro)}</p>` : "";
    const note = item.note ? `<p class="note">${esc(item.note)}</p>` : "";

    if (item.type === "steps") {
      return `${intro}<ol class="check-list">${item.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ol>${note}`;
    }
    if (item.type === "bullets") {
      return `${intro}<ul class="check-list check-list--bullets">${item.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>${note}`;
    }
    if (item.type === "scoring") {
      return `${intro}
        <div class="points-grid">${item.scoring
          .map((s) => `<div class="points-grid__cell"><span class="points-grid__num${s.negative ? " neg" : ""}">${esc(s.value)}</span><span class="points-grid__lbl">${esc(s.label)}</span></div>`)
          .join("")}</div>
        <h4>${esc(item.tiebreakersTitle || "Tiebreakers")}</h4>
        <ol class="check-list check-list--red">${item.tiebreakers.map((i) => `<li>${esc(i)}</li>`).join("")}</ol>${note}`;
    }
    if (item.type === "stations") {
      if (!DATA.fields.length) return `${intro}<p class="note">Field map and Field Marshal stations will be posted before kickoff.</p>`;
      return `${intro}<div class="station-list">${DATA.fields
        .map(
          (f) => `<div class="station">
            <div><div class="station__name">${esc(f.name)}</div><div class="station__where">${esc(f.marshal || "Station TBD")} &middot; ${esc(f.venue)}</div></div>
            <a class="action-btn action-btn--pin" href="${esc(mapsUrl(f))}" target="_blank" rel="noopener" aria-label="Navigate to ${esc(f.name)}">${ICONS.pin}<span>Navigate</span></a>
          </div>`
        )
        .join("")}</div>${note}`;
    }
    return intro + note;
  }

  function renderRules() {
    $("#rules-accordion").innerHTML = DATA.rules
      .map(
        (item) => `
        <div class="card acc-item" data-acc="${esc(item.id)}">
          <h3>
            <button type="button" class="acc-trigger" id="acc-btn-${esc(item.id)}" aria-expanded="false" aria-controls="acc-panel-${esc(item.id)}">
              <span class="acc-icon">${ICONS[item.icon] || ICONS.clipboard}</span>
              <span class="acc-title">${esc(item.title)}</span>
              <span class="acc-chevron">${ICONS.chevron}</span>
            </button>
          </h3>
          <div class="acc-panel" id="acc-panel-${esc(item.id)}" role="region" aria-labelledby="acc-btn-${esc(item.id)}">
            <div class="acc-panel__clip"><div class="acc-panel__body">${drawerBody(item)}</div></div>
          </div>
        </div>`
      )
      .join("");
  }

  function toggleDrawer(id, force) {
    const item = $(`.acc-item[data-acc="${id}"]`);
    if (!item) return;
    const open = force !== undefined ? force : !item.classList.contains("is-open");
    item.classList.toggle("is-open", open);
    $(".acc-trigger", item).setAttribute("aria-expanded", String(open));
    // Hide closed content from keyboard / screen readers.
    const clip = $(".acc-panel__clip", item);
    if (open) clip.removeAttribute("inert"); else clip.setAttribute("inert", "");
  }

  function initDrawers() {
    $$(".acc-item .acc-panel__clip").forEach((c) => c.setAttribute("inert", ""));
  }

  /* ---------- Official downloads ---------- */
  const docUrl = (file) => KAMHI_DOCS_BASE.split("/").filter(Boolean).concat(file.split("/")).map(encodeURIComponent).join("/");
  const docAbsUrl = (file) => new URL(docUrl(file), document.baseURI).href;
  const docExt = (file) => (file.split(".").pop() || "").toLowerCase();
  const docById = (id) => KAMHI_DOCS.find((d) => d.id === id);

  function renderDocs() {
    $("#doc-list").innerHTML = KAMHI_DOCS.map((d) => {
      const ext = docExt(d.file).toUpperCase();
      const href = esc(docUrl(d.file));
      return `<article class="card pdf-card">
        <div class="pdf-card__top">
          <div class="file-icon" data-ext="${esc(ext.toLowerCase())}" aria-hidden="true">${esc(ext)}</div>
          <div class="pdf-card__info">
            <h3 class="pdf-card__title">${esc(d.title)}</h3>
            <p class="pdf-card__desc">${esc(d.desc)}</p>
            <div class="pdf-card__meta"><span class="badge badge--ext">${esc(ext)}</span><span class="pdf-card__size">${esc(d.size || "")}</span></div>
          </div>
        </div>
        <div class="pdf-card__actions">
          <a class="action-btn action-btn--primary" href="${href}" download aria-label="Download ${esc(d.title)} (${esc(ext)}, ${esc(d.size || "")})">${ICONS.download}<span>Download ${esc(ext)}</span></a>
          <a class="action-btn" href="${href}" target="_blank" rel="noopener" aria-label="Open ${esc(d.title)} in a new tab">${ICONS.external}<span>Open / View</span></a>
          <button type="button" class="action-btn action-btn--icon" data-copy="${esc(d.file)}" aria-label="Copy share link for ${esc(d.title)}" title="Copy link">${ICONS.link}</button>
        </div>
      </article>`;
    }).join("");
  }

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2200);
  }

  async function copyLink(file, btn) {
    const url = docAbsUrl(file);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for http:// or older browsers.
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch { /* ignore */ }
      ta.remove();
      if (!ok) {
        try { window.prompt("Copy this link:", url); } catch { toast("Couldn't copy. Use Open / View instead."); }
        return;
      }
    }
    btn.classList.add("is-done");
    btn.innerHTML = ICONS.check;
    toast("Link copied");
    setTimeout(() => { btn.classList.remove("is-done"); btn.innerHTML = ICONS.link; }, 1800);
  }

  /* ---------- Phase 1: key dates ---------- */
  const dateById = (id) => (DATA.dates || []).find((d) => d.id === id);
  const parseDay = (ymd) => (ymd ? new Date(`${ymd}T12:00:00-08:00`) : null);
  const fmtShort = (ymd) => (ymd ? fmt(parseDay(ymd), { month: "short", day: "numeric" }) : "TBD");
  const fmtRange = (d) => {
    if (!d.date) return "TBD";
    const a = fmtShort(d.date);
    if (!d.dateEnd) return `${d.approx ? "~" : ""}${a}`;
    const sameMonth = d.date.slice(0, 7) === d.dateEnd.slice(0, 7);
    return `${a}–${sameMonth ? Number(d.dateEnd.slice(8)) : fmtShort(d.dateEnd)}`;
  };
  const daysUntil = (ymd) => {
    const today = fmt(new Date(), { year: "numeric", month: "2-digit", day: "2-digit" }).split("/");
    const todayNoon = new Date(`${today[2]}-${today[0]}-${today[1]}T12:00:00-08:00`);
    return Math.round((parseDay(ymd) - todayNoon) / 86400000);
  };

  function whenText(d) {
    if (!d.date) return "Date TBD";
    const n = daysUntil(d.date);
    const end = d.dateEnd ? daysUntil(d.dateEnd) : n;
    if (d.openNow && n <= 0) return "Open now";
    if (end < 0) return "Passed";
    if (n <= 0) return "Today";
    if (n === 1) return "Tomorrow";
    return `${d.approx ? "About " : "In "}${n} days`;
  }

  function renderDates() {
    $("#dates-list").innerHTML = (DATA.dates || [])
      .map((d) => {
        const end = d.date ? daysUntil(d.dateEnd || d.date) : null;
        const cls = !d.date ? "is-tbd" : d.openNow && daysUntil(d.date) <= 0 ? "is-open" : end < 0 ? "is-past" : "is-upcoming";
        return `<li class="timeline__item ${cls}${d.highlight ? " is-highlight" : ""}">
          <span class="timeline__dot" aria-hidden="true"></span>
          <span class="timeline__date">${esc(fmtRange(d))}</span>
          <span class="timeline__label">${esc(d.label)}</span>
          <span class="timeline__when">${esc(whenText(d))}</span>
        </li>`;
      })
      .join("");
  }

  /* ---------- Phase 1: registration checklist ---------- */
  const checkKey = (role, i) => `kc26:check:${role}:${i}`;

  function submitHref() {
    const r = DATA.registration;
    const body = "Team name:\nRegion #:\nDivision (U10 / U12 / U14, Boys / Girls):\nHead Coach:\n\nAttached:\n- Signed Team Application\n- RC-signed roster\n- Guest Player Forms (if any)\n";
    return `mailto:${r.submitEmail}?subject=${encodeURIComponent(r.submitSubject)}&body=${encodeURIComponent(body)}`;
  }

  function docChip(d) {
    const ext = docExt(d.file);
    return `<a class="doc-chip" href="${esc(docUrl(d.file))}" download aria-label="Download ${esc(d.title)} (${esc(ext.toUpperCase())})">
      <span class="doc-chip__ext" data-ext="${esc(ext)}">${esc(ext.toUpperCase())}</span>
      <span class="doc-chip__title">${esc(d.title)}</span>
      ${ICONS.download}
    </a>`;
  }

  function stepAction(s) {
    const r = DATA.registration;
    if (r.status === "closed" && s.action) return `<p class="note">Registration is closed.</p>`;
    if (s.action === "rsvp") {
      return `<a class="action-btn action-btn--red action-btn--wide" href="${esc(r.rsvpUrl)}" target="_blank" rel="noopener">${ICONS.ball}<span>Open the online RSVP</span>${ICONS.external}</a>`;
    }
    if (s.action === "pay") {
      return r.paymentUrl
        ? `<a class="action-btn action-btn--wide" href="${esc(r.paymentUrl)}" target="_blank" rel="noopener">${ICONS.card}<span>Pay online</span>${ICONS.external}</a>`
        : `<p class="step__hint"><span class="badge badge--tbd">Link TBD</span> The payment link will be shared after your RSVP.</p>`;
    }
    if (s.action === "submit") {
      return `<a class="action-btn action-btn--wide" href="${esc(submitHref())}">${ICONS.mail}<span>Email ${esc(r.submitEmail)}</span></a>`;
    }
    return "";
  }

  function renderChecklist() {
    const lists = DATA.checklists || [];
    if (!lists.find((l) => l.id === state.role)) state.role = lists[0].id;
    const list = lists.find((l) => l.id === state.role);

    const chips = $("#role-chips");
    chips.hidden = lists.length < 2;
    chips.innerHTML = lists
      .map((l) => `<button type="button" class="pill-btn" data-role="${esc(l.id)}" aria-pressed="${l.id === state.role}">${esc(l.label)}</button>`)
      .join("");

    const done = list.steps.map((_, i) => store.get(checkKey(list.id, i)) === "1");
    const count = done.filter(Boolean).length;
    const pct = Math.round((count / list.steps.length) * 100);

    $("#checklist").innerHTML = `
      <div class="checklist__head">
        <div>
          <div class="checklist__title">Your team's application</div>
          <div class="checklist__count">${count} of ${list.steps.length} done</div>
        </div>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${list.steps.length}" aria-valuenow="${count}" aria-label="Checklist progress"><span style="width:${pct}%"></span></div>
      </div>
      <ol class="steps">
        ${list.steps
          .map((s, i) => {
            const due = s.due ? dateById(s.due) : null;
            const docs = (s.docs || []).map(docById).filter(Boolean);
            return `<li class="step${done[i] ? " is-done" : ""}">
              <label class="step__check">
                <input type="checkbox" data-check="${i}" ${done[i] ? "checked" : ""}>
                <span class="step__box" aria-hidden="true">${ICONS.check}</span>
                <span class="visually-hidden">Mark step ${i + 1} done: ${esc(s.title)}</span>
              </label>
              <div class="step__body">
                <div class="step__top">
                  <span class="step__num">Step ${i + 1}</span>
                  ${due ? `<span class="badge ${due.date ? "badge--upcoming" : "badge--tbd"}">Due ${esc(fmtRange(due))}</span>` : ""}
                </div>
                <div class="step__title">${esc(s.title)}</div>
                ${s.text ? `<p class="step__text">${esc(s.text)}</p>` : ""}
                ${docs.length ? `<div class="doc-chips">${docs.map(docChip).join("")}</div>` : ""}
                ${stepAction(s)}
              </div>
            </li>`;
          })
          .join("")}
      </ol>
      <p class="checklist__foot">Check-offs are saved on this device only.</p>`;
  }

  /* ---------- Phase 1: tournament at a glance ---------- */
  function renderGlance() {
    const groups = new Map();
    DATA.divisions.forEach((d) => {
      const age = d.id.slice(0, 3);
      if (!groups.has(age)) groups.set(age, []);
      groups.get(age).push(d);
    });
    $("#glance-grid").innerHTML =
      [...groups.entries()]
        .map(([age, list]) => {
          const d = list[0];
          return `<article class="card glance-card">
            <div class="glance-card__age">${esc(age)}</div>
            <div class="glance-card__teams">${list.map((x) => esc(x.label.replace(/^U\d+\s*/, ""))).join(" &amp; ")}</div>
            <ul class="glance-card__facts">
              <li><strong>${esc(d.format)}</strong> &middot; ${esc(d.roster)} players max</li>
              <li><strong>${esc(d.poolHalf)}-min</strong> halves in pool play</li>
              <li><strong>${esc(d.medalHalf)}-min</strong> halves in finals</li>
            </ul>
          </article>`;
        })
        .join("") +
      `<article class="card glance-card glance-card--awards">
        <div class="glance-card__age">${ICONS.trophy}</div>
        <div class="glance-card__teams">Awards</div>
        <p class="glance-card__text">${esc(DATA.tournament.awards)}</p>
      </article>`;
  }

  /* ---------- Phase 1: Info Hub ---------- */
  function renderInfo() {
    const pillars = DATA.info || [];
    if (!pillars.find((p) => p.id === state.infoTab)) state.infoTab = pillars[0].id;
    const p = pillars.find((x) => x.id === state.infoTab);

    $("#info-tabs").innerHTML = pillars
      .map((x) => `<button type="button" class="pill-btn" role="tab" id="info-tab-${esc(x.id)}" data-info="${esc(x.id)}" aria-selected="${x.id === p.id}" aria-pressed="${x.id === p.id}" aria-controls="info-panel">${esc(x.label)}</button>`)
      .join("");

    const contact = DATA.contacts.find((c) => c.role === p.contact) || DATA.contacts[0];
    const docs = (p.docs || []).map(docById).filter(Boolean);
    const panel = $("#info-panel");
    panel.setAttribute("aria-labelledby", `info-tab-${p.id}`);
    panel.innerHTML = `
      <div class="info-panel__head">
        <span class="acc-icon">${ICONS[p.icon] || ICONS.clipboard}</span>
        <h3 class="info-panel__title">${esc(p.title)}</h3>
      </div>
      <div class="accordion">
        ${p.faqs
          .map((f, i) => {
            const id = `faq-${p.id}-${i}`;
            return `<div class="acc-item acc-item--flat" data-acc="${esc(id)}">
              <h4>
                <button type="button" class="acc-trigger" id="acc-btn-${esc(id)}" aria-expanded="false" aria-controls="acc-panel-${esc(id)}">
                  <span class="acc-title">${esc(f.q)}</span>
                  ${f.tbd ? '<span class="badge badge--tbd">TBD</span>' : ""}
                  <span class="acc-chevron">${ICONS.chevron}</span>
                </button>
              </h4>
              <div class="acc-panel" id="acc-panel-${esc(id)}" role="region" aria-labelledby="acc-btn-${esc(id)}">
                <div class="acc-panel__clip" inert><div class="acc-panel__body"><p>${esc(f.a)}</p></div></div>
              </div>
            </div>`;
          })
          .join("")}
      </div>
      ${docs.length ? `<h4 class="info-panel__sub">Related downloads</h4><div class="doc-chips">${docs.map(docChip).join("")}</div>` : ""}
      <div class="info-panel__contact">
        <span>Questions? <strong>${esc(contact.role)}</strong></span>
        <a class="action-btn" href="mailto:${esc(contact.email)}?subject=${encodeURIComponent(`Kamhi Cup 2026: ${p.title}`)}">${ICONS.mail}<span>Email</span></a>
      </div>`;
  }

  /* ---------- Phase 1: coming soon + sponsors ---------- */
  function renderComingSoon() {
    const s = DATA.sponsors;
    const cards = (DATA.comingSoon || []).map(
      (c) => `<article class="card soon-card">
        <div class="soon-card__head">
          <span class="soon-card__icon">${(ICONS[c.icon] || ICONS.clipboard).replace(/width="\d+" height="\d+"/, 'width="20" height="20"')}</span>
          <span class="badge badge--soon">${esc(c.pill)}</span>
        </div>
        <h3 class="soon-card__title">${esc(c.title)}</h3>
        <p class="soon-card__text">${esc(c.text)}</p>
      </article>`
    );
    const partners = (s.partners || [])
      .map((p) => `<a class="partner" href="${esc(p.url || "#")}" target="_blank" rel="noopener">${p.logo ? `<img src="${esc(p.logo)}" alt="${esc(p.name)}" loading="lazy">` : esc(p.name)}</a>`)
      .join("");
    cards.push(`<article class="card soon-card soon-card--sponsor">
      <div class="soon-card__head">
        <span class="soon-card__icon">${ICONS.star}</span>
        <span class="badge badge--gold">Tournament Sponsors</span>
      </div>
      <h3 class="soon-card__title">Interested in supporting Cypress youth soccer?</h3>
      <p class="soon-card__text">${esc(s.text)}</p>
      ${partners ? `<div class="partner-grid">${partners}</div>` : ""}
      <a class="action-btn action-btn--gold" href="mailto:${esc(s.inquiryEmail)}?subject=${encodeURIComponent("Kamhi Cup 2026 Sponsorship Inquiry")}">${ICONS.mail}<span>Inquire About Sponsorship</span></a>
    </article>`);
    $("#soon-grid").innerHTML = cards.join("");
  }

  /* ---------- Contacts ---------- */
  function renderContacts() {
    $("#contact-list").innerHTML =
      DATA.contacts
        .map(
          (c) => `<li class="card contact">
            <div><div class="contact__role">${esc(c.role)}</div><div class="contact__name">${esc(c.email)}</div></div>
            <a class="action-btn" href="mailto:${esc(c.email)}" aria-label="Email ${esc(c.role)}">${ICONS.mail}<span>Email</span></a>
          </li>`
        )
        .join("") +
      (DATA.mailingAddress
        ? `<li class="card contact"><div><div class="contact__role">Mailing address</div><address class="contact__name">${DATA.mailingAddress.map(esc).join("<br>")}</address></div></li>`
        : "");
  }

  /* ---------- Phase-aware navigation ---------- */
  function navAttrs(item) {
    return item.openDrawer ? ` data-open-drawer="${esc(item.openDrawer)}"` : "";
  }

  function renderNav() {
    const nav = DATA.site.nav;
    $("#section-nav-links").innerHTML = (nav[state.phase] || [])
      .map((i) => `<a class="section-nav__link" href="${esc(i.href)}"${navAttrs(i)}>${esc(i.label)}</a>`)
      .join("");
    $("#fab-nav").innerHTML = (nav.fab[state.phase] || [])
      .map((i) => `<a class="fab-nav__link" href="${esc(i.href)}"${navAttrs(i)}>${(ICONS[i.icon] || "").replace(/width="\d+" height="\d+"/, 'width="20" height="20"')}${esc(i.short)}</a>`)
      .join("");
  }

  function applyPhase() {
    document.body.dataset.phase = state.phase;
    $$("[data-rsvp]").forEach((a) => (a.href = DATA.registration.rsvpUrl));
  }

  /* ---------- Quick links ---------- */
  function wireQuickLinks() {
    const { links } = DATA;
    const map = $("#link-field-map");
    const rules = $("#link-rules");

    if (links.fieldMap) {
      map.href = links.fieldMap;
      map.target = "_blank";
      map.rel = "noopener";
    } else {
      map.href = "#rules";
      map.dataset.openDrawer = "marshals";
    }

    if (links.rulesPdf) {
      rules.href = links.rulesPdf;
      rules.target = "_blank";
      rules.rel = "noopener";
    } else {
      rules.href = "#rules";
      rules.dataset.openDrawer = "rules";
    }
    $("#link-standings").setAttribute("href", links.standings || "#standings");
    $("#link-schedule").setAttribute("href", links.schedule || "#schedule");
  }

  /* ---------- Sticky bar sizing & scroll-spy ---------- */
  function syncStickyHeight() {
    const bar = $("#sticky-bar");
    if (bar) document.documentElement.style.setProperty("--sticky-h", `${bar.offsetHeight}px`);
  }

  function initScrollSpy() {
    const links = $$(".section-nav__link, .fab-nav__link");
    const sections = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${e.target.id}`));
          }
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    sections.forEach((s) => io.observe(s));
  }

  /* ---------- Static text binding ---------- */
  function renderChrome() {
    const t = DATA.tournament;
    document.title = `${t.title || t.name} | ${t.host} All-Stars`;
    $$("[data-bind]").forEach((el) => {
      const key = el.dataset.bind;
      if (key === "name") el.textContent = t.name;
      if (key === "subtitle") el.textContent = t.subtitle;
      if (key === "title") el.textContent = t.title || t.name;
      if (key === "dates") el.textContent = t.dates || "";
      if (key === "fullName") el.textContent = t.fullName || "";
      if (key === "venue") el.textContent = t.venue || "";
      if (key === "city") el.textContent = t.city || "";
      if (key === "host") el.textContent = t.host;
      if (key === "updated") el.textContent = DATA.meta.lastUpdated;
      if (key === "sample") el.hidden = !DATA.meta.isSample;
    });
  }

  /* ---------- Render all ---------- */
  function renderAll() {
    applyPhase();
    renderChrome();
    renderNav();
    renderDocs();
    renderContacts();
    renderStatus();

    if (state.phase === "registration") {
      renderDates();
      renderChecklist();
      renderGlance();
      renderInfo();
      renderComingSoon();
    } else {
      renderStandingsControls();
      renderDivisionPills();
      renderSchedule();
      renderStandings();
      renderRules();
      initDrawers();
      wireQuickLinks();
    }
  }

  /* ---------- Event wiring ---------- */
  function bindEvents() {
    document.addEventListener("click", (e) => {
      const pill = e.target.closest("#division-pills .pill-btn");
      if (pill) {
        state.division = pill.dataset.division;
        if (state.division !== "all") state.standingsDivision = state.division;
        syncDivisionPills();
        renderSchedule();
        renderStandings();
        return;
      }

      const statusBtn = e.target.closest("#status-filter button");
      if (statusBtn) {
        state.status = statusBtn.dataset.status;
        $$("#status-filter button").forEach((b) => b.setAttribute("aria-pressed", String(b === statusBtn)));
        renderSchedule();
        return;
      }

      const poolBtn = e.target.closest("#pool-toggle button");
      if (poolBtn) {
        state.pool = poolBtn.dataset.pool;
        renderStandings();
        return;
      }

      const cal = e.target.closest("[data-calendar]");
      if (cal) {
        downloadIcs(cal.dataset.calendar);
        return;
      }

      const copy = e.target.closest("[data-copy]");
      if (copy) {
        copyLink(copy.dataset.copy, copy);
        return;
      }

      const trigger = e.target.closest(".acc-trigger");
      if (trigger) {
        toggleDrawer(trigger.closest(".acc-item").dataset.acc);
        return;
      }

      const role = e.target.closest("#role-chips [data-role]");
      if (role) {
        state.role = role.dataset.role;
        store.set("kc26:role", state.role);
        renderChecklist();
        return;
      }

      const tab = e.target.closest("#info-tabs [data-info]");
      if (tab) {
        state.infoTab = tab.dataset.info;
        renderInfo();
        tab.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
        return;
      }

      const opener = e.target.closest("[data-open-drawer]");
      if (opener) toggleDrawer(opener.dataset.openDrawer, true);

    });

    document.addEventListener("change", (e) => {
      const box = e.target.closest("#checklist [data-check]");
      if (!box) return;
      store.set(checkKey(state.role, box.dataset.check), box.checked ? "1" : "0");
      renderChecklist();
      const again = $(`#checklist [data-check="${box.dataset.check}"]`);
      if (again) again.focus();
    });

    $("#standings-division").addEventListener("change", (e) => {
      state.standingsDivision = e.target.value;
      if (state.division !== "all") {
        // Standings dropdown takes over; release the global filter so the two stay consistent.
        state.division = "all";
        syncDivisionPills();
        renderSchedule();
      }
      renderStandings();
    });

    window.addEventListener("resize", syncStickyHeight);
  }

  /* ---------- Remote data sync (Google Sheet / Apps Script) ---------- */
  const SYNC_KEYS = ["meta", "registration", "contacts", "tournament", "links", "divisions", "fields", "games", "standings", "rules", "dates", "checklists", "info", "comingSoon", "sponsors", "mailingAddress"];

  async function syncRemote() {
    const url = DATA.source.endpoint;
    if (!url) return;
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const remote = await res.json();
      SYNC_KEYS.forEach((k) => {
        if (remote[k] !== undefined) DATA[k] = remote[k];
      });
      renderAll();
    } catch (err) {
      console.warn("[Kamhi Cup] Live data sync failed; showing last known data.", err);
    }
  }

  /* ---------- Init ---------- */
  function init() {
    state.standingsDivision = DATA.divisions[0].id;
    state.phase = resolveSitePhase();
    state.role = store.get("kc26:role") || state.role;
    renderAll();
    bindEvents();
    startStatusLoop();
    initScrollSpy();
    syncStickyHeight();
    if ("ResizeObserver" in window) new ResizeObserver(syncStickyHeight).observe($("#sticky-bar"));

    if (DATA.source.endpoint) {
      syncRemote();
      setInterval(syncRemote, Math.max(15, DATA.source.refreshSeconds) * 1000);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
