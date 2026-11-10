/**
 * ============================================================================
 * FILE: js/config.js
 * PROJECT: AYSO Region 154 Cypress - Kamhi Cup 2026 All-Stars Hub
 * REPOSITORY: https://github.com/webmasterayso154/Kamhi_Cup
 * AUTHOR: Bryan Nim (Webmaster & Tech Ops Lead | AYSO Region 154 Cypress)
 * ============================================================================
 * VERSION CONTROL & REVISION HISTORY:
 * - v0.1.0 | 2026-11-09 16:59 PST | Initial Draft: Centralized Single Source 
 *   of Truth (SSOT) configuration object. Designed for unfinalized tournament
 *   details: updating any parent property in KAMHI_CUP_CONFIG automatically 
 *   propagates to every child card, badge, schedule table, and contact link
 *   across the entire DOM on load.
 * ============================================================================
 */

const KAMHI_CUP_CONFIG = {
  /* ==========================================================================
   * 1. META & VERSION TRACKING
   * ========================================================================== */
  meta: {
    version: "v0.1.0-draft",
    lastUpdated: "2026-11-09 16:59 PST",
    environment: "DUAL_HOST_READY", // Works in SportsConnect CMS & GitHub Pages
    statusBannerEnabled: true,
    statusBannerState: "TBD",       // Options: "TBD" | "LIVE" | "CONFIRMED"
    statusBannerMessage: "2026 Tournament Dates, Brackets & Field Assignments are currently being finalized. All TBD placeholders update automatically."
  },

  /* ==========================================================================
   * 2. PARENT TOURNAMENT IDENTITY
   * Changing any value here updates the Hero, Titles, Footer, and Rules text.
   * ========================================================================== */
  tournament: {
    name: "Kamhi Cup",
    year: "2026",
    fullTitle: "Kamhi Cup 2026 All-Stars Tournament",
    subtitle: "Official Post-Season All-Star Invitational • Winter Classic",
    hostRegionCode: "AYSO Region 154",
    hostCity: "Cypress, CA",
    hostFullTitle: "AYSO Region 154 Cypress",
    datesDisplay: "Dates TBD (Winter 2026)",
    checkInTimeOffset: "60 minutes prior to first scheduled match",
    awardsSummary: "Custom 2.5\" Kamhi Cup Medallions & 34\" Ribbons for Champions (Gold/Navy) and Finalists (Silver/Crimson)"
  },

  /* ==========================================================================
   * 3. EXTERNAL LINKS & GOOGLE SHEETS / APPS SCRIPT ENDPOINTS
   * Swap "#" with live URLs as Google Forms, Sheets, and PDFs are finalized.
   * ========================================================================== */
  links: {
    scheduleUrl: "#section-schedules",
    standingsUrl: "#section-standings",
    rulesPdfUrl: "#section-rules",
    fieldMapUrl: "#section-fields",
    refereeSignUpUrl: "#section-volunteers",
    coachCheckInUrl: "#section-rules",
    liveJsonFeedUrl: "" // Leave blank until Google Apps Script Web App URL is deployed
  },

  /* ==========================================================================
   * 4. KEY CONTACTS & LEADERSHIP
   * ========================================================================== */
  contacts: {
    tournamentDirector: {
      role: "Tournament Director",
      name: "TBD",
      email: "coachadmin154@gmail.com"
    },
    refereeAdmin: {
      role: "Tournament Referee Administrator",
      name: "TBD",
      email: "coachadmin154@gmail.com"
    },
    webmaster: {
      role: "Webmaster & Tech Ops Lead",
      name: "Bryan Nim",
      email: "webmasterayso154@gmail.com"
    }
  },

  /* ==========================================================================
   * 5. VENUES & FIELD LOCATIONS (Note: Grace Christian excluded for 2026)
   * ========================================================================== */
  venues: [
    {
      id: "venue-main",
      name: "Primary Complex (Cypress Park / Lexington / Oak Knoll - Finalizing)",
      address: "Cypress, CA 90630 (Exact Field Assignments TBD)",
      divisionsHosted: "10U, 12U, 14U Boys & Girls",
      parkingNotes: "Follow posted city parking signs; no red-curb parking.",
      status: "TBD"
    },
    {
      id: "venue-secondary",
      name: "Overflow / Secondary Venue (TBD)",
      address: "Cypress, CA 90630",
      divisionsHosted: "Pool Play Overflow (TBD)",
      parkingNotes: "Check-in tent location will be posted 7 days prior to kick-off.",
      status: "TBD"
    }
  ],

  /* ==========================================================================
   * 6. DIVISIONS & BRACKET CONFIGURATION
   * Add, remove, or edit divisions here; child pills and bracket cards auto-render.
   * ========================================================================== */
  divisions: [
    {
      code: "10U-B",
      label: "10U Boys",
      format: "7v7",
      halfLengthMins: 25,
      ballSize: "Size 4",
      poolsStatus: "Forming Pools (TBD)",
      championPrize: "Gold Kamhi Cup Medal + Navy Champion Ribbon",
      finalistPrize: "Silver Kamhi Cup Medal + Crimson Finalist Ribbon"
    },
    {
      code: "10U-G",
      label: "10U Girls",
      format: "7v7",
      halfLengthMins: 25,
      ballSize: "Size 4",
      poolsStatus: "Forming Pools (TBD)",
      championPrize: "Gold Kamhi Cup Medal + Navy Champion Ribbon",
      finalistPrize: "Silver Kamhi Cup Medal + Crimson Finalist Ribbon"
    },
    {
      code: "12U-B",
      label: "12U Boys",
      format: "9v9",
      halfLengthMins: 30,
      ballSize: "Size 4",
      poolsStatus: "Forming Pools (TBD)",
      championPrize: "Gold Kamhi Cup Medal + Navy Champion Ribbon",
      finalistPrize: "Silver Kamhi Cup Medal + Crimson Finalist Ribbon"
    },
    {
      code: "12U-G",
      label: "12U Girls",
      format: "9v9",
      halfLengthMins: 30,
      ballSize: "Size 4",
      poolsStatus: "Forming Pools (TBD)",
      championPrize: "Gold Kamhi Cup Medal + Navy Champion Ribbon",
      finalistPrize: "Silver Kamhi Cup Medal + Crimson Finalist Ribbon"
    },
    {
      code: "14U-B",
      label: "14U Boys",
      format: "11v11",
      halfLengthMins: 35,
      ballSize: "Size 5",
      poolsStatus: "Forming Pools (TBD)",
      championPrize: "Gold Kamhi Cup Medal + Navy Champion Ribbon",
      finalistPrize: "Silver Kamhi Cup Medal + Crimson Finalist Ribbon"
    },
    {
      code: "14U-G",
      label: "14U Girls",
      format: "11v11",
      halfLengthMins: 35,
      ballSize: "Size 5",
      poolsStatus: "Forming Pools (TBD)",
      championPrize: "Gold Kamhi Cup Medal + Navy Champion Ribbon",
      finalistPrize: "Silver Kamhi Cup Medal + Crimson Finalist Ribbon"
    }
  ],

  /* ==========================================================================
   * 7. POINT SYSTEM & TIE-BREAKER RULES (Propagates to Standings & Rules section)
   * ========================================================================== */
  scoringRules: {
    winPoints: 6,
    tiePoints: 3,
    lossPoints: 0,
    shutoutBonus: 1,
    goalBonusMax: 3,
    goalBonusDescription: "1 point per goal scored (up to a maximum of 3 goals per match)",
    redCardDeduction: -2,
    tieBreakers: [
      "Head-to-Head competition result",
      "Fewest goals allowed",
      "Goal differential (max +/- 3 per game)",
      "Most shutouts",
      "Kicks from the Penalty Mark (IFAB procedures)"
    ]
  },

  /* ==========================================================================
   * 8. MODULAR TIMELINE / TOURNAMENT MILESTONES
   * ========================================================================== */
  milestones: [
    {
      phase: "Phase 1",
      title: "Team Nominations & Roster Lock",
      date: "TBD",
      status: "TBD",
      details: "All-Star Team Managers and Head Coaches submit official eAYSO laminated rosters."
    },
    {
      phase: "Phase 2",
      title: "Pool Play & Bracket Release",
      date: "TBD",
      status: "TBD",
      details: "Master game schedules and field assignments published to this hub."
    },
    {
      phase: "Phase 3",
      title: "Pool Play Kick-Off",
      date: "TBD",
      status: "TBD",
      details: "Mandatory check-in 60 minutes before first game at Field Marshal HQ tent."
    },
    {
      phase: "Phase 4",
      title: "Championship & Finalist Medal Ceremonies",
      date: "TBD",
      status: "TBD",
      details: "Presentation of 2026 Kamhi Cup Champion & Finalist medals and commemorative pins/coins."
    }
  ]
};

