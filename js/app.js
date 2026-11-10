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
   ========================================================================== */
const KAMHI_CUP_DATA = {
  meta: {
    isSample: true,                    // shows a "Sample data" tag; set false once real data is wired in
    lastUpdated: "2026-11-09 17:00 PST"
  },

  /** Set `endpoint` to a deployed Apps Script web-app URL (returns JSON) to go live. */
  source: {
    endpoint: "",
    refreshSeconds: 60
  },

  tournament: {
    name: "Kamhi Cup 2026",
    subtitle: "All-Stars Tournament",
    host: "AYSO Region 154 Cypress",
    timeZone: "America/Los_Angeles",
    // Placeholder dates - the official dates are still TBD.
    startsAt: "2026-12-05T07:00:00-08:00",
    endsAt: "2026-12-06T17:00:00-08:00",
    championshipDay: "2026-12-06",     // YYYY-MM-DD in tournament time zone
    statusOverride: "",                // "", "live", "pool", "championship" or "complete" forces the hero badge
    advancePerPool: 2,                 // top N per pool reach Championship Sunday
    checkInMinutes: 60
  },

  links: {
    fieldMap: "",                      // image / PDF URL; blank = jump to Field Marshal drawer
    rulesPdf: "",                      // PDF URL; blank = jump to Rules drawer
    standings: "#standings",
    schedule: "#schedule"
  },

  divisions: [
    { id: "10UB", label: "10U Boys",  format: "7v7",   halfMins: 25 },
    { id: "10UG", label: "10U Girls", format: "7v7",   halfMins: 25 },
    { id: "12UB", label: "12U Boys",  format: "9v9",   halfMins: 30 },
    { id: "12UG", label: "12U Girls", format: "9v9",   halfMins: 30 },
    { id: "14UB", label: "14U Boys",  format: "11v11", halfMins: 35 },
    { id: "14UG", label: "14U Girls", format: "11v11", halfMins: 35 }
  ],

  fields: [
    { id: "F1", name: "Field 1", venue: "Primary Complex", address: "Cypress, CA 90630", marshal: "Marshal HQ Tent (north end)" },
    { id: "F2", name: "Field 2", venue: "Primary Complex", address: "Cypress, CA 90630", marshal: "Marshal HQ Tent (north end)" },
    { id: "F3", name: "Field 3", venue: "Primary Complex", address: "Cypress, CA 90630", marshal: "Marshal Station B (east side)" },
    { id: "F4", name: "Field 4", venue: "Primary Complex", address: "Cypress, CA 90630", marshal: "Marshal Station B (east side)" }
  ],

  /**
   * status: "upcoming" | "live" | "final"
   * round : "pool" | "championship"
   */
  games: [
    { match: 1,  division: "10UB", pool: "A", round: "pool", start: "2026-12-05T08:00:00-08:00", field: "F1", home: "Cypress Thunder",   away: "Lakeview Strikers", status: "final",    homeScore: 3, awayScore: 1 },
    { match: 2,  division: "10UB", pool: "B", round: "pool", start: "2026-12-05T08:00:00-08:00", field: "F2", home: "Pacific Hawks",     away: "Meadow Vipers",     status: "final",    homeScore: 0, awayScore: 0 },
    { match: 3,  division: "10UG", pool: "A", round: "pool", start: "2026-12-05T09:15:00-08:00", field: "F1", home: "Oak Knoll Rapids",  away: "Westside Wolves",   status: "final",    homeScore: 2, awayScore: 2 },
    { match: 4,  division: "10UG", pool: "B", round: "pool", start: "2026-12-05T09:15:00-08:00", field: "F2", home: "Harbor Surge",      away: "Canyon FC",         status: "live",     homeScore: 1, awayScore: 0 },
    { match: 5,  division: "12UB", pool: "A", round: "pool", start: "2026-12-05T09:30:00-08:00", field: "F3", home: "Cypress Thunder",   away: "Oak Knoll Rapids",  status: "live",     homeScore: 1, awayScore: 1 },
    { match: 6,  division: "12UB", pool: "B", round: "pool", start: "2026-12-05T10:45:00-08:00", field: "F3", home: "Pacific Hawks",     away: "Harbor Surge",      status: "upcoming", homeScore: null, awayScore: null },
    { match: 7,  division: "12UG", pool: "A", round: "pool", start: "2026-12-05T10:45:00-08:00", field: "F4", home: "Lakeview Strikers", away: "Westside Wolves",   status: "upcoming", homeScore: null, awayScore: null },
    { match: 8,  division: "12UG", pool: "B", round: "pool", start: "2026-12-05T12:00:00-08:00", field: "F4", home: "Meadow Vipers",     away: "Canyon FC",         status: "upcoming", homeScore: null, awayScore: null },
    { match: 9,  division: "14UB", pool: "A", round: "pool", start: "2026-12-05T12:00:00-08:00", field: "F1", home: "Cypress Thunder",   away: "Westside Wolves",   status: "upcoming", homeScore: null, awayScore: null },
    { match: 10, division: "14UB", pool: "B", round: "pool", start: "2026-12-05T13:30:00-08:00", field: "F2", home: "Pacific Hawks",     away: "Canyon FC",         status: "upcoming", homeScore: null, awayScore: null },
    { match: 11, division: "14UG", pool: "A", round: "pool", start: "2026-12-05T13:30:00-08:00", field: "F1", home: "Lakeview Strikers", away: "Oak Knoll Rapids",  status: "upcoming", homeScore: null, awayScore: null },
    { match: 12, division: "14UG", pool: "B", round: "pool", start: "2026-12-05T15:00:00-08:00", field: "F2", home: "Meadow Vipers",     away: "Harbor Surge",      status: "upcoming", homeScore: null, awayScore: null },
    { match: 13, division: "10UB", pool: "",  round: "championship", start: "2026-12-06T10:00:00-08:00", field: "F1", home: "Pool A Winner", away: "Pool B Winner", status: "upcoming", homeScore: null, awayScore: null },
    { match: 14, division: "10UG", pool: "",  round: "championship", start: "2026-12-06T10:00:00-08:00", field: "F2", home: "Pool A Winner", away: "Pool B Winner", status: "upcoming", homeScore: null, awayScore: null },
    { match: 15, division: "12UB", pool: "",  round: "championship", start: "2026-12-06T11:30:00-08:00", field: "F1", home: "Pool A Winner", away: "Pool B Winner", status: "upcoming", homeScore: null, awayScore: null },
    { match: 16, division: "12UG", pool: "",  round: "championship", start: "2026-12-06T11:30:00-08:00", field: "F2", home: "Pool A Winner", away: "Pool B Winner", status: "upcoming", homeScore: null, awayScore: null },
    { match: 17, division: "14UB", pool: "",  round: "championship", start: "2026-12-06T13:00:00-08:00", field: "F1", home: "Pool A Winner", away: "Pool B Winner", status: "upcoming", homeScore: null, awayScore: null },
    { match: 18, division: "14UG", pool: "",  round: "championship", start: "2026-12-06T13:00:00-08:00", field: "F2", home: "Pool A Winner", away: "Pool B Winner", status: "upcoming", homeScore: null, awayScore: null }
  ],

  /**
   * standings[divisionId][poolId] = rows
   * pts = match points (win/tie/shutout/goal bonuses)
   * fp  = fair play / referee adjustment (negative for red cards)
   * Total PTS and GD are calculated in the browser.
   */
  standings: {
    "10UB": {
      A: [
        { team: "Cypress Thunder",   gp: 2, w: 2, l: 0, t: 0, gf: 6, ga: 1, pts: 17, fp: 0 },
        { team: "Oak Knoll Rapids",  gp: 2, w: 1, l: 0, t: 1, gf: 4, ga: 2, pts: 11, fp: 0 },
        { team: "Lakeview Strikers", gp: 2, w: 0, l: 1, t: 1, gf: 3, ga: 5, pts: 6,  fp: -2 },
        { team: "Westside Wolves",   gp: 2, w: 0, l: 2, t: 0, gf: 1, ga: 6, pts: 1,  fp: 0 }
      ],
      B: [
        { team: "Pacific Hawks",     gp: 2, w: 1, l: 0, t: 1, gf: 3, ga: 0, pts: 14, fp: 0 },
        { team: "Harbor Surge",      gp: 2, w: 1, l: 1, t: 0, gf: 4, ga: 3, pts: 9,  fp: 0 },
        { team: "Meadow Vipers",     gp: 2, w: 0, l: 1, t: 1, gf: 1, ga: 3, pts: 4,  fp: 0 },
        { team: "Canyon FC",         gp: 2, w: 1, l: 1, t: 0, gf: 2, ga: 4, pts: 8,  fp: 0 }
      ]
    },
    "10UG": {
      A: [
        { team: "Oak Knoll Rapids",  gp: 2, w: 1, l: 0, t: 1, gf: 5, ga: 3, pts: 12, fp: 0 },
        { team: "Cypress Thunder",   gp: 2, w: 1, l: 1, t: 0, gf: 4, ga: 3, pts: 9,  fp: 0 },
        { team: "Westside Wolves",   gp: 2, w: 0, l: 1, t: 1, gf: 4, ga: 5, pts: 6,  fp: 0 },
        { team: "Lakeview Strikers", gp: 2, w: 1, l: 1, t: 0, gf: 2, ga: 4, pts: 7,  fp: -2 }
      ],
      B: [
        { team: "Harbor Surge",      gp: 1, w: 1, l: 0, t: 0, gf: 2, ga: 0, pts: 9,  fp: 0 },
        { team: "Pacific Hawks",     gp: 1, w: 1, l: 0, t: 0, gf: 3, ga: 1, pts: 8,  fp: 0 },
        { team: "Meadow Vipers",     gp: 1, w: 0, l: 1, t: 0, gf: 1, ga: 3, pts: 1,  fp: 0 },
        { team: "Canyon FC",         gp: 1, w: 0, l: 1, t: 0, gf: 0, ga: 2, pts: 0,  fp: 0 }
      ]
    },
    "12UB": {
      A: [
        { team: "Cypress Thunder",   gp: 2, w: 1, l: 0, t: 1, gf: 5, ga: 2, pts: 13, fp: 0 },
        { team: "Westside Wolves",   gp: 2, w: 1, l: 1, t: 0, gf: 4, ga: 3, pts: 10, fp: 0 },
        { team: "Oak Knoll Rapids",  gp: 2, w: 0, l: 1, t: 1, gf: 3, ga: 4, pts: 6,  fp: 0 },
        { team: "Lakeview Strikers", gp: 2, w: 1, l: 1, t: 0, gf: 2, ga: 5, pts: 7,  fp: -2 }
      ],
      B: [
        { team: "Pacific Hawks",     gp: 2, w: 2, l: 0, t: 0, gf: 7, ga: 1, pts: 18, fp: 0 },
        { team: "Meadow Vipers",     gp: 2, w: 1, l: 1, t: 0, gf: 3, ga: 3, pts: 9,  fp: 0 },
        { team: "Harbor Surge",      gp: 2, w: 0, l: 1, t: 1, gf: 2, ga: 4, pts: 5,  fp: 0 },
        { team: "Canyon FC",         gp: 2, w: 0, l: 2, t: 0, gf: 1, ga: 5, pts: 1,  fp: 0 }
      ]
    },
    "12UG": {
      A: [
        { team: "Lakeview Strikers", gp: 2, w: 2, l: 0, t: 0, gf: 5, ga: 0, pts: 19, fp: 0 },
        { team: "Cypress Thunder",   gp: 2, w: 1, l: 1, t: 0, gf: 3, ga: 2, pts: 9,  fp: 0 },
        { team: "Oak Knoll Rapids",  gp: 2, w: 0, l: 1, t: 1, gf: 2, ga: 4, pts: 5,  fp: 0 },
        { team: "Westside Wolves",   gp: 2, w: 0, l: 2, t: 0, gf: 0, ga: 4, pts: 0,  fp: 0 }
      ],
      B: [
        { team: "Meadow Vipers",     gp: 2, w: 1, l: 0, t: 1, gf: 4, ga: 2, pts: 12, fp: 0 },
        { team: "Harbor Surge",      gp: 2, w: 1, l: 0, t: 1, gf: 3, ga: 2, pts: 11, fp: 0 },
        { team: "Pacific Hawks",     gp: 2, w: 0, l: 2, t: 0, gf: 2, ga: 4, pts: 2,  fp: 0 },
        { team: "Canyon FC",         gp: 2, w: 0, l: 1, t: 1, gf: 2, ga: 3, pts: 5,  fp: -2 }
      ]
    },
    "14UB": {
      A: [
        { team: "Westside Wolves",   gp: 2, w: 2, l: 0, t: 0, gf: 4, ga: 0, pts: 17, fp: 0 },
        { team: "Cypress Thunder",   gp: 2, w: 1, l: 1, t: 0, gf: 3, ga: 2, pts: 9,  fp: 0 },
        { team: "Lakeview Strikers", gp: 2, w: 0, l: 1, t: 1, gf: 1, ga: 3, pts: 4,  fp: 0 },
        { team: "Oak Knoll Rapids",  gp: 2, w: 0, l: 1, t: 1, gf: 1, ga: 2, pts: 4,  fp: 0 }
      ],
      B: [
        { team: "Canyon FC",         gp: 2, w: 1, l: 0, t: 1, gf: 3, ga: 1, pts: 12, fp: 0 },
        { team: "Pacific Hawks",     gp: 2, w: 1, l: 0, t: 1, gf: 2, ga: 1, pts: 10, fp: 0 },
        { team: "Harbor Surge",      gp: 2, w: 0, l: 1, t: 1, gf: 2, ga: 3, pts: 5,  fp: 0 },
        { team: "Meadow Vipers",     gp: 2, w: 0, l: 2, t: 0, gf: 0, ga: 3, pts: 0,  fp: 0 }
      ]
    },
    "14UG": {
      A: [
        { team: "Oak Knoll Rapids",  gp: 2, w: 1, l: 0, t: 1, gf: 4, ga: 1, pts: 13, fp: 0 },
        { team: "Lakeview Strikers", gp: 2, w: 1, l: 0, t: 1, gf: 3, ga: 1, pts: 12, fp: 0 },
        { team: "Cypress Thunder",   gp: 2, w: 0, l: 1, t: 1, gf: 2, ga: 4, pts: 5,  fp: 0 },
        { team: "Westside Wolves",   gp: 2, w: 0, l: 2, t: 0, gf: 1, ga: 4, pts: 1,  fp: 0 }
      ],
      B: [
        { team: "Harbor Surge",      gp: 2, w: 2, l: 0, t: 0, gf: 5, ga: 1, pts: 17, fp: 0 },
        { team: "Meadow Vipers",     gp: 2, w: 1, l: 1, t: 0, gf: 3, ga: 3, pts: 9,  fp: 0 },
        { team: "Canyon FC",         gp: 2, w: 0, l: 1, t: 1, gf: 2, ga: 3, pts: 5,  fp: 0 },
        { team: "Pacific Hawks",     gp: 2, w: 0, l: 2, t: 0, gf: 1, ga: 4, pts: 1,  fp: -2 }
      ]
    }
  },

  /**
   * Rules Hub drawers. Types: "steps" | "bullets" | "scoring" | "stations".
   * `stations` is generated from the `fields` list above.
   */
  rules: [
    {
      id: "check-in", icon: "clipboard", title: "Check-in Protocol", type: "steps",
      intro: "Every team checks in at the Field Marshal HQ tent before its first match of the weekend.",
      items: [
        "Arrive at least 60 minutes before your first scheduled match.",
        "Head Coach or Team Manager presents the official eAYSO laminated roster and player cards.",
        "Each player is verified against the roster; unregistered or missing players cannot be added on site.",
        "Collect your team packet (field assignments, marshal contact, and fair play reminders).",
        "Return to your assigned field 15 minutes before kickoff for referee equipment and roster check."
      ]
    },
    {
      id: "rules", icon: "trophy", title: "Tournament Rules & Scoring Tiebreakers", type: "scoring",
      intro: "Pool play uses the Kamhi Cup point system. The top teams in each pool advance to Championship Sunday.",
      scoring: [
        { label: "Win", value: "6" },
        { label: "Tie", value: "3" },
        { label: "Loss", value: "0" },
        { label: "Shutout bonus", value: "+1" },
        { label: "Goal bonus (max 3)", value: "+1 each" },
        { label: "Red card", value: "-2", negative: true }
      ],
      tiebreakersTitle: "Tiebreakers, in order",
      tiebreakers: [
        "Head-to-head result",
        "Fewest goals allowed",
        "Goal differential (maximum +/- 3 per game)",
        "Most shutouts",
        "Kicks from the penalty mark (IFAB procedures)"
      ],
      note: "The official rules document is the final authority. Use the Tournament Rules (PDF) button above once it is published."
    },
    {
      id: "marshals", icon: "pin", title: "Field Marshal Station Locations", type: "stations",
      intro: "Field Marshals handle score reporting, injuries, and field issues. Find your fields' station below."
    },
    {
      id: "parking", icon: "car", title: "Parking & Canopy Guidelines", type: "bullets",
      intro: "Please help us keep our host park safe and welcoming.",
      items: [
        "Park only in marked stalls or where posted signs allow. No red-curb parking.",
        "Carpool when you can and drop off players at the curb before parking.",
        "Canopies must be weighted or staked and stay back from the touchline and field entrances.",
        "No canopies in referee or team technical areas. Keep walkways and emergency routes clear.",
        "Pack out all trash and bottles. Clean fields keep us invited back."
      ],
      note: "Final venue parking maps will be posted before kickoff."
    }
  ]
};

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
    standingsDivision: "" // standings dropdown (used when global filter is "all")
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
    car: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 17h14M3 13l2-6h14l2 6v4H3zM7 17v2M17 17v2"/><circle cx="7.5" cy="13.5" r=".8"/><circle cx="16.5" cy="13.5" r=".8"/></svg>'
  };

  const STATUS_LABEL = { upcoming: "Upcoming", live: "In-Progress", final: "Final" };

  /* ---------- Hero status & countdown ---------- */
  function currentPhase(now = new Date()) {
    const t = DATA.tournament;
    const start = new Date(t.startsAt);
    const end = new Date(t.endsAt);
    const override = t.statusOverride;

    if (override === "live") return { key: "live", label: "Tournament Live" };
    if (override === "pool") return { key: "pool", label: "Pool Play" };
    if (override === "championship") return { key: "championship", label: "Championship Sunday" };
    if (override === "complete") return { key: "complete", label: "Tournament Complete" };

    if (now < start) return { key: "upcoming", label: "Coming Soon" };
    if (now > end) return { key: "complete", label: "Tournament Complete" };

    const today = fmt(now, { year: "numeric", month: "2-digit", day: "2-digit" });
    const [y, m, d] = t.championshipDay.split("-");
    if (today === `${m}/${d}/${y}`) return { key: "championship", label: "Championship Sunday" };
    if (DATA.games.some((g) => g.status === "live")) return { key: "live", label: "Tournament Live" };
    return { key: "pool", label: "Pool Play" };
  }

  function renderStatus() {
    const phase = currentPhase();
    const badge = $("#status-badge");
    const countdown = $("#countdown");
    const meta = $("#status-meta");
    const start = new Date(DATA.tournament.startsAt);

    badge.dataset.phase = phase.key === "live" || phase.key === "championship" || phase.key === "complete" ? phase.key : "pool";
    $(".status-badge__text", badge).textContent = phase.label;

    const liveCount = DATA.games.filter((g) => g.status === "live").length;
    const finalCount = DATA.games.filter((g) => g.status === "final").length;

    if (phase.key === "upcoming") {
      const diff = Math.max(0, start - new Date());
      const s = Math.floor(diff / 1000);
      const parts = { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), mins: Math.floor((s % 3600) / 60), secs: s % 60 };
      countdown.hidden = false;
      Object.entries(parts).forEach(([k, v]) => {
        const el = $(`[data-unit="${k}"]`, countdown);
        if (el) el.textContent = String(v).padStart(2, "0");
      });
      meta.textContent = `Kickoff ${fmt(start, { weekday: "long", month: "long", day: "numeric" })} at ${fmt(start, { hour: "numeric", minute: "2-digit" })}.`;
    } else {
      countdown.hidden = true;
      meta.textContent = `${liveCount} match${liveCount === 1 ? "" : "es"} in progress, ${finalCount} final.`;
    }
    return phase.key;
  }

  function startStatusLoop() {
    let timer;
    const tick = () => {
      const key = renderStatus();
      timer = setTimeout(tick, key === "upcoming" ? 1000 : 30000);
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

    const roundLabel = g.round === "championship" ? "Championship" : g.pool ? `Pool ${esc(g.pool)}` : "";

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
      host.innerHTML = `<div class="empty">No matches found for this filter. Try another division or status.</div>`;
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
        <span class="legend__item"><span class="swatch"></span>Top ${esc(cutoff)} advance to Championship Sunday</span>
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
        <ol class="check-list">${item.tiebreakers.map((i) => `<li>${esc(i)}</li>`).join("")}</ol>${note}`;
    }
    if (item.type === "stations") {
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
    const links = $$(".section-nav__link");
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
    document.title = `${t.name} ${t.subtitle} | ${t.host}`;
    $$("[data-bind]").forEach((el) => {
      const key = el.dataset.bind;
      if (key === "name") el.textContent = t.name;
      if (key === "subtitle") el.textContent = t.subtitle;
      if (key === "host") el.textContent = t.host;
      if (key === "updated") el.textContent = DATA.meta.lastUpdated;
      if (key === "sample") el.hidden = !DATA.meta.isSample;
    });
  }

  /* ---------- Render all ---------- */
  function renderAll() {
    renderChrome();
    renderStandingsControls();
    renderDivisionPills();
    renderSchedule();
    renderStandings();
    renderRules();
    initDrawers();
    renderStatus();
    wireQuickLinks();
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

      const trigger = e.target.closest(".acc-trigger");
      if (trigger) {
        toggleDrawer(trigger.closest(".acc-item").dataset.acc);
        return;
      }

      const opener = e.target.closest("[data-open-drawer]");
      if (opener) {
        toggleDrawer(opener.dataset.openDrawer, true);
      }
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
  const SYNC_KEYS = ["meta", "tournament", "links", "divisions", "fields", "games", "standings", "rules"];

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
