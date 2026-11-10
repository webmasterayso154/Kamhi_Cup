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
  /**
   * SITE PHASE SWITCH
   * "registration" = Phase 1: announcement, registration checklist, FAQ, sponsors.
   * "gameday"      = Phase 2: live schedule, standings, field map.
   * "auto"         = registration until `gameDayFrom`, then gameday.
   * Board members can preview either phase with ?phase=gameday or ?phase=registration.
   */
  site: {
    phase: "auto",
    gameDayFrom: "2026-12-11T18:00:00-08:00",
    allowUrlPreview: true,
    nav: {
      registration: [
        { label: "Register", short: "Register", href: "#register", icon: "clipboard" },
        { label: "Key Dates", short: "Dates", href: "#dates", icon: "calendar" },
        { label: "FAQ", short: "FAQ", href: "#info", icon: "help" },
        { label: "Sponsors", short: "Sponsors", href: "#sponsors", icon: "star" }
      ],
      fab: {
        registration: [
          { short: "Register", href: "#register", icon: "clipboard" },
          { short: "Docs", href: "#documents", icon: "file", openDetails: "doc-browser" },
          { short: "FAQ", href: "#info", icon: "help" },
          { short: "Contact", href: "#contact", icon: "mail" }
        ],
        gameday: [
          { short: "Schedule", href: "#schedule", icon: "calendar" },
          { short: "Standings", href: "#standings", icon: "chart" },
          { short: "Docs", href: "#documents", icon: "file", openDetails: "doc-browser" },
          { short: "Map", href: "#rules", icon: "pin", openDrawer: "marshals" }
        ]
      },
      gameday: [
        { label: "Schedule", href: "#schedule" },
        { label: "Standings", href: "#standings" },
        { label: "Rules & Field Map", href: "#rules" },
        { label: "Documents", href: "#documents", openDetails: "doc-browser" }
      ]
    }
  },

  /** Registration (Phase 1). Leave submitUrl blank to submit by email. */
  registration: {
    status: "open",                    // "open" | "closed"
    submitUrl: "",                     // e.g. a Google Form link
    submitEmail: "coachadmin154@gmail.com", // TODO: confirm the packet submission address
    submitSubject: "Kamhi Cup 2026 Registration Packet"
  },

  contacts: [
    { role: "Tournament Director", name: "TBD", email: "coachadmin154@gmail.com" },
    { role: "Referee Administrator", name: "TBD", email: "coachadmin154@gmail.com" },
    { role: "Webmaster & Tech Ops", name: "Bryan Nim", email: "webmasterayso154@gmail.com" }
  ],

  meta: {
    isSample: true,                    // shows a "Sample data" tag; set false once real data is wired in
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
    subtitle: "All-Stars Tournament",
    dates: "Sat, Dec 12, 2026 • Cypress, CA",
    dayLong: "Saturday, December 12, 2026",
    host: "AYSO Region 154 Cypress",
    timeZone: "America/Los_Angeles",
    // One-day event. Kickoff time is TBD, so the countdown runs to the start of the day.
    startsAt: "2026-12-12T00:00:00-08:00",
    endsAt: "2026-12-12T18:00:00-08:00",
    kickoffTimeKnown: false,
    statusOverride: "",                // game day only: "", "live" or "complete" forces the hero badge
    advancePerPool: 2,                 // top N per pool reach the finals
    checkInMinutes: 60,
    awards: "Gold Kamhi Cup medals for champions and silver medals for finalists in every division."
  },

  links: {
    fieldMap: "",                      // image / PDF URL; blank = jump to Field Marshal drawer
    rulesPdf: "",                      // PDF URL; blank = jump to Rules drawer
    standings: "#standings",
    schedule: "#schedule"
  },

  divisions: [
    { id: "10UB", label: "10U Boys",  format: "7v7",   halfMins: 25, ball: "Size 4" },
    { id: "10UG", label: "10U Girls", format: "7v7",   halfMins: 25, ball: "Size 4" },
    { id: "12UB", label: "12U Boys",  format: "9v9",   halfMins: 30, ball: "Size 4" },
    { id: "12UG", label: "12U Girls", format: "9v9",   halfMins: 30, ball: "Size 4" },
    { id: "14UB", label: "14U Boys",  format: "11v11", halfMins: 35, ball: "Size 5" },
    { id: "14UG", label: "14U Girls", format: "11v11", halfMins: 35, ball: "Size 5" }
  ],

  fields: [
    { id: "F1", name: "Field 1", venue: "Primary Complex", address: "Cypress, CA 90630", marshal: "Marshal HQ Tent (north end)" },
    { id: "F2", name: "Field 2", venue: "Primary Complex", address: "Cypress, CA 90630", marshal: "Marshal HQ Tent (north end)" },
    { id: "F3", name: "Field 3", venue: "Primary Complex", address: "Cypress, CA 90630", marshal: "Marshal Station B (east side)" },
    { id: "F4", name: "Field 4", venue: "Primary Complex", address: "Cypress, CA 90630", marshal: "Marshal Station B (east side)" }
  ],

  /**
   * status: "upcoming" | "live" | "final"
   * round : "pool" | "final"
   */
  games: [
    { match: 1,  division: "10UB", pool: "A", round: "pool", start: "2026-12-12T08:00:00-08:00", field: "F1", home: "Cypress Thunder",   away: "Lakeview Strikers", status: "final",    homeScore: 3, awayScore: 1 },
    { match: 2,  division: "10UB", pool: "B", round: "pool", start: "2026-12-12T08:00:00-08:00", field: "F2", home: "Pacific Hawks",     away: "Meadow Vipers",     status: "final",    homeScore: 0, awayScore: 0 },
    { match: 3,  division: "10UG", pool: "A", round: "pool", start: "2026-12-12T09:15:00-08:00", field: "F1", home: "Oak Knoll Rapids",  away: "Westside Wolves",   status: "final",    homeScore: 2, awayScore: 2 },
    { match: 4,  division: "10UG", pool: "B", round: "pool", start: "2026-12-12T09:15:00-08:00", field: "F2", home: "Harbor Surge",      away: "Canyon FC",         status: "live",     homeScore: 1, awayScore: 0 },
    { match: 5,  division: "12UB", pool: "A", round: "pool", start: "2026-12-12T09:30:00-08:00", field: "F3", home: "Cypress Thunder",   away: "Oak Knoll Rapids",  status: "live",     homeScore: 1, awayScore: 1 },
    { match: 6,  division: "12UB", pool: "B", round: "pool", start: "2026-12-12T10:45:00-08:00", field: "F3", home: "Pacific Hawks",     away: "Harbor Surge",      status: "upcoming", homeScore: null, awayScore: null },
    { match: 7,  division: "12UG", pool: "A", round: "pool", start: "2026-12-12T10:45:00-08:00", field: "F4", home: "Lakeview Strikers", away: "Westside Wolves",   status: "upcoming", homeScore: null, awayScore: null },
    { match: 8,  division: "12UG", pool: "B", round: "pool", start: "2026-12-12T12:00:00-08:00", field: "F4", home: "Meadow Vipers",     away: "Canyon FC",         status: "upcoming", homeScore: null, awayScore: null },
    { match: 9,  division: "14UB", pool: "A", round: "pool", start: "2026-12-12T12:00:00-08:00", field: "F1", home: "Cypress Thunder",   away: "Westside Wolves",   status: "upcoming", homeScore: null, awayScore: null },
    { match: 10, division: "14UB", pool: "B", round: "pool", start: "2026-12-12T13:30:00-08:00", field: "F2", home: "Pacific Hawks",     away: "Canyon FC",         status: "upcoming", homeScore: null, awayScore: null },
    { match: 11, division: "14UG", pool: "A", round: "pool", start: "2026-12-12T13:30:00-08:00", field: "F1", home: "Lakeview Strikers", away: "Oak Knoll Rapids",  status: "upcoming", homeScore: null, awayScore: null },
    { match: 12, division: "14UG", pool: "B", round: "pool", start: "2026-12-12T12:00:00-08:00", field: "F3", home: "Meadow Vipers",     away: "Harbor Surge",      status: "upcoming", homeScore: null, awayScore: null },
    { match: 13, division: "10UB", pool: "",  round: "final", start: "2026-12-12T15:00:00-08:00", field: "F1", home: "Pool A Winner", away: "Pool B Winner", status: "upcoming", homeScore: null, awayScore: null },
    { match: 14, division: "10UG", pool: "",  round: "final", start: "2026-12-12T15:00:00-08:00", field: "F2", home: "Pool A Winner", away: "Pool B Winner", status: "upcoming", homeScore: null, awayScore: null },
    { match: 15, division: "12UB", pool: "",  round: "final", start: "2026-12-12T15:00:00-08:00", field: "F3", home: "Pool A Winner", away: "Pool B Winner", status: "upcoming", homeScore: null, awayScore: null },
    { match: 16, division: "12UG", pool: "",  round: "final", start: "2026-12-12T15:00:00-08:00", field: "F4", home: "Pool A Winner", away: "Pool B Winner", status: "upcoming", homeScore: null, awayScore: null },
    { match: 17, division: "14UB", pool: "",  round: "final", start: "2026-12-12T16:30:00-08:00", field: "F1", home: "Pool A Winner", away: "Pool B Winner", status: "upcoming", homeScore: null, awayScore: null },
    { match: 18, division: "14UG", pool: "",  round: "final", start: "2026-12-12T16:30:00-08:00", field: "F2", home: "Pool A Winner", away: "Pool B Winner", status: "upcoming", homeScore: null, awayScore: null }
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
      intro: "Pool play uses the Kamhi Cup point system. The top teams in each pool advance to the afternoon finals.",
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
  ],

  /* ---------------- Phase 1 content ---------------- */

  /** Key dates. Leave `date` blank to show "TBD". */
  dates: [
    { id: "open",    label: "Registration opens",          date: "2026-11-10" },
    { id: "apps",    label: "Team applications due",       date: "" },
    { id: "rosters", label: "Rosters & guest forms due",   date: "" },
    { id: "refs",    label: "Referee forms due",           date: "" },
    { id: "day",     label: "Tournament day",              date: "2026-12-12", highlight: true }
  ],

  /**
   * Registration checklists by role. `docs` are KAMHI_DOCS ids; `due` is a dates id.
   * `action: "submit"` renders the packet submission button.
   */
  checklists: [
    {
      id: "coach", label: "Coach / Manager",
      steps: [
        { title: "Read the invitation & rules", text: "Start here for divisions, eligibility, and how the day works.", docs: ["invitation", "rules"] },
        { title: "Complete the team application", docs: ["team-app"], due: "apps" },
        { title: "Complete your tournament roster", text: "Using guest players? Add a guest player form for each one.", docs: ["roster", "guest"], due: "rosters" },
        { title: "Submit referee information", text: "See the referee plan for what your team needs to provide.", docs: ["ref-form", "ref-plan"], due: "refs" },
        { title: "Submit your packet", text: "Send all completed forms together.", action: "submit" }
      ]
    },
    {
      id: "u8", label: "U8 Coach",
      steps: [
        { title: "Read the invitation & U8 rules", docs: ["invitation", "u8-rules"] },
        { title: "Complete the U8 team application", docs: ["u8-app"], due: "apps" },
        { title: "Complete the U8 team roster", docs: ["u8-roster"], due: "rosters" },
        { title: "Submit the U8 referee form", docs: ["u8-ref"], due: "refs" },
        { title: "Submit your packet", text: "Send all completed forms together.", action: "submit" }
      ]
    },
    {
      id: "referee", label: "Referee",
      steps: [
        { title: "Read the referee plan", docs: ["ref-plan", "rules"] },
        { title: "Complete the referee information form", docs: ["ref-form"], due: "refs" },
        { title: "Submit your form", text: "Send it to the Referee Administrator.", action: "submit" }
      ]
    }
  ],

  /**
   * Info Hub, organized by the six board pillars.
   * Mark an answer `tbd: true` while the board is still deciding; it shows a TBD tag.
   */
  info: [
    {
      id: "registration", label: "Registration", title: "Registration & Team Coordination", icon: "clipboard",
      docs: ["invitation", "team-app", "roster", "guest"], contact: "Tournament Director",
      faqs: [
        { q: "How do we register?", a: "Follow the Registration Checklist above: team application, roster and guest player forms, referee information, then submit your packet." },
        { q: "Which divisions are offered?", a: "10U, 12U and 14U boys and girls. See Tournament at a Glance for format, half length, and ball size. Full eligibility is in the Tournament Invitation." },
        { q: "What are the deadlines?", a: "Deadlines will be posted under Key Dates.", tbd: true },
        { q: "Can we use guest players?", a: "Yes, with a 2026 Guest Player Form for each guest. Limits are set in the tournament rules." },
        { q: "How are teams ranked in pool play?", a: "Win 6, tie 3, loss 0. Plus 1 for a shutout and 1 per goal scored (up to 3 per match). Minus 2 per red card. Tiebreakers: head-to-head, fewest goals allowed, goal differential (max +/- 3 per game), most shutouts, then kicks from the penalty mark." }
      ]
    },
    {
      id: "referees", label: "Referees", title: "Referees & Game Operations", icon: "whistle",
      docs: ["ref-plan", "ref-form", "u8-ref"], contact: "Referee Administrator",
      faqs: [
        { q: "Does each team need to provide referees?", a: "Referee requirements per team will be confirmed in the Referee Plan Guidelines.", tbd: true },
        { q: "How do referees sign up?", a: "Complete the Referee Information Form and include it in your team packet." },
        { q: "Are there referee point requirements?", a: "Point requirements are being finalized by the board.", tbd: true }
      ]
    },
    {
      id: "fields", label: "Fields", title: "Fields & Facilities", icon: "pin",
      docs: [], contact: "Tournament Director",
      faqs: [
        { q: "Where are the fields?", a: "In Cypress, CA. Field assignments and a field map will be posted before tournament day.", tbd: true },
        { q: "Where should we park?", a: "Park only in marked stalls or where posted signs allow. No red-curb parking. Please carpool and drop players at the curb." },
        { q: "Are canopies allowed?", a: "Yes. Canopies must be weighted or staked, stay back from the touchline and field entrances, and are not allowed in referee or team technical areas." }
      ]
    },
    {
      id: "safety", label: "Safety", title: "Safety & Medical", icon: "shield",
      docs: [], contact: "Tournament Director",
      faqs: [
        { q: "How does check-in work?", a: "Arrive at least 60 minutes before your first match at the Field Marshal HQ tent with your official eAYSO roster and player cards." },
        { q: "Will there be a trainer or first-aid tent?", a: "Medical and first-aid details will be announced.", tbd: true },
        { q: "What happens in bad weather or poor air quality?", a: "The tournament weather and air-quality policy will be posted here.", tbd: true }
      ]
    },
    {
      id: "volunteers", label: "Volunteers", title: "Volunteers & Staffing", icon: "users",
      docs: [], contact: "Tournament Director",
      faqs: [
        { q: "How do field marshals check in?", a: "Field marshal check-in details will be shared with volunteers.", tbd: true },
        { q: "Do volunteers earn credit?", a: "Volunteer point credit rules are being finalized.", tbd: true },
        { q: "How can I help?", a: "Email the Tournament Director to volunteer." }
      ]
    },
    {
      id: "concessions", label: "Concessions", title: "Concessions, Fundraising & Vendors", icon: "food",
      docs: [], contact: "Tournament Director",
      faqs: [
        { q: "Will there be food on site?", a: "Food trucks and snack options will be announced.", tbd: true },
        { q: "Is there tournament merchandise?", a: "Merchandise details will be announced.", tbd: true },
        { q: "I'm a vendor. How do I take part?", a: "Email the Tournament Director with your business and what you'd offer." }
      ]
    }
  ],

  /** Sponsors. Tier names and perks are placeholders until the board confirms them. */
  sponsors: {
    inquiryEmail: "coachadmin154@gmail.com", // TODO: confirm sponsorship contact
    placeholder: true,
    tiers: [
      { id: "champion",  name: "Champion Sponsor",  tone: "gold",   perks: ["Logo on tournament banner and this site", "Recognition at the medal ceremony", "Booth space on tournament day"] },
      { id: "finalist",  name: "Finalist Sponsor",  tone: "silver", perks: ["Logo on this site", "Name on tournament banner"] },
      { id: "community", name: "Community Partner", tone: "navy",   perks: ["Name listed on this site", "Thank-you on region social media"] }
    ],
    partners: []                       // { name, logo, url }
  }
};