/**
 * Helper binding function: Automatically populates any HTML element with
 * a `data-kc-bind="path.to.property"` attribute from KAMHI_CUP_CONFIG.
 */
function initKamhiCupBindings() {
  const root = document.getElementById("kamhi-cup-app");
  if (!root) return;

  // 1. Resolve simple text bindings via data-kc-bind="tournament.fullTitle"
  const boundElements = root.querySelectorAll("[data-kc-bind]");
  boundElements.forEach((el) => {
    const path = el.getAttribute("data-kc-bind");
    const value = path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), KAMHI_CUP_CONFIG);
    if (value !== null) {
      el.textContent = value;
    }
  });

  // 2. Resolve href bindings via data-kc-href="links.scheduleUrl"
  const boundLinks = root.querySelectorAll("[data-kc-href]");
  boundLinks.forEach((el) => {
    const path = el.getAttribute("data-kc-href");
    const value = path.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), KAMHI_CUP_CONFIG);
    if (value) {
      el.setAttribute("href", value);
    }
  });

  // 3. Render Status Banner
  const bannerEl = document.getElementById("kc-status-banner");
  if (bannerEl) {
    if (!KAMHI_CUP_CONFIG.meta.statusBannerEnabled) {
      bannerEl.style.display = "none";
    } else {
      bannerEl.setAttribute("data-state", KAMHI_CUP_CONFIG.meta.statusBannerState);
    }
  }

  // 4. Render Dynamic Division Cards
  const divisionGrid = document.getElementById("kc-divisions-grid");
  if (divisionGrid) {
    divisionGrid.innerHTML = KAMHI_CUP_CONFIG.divisions
      .map(
        (div) => `
        <article class="kc-card kc-division-card" data-division="${div.code}">
          <div class="kc-card-header">
            <span class="kc-division-code">${div.code}</span>
            <span class="kc-status-pill" data-state="TBD">${div.poolsStatus}</span>
          </div>
          <h3 class="kc-card-title">${div.label}</h3>
          <ul class="kc-meta-list">
            <li><strong>Format:</strong> ${div.format} (${div.halfLengthMins} min halves)</li>
            <li><strong>Ball:</strong> ${div.ballSize}</li>
            <li><strong>1st Place:</strong> ${div.championPrize}</li>
            <li><strong>2nd Place:</strong> ${div.finalistPrize}</li>
          </ul>
        </article>
      `
      )
      .join("");
  }

  // 5. Render Dynamic Milestones
  const milestoneList = document.getElementById("kc-milestone-list");
  if (milestoneList) {
    milestoneList.innerHTML = KAMHI_CUP_CONFIG.milestones
      .map(
        (m) => `
        <div class="kc-milestone-item">
          <div class="kc-milestone-badge">${m.phase}</div>
          <div class="kc-milestone-body">
            <div class="kc-milestone-top">
              <h4>${m.title}</h4>
              <span class="kc-status-pill" data-state="${m.status}">${m.date}</span>
            </div>
            <p>${m.details}</p>
          </div>
        </div>
      `
      )
      .join("");
  }

  // 6. Render Dynamic Venues
  const venueGrid = document.getElementById("kc-venues-grid");
  if (venueGrid) {
    venueGrid.innerHTML = KAMHI_CUP_CONFIG.venues
      .map(
        (v) => `
        <article class="kc-card">
          <div class="kc-card-header">
            <span class="kc-badge-ice">${v.divisionsHosted}</span>
            <span class="kc-status-pill" data-state="${v.status}">${v.status}</span>
          </div>
          <h3 class="kc-card-title">${v.name}</h3>
          <p class="kc-text-muted">${v.address}</p>
          <p class="kc-venue-note"><strong>Parking & Check-In:</strong> ${v.parkingNotes}</p>
        </article>
      `
      )
      .join("");
  }
}

document.addEventListener("DOMContentLoaded", initKamhiCupBindings);