/* ==========================================================================
   1b. DOCUMENT CENTER DATA
   --------------------------------------------------------------------------
   `file` is relative to KAMHI_DOCS_BASE (encoded automatically when rendered).
   Categories appear in the order they first show up in this array.
   ========================================================================== */
const KAMHI_DOCS_BASE = "Template Doc Files/";

const KAMHI_DOCS = [
  // A. Tournament Applications & Rosters
  { id: "team-app", category: "Tournament Applications & Rosters", title: "2026 Team Application",                 desc: "Register your All-Star team for the tournament.",             file: "2026-turkey team application-3.docx" },
  { id: "roster", category: "Tournament Applications & Rosters", title: "2026 Tournament Roster Form",           desc: "Official team roster to complete and submit.",                file: "2026 -turkey tournament roster.doc" },
  { id: "guest", category: "Tournament Applications & Rosters", title: "2026 Guest Player Form",                desc: "Request approval to add a guest player to your roster.",      file: "2026 -turkey guest form.docx" },
  { id: "invitation", category: "Tournament Applications & Rosters", title: "2026 Tournament Invitation & Details",  desc: "Invitation letter with tournament details and logistics.",    file: "2026 -turkey invitation_1.docx" },

  // B. Rules & Guidelines
  { id: "rules", category: "Rules & Guidelines", title: "2026 Tournament Rules (Revised Final)", desc: "Complete rules, scoring, and tiebreakers for the tournament.", file: "turkey tournament rules 2026 revised final 2.docx" },
  { id: "u8-rules", category: "Rules & Guidelines", title: "U8 Division Specific Rules",            desc: "Additional rules that apply only to the U8 division.",         file: "u8 division rules - all american turkey tournamnt.doc" },

  // C. Referee Forms & Plans
  { id: "ref-form", category: "Referee Forms & Plans", title: "2026 Referee Information Form", desc: "Referee contact and availability information.",                file: "2025 -turkey referee form.doc" },
  { id: "ref-plan", category: "Referee Forms & Plans", title: "Referee Plan Guidelines",       desc: "How referees are assigned and tournament refereeing guidelines.", file: "2025 -turkey referee plan.docx" },

  // D. U8 Division Specific Forms
  { id: "u8-app", category: "U8 Division Specific Forms", title: "U8 Team Application", desc: "Team application for the U8 division.",   file: "u8 turkey application1.doc" },
  { id: "u8-roster", category: "U8 Division Specific Forms", title: "U8 Team Roster",      desc: "Roster form for U8 teams.",               file: "u8_turkey_team_roster.doc" },
  { id: "u8-ref", category: "U8 Division Specific Forms", title: "U8 Referee Form",     desc: "Referee information form for U8 games.",  file: "u8 -turkey referee form.doc" }
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
    return { key: "gameday", label: now < start ? "Game Day Tomorrow" : "Game Day" };
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
      meta.textContent = `${t.dayLong} in Cypress, CA. ${t.kickoffTimeKnown ? `Kickoff ${fmt(start, { hour: "numeric", minute: "2-digit" })}.` : "Kickoff and check-in times TBD."}`;
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

  /* ---------- Document center ---------- */
  const docUrl = (file) => KAMHI_DOCS_BASE.split("/").filter(Boolean).concat(file.split("/")).map(encodeURIComponent).join("/");
  const docAbsUrl = (file) => new URL(docUrl(file), document.baseURI).href;
  const docExt = (file) => (file.split(".").pop() || "").toLowerCase();

  function renderDocs() {
    const q = ($("#doc-search").value || "").trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    const matches = KAMHI_DOCS.filter((d) => {
      const hay = `${d.title} ${d.desc} ${d.category} ${docExt(d.file)}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });

    $("#doc-count").textContent = `${matches.length} of ${KAMHI_DOCS.length} documents`;
    const host = $("#doc-list");
    if (!matches.length) {
      host.innerHTML = `<div class="empty">No documents match &ldquo;${esc(q)}&rdquo;. Try &ldquo;roster&rdquo;, &ldquo;referee&rdquo;, or &ldquo;rules&rdquo;.</div>`;
      return;
    }

    const groups = new Map();
    matches.forEach((d) => {
      if (!groups.has(d.category)) groups.set(d.category, []);
      groups.get(d.category).push(d);
    });

    host.innerHTML = [...groups.entries()]
      .map(
        ([cat, list]) => `
        <div class="doc-group">
          <h3 class="doc-group__title">${esc(cat)} <span class="doc-group__count">${list.length}</span></h3>
          <div class="doc-grid">
            ${list
              .map((d) => {
                const ext = docExt(d.file);
                return `<article class="card doc-card">
                  <div class="doc-card__top">
                    <div class="file-icon" data-ext="${esc(ext)}" aria-hidden="true">${esc(ext.toUpperCase())}</div>
                    <div>
                      <div class="doc-card__title">${esc(d.title)}</div>
                      <p class="doc-card__desc">${esc(d.desc)}</p>
                      <div class="doc-card__badges"><span class="badge badge--ext">${esc(ext.toUpperCase())}</span></div>
                    </div>
                  </div>
                  <div class="doc-card__actions">
                    <a class="action-btn action-btn--primary" href="${esc(docUrl(d.file))}" download aria-label="Download ${esc(d.title)} (${esc(ext.toUpperCase())})">${ICONS.download}<span>Download</span></a>
                    <button type="button" class="action-btn action-btn--icon" data-copy="${esc(d.file)}" aria-label="Copy share link for ${esc(d.title)}" title="Copy link">${ICONS.link}</button>
                  </div>
                </article>`;
              })
              .join("")}
          </div>
        </div>`
      )
      .join("");
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
        try { window.prompt("Copy this link:", url); } catch { toast("Couldn't copy. Use Download instead."); }
        return;
      }
    }
    btn.classList.add("is-done");
    btn.innerHTML = ICONS.check;
    toast("Link copied");
    setTimeout(() => { btn.classList.remove("is-done"); btn.innerHTML = ICONS.link; }, 1800);
  }

  /* ---------- Phase 1: key dates ---------- */
  const docById = (id) => KAMHI_DOCS.find((d) => d.id === id);
  const dateById = (id) => (DATA.dates || []).find((d) => d.id === id);
  const parseDay = (ymd) => (ymd ? new Date(`${ymd}T12:00:00-08:00`) : null);
  const fmtShort = (ymd) => (ymd ? fmt(parseDay(ymd), { month: "short", day: "numeric" }) : "TBD");
  const daysUntil = (ymd) => {
    const today = fmt(new Date(), { year: "numeric", month: "2-digit", day: "2-digit" }).split("/");
    const todayNoon = new Date(`${today[2]}-${today[0]}-${today[1]}T12:00:00-08:00`);
    return Math.round((parseDay(ymd) - todayNoon) / 86400000);
  };

  function dueText(ymd) {
    if (!ymd) return "Date TBD";
    const n = daysUntil(ymd);
    if (n < 0) return "Passed";
    if (n === 0) return "Today";
    if (n === 1) return "Tomorrow";
    return `In ${n} days`;
  }

  function renderDates() {
    $("#dates-list").innerHTML = (DATA.dates || [])
      .map((d) => {
        const n = d.date ? daysUntil(d.date) : null;
        const stateCls = d.date == null || d.date === "" ? "is-tbd" : n < 0 || (n === 0 && !d.highlight) ? "is-past" : "is-upcoming";
        return `<li class="timeline__item ${stateCls}${d.highlight ? " is-highlight" : ""}">
          <span class="timeline__dot" aria-hidden="true"></span>
          <span class="timeline__date">${esc(fmtShort(d.date))}</span>
          <span class="timeline__label">${esc(d.label)}</span>
          <span class="timeline__when">${esc(d.id === "open" && n !== null && n <= 0 ? "Open now" : dueText(d.date))}</span>
        </li>`;
      })
      .join("");
  }

  /* ---------- Phase 1: registration checklist ---------- */
  const checkKey = (role, i) => `kc26:check:${role}:${i}`;

  function submitHref(role) {
    const r = DATA.registration;
    if (r.submitUrl) return r.submitUrl;
    const contact = role === "referee" ? DATA.contacts.find((c) => /referee/i.test(c.role)) : null;
    const email = (contact && contact.email) || r.submitEmail;
    const list = DATA.checklists.find((c) => c.id === role);
    const forms = list.steps.flatMap((s) => s.docs || []).map((id) => docById(id)).filter(Boolean).map((d) => `- ${d.title}`);
    const body = `Team / name:\nDivision:\n\nAttached forms:\n${forms.join("\n")}\n`;
    return `mailto:${email}?subject=${encodeURIComponent(`${r.submitSubject} - ${list.label}`)}&body=${encodeURIComponent(body)}`;
  }

  function docChip(d) {
    const ext = docExt(d.file);
    return `<a class="doc-chip" href="${esc(docUrl(d.file))}" download aria-label="Download ${esc(d.title)} (${esc(ext.toUpperCase())})">
      <span class="doc-chip__ext" data-ext="${esc(ext)}">${esc(ext.toUpperCase())}</span>
      <span class="doc-chip__title">${esc(d.title)}</span>
      ${ICONS.download}
    </a>`;
  }

  function renderChecklist() {
    const lists = DATA.checklists || [];
    if (!lists.find((l) => l.id === state.role)) state.role = lists[0].id;
    const list = lists.find((l) => l.id === state.role);

    $("#role-chips").innerHTML = lists
      .map((l) => `<button type="button" class="pill-btn" data-role="${esc(l.id)}" aria-pressed="${l.id === state.role}">${esc(l.label)}</button>`)
      .join("");

    const done = list.steps.map((_, i) => store.get(checkKey(list.id, i)) === "1");
    const count = done.filter(Boolean).length;
    const pct = Math.round((count / list.steps.length) * 100);
    const closed = DATA.registration.status === "closed";

    $("#checklist").innerHTML = `
      <div class="checklist__head">
        <div>
          <div class="checklist__title">${esc(list.label)} packet</div>
          <div class="checklist__count">${count} of ${list.steps.length} done</div>
        </div>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${list.steps.length}" aria-valuenow="${count}" aria-label="Checklist progress"><span style="width:${pct}%"></span></div>
      </div>
      <ol class="steps">
        ${list.steps
          .map((s, i) => {
            const due = s.due ? dateById(s.due) : null;
            const docs = (s.docs || []).map(docById).filter(Boolean);
            const action =
              s.action === "submit"
                ? closed
                  ? `<p class="note">Registration is closed.</p>`
                  : `<a class="action-btn action-btn--red action-btn--wide" href="${esc(submitHref(list.id))}"${DATA.registration.submitUrl ? ' target="_blank" rel="noopener"' : ""}>${ICONS.mail}<span>${DATA.registration.submitUrl ? "Open submission form" : "Email your packet"}</span></a>`
                : "";
            return `<li class="step${done[i] ? " is-done" : ""}">
              <label class="step__check">
                <input type="checkbox" data-check="${i}" ${done[i] ? "checked" : ""}>
                <span class="step__box" aria-hidden="true">${ICONS.check}</span>
                <span class="visually-hidden">Mark step ${i + 1} done: ${esc(s.title)}</span>
              </label>
              <div class="step__body">
                <div class="step__top">
                  <span class="step__num">Step ${i + 1}</span>
                  ${due ? `<span class="badge ${due.date ? "badge--upcoming" : "badge--tbd"}">Due ${esc(fmtShort(due.date))}</span>` : ""}
                </div>
                <div class="step__title">${esc(s.title)}</div>
                ${s.text ? `<p class="step__text">${esc(s.text)}</p>` : ""}
                ${docs.length ? `<div class="doc-chips">${docs.map(docChip).join("")}</div>` : ""}
                ${action}
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
      if (!groups.has(age)) groups.set(age, { age, list: [] });
      groups.get(age).list.push(d);
    });
    $("#glance-grid").innerHTML =
      [...groups.values()]
        .map(({ age, list }) => {
          const d = list[0];
          return `<article class="card glance-card">
            <div class="glance-card__age">${esc(age)}</div>
            <div class="glance-card__teams">${list.map((x) => esc(x.label.replace(/^\d+U\s*/, ""))).join(" &amp; ")}</div>
            <ul class="glance-card__facts">
              <li><strong>${esc(d.format)}</strong> format</li>
              <li><strong>${esc(d.halfMins)}-min</strong> halves</li>
              <li><strong>${esc(d.ball)}</strong> ball</li>
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

  /* ---------- Phase 1: Info Hub (six pillars) ---------- */
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
      ${docs.length ? `<h4 class="info-panel__sub">Related forms</h4><div class="doc-chips">${docs.map(docChip).join("")}</div>` : ""}
      <div class="info-panel__contact">
        <span>Questions? <strong>${esc(contact.role)}</strong></span>
        <a class="action-btn" href="mailto:${esc(contact.email)}?subject=${encodeURIComponent(`Kamhi Cup 2026: ${p.title}`)}">${ICONS.mail}<span>Email</span></a>
      </div>`;
  }

  /* ---------- Phase 1: sponsors ---------- */
  function renderSponsors() {
    const s = DATA.sponsors;
    $("#sponsor-tiers").innerHTML = s.tiers
      .map(
        (t) => `<article class="card tier-card tier-card--${esc(t.tone)}">
          <div class="tier-card__name">${esc(t.name)}</div>
          <ul class="check-list check-list--bullets">${t.perks.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
        </article>`
      )
      .join("");

    const partners = s.partners && s.partners.length ? s.partners : Array.from({ length: 6 }, () => null);
    $("#partner-grid").innerHTML = partners
      .map((p) =>
        p
          ? `<a class="partner" href="${esc(p.url || "#")}" target="_blank" rel="noopener">${p.logo ? `<img src="${esc(p.logo)}" alt="${esc(p.name)}" loading="lazy">` : esc(p.name)}</a>`
          : `<div class="partner partner--empty">Your logo here</div>`
      )
      .join("");

    $("#sponsor-note").hidden = !s.placeholder;
    $("#sponsor-cta").href = `mailto:${s.inquiryEmail}?subject=${encodeURIComponent("Kamhi Cup 2026 Sponsorship Inquiry")}`;
  }

  /* ---------- Contacts ---------- */
  function renderContacts() {
    $("#contact-list").innerHTML = DATA.contacts
      .map(
        (c) => `<li class="card contact">
          <div><div class="contact__role">${esc(c.role)}</div><div class="contact__name">${esc(c.name)}</div></div>
          <a class="action-btn" href="mailto:${esc(c.email)}" aria-label="Email ${esc(c.role)}">${ICONS.mail}<span>Email</span></a>
        </li>`
      )
      .join("");
  }

  /* ---------- Phase-aware navigation ---------- */
  function navAttrs(item) {
    return `${item.openDrawer ? ` data-open-drawer="${esc(item.openDrawer)}"` : ""}${item.openDetails ? ` data-open-details="${esc(item.openDetails)}"` : ""}`;
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
    const browser = $("#doc-browser");
    if (browser) browser.open = state.phase === "gameday";
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
      renderSponsors();
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

      const details = e.target.closest("[data-open-details]");
      if (details) {
        const el = document.getElementById(details.dataset.openDetails);
        if (el) el.open = true;
      }
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

    $("#doc-search").addEventListener("input", renderDocs);

    window.addEventListener("resize", syncStickyHeight);
  }

  /* ---------- Remote data sync (Google Sheet / Apps Script) ---------- */
  const SYNC_KEYS = ["meta", "registration", "contacts", "tournament", "links", "divisions", "fields", "games", "standings", "rules", "dates", "checklists", "info", "sponsors"];

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
    // Opening a link to #documents should also expand the file browser.
    if (location.hash === "#documents") $("#doc-browser").open = true;
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
